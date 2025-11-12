/**
 * Location Model
 * MongoDB schema for cabin park locations (e.g., Mansfield)
 */
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      postcode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'Australia' },
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    totalSites: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    availableSites: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'coming_soon', 'inactive'],
      default: 'active',
      trim: true,
      lowercase: true,
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    images: [{
      url: { type: String, trim: true },
      caption: { type: String, trim: true, default: '' },
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

// Index for faster queries
locationSchema.index({ slug: 1 });
locationSchema.index({ status: 1 });

// Pre-save hook to generate slug from name
locationSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Create model
const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

export default Location;

