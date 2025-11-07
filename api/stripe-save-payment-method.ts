// Vercel Serverless Function: Save Stripe Payment Method
// Attaches a payment method to a customer and optionally sets it as default

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Save Payment Method Request
 */
interface SavePaymentMethodRequest {
  paymentMethodId: string;
  customerId: string;
  setAsDefault?: boolean;
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
    const request: SavePaymentMethodRequest = req.body;

    // Validate required fields
    if (!request.paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method ID is required'
      });
    }

    if (!request.customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    console.log('Saving payment method:', {
      paymentMethodId: request.paymentMethodId,
      customerId: request.customerId,
      setAsDefault: request.setAsDefault,
    });

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(
      request.paymentMethodId,
      {
        customer: request.customerId,
      }
    );

    console.log('Payment method attached:', paymentMethod.id);

    // Set as default if requested
    if (request.setAsDefault) {
      await stripe.customers.update(request.customerId, {
        invoice_settings: {
          default_payment_method: request.paymentMethodId,
        },
      });

      console.log('Payment method set as default');
    }

    return res.status(200).json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card,
        billing_details: paymentMethod.billing_details,
        created: paymentMethod.created,
      },
    });
  } catch (error: any) {
    console.error('Error saving payment method:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save payment method',
    });
  }
}

