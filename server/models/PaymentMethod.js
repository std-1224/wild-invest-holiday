/**
 * PaymentMethod Model
 * Stores saved payment methods (credit cards) for users
 */
import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
    unique: true,
  },
  brand: {
    type: String,
    required: true,
    lowercase: true,
  },
  last4: {
    type: String,
    required: true,
  },
  expMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  expYear: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
paymentMethodSchema.index({ userId: 1, createdAt: -1 });

const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;

