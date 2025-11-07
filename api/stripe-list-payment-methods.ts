// Vercel Serverless Function: List Stripe Payment Methods
// Retrieves all saved payment methods for a customer

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    // Get request body
    const { customerId, type = 'card' } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    console.log('Listing payment methods for customer:', customerId);

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(customerId);

    let defaultPaymentMethodId: string | null = null;
    if (customer && !customer.deleted) {
      defaultPaymentMethodId =
        typeof customer.invoice_settings.default_payment_method === 'string'
          ? customer.invoice_settings.default_payment_method
          : customer.invoice_settings.default_payment_method?.id || null;
    }

    // List payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: type as 'card' | 'us_bank_account',
    });

    console.log(`Found ${paymentMethods.data.length} payment methods`);

    return res.status(200).json({
      success: true,
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card,
        billing_details: pm.billing_details,
        created: pm.created,
        isDefault: pm.id === defaultPaymentMethodId,
      })),
    });
  } catch (error: any) {
    console.error('Error listing payment methods:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to list payment methods',
    });
  }
}

