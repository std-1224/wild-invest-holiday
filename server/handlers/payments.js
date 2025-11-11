/**
 * Payment History Handlers
 * Handles fetching payment history from InvoicePayment and BoostPayment collections
 */
import jwt from 'jsonwebtoken';
import connectDB from '../lib/db.js';
import User from '../models/User.js';
import InvoicePayment from '../models/InvoicePayment.js';
import BoostPayment from '../models/BoostPayment.js';

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
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * GET /api/payments/history
 * Get all payment history for authenticated user (invoice payments + boost payments)
 */
export async function handleGetPaymentHistory(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);

    console.log('📋 Fetching payment history for user:', user.email);

    // Fetch invoice payments
    const invoicePayments = await InvoicePayment.findByUserId(user._id);

    // Fetch boost payments
    const boostPayments = await BoostPayment.findByUserId(user._id);

    // Transform invoice payments to unified format
    const formattedInvoicePayments = invoicePayments.map(payment => ({
      id: payment._id.toString(),
      date: payment.createdAt,
      description: payment.description || `Invoice Payment - ${payment.xeroInvoiceNumber}`,
      amount: payment.amount,
      status: mapPaymentStatus(payment.status),
      method: 'Stripe Card',
      type: 'payment',
      category: 'invoice',
      invoiceUrl: null, // Could be added later if we store Xero invoice URLs
      metadata: {
        xeroInvoiceId: payment.xeroInvoiceId,
        xeroInvoiceNumber: payment.xeroInvoiceNumber,
        stripePaymentIntentId: payment.stripePaymentIntentId,
      },
    }));

    // Transform boost payments to unified format
    const formattedBoostPayments = boostPayments.map(payment => ({
      id: payment._id.toString(),
      date: payment.createdAt,
      description: `Marketing Boost - ${payment.tierName}`,
      amount: payment.amount,
      status: mapPaymentStatus(payment.status),
      method: 'Stripe Card',
      type: 'payment',
      category: 'boost',
      invoiceUrl: null,
      metadata: {
        boostId: payment.boostId,
        tier: payment.tier,
        tierName: payment.tierName,
        investmentId: payment.investmentId,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        billingPeriodStart: payment.billingPeriodStart,
        billingPeriodEnd: payment.billingPeriodEnd,
      },
    }));

    // Combine and sort by date (newest first)
    const allPayments = [...formattedInvoicePayments, ...formattedBoostPayments]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`✅ Found ${allPayments.length} total payments (${invoicePayments.length} invoice, ${boostPayments.length} boost)`);

    return res.json({
      success: true,
      payments: allPayments,
      summary: {
        total: allPayments.length,
        invoicePayments: invoicePayments.length,
        boostPayments: boostPayments.length,
        totalPaid: allPayments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        totalPending: allPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching payment history:', error);

    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payment history',
    });
  }
}

/**
 * GET /api/payments/boost-payments
 * Get boost payment history for a specific boost subscription
 * Query params: boostId (optional - returns all if not provided)
 */
export async function handleGetBoostPayments(req, res) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    const { boostId } = req.query;

    console.log('📋 Fetching boost payments for user:', user.email, 'boostId:', boostId);

    let boostPayments;
    if (boostId) {
      boostPayments = await BoostPayment.findByBoostId(boostId);
      
      // Verify the boost belongs to the user
      if (boostPayments.length > 0 && boostPayments[0].userId.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
    } else {
      boostPayments = await BoostPayment.findByUserId(user._id);
    }

    // Format payments
    const formattedPayments = boostPayments.map(payment => ({
      id: payment._id.toString(),
      date: payment.createdAt,
      amount: payment.amount,
      status: mapPaymentStatus(payment.status),
      tier: payment.tier,
      tierName: payment.tierName,
      description: payment.description,
      billingPeriodStart: payment.billingPeriodStart,
      billingPeriodEnd: payment.billingPeriodEnd,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      xeroInvoiceId: payment.xeroInvoiceId,
    }));

    console.log(`✅ Found ${formattedPayments.length} boost payments`);

    return res.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error('❌ Error fetching boost payments:', error);

    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch boost payments',
    });
  }
}

/**
 * Helper function to map payment status from database to frontend format
 */
function mapPaymentStatus(dbStatus) {
  const statusMap = {
    'pending': 'pending',
    'succeeded': 'completed',
    'failed': 'failed',
    'refunded': 'completed', // Show refunded as completed but with different type
  };
  return statusMap[dbStatus] || 'pending';
}

