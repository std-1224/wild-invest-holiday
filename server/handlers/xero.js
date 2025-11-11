import { XeroClient } from 'xero-node';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import XeroConnection from '../models/XeroConnection.js';
import User from '../models/User.js';
import StripeCustomer from '../models/StripeCustomer.js';
import InvoicePayment from '../models/InvoicePayment.js';
import { connectDB } from '../lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper: Extract and verify authenticated user from JWT token
 */
async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Not authenticated');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Token payload uses 'id' not 'userId'
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Helper: Get or refresh Xero access token
 * Automatically refreshes if token is expired or expires soon
 */
async function getValidXeroClient(userId) {
  const connection = await XeroConnection.findByUserId(userId);
  
  if (!connection) {
    throw new Error('Xero not connected. Please connect your Xero account first.');
  }
  
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Xero OAuth not configured');
  }
  
  // Initialize Xero client
  const xero = new XeroClient({
    clientId,
    clientSecret,
    redirectUris: [redirectUri],
    scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access'.split(' '),
  });

  // ✅ Initialize the OAuth client (required for token refresh to work)
  await xero.initialize();

  // 🔍 DEBUG: Decrypt and validate tokens
  const decryptedAccessToken = connection.getAccessToken();
  const decryptedRefreshToken = connection.getRefreshToken();

  console.log('\n🔍 ===== XERO TOKEN DEBUG INFO =====');
  console.log('📅 Token expires at:', connection.tokenExpiresAt);
  console.log('📅 Current time:', new Date());
  console.log('⏰ Time until expiry:', Math.floor((connection.tokenExpiresAt - new Date()) / 1000 / 60), 'minutes');
  console.log('🔄 Needs refresh?', connection.needsRefresh());
  console.log('🔑 XERO_ENCRYPTION_KEY exists:', !!process.env.XERO_ENCRYPTION_KEY);
  console.log('🔑 XERO_ENCRYPTION_KEY length:', process.env.XERO_ENCRYPTION_KEY?.length);
  console.log('🎫 Access token length:', decryptedAccessToken.length);
  console.log('🎫 Refresh token length:', decryptedRefreshToken.length);

  if (decryptedAccessToken.length > 0) {
    console.log('🎫 Access token preview:', decryptedAccessToken.substring(0, 20) + '...');
  }
  if (decryptedRefreshToken.length > 0) {
    console.log('🎫 Refresh token preview:', decryptedRefreshToken.substring(0, 20) + '...');
  }
  console.log('===================================\n');

  // ✅ Validate that tokens were decrypted successfully
  if (!decryptedAccessToken || !decryptedRefreshToken) {
    console.error('❌ Token decryption failed!');
    console.error('💡 This usually means:');
    console.error('   1. XERO_ENCRYPTION_KEY is missing from environment variables');
    console.error('   2. XERO_ENCRYPTION_KEY has changed since tokens were encrypted');
    console.error('   3. Tokens in database are corrupted');
    console.error('');
    console.error('🔧 Solution: Reconnect your Xero account to generate new tokens');
    throw new Error('Token decryption failed. The encryption key may have changed. Please reconnect your Xero account.');
  }

  // Check if token needs refresh (expired or expires in < 5 minutes)
  if (connection.needsRefresh()) {
    console.log('🔄 Xero access token expired or expiring soon, refreshing...');

    try {
      // Set the current token set for refresh
      xero.setTokenSet({
        access_token: decryptedAccessToken,
        refresh_token: decryptedRefreshToken,
        expires_at: Math.floor(connection.tokenExpiresAt.getTime() / 1000),
        token_type: connection.tokenType,
      });

      console.log('📡 Calling Xero API to refresh token...');

      // Refresh the token
      const newTokenSet = await xero.refreshToken();

      console.log('✅ Xero token refreshed successfully!');
      console.log('📅 New expires at:', new Date((newTokenSet.expires_at || 0) * 1000).toISOString());
      console.log('🎫 New access token length:', newTokenSet.access_token?.length || 0);
      console.log('🎫 New refresh token length:', newTokenSet.refresh_token?.length || 0);

      // Update connection with new tokens
      connection.setAccessToken(newTokenSet.access_token);
      connection.setRefreshToken(newTokenSet.refresh_token);
      connection.tokenExpiresAt = new Date((newTokenSet.expires_at || 0) * 1000);
      connection.tokenType = newTokenSet.token_type || 'Bearer';

      await connection.save();
      console.log('💾 New tokens saved to database');

      // Set the new token set in the client
      xero.setTokenSet(newTokenSet);
    } catch (error) {
      console.error('\n❌ ===== XERO TOKEN REFRESH FAILED =====');
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      console.error('');
      console.error('💡 Common causes:');
      console.error('   1. Refresh token is invalid or expired (>60 days old)');
      console.error('   2. Refresh token was already used (Xero invalidates old refresh tokens)');
      console.error('   3. User revoked access from Xero side');
      console.error('   4. Network/API error');
      console.error('');
      console.error('🔧 Solution: Reconnect your Xero account');
      console.error('======================================\n');
      throw new Error('Failed to refresh Xero token. Please reconnect your Xero account.');
    }
  } else {
    // Token is still valid, use it
    console.log('✅ Xero token is still valid, using existing token');
    xero.setTokenSet({
      access_token: decryptedAccessToken,
      refresh_token: decryptedRefreshToken,
      expires_at: Math.floor(connection.tokenExpiresAt.getTime() / 1000),
      token_type: connection.tokenType,
    });
  }
  
  return { xero, connection };
}

