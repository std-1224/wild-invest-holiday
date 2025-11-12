/**
 * Site Model
 * MongoDB schema for individual cabin sites within a location
 */
import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location ID is required'],
      index: true,
    },
    siteNumber: {
      type: String,
      required: [true, 'Site number is required'],
      trim: true,
    },
    cabinType: {
      type: String,
      enum: ['1BR', '2BR'],
      required: [true, 'Cabin type is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'unavailable'],
      default: 'available',
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    features: [{
      type: String,
      trim: true,
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique site numbers within a location
siteSchema.index({ locationId: 1, siteNumber: 1 }, { unique: true });
siteSchema.index({ status: 1 });
siteSchema.index({ cabinType: 1 });

// Create model
const Site = mongoose.models.Site || mongoose.model('Site', siteSchema);

export default Site;

