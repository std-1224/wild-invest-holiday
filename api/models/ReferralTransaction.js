/**
 * ReferralTransaction Model
 * MongoDB schema for tracking referral credits between users
 */
import mongoose from 'mongoose';

const referralTransactionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 1000, // $1,000 credit
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed',
      required: true,
    },
    type: {
      type: String,
      enum: ['referrer_credit', 'referee_credit'],
      required: true,
    },
    investmentId: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
referralTransactionSchema.index({ fromUserId: 1, toUserId: 1 });
referralTransactionSchema.index({ status: 1 });

// Create model
const ReferralTransaction =
  mongoose.models.ReferralTransaction ||
  mongoose.model('ReferralTransaction', referralTransactionSchema);

export default ReferralTransaction;

