/**
 * Vercel Serverless Function - Main API Handler
 * Converts Express dev-server.js to work on Vercel
 * Handles all /api/* routes using the same logic as local development
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
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

// Initialize Stripe
const stripeKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
if (!stripeKey) {
  console.warn('⚠️  Warning: No Stripe API key found in environment variables');
}
const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia' as any,
});

// In-memory storage (simulates DynamoDB)
// Note: In serverless, this resets on each cold start
// For production, you'd want to use a real database
let mockPaymentMethods: any[] = [
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
    const path = req.url || '';
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
    } else if (path.includes('/xero/get-invoices') || path.includes('/xero-get-invoices')) {
      return await handleXeroGetInvoices(req, res);
    } else if (path.includes('/xero/pay-invoice') || path.includes('/xero-pay-invoice')) {
      return await handleXeroPayInvoice(req, res);
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

/**
 * GET /api/xero-auth
 * Redirects user to Xero authorization page
 */
async function handleXeroAuth(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        error: 'Xero OAuth not configured',
        message: 'Please configure XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI',
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret,
          redirectUri: !redirectUri,
        },
      });
    }

    console.log('Generating Xero consent URL...');
    console.log('Redirect URI:', redirectUri);

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
    });

    // Generate consent URL
    const consentUrl = await xero.buildConsentUrl();

    console.log('Consent URL generated:', consentUrl);

    // Redirect to Xero authorization page
    return res.redirect(consentUrl);

  } catch (error: any) {
    console.error('Error generating Xero consent URL:', error);
    return res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message,
    });
  }
}

/**
 * GET /api/xero-callback
 * Handles OAuth callback from Xero
 */
async function handleXeroCallback(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, error, error_description } = req.query;

    // Get frontend callback URL
    const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';

    // Check for OAuth errors
    if (error) {
      console.error('Xero OAuth error:', error, error_description);
      const errorUrl = `${frontendCallback}?error=${encodeURIComponent(error as string)}&error_description=${encodeURIComponent(error_description as string || 'Unknown error')}`;
      res.setHeader('Location', errorUrl);
      return res.status(302).end();
    }

    if (!code) {
      const errorUrl = `${frontendCallback}?error=no_code&error_description=${encodeURIComponent('No authorization code was provided by Xero')}`;
      res.setHeader('Location', errorUrl);
      return res.status(302).end();
    }

    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        error: 'Xero OAuth not configured',
        message: 'Please configure XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI',
      });
    }

    console.log('Processing Xero OAuth callback...');
    console.log('Authorization code received:', code);

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
      state: '', // Match the empty state from the callback
    });

    // Exchange authorization code for tokens
    const callbackUrl = `${redirectUri}?code=${code}&state=`;
    await xero.apiCallback(callbackUrl);

    console.log('✅ Token exchange successful');

    // Get token set
    const tokenSet = xero.readTokenSet();

    // Save tokens to memory for use by other endpoints
    saveTokenSet(tokenSet);

    console.log('Access Token:', tokenSet.access_token?.substring(0, 20) + '...');
    console.log('Refresh Token:', tokenSet.refresh_token?.substring(0, 20) + '...');
    console.log('Expires At:', new Date((tokenSet.expires_at || 0) * 1000).toISOString());

    // Get tenant connections
    await xero.updateTenants();
    const tenants = xero.tenants;

    if (!tenants || tenants.length === 0) {
      return res.status(500).json({
        error: 'No organizations found',
        message: 'No Xero organizations are connected to your account'
      });
    }

    const tenant = tenants[0];

    console.log('✅ Tenant ID:', tenant.tenantId);
    console.log('✅ Tenant Name:', tenant.tenantName);
    console.log('✅ Tenant Type:', tenant.tenantType);

    // Redirect to frontend with success parameters
    const redirectUrl = `${frontendCallback}?success=true&tenantId=${tenant.tenantId}&tenantName=${encodeURIComponent(tenant.tenantName || '')}&tenantType=${tenant.tenantType}`;

    console.log('Redirecting to frontend:', redirectUrl);
    res.setHeader('Location', redirectUrl);
    return res.status(302).end();

  } catch (error: any) {
    console.error('Error processing Xero callback:', error);

    // Redirect to frontend with error
    const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
    const errorUrl = `${frontendCallback}?error=connection_error&error_description=${encodeURIComponent(error.message || 'Failed to connect to Xero')}`;
    res.setHeader('Location', errorUrl);
    return res.status(302).end();
  }
}

/**
 * GET /api/xero-get-invoices
 * Fetches unpaid invoices from Xero for a specific customer
 */
