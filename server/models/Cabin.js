/**
 * Cabin Model
 * MongoDB schema for cabin ownership and details
 */
import mongoose from 'mongoose';

const cabinSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location ID is required'],
      index: true,
    },
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Site ID is required'],
      unique: true,
      index: true,
    },
    cabinType: {
      type: String,
      enum: ['1BR', '2BR'],
      required: [true, 'Cabin type is required'],
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'inactive'],
      default: 'active',
      trim: true,
      lowercase: true,
    },
    purchasedExtras: [{
      type: String,
      trim: true,
    }],
    financingDetails: {
      isFinanced: { type: Boolean, default: false },
      loanAmount: { type: Number, default: 0 },
      interestRate: { type: Number, default: 0 },
      loanTermYears: { type: Number, default: 0 },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
cabinSchema.index({ ownerId: 1, status: 1 });
cabinSchema.index({ locationId: 1, cabinType: 1 });
cabinSchema.index({ siteId: 1 });

// Static method to find cabins by owner
cabinSchema.statics.findByOwnerId = function(ownerId) {
  return this.find({ ownerId })
    .populate('locationId', 'name slug')
    .populate('siteId', 'siteNumber siteLeaseFee')
    .sort({ purchaseDate: -1 });
};

// Create model
const Cabin = mongoose.models.Cabin || mongoose.model('Cabin', cabinSchema);

export default Cabin;

