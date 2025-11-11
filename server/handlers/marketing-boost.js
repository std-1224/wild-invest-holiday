/**
 * Marketing Boost Handler
 * Handles marketing boost subscription payments with Stripe and Xero integration
 */
import Stripe from 'stripe';
import { XeroClient } from 'xero-node';
import jwt from 'jsonwebtoken';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import StripeCustomer from '../models/StripeCustomer.js';
import PaymentMethod from '../models/PaymentMethod.js';
import MarketingBoost from '../models/MarketingBoost.js';
import XeroConnection from '../models/XeroConnection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize Stripe
const stripeKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia',
});

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
 * Helper: Get admin's Xero client (centralized Xero for all owners)
 * Only the admin user has Xero connected, and all owner invoices are created in admin's Xero
 */
async function getAdminXeroClient() {
  // Find the single admin user
  const adminUser = await User.findOne({ role: 'admin' });

  if (!adminUser) {
    console.log('⚠️ No admin user found in system');
    return null;
  }

  console.log('✅ Found admin user:', adminUser.email);

  // Get admin's Xero connection
  const connection = await XeroConnection.findByUserId(adminUser._id);

  if (!connection) {
    console.log('⚠️ Admin has not connected Xero yet');
    return null;
  }

  console.log('Token expires at:', connection.tokenExpiresAt);
  console.log('Current time:', new Date());
  console.log('Needs refresh?', connection.needsRefresh());

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.log('⚠️ Xero credentials missing');
    return null;
  }

  const xero = new XeroClient({
    clientId,
    clientSecret,
    redirectUris: [redirectUri],
    scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access'.split(' '),
  });

  // ✅ Initialize the XeroClient (this sets up the OAuth client)
  await xero.initialize();

  // ✅ Set the current token
  const currentTokenSet = {
    access_token: connection.getAccessToken(),
    refresh_token: connection.getRefreshToken(),
    expires_at: Math.floor(connection.tokenExpiresAt.getTime() / 1000),
    token_type: connection.tokenType,
  };

  xero.setTokenSet(currentTokenSet);

  // ✅ Check if refresh is needed
  if (connection.needsRefresh()) {
    console.log('🔄 Token needs refresh, attempting refresh...');
    try {
      const newTokenSet = await xero.refreshToken();

      console.log('✅ Token refreshed successfully');

      connection.setAccessToken(newTokenSet.access_token);
      connection.setRefreshToken(newTokenSet.refresh_token);
      connection.tokenExpiresAt = new Date((newTokenSet.expires_at || 0) * 1000);
      connection.tokenType = newTokenSet.token_type || 'Bearer';

      await connection.save();
      xero.setTokenSet(newTokenSet);
    } catch (error) {
      console.error('❌ Error refreshing Xero token:', error.message);
      console.error('Full error:', error);
      return null;
    }
  } else {
    console.log('✅ Token is still valid, no refresh needed');
  }

  return { xero, connection };
}

/**
 * Helper: Create or get Xero contact for user
 */
async function getOrCreateXeroContact(xero, tenantId, user) {
  try {
    // Search for existing contact by email
    const searchResponse = await xero.accountingApi.getContacts(
      tenantId,
      undefined, // ifModifiedSince
      `EmailAddress=="${user.email}"` // where filter
    );
    
    if (searchResponse.body.contacts && searchResponse.body.contacts.length > 0) {
      return searchResponse.body.contacts[0].contactID;
    }
    
    // Create new contact
    const contact = {
      name: user.name || user.email,
      emailAddress: user.email,
      contactStatus: 'ACTIVE',
    };
    
    const createResponse = await xero.accountingApi.createContacts(tenantId, { contacts: [contact] });
    
    if (createResponse.body.contacts && createResponse.body.contacts.length > 0) {
      return createResponse.body.contacts[0].contactID;
    }
    
    throw new Error('Failed to create Xero contact');
  } catch (error) {
    console.error('❌ Error creating Xero contact:', error.message);
    throw error;
  }
}

/**
 * Helper: Get first bank account from Xero
 */
async function getXeroBankAccount(xero, tenantId) {
  try {
    console.log('🔍 Fetching bank accounts from Xero...');
    const accountsResponse = await xero.accountingApi.getAccounts(
      tenantId,
      undefined, // ifModifiedSince
      'Type=="BANK"' // where filter
    );

    if (accountsResponse.body.accounts && accountsResponse.body.accounts.length > 0) {
      const bankAccount = accountsResponse.body.accounts[0];
      console.log('✅ Found bank account:', bankAccount.code, '-', bankAccount.name);
      return bankAccount.accountID;
    }

    console.warn('⚠️ No bank accounts found in Xero');
    return null;
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    console.error('❌ Error fetching bank accounts:', errorMsg);
    if (error?.response?.body) {
      console.error('Xero API response:', JSON.stringify(error.response.body, null, 2));
    }
    return null;
  }
}

/**
 * Helper: Create invoice in Xero
 */