async function handleXeroGetInvoices(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contactId } = req.query;

    if (!contactId) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    console.log('Fetching Xero invoices for contact:', contactId);

    // Validate Xero configuration
    const tenantId = process.env.XERO_TENANT_ID;
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    if (!tenantId || !clientId || !clientSecret || !redirectUri) {
      console.error('Xero API not configured properly');
      return res.status(500).json({
        error: 'Xero API not configured',
        message: 'Please configure XERO_TENANT_ID, XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI in environment variables',
        missing: {
          tenantId: !tenantId,
          clientId: !clientId,
          clientSecret: !clientSecret,
          redirectUri: !redirectUri,
        }
      });
    }

    // Check if we have valid OAuth tokens
    if (!hasValidTokens()) {
      console.error('No valid Xero OAuth tokens found');
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
      console.error('No token set available');
      return res.status(401).json({
        error: 'Not authenticated with Xero',
        message: 'Please connect to Xero first',
      });
    }
    xero.setTokenSet(tokenSet as any);

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

    return res.status(200).json({
      success: true,
      invoices: unpaidInvoices,
      count: unpaidInvoices.length,
    });
  } catch (error: any) {
    console.error('Error fetching Xero invoices:', error);
    return res.status(500).json({
      error: 'Failed to fetch invoices',
      message: error.message,
    });
  }
}

/**
 * POST /api/xero-pay-invoice
 * Charges customer's saved credit card and records payment in Xero
 */
async function handleXeroPayInvoice(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoiceId, invoiceNumber, amount, currency, customerId, paymentMethodId, xeroContactId, description } = req.body;

    // Validate request
    if (!invoiceId || !amount || !customerId || !paymentMethodId) {
      return res.status(400).json({
        error: 'Missing required fields: invoiceId, amount, customerId, paymentMethodId',
      });
    }

    console.log('Processing invoice payment:', {
      invoiceId,
      invoiceNumber,
      amount,
      customerId,
    });

    // Step 1: Charge the customer's credit card via Stripe
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      description: description || `Payment for Invoice ${invoiceNumber}`,
      metadata: {
        invoiceId,
        invoiceNumber,
        xeroContactId,
        source: 'wild-things-portal',
      },
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/investor-portal`,
    });

    console.log('Stripe payment created:', paymentIntent.id, 'Status:', paymentIntent.status);

    // Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment failed',
        status: paymentIntent.status,
        message: 'The payment could not be processed. Please check your payment method.',
      });
    }

    // Step 2: Record payment in Xero
    const tenantId = process.env.XERO_TENANT_ID;
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    if (!tenantId || !clientId || !clientSecret || !redirectUri) {
      console.error('Xero API not configured - payment charged but not recorded in Xero!');

      return res.status(500).json({
        error: 'Xero API not configured',
        message: 'Payment was charged successfully but could not be recorded in Xero. Please contact support.',
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
        missing: {
          tenantId: !tenantId,
          clientId: !clientId,
          clientSecret: !clientSecret,
          redirectUri: !redirectUri,
        }
      });
    }

    // Check if we have valid OAuth tokens
    if (!hasValidTokens()) {
      console.error('No valid Xero OAuth tokens - payment charged but not recorded in Xero!');
      return res.status(401).json({
        error: 'Not authenticated with Xero',
        message: 'Payment was charged successfully but could not be recorded in Xero. Please connect to Xero first.',
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
        authUrl: `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/xero-auth`,
      });
    }

    console.log('Recording payment in Xero...');

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
      console.error('No token set available');
      return res.status(401).json({
        error: 'Not authenticated with Xero',
        message: 'Please connect to Xero first',
      });
    }
    xero.setTokenSet(tokenSet as any);

    // Create payment in Xero
    const xeroPayment = {
      invoice: {
        invoiceID: invoiceId,
      },
      account: {
        code: process.env.XERO_BANK_ACCOUNT_CODE || '090', // Default bank account
      },
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      reference: `Stripe: ${paymentIntent.id}`,
    };

    const paymentResponse = await xero.accountingApi.createPayment(
      tenantId,
      xeroPayment as any
    );

    const xeroPaymentRecord = paymentResponse.body.payments?.[0];

    console.log('Xero payment recorded:', xeroPaymentRecord?.paymentID);

    // Fetch the full payment intent to get charges
    const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
      expand: ['charges'],
    });

    // Step 3: Return success response
    return res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        receiptUrl: (fullPaymentIntent as any).charges?.data[0]?.receipt_url,
      },
      xeroPayment: {
        paymentID: xeroPaymentRecord?.paymentID,
        invoiceID: invoiceId,
        amount: amount,
        date: xeroPaymentRecord?.date,
        reference: xeroPaymentRecord?.reference,
      },
      message: 'Payment processed and recorded in Xero successfully',
    });
  } catch (error: any) {
    console.error('Error processing invoice payment:', error);

    // Handle Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card error',
        message: error.message,
        code: error.code,
      });
    }

    // Handle Xero errors
    if (error.response?.body) {
      console.error('Xero API error:', error.response.body);
      return res.status(500).json({
        error: 'Xero API error',
        message: 'Payment succeeded but failed to record in Xero',
        details: error.response.body,
      });
    }

    return res.status(500).json({
      error: 'Failed to process payment',
      message: error.message,
    });
  }
}

