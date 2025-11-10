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
import { saveTokenSet, getTokenSet, hasValidTokens } from '../server/lib/xero-token-store.js';
import {
  handleRegister,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  handleGetProfile,
  handleUpdateProfile,
  handleChangePassword,
  handleValidateReferral,
  handleGetReferralStats,
  handleApplyReferralCredits,
} from '../server/handlers/auth.js';
import {
  handleGetAllOwners,
  handleGetAgreementsByOwner,
  handleCreateAgreement,
  handleUpdateAgreement,
} from '../server/handlers/agreements.js';
import {
  handleUploadAgreement,
} from '../server/handlers/upload.js';
import {
  handleSavePaymentMethod,
  handleListPaymentMethods,
  handleSetDefaultPaymentMethod,
  handleRemovePaymentMethod,
} from '../server/handlers/payment-methods.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for file uploads (base64)
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory storage for subscriptions (simulates DynamoDB)
const mockSubscriptions = [];

// ============================================================================
// AUTH API ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/register
 * Register a new user
 */
app.post('/api/auth/register', async (req, res) => {
  await handleRegister(req, res);
});

/**
 * POST /api/auth/login
 * Login user
 */
app.post('/api/auth/login', async (req, res) => {
  await handleLogin(req, res);
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
app.post('/api/auth/forgot-password', async (req, res) => {
  await handleForgotPassword(req, res);
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
app.post('/api/auth/reset-password', async (req, res) => {
  await handleResetPassword(req, res);
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
app.get('/api/auth/me', async (req, res) => {
  await handleGetProfile(req, res);
});

/**
 * PUT /api/auth/update-profile
 * Update user profile
 */
app.put('/api/auth/update-profile', async (req, res) => {
  await handleUpdateProfile(req, res);
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
app.put('/api/auth/change-password', async (req, res) => {
  await handleChangePassword(req, res);
});

/**
 * POST /api/auth/validate-referral
 * Validate a referral code
 */
app.post('/api/auth/validate-referral', async (req, res) => {
  await handleValidateReferral(req, res);
});

/**
 * GET /api/auth/referral-stats
 * Get referral statistics
 */
app.get('/api/auth/referral-stats', async (req, res) => {
  await handleGetReferralStats(req, res);
});

/**
 * POST /api/auth/apply-referral-credits
 * Apply referral credits on first investment
 */
app.post('/api/auth/apply-referral-credits', async (req, res) => {
  await handleApplyReferralCredits(req, res);
});

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

// Stripe Payment Method Routes - Using MongoDB handlers
app.post('/api/stripe/save-payment-method', handleSavePaymentMethod);
app.post('/api/stripe/list-payment-methods', handleListPaymentMethods);
app.post('/api/stripe/set-default-payment-method', handleSetDefaultPaymentMethod);
app.post('/api/stripe/remove-payment-method', handleRemovePaymentMethod);

/**
 * POST /api/stripe/create-subscription
 * Create a subscription for recurring payments
 */
app.post('/api/stripe/create-subscription', (req, res) => {
  const { customerId, priceId, trialPeriodDays } = req.body;

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
app.get('/api/xero-auth', async (_req, res) => {
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
    const { code, error, error_description } = req.query;

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
// AGREEMENT API ENDPOINTS
// ============================================================================

/**
 * GET /api/agreements/owners
 * Get all users with role 'owner' (Admin only)
 */
app.get('/api/agreements/owners', async (req, res) => {
  await handleGetAllOwners(req, res);
});

/**
 * GET /api/agreements/:ownerId
 * Get all agreements for a specific owner
 */
app.get('/api/agreements/:ownerId', async (req, res) => {
  await handleGetAgreementsByOwner(req, res);
});

/**
 * POST /api/agreements
 * Create a new agreement (Admin only)
 */
app.post('/api/agreements', async (req, res) => {
  await handleCreateAgreement(req, res);
});

/**
 * PUT /api/agreements/:agreementId
 * Update an agreement (Admin only)
 */
app.put('/api/agreements/:agreementId', async (req, res) => {
  await handleUpdateAgreement(req, res);
});

/**
 * POST /api/upload/agreement
 * Upload agreement file to S3
 */
app.post('/api/upload/agreement', async (req, res) => {
  await handleUploadAgreement(req, res);
});

// ============================================================================
// SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n🚀 Wild Things Development API Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`\n✅ Available endpoints:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/auth/forgot-password`);
  console.log(`   - POST /api/auth/reset-password`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   - GET  /api/health`);
  console.log(`   - Stripe endpoints...`);
  console.log(`   - Xero endpoints...\n`);
});

