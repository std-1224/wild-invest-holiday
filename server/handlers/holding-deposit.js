import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import StripeCustomer from '../models/StripeCustomer.js';
import XeroConnection from '../models/XeroConnection.js';
import { XeroClient } from 'xero-node';

const JWT_SECRET = process.env.JWT_SECRET;

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
 * Helper: Get admin user with Xero connection
 */
async function getAdminXeroClient() {
  try {
    // Find admin user (role: 'admin')
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.warn('⚠️ No admin user found for Xero integration');
      return null;
    }

    // Get admin's Xero connection
    const connection = await XeroConnection.findByUserId(adminUser._id);

    if (!connection) {
      console.warn('⚠️ Admin user has no Xero connection');
      return null;
    }

    // Initialize Xero client
    const xero = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID,
      clientSecret: process.env.XERO_CLIENT_SECRET,
      redirectUris: [process.env.XERO_REDIRECT_URI || 'http://localhost:5173/admin/xero/callback'],
      scopes: process.env.XERO_SCOPES?.split(' ') || ['accounting.transactions', 'accounting.contacts'],
    });

    // Get decrypted tokens
    const decryptedAccessToken = connection.getAccessToken();
    const decryptedRefreshToken = connection.getRefreshToken();

    // Check if token needs refresh
    if (connection.needsRefresh()) {
      console.log('🔄 Xero access token expired or expiring soon, refreshing...');

      xero.setTokenSet({
        access_token: decryptedAccessToken,
        refresh_token: decryptedRefreshToken,
        expires_at: Math.floor(connection.tokenExpiresAt.getTime() / 1000),
        token_type: connection.tokenType,
      });

      const newTokenSet = await xero.refreshToken();

      connection.setAccessToken(newTokenSet.access_token);
      connection.setRefreshToken(newTokenSet.refresh_token);
      connection.tokenExpiresAt = new Date((newTokenSet.expires_at || 0) * 1000);
      connection.tokenType = newTokenSet.token_type || 'Bearer';
      await connection.save();

      console.log('✅ Xero token refreshed successfully');
    } else {
      xero.setTokenSet({
        access_token: decryptedAccessToken,
        refresh_token: decryptedRefreshToken,
        expires_at: Math.floor(connection.tokenExpiresAt.getTime() / 1000),
        token_type: connection.tokenType,
      });
    }

    return { xero, connection };
  } catch (error) {
    console.error('❌ Error getting admin Xero client:', error);
    return null;
  }
}

/**
 * Helper: Create or get Xero contact for user
 */
