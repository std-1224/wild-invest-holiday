/**
 * StripeCustomer Model
 * Links users to their Stripe customer accounts
 */
import mongoose from 'mongoose';

const stripeCustomerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
    unique: true,
  },
  defaultPaymentMethodId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
stripeCustomerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const StripeCustomer = mongoose.models.StripeCustomer || mongoose.model('StripeCustomer', stripeCustomerSchema);

export default StripeCustomer;

