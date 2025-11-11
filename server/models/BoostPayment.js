/**
 * BoostPayment Model
 * Tracks payments made for Marketing Boost subscriptions via Stripe
 */
import mongoose from 'mongoose';

const boostPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Marketing Boost reference
  boostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketingBoost',
    required: true,
    index: true,
  },
  investmentId: {
    type: String,
    required: true,
  },
  // Stripe payment details
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripePaymentMethodId: {
    type: String,
    required: true,
  },
  // Xero invoice details (optional)
  xeroInvoiceId: {
    type: String,
    default: null,
  },
  xeroPaymentId: {
    type: String,
    default: null,
  },
  xeroContactId: {
    type: String,
    default: null,
  },
  // Payment amount and currency
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'AUD',
  },
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending',
    required: true,
  },
  // Boost details at time of payment
  tier: {
    type: String,
    enum: ['wild', 'wilder', 'wildest'],
    required: true,
  },
  tierName: {
    type: String,
    required: true,
  },
  // Description
  description: {
    type: String,
    default: '',
  },
  // Billing period
  billingPeriodStart: {
    type: Date,
    required: true,
  },
  billingPeriodEnd: {
    type: Date,
    required: true,
  },
  // Error tracking
  errorMessage: {
    type: String,
    default: null,
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexes for faster queries
boostPaymentSchema.index({ userId: 1, createdAt: -1 });
boostPaymentSchema.index({ boostId: 1, createdAt: -1 });
boostPaymentSchema.index({ stripePaymentIntentId: 1 });
boostPaymentSchema.index({ status: 1 });

// Static method to find payments by user
boostPaymentSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find payment by Stripe PaymentIntent ID
boostPaymentSchema.statics.findByPaymentIntentId = function(paymentIntentId) {
  return this.findOne({ stripePaymentIntentId: paymentIntentId });
};

// Static method to find payments by boost ID
boostPaymentSchema.statics.findByBoostId = function(boostId) {
  return this.find({ boostId }).sort({ createdAt: -1 });
};

// Static method to find payments by investment ID
boostPaymentSchema.statics.findByInvestmentId = function(investmentId) {
  return this.find({ investmentId }).sort({ createdAt: -1 });
};

const BoostPayment = mongoose.models.BoostPayment || mongoose.model('BoostPayment', boostPaymentSchema);

export default BoostPayment;

