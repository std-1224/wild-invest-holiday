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
import { XeroClient } from 'xero-node';
import { saveTokenSet, getTokenSet, hasValidTokens } from './lib/xero-token-store.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Stripe Customer ID
const MOCK_CUSTOMER_ID = 'cus_mock_customer_id';

// In-memory storage (simulates DynamoDB)
const mockPaymentMethods = [
  // {
  //   id: 'pm_1',
  //   object: 'payment_method',
  //   card: {
  //     brand: 'visa',
  //     last4: '4242',
  //     exp_month: 12,
  //     exp_year: 2025,
  //   },
  //   customer: MOCK_CUSTOMER_ID,
  // },
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
// XERO API ENDPOINTS
// ============================================================================

/**
 * GET /api/xero-auth
 * Redirect to Xero authorization page
 */
app.get('/api/xero-auth', async (req, res) => {
  console.log('🔐 Xero Authorization Request');

  try {
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Xero environment variables');
      return res.status(500).json({
        error: 'Xero not configured',
        message: 'Missing required environment variables',
      });
    }

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
    });

    // Generate consent URL
    const consentUrl = await xero.buildConsentUrl();
    console.log('Redirecting to Xero consent URL');

    // Redirect to Xero
    res.redirect(consentUrl);
  } catch (error) {
    console.error('Error generating Xero consent URL:', error);
    res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message,
    });
  }
});

/**
 * GET /api/xero-callback
 * Handle OAuth callback from Xero
 */
app.get('/api/xero-callback', async (req, res) => {
  console.log('🔄 Xero OAuth Callback:', req.query);

  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('Xero OAuth error:', error, error_description);
      const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
      const errorUrl = `${frontendCallback}?error=${error}&error_description=${encodeURIComponent(error_description || 'Authorization failed')}`;
      return res.redirect(errorUrl);
    }

    if (!code) {
      const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
      const errorUrl = `${frontendCallback}?error=missing_code&error_description=${encodeURIComponent('No authorization code received')}`;
      return res.redirect(errorUrl);
    }

    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
    });

    // Exchange code for tokens
    const tokenSet = await xero.apiCallback(req.url);
    console.log('✅ Successfully obtained Xero tokens');

    // Save tokens to memory
    saveTokenSet(tokenSet);

    // Get tenant connections
    await xero.updateTenants();
    const tenants = xero.tenants;
    const tenant = tenants && tenants.length > 0 ? tenants[0] : null;

    console.log('Xero tenant:', tenant?.tenantName || 'Unknown');

    // Redirect to frontend with success
    const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
    const successUrl = `${frontendCallback}?success=true&tenantId=${tenant?.tenantId || ''}&tenantName=${encodeURIComponent(tenant?.tenantName || 'Unknown')}`;
    res.redirect(successUrl);

  } catch (error) {
    console.error('Error processing Xero callback:', error);
    const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
    const errorUrl = `${frontendCallback}?error=connection_error&error_description=${encodeURIComponent(error.message || 'Failed to connect to Xero')}`;
    res.redirect(errorUrl);
  }
});

/**
 * GET /api/xero/get-invoices
 * Fetch invoices from Xero
 */
