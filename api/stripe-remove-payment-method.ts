// Vercel Serverless Function: Remove Stripe Payment Method
// Detaches a payment method from a customer

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Remove Payment Method Request
 */
interface RemovePaymentMethodRequest {
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
    const request: RemovePaymentMethodRequest = req.body;

    // Validate required fields
    if (!request.paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method ID is required'
      });
    }

    console.log('Removing payment method:', request.paymentMethodId);

    // Detach payment method from customer
    await stripe.paymentMethods.detach(request.paymentMethodId);

    console.log('Payment method removed');

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error removing payment method:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove payment method',
    });
  }
}

