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
import {
  handleXeroAuth,
  handleXeroCallback,
} from '../server/handlers/xero-oauth.js';
import {
  handleXeroStatus,
  handleValidateXeroConnection,
  handleXeroDisconnect,
  handleGetXeroInvoices,
  handleRecordXeroPayment,
  handleGetInvoicesForContact,
  handlePayInvoice,
} from '../server/handlers/xero.js';
import {
  handleActivateBoost,
  handleListBoosts,
  handleCancelBoost,
  handlePauseBoost,
  handleResumeBoost,
} from '../server/handlers/marketing-boost.js';
import {
  handleGetPaymentHistory,
  handleGetBoostPayments,
} from '../server/handlers/payments.js';
import {
  handleGetLocations,
  handleCreateLocation,
  handleGetSitesByLocation,
  handleUpdateLocation,
} from '../server/handlers/locations.js';
import {
  handleGetOwnerCabins,
  handleGetMyCabins,
  handleSearchOwners,
} from '../server/handlers/cabins.js';

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

// OAuth endpoints
app.get('/api/xero-auth', handleXeroAuth);
app.get('/api/xero-callback', handleXeroCallback);

// Xero connection management
app.get('/api/xero/status', handleXeroStatus);
app.get('/api/xero/validate-connection', handleValidateXeroConnection);
app.post('/api/xero/disconnect', handleXeroDisconnect);

// Xero data endpoints
app.get('/api/xero/invoices', handleGetXeroInvoices);
app.post('/api/xero/record-payment', handleRecordXeroPayment);

// Xero invoice endpoints (for owners to view and pay invoices)
app.get('/api/xero/get-invoices', handleGetInvoicesForContact);
app.post('/api/xero/pay-invoice', handlePayInvoice);

// ============================================================================
// MARKETING BOOST API ENDPOINTS
// ============================================================================

app.post('/api/marketing-boost/activate', handleActivateBoost);
app.get('/api/marketing-boost/list', handleListBoosts);
app.post('/api/marketing-boost/cancel', handleCancelBoost);
app.post('/api/marketing-boost/pause', handlePauseBoost);
app.post('/api/marketing-boost/resume', handleResumeBoost);

// ============================================================================
// PAYMENT HISTORY API ENDPOINTS
// ============================================================================

app.get('/api/payments/history', handleGetPaymentHistory);
app.get('/api/payments/boost-payments', handleGetBoostPayments);

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
// LOCATION & SITE API ENDPOINTS
// ============================================================================

/**
 * GET /api/locations
 * Get all locations
 */
app.get('/api/locations', async (req, res) => {
  await handleGetLocations(req, res);
});

/**
 * POST /api/admin/locations
 * Create a new location (Admin only)
 */
app.post('/api/admin/locations', async (req, res) => {
  await handleCreateLocation(req, res);
});

/**
 * PUT /api/admin/locations/:locationId
 * Update a location (Admin only)
 */
app.put('/api/admin/locations/:locationId', async (req, res) => {
  await handleUpdateLocation(req, res);
});

/**
 * GET /api/locations/:locationId/sites
 * Get sites for a location
 */
app.get('/api/locations/:locationId/sites', async (req, res) => {
  await handleGetSitesByLocation(req, res);
});

// ============================================================================
// CABIN & OWNER API ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/owners/search
 * Search owners by name or email (Admin only)
 */
app.get('/api/admin/owners/search', async (req, res) => {
  await handleSearchOwners(req, res);
});

/**
 * GET /api/admin/owners/:ownerId/cabins
 * Get cabins owned by a specific owner (Admin only)
 */
app.get('/api/admin/owners/:ownerId/cabins', async (req, res) => {
  await handleGetOwnerCabins(req, res);
});

/**
 * GET /api/cabins/my-cabins
 * Get all cabins for authenticated user
 */
app.get('/api/cabins/my-cabins', async (req, res) => {
  await handleGetMyCabins(req, res);
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

