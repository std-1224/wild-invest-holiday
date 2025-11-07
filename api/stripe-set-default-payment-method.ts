// Vercel Serverless Function: Set Default Stripe Payment Method
// Sets a payment method as the default for a customer

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Set Default Payment Method Request
 */
interface SetDefaultPaymentMethodRequest {
  customerId: string;
  paymentMethodId: string;
}

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
    const request: SetDefaultPaymentMethodRequest = req.body;

    // Validate required fields
    if (!request.customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    if (!request.paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method ID is required'
      });
    }

    console.log('Setting default payment method:', {
      customerId: request.customerId,
      paymentMethodId: request.paymentMethodId,
    });

    // Update customer's default payment method
    const customer = await stripe.customers.update(request.customerId, {
      invoice_settings: {
        default_payment_method: request.paymentMethodId,
      },
    });

    console.log('Default payment method updated');

    return res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata,
        created: customer.created,
      },
    });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to set default payment method',
    });
  }
}