app.get('/api/xero/get-invoices', async (req, res) => {
  const { contactId } = req.query;
  console.log('📄 Get Xero Invoices:', { contactId });

  try {
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;
    const tenantId = process.env.XERO_TENANT_ID;

    if (!clientId || !clientSecret || !redirectUri || !tenantId) {
      return res.status(500).json({
        error: 'Xero not configured',
        message: 'Missing required environment variables',
      });
    }

    if (!contactId) {
      return res.status(400).json({
        error: 'Missing contactId parameter',
      });
    }

    // Check if we have valid OAuth tokens
    if (!hasValidTokens()) {
      return res.status(401).json({
        error: 'Not authenticated with Xero',
        message: 'Please connect to Xero first by visiting /api/xero-auth',
        authUrl: `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/xero-auth`,
      });
    }

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
    });

    // Set the stored tokens
    const tokenSet = getTokenSet();
    if (!tokenSet) {
      return res.status(401).json({
        error: 'Not authenticated with Xero',
        message: 'Please connect to Xero first',
      });
    }
    xero.setTokenSet(tokenSet);

    console.log('Fetching real invoices from Xero API for contact:', contactId);

    // Fetch invoices from Xero
    const response = await xero.accountingApi.getInvoices(
      tenantId,
      undefined, // ifModifiedSince
      `Contact.ContactID=GUID("${contactId}")`, // where filter
      'Date DESC', // order
      undefined, // IDs
      undefined, // invoiceNumbers
      undefined, // contactIDs
      ['AUTHORISED', 'SUBMITTED'], // statuses - only unpaid invoices
      undefined, // page
      undefined, // includeArchived
      undefined, // createdByMyApp
      undefined, // unitdp
      undefined  // summaryOnly
    );

    const invoices = response.body.invoices || [];

    // Filter for unpaid invoices only
    const unpaidInvoices = invoices.filter(
      (inv) => inv.amountDue && inv.amountDue > 0
    );

    console.log(`Found ${unpaidInvoices.length} unpaid invoices`);

    res.status(200).json({
      success: true,
      invoices: unpaidInvoices,
      count: unpaidInvoices.length,
    });
  } catch (error) {
    console.error('Error fetching Xero invoices:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices',
      message: error.message,
    });
  }
});

/**
 * POST /api/xero/pay-invoice
 * Pay a Xero invoice with Stripe
 */
app.post('/api/xero/pay-invoice', async (req, res) => {
  console.log('💳 Pay Xero Invoice:', req.body);

  try {
    const {
      invoiceId,
      invoiceNumber,
      amount,
      currency,
      customerId,
      paymentMethodId,
      xeroContactId,
      description,
    } = req.body;

    // Validate required fields
    if (!invoiceId || !amount || !customerId || !paymentMethodId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['invoiceId', 'amount', 'customerId', 'paymentMethodId'],
      });
    }

    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;
    const tenantId = process.env.XERO_TENANT_ID;
    const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

    if (!clientId || !clientSecret || !redirectUri || !tenantId) {
      return res.status(500).json({
        error: 'Xero not configured',
        message: 'Missing required Xero environment variables',
      });
    }

    if (!stripeSecretKey) {
      return res.status(500).json({
        error: 'Stripe not configured',
        message: 'Missing STRIPE_SECRET_KEY environment variable',
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
    });

    // Set the stored tokens
    const tokenSet = getTokenSet();
    if (!tokenSet) {
      return res.status(401).json({
        error: 'Not authenticated with Xero',
        message: 'Please connect to Xero first',
      });
    }
    xero.setTokenSet(tokenSet);

    // Step 1: Charge the customer's card via Stripe
    console.log(`Charging ${amount} ${currency} to payment method ${paymentMethodId}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      description: description || `Payment for invoice ${invoiceNumber}`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    console.log('✅ Stripe charge successful:', paymentIntent.id);

    // Step 2: Record payment in Xero
    const xeroPayment = {
      invoice: {
        invoiceID: invoiceId,
      },
      account: {
        code: '200', // Bank account code - adjust as needed
      },
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      reference: `Stripe: ${paymentIntent.id}`,
    };

    console.log('Recording payment in Xero:', xeroPayment);

    const paymentResponse = await xero.accountingApi.createPayment(
      tenantId,
      { payments: [xeroPayment] }
    );

    console.log('✅ Xero payment recorded successfully');

    res.status(200).json({
      success: true,
      stripeCharge: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      xeroPayment: paymentResponse.body.payments?.[0] || {},
      message: 'Payment processed successfully',
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      error: 'Failed to process payment',
      message: error.message,
      details: error.response?.body || error.stack,
    });
  }
});

// ============================================================================
// SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n🚀 Wild Things Development API Server');
});

