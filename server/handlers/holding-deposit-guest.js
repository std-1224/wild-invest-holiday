/**
 * Holding Deposit Guest Checkout Handler
 * Handles registration + payment in a single transaction for non-logged-in users
 */

import Stripe from 'stripe';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import StripeCustomer from '../models/StripeCustomer.js';
import PaymentMethod from '../models/PaymentMethod.js';
import ReferralTransaction from '../models/ReferralTransaction.js';
import { generateToken } from '../lib/jwt.js';

/**
 * POST /api/holding-deposit-guest
 * Process $100 holding deposit payment for guest users (creates account + processes payment)
 * Body: { 
 *   firstName, lastName, email, password, referralCode (optional),
 *   paymentMethodId, cabinType, location, totalAmount, siteId 
 * }
 */
export async function handleHoldingDepositGuest(req, res) {
  try {
    await connectDB();

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      referralCode,
      paymentMethodId, 
      cabinType, 
      location, 
      totalAmount,
      siteId 
    } = req.body;

    console.log('💰 Processing guest holding deposit:', {
      email,
      cabinType,
      location,
      totalAmount,
      siteId,
    });

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !paymentMethodId || !cabinType || !location || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please login instead.',
      });
    }

    // Validate referral code if provided
    let referrerUser = null;
    if (referralCode) {
      referrerUser = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (!referrerUser) {
        return res.status(400).json({
          success: false,
          error: 'Invalid referral code',
        });
      }
    }

    // Initialize Stripe
    const stripeKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const depositAmount = 100; // Fixed $100 holding deposit

    // Step 1: Create user account
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password,
      referredBy: referralCode ? referralCode.toUpperCase() : null,
      role: 'owner',
    });

    console.log('✅ User account created:', user.email);

    // Step 2: Apply referral credits if applicable
    if (referrerUser) {
      try {
        // Credit $1,000 to referrer
        await User.findByIdAndUpdate(referrerUser._id, {
          $inc: { balance: 1000 },
        });

        await ReferralTransaction.create({
          fromUserId: user._id,
          toUserId: referrerUser._id,
          amount: 1000,
          type: 'referrer_credit',
          status: 'completed',
          notes: `Referral credit for ${user.name} signing up`,
        });

        // Credit $1,000 to new user (referee)
        await User.findByIdAndUpdate(user._id, {
          $inc: { balance: 1000 },
        });

        await ReferralTransaction.create({
          fromUserId: referrerUser._id,
          toUserId: user._id,
          amount: 1000,
          type: 'referee_credit',
          status: 'completed',
          notes: `Referral credit for using ${referrerUser.name}'s referral code`,
        });

        console.log(`✅ Referral credits applied: $1,000 to ${referrerUser.name} and $1,000 to ${user.name}`);
      } catch (error) {
        console.error('❌ Error creating referral transactions:', error);
        // Don't fail the whole transaction if referral credits fail
      }
    }

    // Step 3: Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });

    console.log('✅ Created Stripe customer:', stripeCustomer.id);

    // Save Stripe customer to database
    await StripeCustomer.create({
      userId: user._id,
      stripeCustomerId: stripeCustomer.id,
      defaultPaymentMethodId: paymentMethodId,
    });

    // Step 4: Attach payment method to Stripe customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer.id,
    });

    console.log('✅ Payment method attached to customer');

    // Step 5: Save payment method to database
    const paymentMethodDetails = await stripe.paymentMethods.retrieve(paymentMethodId);

    await PaymentMethod.create({
      userId: user._id,
      paymentMethodId: paymentMethodId,
      brand: paymentMethodDetails.card?.brand || 'unknown',
      last4: paymentMethodDetails.card?.last4 || '0000',
      expMonth: paymentMethodDetails.card?.exp_month || 1,
      expYear: paymentMethodDetails.card?.exp_year || 2030,
    });

    console.log('✅ Payment method saved to database');

    // Step 6: Create Stripe PaymentIntent for $100 deposit
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount * 100, // Convert to cents
      currency: 'aud',
      customer: stripeCustomer.id,
      payment_method: paymentMethodId,
      confirm: true,
      description: `Holding Deposit - ${cabinType} Cabin at ${location}`,
      metadata: {
        userId: user._id.toString(),
        cabinType,
        location,
        totalAmount: totalAmount.toString(),
        depositType: 'holding_deposit',
        siteId: siteId || '',
      },
      return_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/investor-portal`,
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    if (paymentIntent.status !== 'succeeded') {
      // Payment failed - we should ideally rollback the user creation
      // For now, just return an error
      console.error('❌ Payment failed:', paymentIntent.status);
      return res.status(400).json({
        success: false,
        error: 'Payment failed. Please check your card details and try again.',
      });
    }

    console.log('✅ Payment succeeded!');

    // Step 7: Generate JWT token for auto-login
    const token = generateToken(user._id);

    // Get updated user with balance
    const updatedUser = await User.findById(user._id);

    // Return success with token and user data
    return res.json({
      success: true,
      message: 'Account created and deposit paid successfully',
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        referralCode: updatedUser.referralCode,
        balance: updatedUser.balance,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
      payment: {
        paymentIntentId: paymentIntent.id,
        amount: depositAmount,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    console.error('❌ Error in guest holding deposit:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process payment',
    });
  }
}