/**
 * GET /api/xero/status
 * Check if user has connected Xero account
 */
export async function handleXeroStatus(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    const connection = await XeroConnection.findByUserId(user._id);

    if (!connection) {
      return res.json({
        success: true,
        connected: false,
      });
    }

    return res.json({
      success: true,
      connected: true,
      tenantId: connection.tenantId,
      tenantName: connection.tenantName,
      connectedAt: connection.createdAt,
      tokenExpiresAt: connection.tokenExpiresAt,
      needsRefresh: connection.needsRefresh(),
    });
  } catch (error) {
    console.error('Error checking Xero status:', error);

    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/xero/validate-connection
 * Validate Xero connection by making an actual API call
 * This triggers automatic token refresh if needed
 *
 * This is a lightweight endpoint specifically designed for:
 * - Periodic background validation
 * - Triggering automatic token refresh
 * - Verifying the connection is working
 *
 * Unlike /api/xero/status which only checks the database,
 * this endpoint makes an actual Xero API call to validate the connection.
 */
export async function handleValidateXeroConnection(req, res) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(req);

    console.log(`\n🔍 ===== VALIDATING XERO CONNECTION =====`);
    console.log(`👤 User: ${user.email}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    // Check if Xero is connected
    const connection = await XeroConnection.findByUserId(user._id);

    if (!connection) {
      console.log('❌ No Xero connection found');
      console.log('========================================\n');
      return res.json({
        success: false,
        connected: false,
        message: 'Xero not connected',
      });
    }

    console.log(`✅ Xero connection found`);
    console.log(`🏢 Tenant: ${connection.tenantName}`);
    console.log(`🆔 Tenant ID: ${connection.tenantId}`);
    console.log(`⏰ Token expires: ${connection.tokenExpiresAt}`);
    console.log(`🔄 Needs refresh: ${connection.needsRefresh()}`);

    // Get valid Xero client (this will auto-refresh tokens if needed)
    const { xero, connection: updatedConnection } = await getValidXeroClient(user._id);

    // Make a lightweight API call to validate the connection
    // We'll use getInvoices with a limit of 1 - it's fast and proves the connection works
    console.log('📡 Making test API call to Xero...');
    console.log(`🆔 Using tenant ID: ${updatedConnection.tenantId}`);

    const response = await xero.accountingApi.getInvoices(
      updatedConnection.tenantId,
      undefined, // ifModifiedSince
      undefined, // where
      undefined, // order
      undefined, // IDs
      undefined, // invoiceNumbers
      undefined, // contactIDs
      undefined, // statuses
      1 // page size - only get 1 invoice to keep it lightweight
    );

    if (response && response.body) {
      console.log(`✅ Xero API call successful`);
      console.log(`📊 API response received (${response.body.invoices?.length || 0} invoices)`);
      console.log('========================================\n');

      return res.json({
        success: true,
        connected: true,
        validated: true,
        tenantId: updatedConnection.tenantId,
        tenantName: updatedConnection.tenantName,
        tokenExpiresAt: updatedConnection.tokenExpiresAt,
        message: 'Xero connection validated successfully',
      });
    } else {
      console.log('⚠️ Unexpected API response');
      console.log('========================================\n');

      return res.json({
        success: false,
        connected: true,
        validated: false,
        message: 'Unexpected response from Xero API',
      });
    }
  } catch (error) {
    console.error('❌ Error validating Xero connection:', error);
    console.error('Error details:', error.message);
    console.log('========================================\n');

    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Check if it's a token refresh error
    if (error.message.includes('Failed to refresh Xero token') ||
        error.message.includes('Token decryption failed') ||
        error.message.includes('Please reconnect')) {
      return res.status(401).json({
        success: false,
        connected: true,
        validated: false,
        error: error.message,
        requiresReconnect: true,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/xero/disconnect
 * Disconnect Xero account for authenticated user
 */
export async function handleXeroDisconnect(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    
    await XeroConnection.deleteByUserId(user._id);
    
    console.log(`✅ Xero disconnected for user ${user.email}`);
    
    return res.json({
      success: true,
      message: 'Xero account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Xero:', error);
    
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/xero/invoices
 * Get invoices from Xero for authenticated user
 */
export async function handleGetXeroInvoices(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    const { xero, connection } = await getValidXeroClient(user._id);
    
    // Update tenants to ensure we have the latest
    await xero.updateTenants();
    
    // Get invoices
    const response = await xero.accountingApi.getInvoices(connection.tenantId);
    
    return res.json({
      success: true,
      invoices: response.body.invoices || [],
    });
  } catch (error) {
    console.error('Error fetching Xero invoices:', error);
    
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }
    
    if (error.message.includes('Xero not connected')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        needsConnection: true,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/xero/record-payment
 * Record a payment in Xero
 */
export async function handleRecordXeroPayment(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    const { xero, connection } = await getValidXeroClient(user._id);
    const { invoiceId, amount, paymentDate, reference } = req.body;
    
    if (!invoiceId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: invoiceId, amount',
      });
    }
    
    // Create payment object
    const payment = {
      invoice: {
        invoiceID: invoiceId,
      },
      account: {
        code: '200', // Default bank account code - should be configurable
      },
      date: paymentDate || new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      reference: reference || 'Payment via Wild Things Portal',
    };
    
    // Record payment in Xero
    const response = await xero.accountingApi.createPayment(
      connection.tenantId,
      { payments: [payment] }
    );
    
    return res.json({
      success: true,
      payment: response.body.payments?.[0] || {},
    });
  } catch (error) {
    console.error('Error recording Xero payment:', error);
    
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }
    
    if (error.message.includes('Xero not connected')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        needsConnection: true,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/xero/get-invoices
 * Get unpaid invoices from admin's Xero for a specific contact (owner)
 * Query params: contactId (optional - uses user's xeroContactId if not provided)
 */
export async function handleGetInvoicesForContact(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    const { contactId } = req.query;

    console.log('📋 Fetching invoices for user:', user.email);
    console.log('Contact ID from query:', contactId);
    console.log('User xeroContactId:', user.xeroContactId);

    // Use contactId from query or user's xeroContactId
    const xeroContactId = contactId || user.xeroContactId;

    if (!xeroContactId) {
      console.log('⚠️ User does not have a Xero contact ID');
      return res.status(400).json({
        success: false,
        error: 'No Xero contact ID found. Your account needs to be set up in Xero first. Please contact support.',
        needsSetup: true,
      });
    }

    console.log('✅ Using Xero contact ID:', xeroContactId);

    // Get admin's Xero client (centralized Xero for all owners)
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      return res.status(500).json({
        success: false,
        error: 'Admin user not found. Please contact support.',
      });
    }

    const { xero, connection } = await getValidXeroClient(adminUser._id);

    console.log('✅ Got admin Xero client, tenant:', connection.tenantId);

    // Fetch invoices for this contact
    // Filter: ContactID matches AND Status is AUTHORISED (unpaid)
    const whereClause = `Contact.ContactID=Guid("${xeroContactId}") AND Status=="AUTHORISED"`;

    console.log('🔍 Fetching invoices with filter:', whereClause);

    const response = await xero.accountingApi.getInvoices(
      connection.tenantId,
      undefined, // ifModifiedSince
      whereClause, // where filter
      undefined, // order
      undefined, // IDs
      undefined, // invoiceNumbers
      undefined, // contactIDs
      undefined, // statuses
      undefined, // page
      true // includeArchived
    );

    const invoices = response.body.invoices || [];

    console.log(`✅ Found ${invoices.length} unpaid invoices for contact ${xeroContactId}`);

    return res.json({
      success: true,
      invoices,
      count: invoices.length,
    });
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);

    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    if (error.message.includes('Xero not connected')) {
      return res.status(400).json({
        success: false,
        error: 'Admin has not connected Xero. Please contact support.',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch invoices',
    });
  }
}

/**
 * POST /api/xero/pay-invoice
 * Pay a Xero invoice using Stripe and record payment in Xero
 * Body: { invoiceId, invoiceNumber, amount, currency, paymentMethodId, xeroContactId, description }
 */
export async function handlePayInvoice(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    const {
      invoiceId,
      invoiceNumber,
      amount,
      currency = 'AUD',
      paymentMethodId,
      xeroContactId,
      description,
    } = req.body;

    console.log('💳 Processing invoice payment:', {
      user: user.email,
      invoiceId,
      invoiceNumber,
      amount,
      currency,
      paymentMethodId,
    });

    // Validate required fields
    if (!invoiceId || !invoiceNumber || !amount || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: invoiceId, invoiceNumber, amount, paymentMethodId',
      });
    }

    // Get user's Stripe customer
    const stripeCustomer = await StripeCustomer.findOne({ userId: user._id });

    if (!stripeCustomer) {
      return res.status(400).json({
        success: false,
        error: 'No Stripe customer found. Please add a payment method first.',
      });
    }

    // Initialize Stripe
    const stripeKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Step 1: Create Stripe PaymentIntent
    console.log('💳 Creating Stripe PaymentIntent...');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: stripeCustomer.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true, // Immediately confirm the payment
      description: description || `Payment for invoice ${invoiceNumber}`,
      metadata: {
        invoiceId,
        invoiceNumber,
        xeroContactId: xeroContactId || user.xeroContactId || '',
        userId: user._id.toString(),
      },
      return_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/investor-portal?tab=payments`,
    });

    console.log('✅ Stripe PaymentIntent created:', paymentIntent.id, 'Status:', paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      // Save failed payment record
      await InvoicePayment.create({
        userId: user._id,
        xeroInvoiceId: invoiceId,
        xeroInvoiceNumber: invoiceNumber,
        xeroContactId: xeroContactId || user.xeroContactId || '',
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: stripeCustomer.stripeCustomerId,
        stripePaymentMethodId: paymentMethodId,
        amount,
        currency: currency.toUpperCase(),
        status: 'failed',
        description,
        errorMessage: `Payment status: ${paymentIntent.status}`,
      });

      return res.status(400).json({
        success: false,
        error: 'Payment failed',
        status: paymentIntent.status,
        message: 'The payment could not be processed. Please check your payment method.',
      });
    }

    // Step 2: Record payment in admin's Xero
    let xeroPayment = null;
    let xeroError = null;

    try {
      console.log('📝 Recording payment in Xero...');

      // Get admin's Xero client
      const adminUser = await User.findOne({ role: 'admin' });

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      const { xero, connection } = await getValidXeroClient(adminUser._id);

      // Get first bank account
      const accountsResponse = await xero.accountingApi.getAccounts(
        connection.tenantId,
        undefined,
        'Type=="BANK"'
      );

      const bankAccount = accountsResponse.body.accounts?.[0];

      if (!bankAccount) {
        throw new Error('No bank account found in Xero');
      }

      // Create payment in Xero
      const payment = {
        invoice: {
          invoiceID: invoiceId,
        },
        account: {
          accountID: bankAccount.accountID,
        },
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(amount),
        reference: `Stripe: ${paymentIntent.id}`,
      };

      const paymentResponse = await xero.accountingApi.createPayment(
        connection.tenantId,
        payment
      );

      xeroPayment = paymentResponse.body.payments?.[0];

      console.log('✅ Payment recorded in Xero:', xeroPayment?.paymentID);
    } catch (error) {
      console.error('⚠️ Error recording payment in Xero (non-critical):', error.message);
      xeroError = error.message;
      // Continue even if Xero fails - payment was successful in Stripe
    }

    // Step 3: Save payment record to database
    const invoicePayment = await InvoicePayment.create({
      userId: user._id,
      xeroInvoiceId: invoiceId,
      xeroInvoiceNumber: invoiceNumber,
      xeroContactId: xeroContactId || user.xeroContactId || '',
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: stripeCustomer.stripeCustomerId,
      stripePaymentMethodId: paymentMethodId,
      xeroPaymentId: xeroPayment?.paymentID || null,
      amount,
      currency: currency.toUpperCase(),
      status: 'succeeded',
      description,
      metadata: {
        xeroError: xeroError || null,
      },
    });

    console.log('✅ Invoice payment saved to database:', invoicePayment._id);

    return res.json({
      success: true,
      message: 'Payment successful',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      xeroPayment: xeroPayment ? {
        paymentID: xeroPayment.paymentID,
        status: xeroPayment.status,
      } : null,
      xeroError: xeroError || null,
      invoicePayment: {
        id: invoicePayment._id,
        createdAt: invoicePayment.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error processing invoice payment:', error);

    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process payment',
    });
  }
}

export { getValidXeroClient };

