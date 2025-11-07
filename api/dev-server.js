/**
 * Local Development API Server
 * Simulates AWS Lambda + API Gateway for local testing
 *
 * Usage: node api/dev-server.js
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Stripe Customer ID
const MOCK_CUSTOMER_ID = 'cus_mock_customer_id';

// In-memory storage (simulates DynamoDB)
const mockPaymentMethods = [
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

// Mock payments storage
const mockPayments = [];
const mockSubscriptions = [];

// ============================================================================
// STRIPE API ENDPOINTS
// ============================================================================

/**
 * POST /api/stripe/create-payment-intent
 * Create a PaymentIntent for one-time payment
 */
app.post('/api/stripe/create-payment-intent', (req, res) => {
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

  res.json({
    success: true,
    paymentIntent,
  });
});

/**
 * POST /api/stripe/save-payment-method
 * Save a payment method to a customer
 *
 * In production, this would call Stripe API to attach the payment method.
 * For development, we need to fetch the payment method details from Stripe
 * to get the real card information (brand, last4, expiry).
 */
app.post('/api/stripe/save-payment-method', async (req, res) => {
  const { paymentMethodId, customerId, setAsDefault } = req.body;

  console.log('💳 Save Payment Method:', { paymentMethodId, customerId, setAsDefault });

  try {
    // In development, we need to fetch the real payment method from Stripe
    // to get the actual card details (brand, last4, exp_month, exp_year)
    const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

    // Retrieve the payment method from Stripe
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

    res.json({
      success: true,
      paymentMethod: mockPaymentMethods.find(pm => pm.id === paymentMethodId),
    });
  } catch (error) {
    console.error('❌ Error saving payment method:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/stripe/list-payment-methods
 * List all payment methods for a customer
 */
app.post('/api/stripe/list-payment-methods', (req, res) => {
  const { customerId } = req.body;

  console.log('📋 List Payment Methods:', { customerId });

  // Return payment methods in the same format as the Lambda function
  // with nested card object to match Stripe API structure
  const paymentMethods = mockPaymentMethods.map(pm => ({
    id: pm.id,
    type: pm.type,
    card: pm.card,
    billing_details: pm.billing_details,
    created: pm.created,
    isDefault: pm.id === defaultPaymentMethodId,
  }));

  res.json({
    success: true,
    paymentMethods,
    defaultPaymentMethodId,
  });
});

/**
 * POST /api/stripe/set-default-payment-method
 * Set a payment method as default
 */
app.post('/api/stripe/set-default-payment-method', (req, res) => {
  const { paymentMethodId, customerId } = req.body;

  console.log('⭐ Set Default Payment Method:', { paymentMethodId, customerId });

  defaultPaymentMethodId = paymentMethodId;

  res.json({
    success: true,
    message: 'Default payment method updated',
  });
});

/**
 * POST /api/stripe/remove-payment-method
 * Remove a payment method
 */
app.post('/api/stripe/remove-payment-method', (req, res) => {
  const { paymentMethodId } = req.body;

  console.log('🗑️  Remove Payment Method:', { paymentMethodId });

  const index = mockPaymentMethods.findIndex(pm => pm.id === paymentMethodId);
  if (index !== -1) {
    mockPaymentMethods.splice(index, 1);
    
    // If removed payment method was default, set first remaining as default
    if (defaultPaymentMethodId === paymentMethodId && mockPaymentMethods.length > 0) {
      defaultPaymentMethodId = mockPaymentMethods[0].id;
    }
  }

  res.json({
    success: true,
    message: 'Payment method removed',
  });
});

/**
 * POST /api/stripe/create-subscription
 * Create a subscription for recurring payments
 */
app.post('/api/stripe/create-subscription', (req, res) => {
  const { customerId, priceId, paymentMethodId, trialPeriodDays, metadata } = req.body;

  console.log('🔄 Create Subscription:', { customerId, priceId, trialPeriodDays });

  const subscription = {
    id: `sub_mock_${Date.now()}`,
    object: 'subscription',
    customer: customerId,
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    items: {
      data: [
        {
          id: `si_mock_${Date.now()}`,
          price: {
            id: priceId,
            unit_amount: 9900,
            currency: 'aud',
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
    },
    latest_invoice: {
      payment_intent: {
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
      },
    },
  };

  mockSubscriptions.push(subscription);

  res.json({
    success: true,
    subscription,
  });
});

/**
 * POST /api/stripe/cancel-subscription
 * Cancel a subscription
 */
app.post('/api/stripe/cancel-subscription', (req, res) => {
  const { subscriptionId } = req.body;

  console.log('❌ Cancel Subscription:', { subscriptionId });

  const subscription = mockSubscriptions.find(s => s.id === subscriptionId);
  if (subscription) {
    subscription.status = 'canceled';
  }

  res.json({
    success: true,
    message: 'Subscription canceled',
  });
});

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
app.post('/api/stripe/webhook', (req, res) => {
  const event = req.body;

  console.log('🔔 Webhook Event:', event.type);

  // Simulate webhook processing
  res.json({
    success: true,
    received: true,
  });
});

// ============================================================================
// SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n🚀 Wild Things Development API Server');
  console.log('=====================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Stripe API endpoints available at /api/stripe/*`);
  console.log('\n📝 Available Endpoints:');
  console.log('  POST /api/stripe/create-payment-intent');
  console.log('  POST /api/stripe/save-payment-method');
  console.log('  POST /api/stripe/list-payment-methods');
  console.log('  POST /api/stripe/set-default-payment-method');
  console.log('  POST /api/stripe/remove-payment-method');
  console.log('  POST /api/stripe/create-subscription');
  console.log('  POST /api/stripe/cancel-subscription');
  console.log('  POST /api/stripe/webhook');
  console.log('\n💡 Update your .env file:');
  console.log(`  VITE_API_URL=http://localhost:${PORT}`);
  console.log('\n');
});