async function createXeroInvoice(xero, tenantId, contactId, boostData, paymentIntentId) {
  try {
    console.log('📝 Creating Xero invoice...');

    const invoice = {
      type: 'ACCREC', // Accounts Receivable (Sales Invoice)
      contact: {
        contactID: contactId,
      },
      lineItems: [
        {
          description: `Marketing Boost - ${boostData.tierName} Package for ${boostData.cabinType} Cabin (${boostData.location})`,
          quantity: 1,
          unitAmount: boostData.monthlyPrice,
          accountCode: '200', // Revenue account code (adjust as needed)
          taxType: 'OUTPUT', // Adjust based on your tax settings
        },
      ],
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0], // Paid immediately
      reference: `BOOST-${boostData.investmentId}`,
      status: 'AUTHORISED', // Changed from DRAFT to AUTHORISED so it can be paid
    };

    console.log('📤 Sending invoice to Xero...');
    const invoiceResponse = await xero.accountingApi.createInvoices(tenantId, { invoices: [invoice] });

    if (!invoiceResponse.body.invoices || invoiceResponse.body.invoices.length === 0) {
      throw new Error('Failed to create invoice in Xero - no invoices returned');
    }

    const createdInvoice = invoiceResponse.body.invoices[0];
    console.log('✅ Invoice created in Xero:', createdInvoice.invoiceID);

    // Get bank account for payment
    const bankAccountId = await getXeroBankAccount(xero, tenantId);

    if (!bankAccountId) {
      console.warn('⚠️ No bank account found, skipping payment recording');
      return createdInvoice.invoiceID;
    }

    // Record payment immediately
    const payment = {
      invoice: {
        invoiceID: createdInvoice.invoiceID,
      },
      account: {
        accountID: bankAccountId, // Use accountID instead of code
      },
      date: new Date().toISOString().split('T')[0],
      amount: boostData.monthlyPrice,
      reference: `Stripe: ${paymentIntentId}`,
    };

    console.log('📤 Recording payment in Xero...');
    await xero.accountingApi.createPayment(tenantId, payment);
    console.log('✅ Payment recorded in Xero');

    return createdInvoice.invoiceID;
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    console.error('❌ Error creating Xero invoice:', errorMsg);
    if (error?.response?.body) {
      console.error('Xero API error response:', JSON.stringify(error.response.body, null, 2));
    }
    throw error;
  }
}

/**
 * POST /api/marketing-boost/activate
 * Activate marketing boost subscription
 */
