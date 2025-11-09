// Lambda Function: Pay Xero Invoice with Stripe
// Charges customer's saved credit card and records payment in Xero

import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { XeroClient } from 'xero-node';
import { getTokenSet, hasValidTokens } from './xero-token-store.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

/**
 * Pay Invoice Request
 */
interface PayInvoiceRequest {
  invoiceId: string;
  invoiceNumber: string;
  amount: number; // Amount in dollars (will be converted to cents for Stripe)
  currency: string;
  customerId: string; // Stripe customer ID
  paymentMethodId: string; // Stripe payment method ID
  xeroContactId: string; // Xero contact ID
  description?: string;
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const request: PayInvoiceRequest = req.body;

    // Validate request
    if (!request.invoiceId || !request.amount || !request.customerId || !request.paymentMethodId) {
      return res.status(400).json({
        error: 'Missing required fields: invoiceId, amount, customerId, paymentMethodId',
      });
    }

    console.log('Processing invoice payment:', {
      invoiceId: request.invoiceId,
      invoiceNumber: request.invoiceNumber,
      amount: request.amount,
      customerId: request.customerId,
    });

    // Step 1: Charge the customer's credit card via Stripe
    const amountInCents = Math.round(request.amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: request.currency.toLowerCase(),
      customer: request.customerId,
      payment_method: request.paymentMethodId,
      confirm: true,
      description: request.description || `Payment for Invoice ${request.invoiceNumber}`,
      metadata: {
        invoiceId: request.invoiceId,
        invoiceNumber: request.invoiceNumber,
        xeroContactId: request.xeroContactId,
        source: 'wild-things-portal',
      },
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/investor-portal`,
    });

    console.log('Stripe payment created:', paymentIntent.id, 'Status:', paymentIntent.status);

    // Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment failed',
        status: paymentIntent.status,
        message: 'The payment could not be processed. Please check your payment method.',
      });
    }

    // Step 2: Record payment in Xero
    const tenantId = process.env.XERO_TENANT_ID;
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    if (!tenantId || !clientId || !clientSecret || !redirectUri) {
      console.error('Xero API not configured - payment charged but not recorded in Xero!');

      // Payment was already charged to Stripe, so we need to handle this carefully
      // In production, you might want to queue this for retry or manual processing
      return res.status(500).json({
        error: 'Xero API not configured',
        message: 'Payment was charged successfully but could not be recorded in Xero. Please contact support.',
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
        missing: {
          tenantId: !tenantId,
          clientId: !clientId,
          clientSecret: !clientSecret,
          redirectUri: !redirectUri,
        }
      });
    }

    // Check if we have valid OAuth tokens
    if (!hasValidTokens()) {
      console.error('No valid Xero OAuth tokens - payment charged but not recorded in Xero!');
      return res.status(401).json({
        error: 'Not authenticated with Xero',
        message: 'Payment was charged successfully but could not be recorded in Xero. Please connect to Xero first.',
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
        authUrl: `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/xero-auth`,
      });
    }

    console.log('Recording payment in Xero...');

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
    });

    // Set the stored tokens
    const tokenSet = getTokenSet();
    xero.setTokenSet(tokenSet);

    // Create payment in Xero
    const xeroPayment = {
      invoice: {
        invoiceID: request.invoiceId,
      },
      account: {
        code: process.env.XERO_BANK_ACCOUNT_CODE || '090', // Default bank account
      },
      date: new Date().toISOString().split('T')[0],
      amount: request.amount,
      reference: `Stripe: ${paymentIntent.id}`,
    };

    const paymentResponse = await xero.accountingApi.createPayment(
      tenantId,
      xeroPayment as any
    );

    const xeroPaymentRecord = paymentResponse.body.payments?.[0];

    console.log('Xero payment recorded:', xeroPaymentRecord?.paymentID);

    // Fetch the full payment intent to get charges
    const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
      expand: ['charges'],
    });

    // Step 3: Return success response
    return res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        receiptUrl: (fullPaymentIntent as any).charges?.data[0]?.receipt_url,
      },
      xeroPayment: {
        paymentID: xeroPaymentRecord?.paymentID,
        invoiceID: request.invoiceId,
        amount: request.amount,
        date: xeroPaymentRecord?.date,
        reference: xeroPaymentRecord?.reference,
      },
      message: 'Payment processed and recorded in Xero successfully',
    });
  } catch (error: any) {
    console.error('Error processing invoice payment:', error);

    // Handle Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card error',
        message: error.message,
        code: error.code,
      });
    }

    // Handle Xero errors
    if (error.response?.body) {
      console.error('Xero API error:', error.response.body);
      return res.status(500).json({
        error: 'Xero API error',
        message: 'Payment succeeded but failed to record in Xero',
        details: error.response.body,
      });
    }

    return res.status(500).json({
      error: 'Failed to process payment',
      message: error.message,
    });
  }
}

