/**
 * Agreement Model
 * MongoDB schema for legal agreements and documents
 */
import mongoose from 'mongoose';

const agreementSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    agreement_type: {
      type: String,
      required: [true, 'Agreement type is required'],
      enum: ['sale_agreement', 'land_lease', 'site_management', 'other'],
      trim: true,
      lowercase: true,
    },
    agreement_url: {
      type: String,
      required: [true, 'Agreement URL is required'],
      trim: true,
    },
    cabin_id: {
      type: String,
      trim: true,
      default: null,
    },
    file_name: {
      type: String,
      trim: true,
    },
    file_size: {
      type: Number, // in bytes
    },
    file_type: {
      type: String, // MIME type
      trim: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'archived'],
      default: 'active',
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
agreementSchema.index({ owner_id: 1, agreement_type: 1 });
agreementSchema.index({ cabin_id: 1 });

// Create model
const Agreement = mongoose.models.Agreement || mongoose.model('Agreement', agreementSchema);

export default Agreement;

