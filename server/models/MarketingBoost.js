/**
 * Marketing Boost Subscription Model
 * Stores marketing boost subscriptions for cabins/investments
 */
import mongoose from 'mongoose';

const marketingBoostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  investmentId: {
    type: String,
    required: true,
  },
  cabinType: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    enum: ['wild', 'wilder', 'wildest'],
    required: true,
  },
  tierName: {
    type: String,
    required: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active',
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  // Xero integration
  xeroContactId: {
    type: String,
    default: null,
  },
  // Billing history
  lastBillingDate: {
    type: Date,
    default: Date.now,
  },
  nextBillingDate: {
    type: Date,
    required: true,
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
});

// Index for efficient queries
marketingBoostSchema.index({ userId: 1, investmentId: 1 });
marketingBoostSchema.index({ status: 1 });
marketingBoostSchema.index({ nextBillingDate: 1 });

// Update timestamp on save
marketingBoostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find active boost for investment
marketingBoostSchema.statics.findActiveBoost = async function (userId, investmentId) {
  return this.findOne({
    userId,
    investmentId,
    status: 'active',
  });
};

// Static method to find all active boosts for user
marketingBoostSchema.statics.findActiveBoostsByUser = async function (userId) {
  return this.find({
    userId,
    status: 'active',
  });
};

const MarketingBoost = mongoose.model('MarketingBoost', marketingBoostSchema);

export default MarketingBoost;