async function getOrCreateXeroContact(xero, tenantId, user) {
  try {
    // Search for existing contact by email
    const searchResponse = await xero.accountingApi.getContacts(
      tenantId,
      undefined,
      `EmailAddress=="${user.email}"`
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
 * Helper: Get Xero bank account
 */
async function getXeroBankAccount(xero, tenantId) {
  try {
    const accountsResponse = await xero.accountingApi.getAccounts(
      tenantId,
      undefined,
      'Type=="BANK"&&Status=="ACTIVE"'
    );

    if (accountsResponse.body.accounts && accountsResponse.body.accounts.length > 0) {
      return accountsResponse.body.accounts[0].accountID;
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting bank account:', error);
    return null;
  }
}

/**
 * Helper: Create holding deposit invoice in Xero
 */
async function createHoldingDepositInvoice(xero, tenantId, xeroContactId, depositData, stripePaymentIntentId) {
  try {
    const { cabinType, location, totalAmount, depositAmount } = depositData;

    // Create invoice line item
    const lineItem = {
      description: `Holding Deposit - ${cabinType} Cabin at ${location}`,
      quantity: 1,
      unitAmount: depositAmount,
      accountCode: '200', // Revenue account - should be configurable
      taxType: 'NONE', // Adjust based on your tax requirements
    };

    // Create invoice
    const invoice = {
      type: 'ACCREC', // Accounts Receivable (customer invoice)
      contact: {
        contactID: xeroContactId,
      },
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0], // Due immediately
      lineItems: [lineItem],
      reference: `Holding Deposit - ${cabinType}`,
      status: 'AUTHORISED',
    };

    console.log('📤 Creating holding deposit invoice in Xero...');
    const invoiceResponse = await xero.accountingApi.createInvoices(tenantId, { invoices: [invoice] });

    if (!invoiceResponse.body.invoices || invoiceResponse.body.invoices.length === 0) {
      throw new Error('Failed to create invoice in Xero');
    }

    const createdInvoice = invoiceResponse.body.invoices[0];
    console.log('✅ Invoice created in Xero:', createdInvoice.invoiceID);

    // Record payment in Xero
    const bankAccountId = await getXeroBankAccount(xero, tenantId);

    if (bankAccountId) {
      const payment = {
        invoice: {
          invoiceID: createdInvoice.invoiceID,
        },
        account: {
          accountID: bankAccountId,
        },
        date: new Date().toISOString().split('T')[0],
        amount: depositAmount,
        reference: `Stripe: ${stripePaymentIntentId}`,
      };

      const paymentResponse = await xero.accountingApi.createPayment(tenantId, payment);
      console.log('✅ Payment recorded in Xero:', paymentResponse.body.payments?.[0]?.paymentID);
    } else {
      console.warn('⚠️ No bank account found, skipping payment recording');
    }

    return {
      invoiceId: createdInvoice.invoiceID,
      invoiceNumber: createdInvoice.invoiceNumber,
    };
  } catch (error) {
    console.error('❌ Error creating Xero invoice:', error);
    throw error;
  }
}

/**
 * POST /api/holding-deposit
 * Process $100 holding deposit payment via Stripe and create invoice in Xero
 * Body: { paymentMethodId, cabinType, location, totalAmount }
 */
export async function handleHoldingDeposit(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    const { paymentMethodId, cabinType, location, totalAmount } = req.body;

    console.log('💰 Processing holding deposit:', {
      user: user.email,
      cabinType,
      location,
      totalAmount,
    });

    // Validate required fields
    if (!paymentMethodId || !cabinType || !location || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: paymentMethodId, cabinType, location, totalAmount',
      });
    }

    const depositAmount = 100; // Fixed $100 holding deposit

    // Initialize Stripe
    const stripeKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Get or create Stripe customer
    let stripeCustomer = await StripeCustomer.findOne({ userId: user._id });

    if (!stripeCustomer) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      stripeCustomer = await StripeCustomer.create({
        userId: user._id,
        stripeCustomerId: customer.id,
      });

      console.log('✅ Created new Stripe customer:', customer.id);
    }

    // Payment method should already be attached (it's a saved payment method)
    // Just verify it belongs to this customer
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      if (paymentMethod.customer !== stripeCustomer.stripeCustomerId) {
        return res.status(400).json({
          success: false,
          error: 'Payment method does not belong to this customer',
        });
      }

      console.log('✅ Verified payment method belongs to customer');
    } catch (error) {
      console.error('❌ Error verifying payment method:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method',
      });
    }

    // Create Stripe PaymentIntent for $100 deposit
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount * 100, // Convert to cents
      currency: 'aud',
      customer: stripeCustomer.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      description: `Holding Deposit - ${cabinType} Cabin at ${location}`,
      metadata: {
        userId: user._id.toString(),
        cabinType,
        location,
        totalAmount: totalAmount.toString(),
        depositType: 'holding_deposit',
      },
      return_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/investor-portal`,
    });

    console.log('✅ Stripe payment created:', paymentIntent.id, 'Status:', paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment failed',
        status: paymentIntent.status,
      });
    }

    // Create invoice in Xero (optional - non-critical)
    let xeroInvoiceId = null;
    let xeroInvoiceNumber = null;
    let xeroError = null;

    try {
      const xeroClient = await getAdminXeroClient();

      if (xeroClient) {
        const { xero, connection } = xeroClient;

        console.log('📝 Creating invoice in admin\'s Xero for user:', user.email);

        // Create or get Xero contact for this user
        const xeroContactId = await getOrCreateXeroContact(xero, connection.tenantId, user);
        console.log('✅ Xero contact ID:', xeroContactId);

        // Create invoice in Xero
        const xeroInvoice = await createHoldingDepositInvoice(
          xero,
          connection.tenantId,
          xeroContactId,
          {
            cabinType,
            location,
            totalAmount,
            depositAmount,
          },
          paymentIntent.id
        );

        xeroInvoiceId = xeroInvoice.invoiceId;
        xeroInvoiceNumber = xeroInvoice.invoiceNumber;

        console.log('✅ Holding deposit invoice created in Xero:', xeroInvoiceNumber);
      } else {
        console.warn('⚠️ Xero integration not available - skipping invoice creation');
      }
    } catch (error) {
      console.error('⚠️ Error creating Xero invoice (non-critical):', error.message);
      xeroError = error.message;
      // Continue even if Xero fails - payment was successful in Stripe
    }

    return res.json({
      success: true,
      message: 'Holding deposit payment successful',
      paymentIntentId: paymentIntent.id,
      amount: depositAmount,
      xero: {
        invoiceId: xeroInvoiceId,
        invoiceNumber: xeroInvoiceNumber,
        error: xeroError,
      },
    });
  } catch (error) {
    console.error('❌ Holding deposit error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process holding deposit',
    });
  }
}

