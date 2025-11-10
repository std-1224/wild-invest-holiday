/**
 * Payment Methods Handler
 * Handles Stripe payment method operations with MongoDB persistence
 */
import Stripe from 'stripe';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import StripeCustomer from '../models/StripeCustomer.js';
import PaymentMethod from '../models/PaymentMethod.js';
import { verifyToken } from '../lib/jwt.js';

// Initialize Stripe
const stripeKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Get authenticated user from request
 */
async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Not authenticated');
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Get or create Stripe customer for user
 */
async function getOrCreateStripeCustomer(userId, userEmail, userName) {
  await connectDB();

  // Check if user already has a Stripe customer
  let stripeCustomer = await StripeCustomer.findOne({ userId });

  if (stripeCustomer) {
    return stripeCustomer.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: userEmail,
    name: userName,
    metadata: {
      userId: userId.toString(),
    },
  });

  // Save to database
  stripeCustomer = await StripeCustomer.create({
    userId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

/**
 * POST /api/stripe/save-payment-method
 * Save a payment method to a customer
 */
export async function handleSavePaymentMethod(req, res) {
  try {
    await connectDB();

    // Get authenticated user
    const user = await getAuthenticatedUser(req);

    const { paymentMethodId, setAsDefault } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method ID is required',
      });
    }

    console.log('💳 Save Payment Method:', { userId: user._id, paymentMethodId, setAsDefault });

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(user._id, user.email, user.name);

    // Attach payment method to Stripe customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Retrieve payment method details from Stripe
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Check if payment method already exists in our database
    let paymentMethod = await PaymentMethod.findOne({ paymentMethodId });

    if (!paymentMethod) {
      // Save to our database
      paymentMethod = await PaymentMethod.create({
        userId: user._id,
        paymentMethodId: stripePaymentMethod.id,
        brand: stripePaymentMethod.card?.brand || 'unknown',
        last4: stripePaymentMethod.card?.last4 || '0000',
        expMonth: stripePaymentMethod.card?.exp_month || 0,
        expYear: stripePaymentMethod.card?.exp_year || 0,
      });
    }

    // Set as default if requested
    if (setAsDefault) {
      await StripeCustomer.findOneAndUpdate(
        { userId: user._id },
        { defaultPaymentMethodId: paymentMethodId }
      );

      // Also set as default in Stripe
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return res.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.paymentMethodId,
        brand: paymentMethod.brand,
        last4: paymentMethod.last4,
        expMonth: paymentMethod.expMonth,
        expYear: paymentMethod.expYear,
      },
    });
  } catch (error) {
    console.error('❌ Error saving payment method:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save payment method',
    });
  }
}

/**
 * POST /api/stripe/list-payment-methods
 * List all payment methods for authenticated user
 */
export async function handleListPaymentMethods(req, res) {
  try {
    await connectDB();

    // Get authenticated user
    const user = await getAuthenticatedUser(req);

    console.log('📋 List Payment Methods for user:', user._id);

    // Get user's Stripe customer
    const stripeCustomer = await StripeCustomer.findOne({ userId: user._id });

    if (!stripeCustomer) {
      // No Stripe customer yet, return empty list
      return res.json({
        success: true,
        paymentMethods: [],
      });
    }

    // Get payment methods from our database
    const paymentMethods = await PaymentMethod.find({ userId: user._id }).sort({ createdAt: -1 });

    // Format response
    const formattedMethods = paymentMethods.map(pm => ({
      id: pm.paymentMethodId,
      card: {
        brand: pm.brand,
        last4: pm.last4,
        exp_month: pm.expMonth,
        exp_year: pm.expYear,
      },
      isDefault: pm.paymentMethodId === stripeCustomer.defaultPaymentMethodId,
    }));

    return res.json({
      success: true,
      paymentMethods: formattedMethods,
    });
  } catch (error) {
    console.error('❌ Error listing payment methods:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to list payment methods',
    });
  }
}

/**
 * POST /api/stripe/set-default-payment-method
 * Set a payment method as default
 */
export async function handleSetDefaultPaymentMethod(req, res) {
  try {
    await connectDB();

    // Get authenticated user
    const user = await getAuthenticatedUser(req);

    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method ID is required',
      });
    }

    console.log('⭐ Set Default Payment Method:', { userId: user._id, paymentMethodId });

    // Verify payment method belongs to user
    const paymentMethod = await PaymentMethod.findOne({
      userId: user._id,
      paymentMethodId,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
      });
    }

    // Update default in database
    const stripeCustomer = await StripeCustomer.findOneAndUpdate(
      { userId: user._id },
      { defaultPaymentMethodId: paymentMethodId },
      { new: true }
    );

    // Update default in Stripe
    if (stripeCustomer) {
      await stripe.customers.update(stripeCustomer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Default payment method updated',
    });
  } catch (error) {
    console.error('❌ Error setting default payment method:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to set default payment method',
    });
  }
}

/**
 * POST /api/stripe/remove-payment-method
 * Remove a payment method
 */
export async function handleRemovePaymentMethod(req, res) {
  try {
    await connectDB();

    // Get authenticated user
    const user = await getAuthenticatedUser(req);

    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method ID is required',
      });
    }

    console.log('🗑️ Remove Payment Method:', { userId: user._id, paymentMethodId });

    // Verify payment method belongs to user
    const paymentMethod = await PaymentMethod.findOne({
      userId: user._id,
      paymentMethodId,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
      });
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Remove from database
    await PaymentMethod.deleteOne({ paymentMethodId });

    // If this was the default, clear it
    const stripeCustomer = await StripeCustomer.findOne({ userId: user._id });
    if (stripeCustomer && stripeCustomer.defaultPaymentMethodId === paymentMethodId) {
      // Find another payment method to set as default
      const remainingMethods = await PaymentMethod.find({ userId: user._id }).limit(1);
      const newDefaultId = remainingMethods.length > 0 ? remainingMethods[0].paymentMethodId : null;

      await StripeCustomer.findOneAndUpdate(
        { userId: user._id },
        { defaultPaymentMethodId: newDefaultId }
      );
    }

    return res.json({
      success: true,
      message: 'Payment method removed',
    });
  } catch (error) {
    console.error('❌ Error removing payment method:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove payment method',
    });
  }
}

