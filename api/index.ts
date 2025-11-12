/**
 * Vercel Serverless Function - Main API Handler
 * Converts Express dev-server.js to work on Vercel
 * Handles all /api/* routes using the same logic as local development
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
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
  handleGetLocationSites,
  handleUpdateLocation,
} from '../server/handlers/locations.js';
import {
  handleGetOwnerCabins,
  handleGetMyCabins,
  handleSearchOwners,
} from '../server/handlers/cabins.js';

// Initialize Stripe
const stripeKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
if (!stripeKey) {
  console.warn('⚠️  Warning: No Stripe API key found in environment variables');
}
const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia' as any,
});

// In-memory storage for subscriptions (simulates DynamoDB)
// Note: In serverless, this resets on each cold start
// For production, you'd want to use a real database
let mockSubscriptions: any[] = [];

/**
 * Main Handler - Routes requests to appropriate handlers
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Get the path from the URL
    // In Vercel, req.url might be just the function path, so we need to reconstruct from query params
    let path = req.url || '';

    // If Vercel added the path as a query parameter, use that instead
    if (req.query.path && typeof req.query.path === 'string') {
      path = `/api/${req.query.path}`;
    } else {
      // Otherwise, clean the URL by removing query string
      path = path.split('?')[0];
    }

    // Debug logging
    console.log('📍 Request:', {
      method: req.method,
      url: req.url,
      path,
      query: req.query,
    });

    // Health check endpoint
    if (path === '/api' || path === '/api/' || path.includes('/health')) {
      return res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        env: {
          hasStripeKey: !!process.env.STRIPE_SECRET_KEY || !!process.env.VITE_STRIPE_SECRET_KEY,
          hasXeroClientId: !!process.env.XERO_CLIENT_ID,
          hasXeroClientSecret: !!process.env.XERO_CLIENT_SECRET,
          hasXeroTenantId: !!process.env.XERO_TENANT_ID,
        },
      });
    }

    // Route to appropriate handler
    // Auth routes
    if (path.includes('/auth/register')) {
      return await handleRegister(req, res);
    } else if (path.includes('/auth/login')) {
      return await handleLogin(req, res);
    } else if (path.includes('/auth/forgot-password')) {
      return await handleForgotPassword(req, res);
    } else if (path.includes('/auth/reset-password')) {
      return await handleResetPassword(req, res);
    } else if (path.includes('/auth/update-profile')) {
      return await handleUpdateProfile(req, res);
    } else if (path.includes('/auth/change-password')) {
      return await handleChangePassword(req, res);
    } else if (path.includes('/auth/validate-referral')) {
      return await handleValidateReferral(req, res);
    } else if (path.includes('/auth/referral-stats')) {
      return await handleGetReferralStats(req, res);
    } else if (path.includes('/auth/apply-referral-credits')) {
      return await handleApplyReferralCredits(req, res);
    } else if (path.includes('/auth/me')) {
      return await handleGetProfile(req, res);
    }
    // Stripe routes
    else if (path.includes('/stripe/save-payment-method')) {
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
    }
    // Xero routes
    else if (path.includes('/xero-auth') || path.includes('/xero/auth')) {
      return await handleXeroAuth(req, res);
    } else if (path.includes('/xero-callback') || path.includes('/xero/callback')) {
      return await handleXeroCallback(req, res);
    } else if (path.includes('/xero/status')) {
      return await handleXeroStatus(req, res);
    } else if (path.includes('/xero/disconnect')) {
      return await handleXeroDisconnect(req, res);
    } else if (path.includes('/xero/invoices')) {
      return await handleGetXeroInvoices(req, res);
    } else if (path.includes('/xero/record-payment')) {
      return await handleRecordXeroPayment(req, res);
    } else if (path.includes('/xero/get-invoices')) {
      return await handleGetInvoicesForContact(req, res);
    } else if (path.includes('/xero/pay-invoice')) {
      return await handlePayInvoice(req, res);
    }
    // Marketing Boost routes
    else if (path.includes('/marketing-boost/activate')) {
      return await handleActivateBoost(req, res);
    } else if (path.includes('/marketing-boost/list')) {
      return await handleListBoosts(req, res);
    } else if (path.includes('/marketing-boost/cancel')) {
      return await handleCancelBoost(req, res);
    } else if (path.includes('/marketing-boost/pause')) {
      return await handlePauseBoost(req, res);
    } else if (path.includes('/marketing-boost/resume')) {
      return await handleResumeBoost(req, res);
    }
    // Payment History routes
    else if (path.includes('/payments/history')) {
      return await handleGetPaymentHistory(req, res);
    } else if (path.includes('/payments/boost-payments')) {
      return await handleGetBoostPayments(req, res);
    }
    // Agreement routes - Order matters! Check specific routes before generic patterns
    else if (path.includes('/agreements/owners')) {
      return await handleGetAllOwners(req, res);
    } else if (path.includes('/agreements') && req.method === 'POST') {
      return await handleCreateAgreement(req, res);
    } else if (path.match(/\/agreements\/[a-f0-9]{24}$/) && req.method === 'PUT') {
      // PUT /api/agreements/:agreementId
      const agreementId = path.split('/').pop();
      (req as any).params = { agreementId };
      return await handleUpdateAgreement(req, res);
    } else if (path.match(/\/agreements\/[a-f0-9]{24}$/)) {
      // GET /api/agreements/:ownerId
      const ownerId = path.split('/').pop();
      (req as any).params = { ownerId };
      return await handleGetAgreementsByOwner(req, res);
    }
    // Upload routes
    else if (path.includes('/upload/agreement')) {
      return await handleUploadAgreement(req, res);
    }
    // Location routes
    else if (path.includes('/admin/locations') && req.method === 'POST') {
      return await handleCreateLocation(req, res);
    } else if (path.match(/\/admin\/locations\/[a-f0-9]{24}$/) && req.method === 'PUT') {
      const locationId = path.split('/').pop();
      (req as any).params = { locationId };
      return await handleUpdateLocation(req, res);
    } else if (path.match(/\/locations\/[a-f0-9]{24}\/sites$/)) {
      const parts = path.split('/');
      const locationId = parts[parts.length - 2];
      (req as any).params = { locationId };
      return await handleGetLocationSites(req, res);
    } else if (path.includes('/locations')) {
      return await handleGetLocations(req, res);
    }
    // Cabin and Owner routes
    else if (path.includes('/admin/owners/search')) {
      return await handleSearchOwners(req, res);
    } else if (path.match(/\/admin\/owners\/[a-f0-9]{24}\/cabins$/)) {
      const parts = path.split('/');
      const ownerId = parts[parts.length - 2];
      (req as any).params = { ownerId };
      return await handleGetOwnerCabins(req, res);
    } else if (path.includes('/cabins/my-cabins')) {
      return await handleGetMyCabins(req, res);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: path,
      });
    }
  } catch (error: any) {
    console.error('❌ Fatal Error in handler:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
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
