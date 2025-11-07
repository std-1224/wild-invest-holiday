/**
 * Vercel Serverless Function - Main API Handler
 * Converts Express dev-server.js to work on Vercel
 * Handles all /api/* routes using the same logic as local development
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Mock Stripe Customer ID (same as dev-server.js)
const MOCK_CUSTOMER_ID = 'cus_mock_customer_id';

// In-memory storage (simulates DynamoDB)
// Note: In serverless, this resets on each cold start
// For production, you'd want to use a real database
let mockPaymentMethods: any[] = [
  {
    id: 'pm_1',
    object: 'payment_method',
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2025,
    },
    customer: MOCK_CUSTOMER_ID,
  },
];

let defaultPaymentMethodId = 'pm_1';
let mockPayments: any[] = [];
let mockSubscriptions: any[] = [];

/**
 * Main Handler - Routes requests to appropriate handlers
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the path from the URL
  const path = req.url || '';

  console.log(`📥 ${req.method} ${path}`);

  try {
    // Route to appropriate handler
    if (path.includes('/stripe/save-payment-method')) {
      return await handleSavePaymentMethod(req, res);
    } else if (path.includes('/stripe/list-payment-methods')) {
      return await handleListPaymentMethods(req, res);
    } else if (path.includes('/stripe/set-default-payment-method')) {
      return await handleSetDefaultPaymentMethod(req, res);
    } else if (path.includes('/stripe/remove-payment-method')) {
      return await handleRemovePaymentMethod(req, res);
    } else if (path.includes('/stripe/create-payment-intent')) {
      return await handleCreatePaymentIntent(req, res);
    } else if (path.includes('/stripe/create-subscription')) {
      return await handleCreateSubscription(req, res);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found',
      });
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * POST /api/stripe/save-payment-method
 * Save a payment method to a customer
 */
async function handleSavePaymentMethod(req: VercelRequest, res: VercelResponse) {
  const { paymentMethodId, customerId, setAsDefault } = req.body;

  console.log('💳 Save Payment Method:', { paymentMethodId, customerId, setAsDefault });

  try {
    // Retrieve the payment method from Stripe to get real card details
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Check if payment method already exists
    const existingIndex = mockPaymentMethods.findIndex(pm => pm.id === paymentMethodId);

    if (existingIndex === -1) {
      // Add new payment method with real Stripe data
      const newPaymentMethod = {
        id: stripePaymentMethod.id,
        object: 'payment_method',
        card: {
          brand: stripePaymentMethod.card?.brand || 'unknown',
          last4: stripePaymentMethod.card?.last4 || '0000',
          exp_month: stripePaymentMethod.card?.exp_month || 0,
          exp_year: stripePaymentMethod.card?.exp_year || 0,
        },
        customer: customerId,
      };
      mockPaymentMethods.push(newPaymentMethod);
    }

    if (setAsDefault) {
      defaultPaymentMethodId = paymentMethodId;
    }

    return res.json({
      success: true,
      paymentMethod: mockPaymentMethods.find(pm => pm.id === paymentMethodId),
    });
  } catch (error: any) {
    console.error('❌ Error saving payment method:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/stripe/list-payment-methods
 * List all payment methods for a customer
 */
async function handleListPaymentMethods(req: VercelRequest, res: VercelResponse) {
  const { customerId } = req.body;

  console.log('📋 List Payment Methods:', { customerId });

  // Return payment methods in the same format as the dev-server
  const paymentMethods = mockPaymentMethods.map(pm => ({
    id: pm.id,
    type: pm.type,
    card: pm.card,
    billing_details: pm.billing_details,
    created: pm.created,
    isDefault: pm.id === defaultPaymentMethodId,
  }));

  return res.json({
    success: true,
    paymentMethods,
  });
}

/**
 * POST /api/stripe/set-default-payment-method
 * Set a payment method as default
 */
async function handleSetDefaultPaymentMethod(req: VercelRequest, res: VercelResponse) {
  const { paymentMethodId, customerId } = req.body;

  console.log('⭐ Set Default Payment Method:', { paymentMethodId, customerId });

  defaultPaymentMethodId = paymentMethodId;

  return res.json({
    success: true,
    message: 'Default payment method updated',
  });
}

/**
 * POST /api/stripe/remove-payment-method
 * Remove a payment method
 */
async function handleRemovePaymentMethod(req: VercelRequest, res: VercelResponse) {
  const { paymentMethodId } = req.body;

  console.log('🗑️ Remove Payment Method:', { paymentMethodId });

  const index = mockPaymentMethods.findIndex(pm => pm.id === paymentMethodId);
  if (index !== -1) {
    mockPaymentMethods.splice(index, 1);
  }

  // If this was the default, clear it
  if (defaultPaymentMethodId === paymentMethodId) {
    defaultPaymentMethodId = mockPaymentMethods.length > 0 ? mockPaymentMethods[0].id : '';
  }

  return res.json({
    success: true,
    message: 'Payment method removed',
  });
}

/**
 * POST /api/stripe/create-payment-intent
 * Create a PaymentIntent for one-time payment
 */
async function handleCreatePaymentIntent(req: VercelRequest, res: VercelResponse) {
  const { amount, currency, customerId, description, metadata } = req.body;

  console.log('📝 Create Payment Intent:', { amount, currency, customerId, description });

  const paymentIntent = {
    id: `pi_mock_${Date.now()}`,
    object: 'payment_intent',
    amount,
    currency: currency || 'aud',
    customer: customerId,
    description,
    metadata,
    status: 'requires_payment_method',
    client_secret: `pi_mock_${Date.now()}_secret_mock`,
  };

  return res.json({
    success: true,
    paymentIntent,
  });
}

/**
 * POST /api/stripe/create-subscription
 * Create a subscription
 */
async function handleCreateSubscription(req: VercelRequest, res: VercelResponse) {
  const { customerId, priceId, paymentMethodId, metadata } = req.body;

  console.log('🔄 Create Subscription:', { customerId, priceId, paymentMethodId });

  const subscription = {
    id: `sub_mock_${Date.now()}`,
    object: 'subscription',
    customer: customerId,
    status: 'active',
    items: {
      data: [
        {
          id: `si_mock_${Date.now()}`,
          price: {
            id: priceId,
          },
        },
      ],
    },
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    metadata,
  };

  mockSubscriptions.push(subscription);

  return res.json({
    success: true,
    subscription,
  });
}