export async function handleActivateBoost(req, res) {
  try {
    await connectDB();
    
    const user = await getAuthenticatedUser(req);
    
    const {
      investmentId,
      cabinType,
      location,
      tier,
      tierName,
      monthlyPrice,
      paymentMethodId,
    } = req.body;
    
    // Validate required fields
    if (!investmentId || !cabinType || !location || !tier || !tierName || !monthlyPrice || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    console.log('🚀 Activating Marketing Boost:', {
      userId: user._id,
      investmentId,
      tier,
      monthlyPrice,
    });
    
    // Check if boost already exists for this investment
    const existingBoost = await MarketingBoost.findActiveBoost(user._id, investmentId);
    
    if (existingBoost) {
      return res.status(400).json({
        success: false,
        error: 'Marketing boost already active for this cabin',
      });
    }
    
    // Get Stripe customer
    const stripeCustomer = await StripeCustomer.findOne({ userId: user._id });
    
    if (!stripeCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Stripe customer not found. Please add a payment method first.',
      });
    }
    
    // Verify payment method exists
    const paymentMethod = await PaymentMethod.findOne({
      userId: user._id,
      paymentMethodId,
    });
    
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method not found',
      });
    }
    
    // Step 1: Charge the customer via Stripe
    const amountInCents = Math.round(monthlyPrice * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'aud',
      customer: stripeCustomer.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      description: `Marketing Boost - ${tierName} Package`,
      metadata: {
        userId: user._id.toString(),
        investmentId,
        tier,
        cabinType,
        location,
      },
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/investor-portal`,
    });
    
    console.log('💳 Stripe payment created:', paymentIntent.id, 'Status:', paymentIntent.status);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment failed',
        status: paymentIntent.status,
        message: 'The payment could not be processed. Please check your payment method.',
      });
    }
    
    // Step 2: Try to create invoice in admin's Xero (optional)
    let xeroInvoiceId = null;
    let xeroContactId = null;

    try {
      // Get admin's Xero client (centralized for all owners)
      const xeroClient = await getAdminXeroClient();

      if (xeroClient) {
        const { xero, connection } = xeroClient;

        console.log('📝 Creating invoice in admin\'s Xero for owner:', user.email);

        // Create contact in admin's Xero for this owner
        xeroContactId = await getOrCreateXeroContact(xero, connection.tenantId, user);

        // Create invoice in admin's Xero
        xeroInvoiceId = await createXeroInvoice(
          xero,
          connection.tenantId,
          xeroContactId,
          { investmentId, cabinType, location, tierName, monthlyPrice },
          paymentIntent.id
        );

        console.log('✅ Xero invoice created in admin\'s account:', xeroInvoiceId);
      } else {
        console.log('⚠️ Admin Xero not connected, skipping invoice creation');
      }
    } catch (xeroError) {
      const errorMsg = xeroError?.message || xeroError?.toString() || 'Unknown error';
      console.error('⚠️ Xero invoice creation failed (non-critical):', errorMsg);
      if (xeroError?.response?.body) {
        console.error('Xero API error details:', JSON.stringify(xeroError.response.body, null, 2));
      }
      // Continue even if Xero fails
    }
    
    // Step 3: Create marketing boost subscription
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    const boost = await MarketingBoost.create({
      userId: user._id,
      investmentId,
      cabinType,
      location,
      tier,
      tierName,
      monthlyPrice,
      status: 'active',
      stripeCustomerId: stripeCustomer.stripeCustomerId,
      paymentMethodId,
      xeroContactId,
      lastBillingDate: new Date(),
      nextBillingDate,
    });
    
    console.log('✅ Marketing boost activated:', boost._id);
    
    return res.json({
      success: true,
      boost: {
        id: boost._id,
        tier: boost.tier,
        tierName: boost.tierName,
        monthlyPrice: boost.monthlyPrice,
        status: boost.status,
        nextBillingDate: boost.nextBillingDate,
      },
      payment: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      xero: xeroInvoiceId ? {
        invoiceId: xeroInvoiceId,
        contactId: xeroContactId,
      } : null,
      message: 'Marketing boost activated successfully!',
    });
  } catch (error) {
    console.error('❌ Error activating marketing boost:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to activate marketing boost',
    });
  }
}

/**
 * GET /api/marketing-boost/list
 * Get all marketing boosts for authenticated user
 */
export async function handleListBoosts(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);

    const boosts = await MarketingBoost.find({ userId: user._id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      boosts: boosts.map(boost => ({
        id: boost._id,
        investmentId: boost.investmentId,
        cabinType: boost.cabinType,
        location: boost.location,
        tier: boost.tier,
        tierName: boost.tierName,
        monthlyPrice: boost.monthlyPrice,
        status: boost.status,
        lastBillingDate: boost.lastBillingDate,
        nextBillingDate: boost.nextBillingDate,
        createdAt: boost.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Error listing marketing boosts:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to list marketing boosts',
    });
  }
}

/**
 * POST /api/marketing-boost/cancel
 * Cancel marketing boost subscription
 */
export async function handleCancelBoost(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    const { boostId } = req.body;

    if (!boostId) {
      return res.status(400).json({
        success: false,
        error: 'Boost ID is required',
      });
    }

    const boost = await MarketingBoost.findOne({
      _id: boostId,
      userId: user._id,
    });

    if (!boost) {
      return res.status(404).json({
        success: false,
        error: 'Marketing boost not found',
      });
    }

    boost.status = 'cancelled';
    boost.cancelledAt = new Date();
    await boost.save();

    console.log('✅ Marketing boost cancelled:', boost._id);

    return res.json({
      success: true,
      message: 'Marketing boost cancelled successfully',
    });
  } catch (error) {
    console.error('❌ Error cancelling marketing boost:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel marketing boost',
    });
  }
}

/**
 * POST /api/marketing-boost/pause
 * Pause marketing boost subscription
 */
export async function handlePauseBoost(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    const { boostId } = req.body;

    if (!boostId) {
      return res.status(400).json({
        success: false,
        error: 'Boost ID is required',
      });
    }

    const boost = await MarketingBoost.findOne({
      _id: boostId,
      userId: user._id,
    });

    if (!boost) {
      return res.status(404).json({
        success: false,
        error: 'Marketing boost not found',
      });
    }

    boost.status = 'paused';
    await boost.save();

    console.log('✅ Marketing boost paused:', boost._id);

    return res.json({
      success: true,
      message: 'Marketing boost paused successfully',
    });
  } catch (error) {
    console.error('❌ Error pausing marketing boost:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to pause marketing boost',
    });
  }
}

/**
 * POST /api/marketing-boost/resume
 * Resume paused marketing boost subscription
 */
export async function handleResumeBoost(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    const { boostId } = req.body;

    if (!boostId) {
      return res.status(400).json({
        success: false,
        error: 'Boost ID is required',
      });
    }

    const boost = await MarketingBoost.findOne({
      _id: boostId,
      userId: user._id,
    });

    if (!boost) {
      return res.status(404).json({
        success: false,
        error: 'Marketing boost not found',
      });
    }

    boost.status = 'active';
    await boost.save();

    console.log('✅ Marketing boost resumed:', boost._id);

    return res.json({
      success: true,
      message: 'Marketing boost resumed successfully',
    });
  } catch (error) {
    console.error('❌ Error resuming marketing boost:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to resume marketing boost',
    });
  }
}

