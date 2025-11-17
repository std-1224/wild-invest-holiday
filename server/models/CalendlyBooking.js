/**
 * CalendlyBooking Model
 * MongoDB schema for storing Calendly booking/appointment data
 */
import mongoose from 'mongoose';

const calendlyBookingSchema = new mongoose.Schema(
  {
    // User reference (optional - for logged-in users)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // Calendly event details
    calendlyEventUri: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    calendlyInviteeUri: {
      type: String,
      required: true,
      unique: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'inspection', // Property inspection booking
        'owner_consultation', // Owner consultation
        'general_inquiry', // General inquiry meeting
        'other',
      ],
      default: 'general_inquiry',
    },
    eventTypeName: {
      type: String,
      default: '',
    },
    // Invitee information
    inviteeName: {
      type: String,
      required: true,
      trim: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    inviteePhone: {
      type: String,
      default: '',
      trim: true,
    },
    // Scheduling details
    scheduledStartTime: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      default: 'Australia/Melbourne',
    },
    // Meeting location/details
    location: {
      type: String,
      default: '',
    },
    meetingNotes: {
      type: String,
      default: '',
    },
    // Status tracking
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'canceled', 'no_show', 'rescheduled'],
      default: 'scheduled',
      index: true,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    canceledBy: {
      type: String,
      enum: ['invitee', 'host', 'system'],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    // Calendly webhook payload (for debugging/reference)
    webhookPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Custom questions/answers from Calendly form
    customAnswers: [{
      question: { type: String },
      answer: { type: String },
    }],
    // Tracking fields
    source: {
      type: String,
      enum: ['invest_page', 'investor_portal', 'holiday_homes', 'direct'],
      default: 'direct',
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

// Indexes for efficient queries
calendlyBookingSchema.index({ inviteeEmail: 1, status: 1 });
calendlyBookingSchema.index({ userId: 1, status: 1 });
calendlyBookingSchema.index({ scheduledStartTime: 1, status: 1 });
calendlyBookingSchema.index({ createdAt: -1 });

// Static methods
calendlyBookingSchema.statics.findByUserId = function(userId) {
  return this.find({ userId })
    .sort({ scheduledStartTime: -1 })
    .lean();
};

calendlyBookingSchema.statics.findByEmail = function(email) {
  return this.find({ inviteeEmail: email.toLowerCase() })
    .sort({ scheduledStartTime: -1 })
    .lean();
};

calendlyBookingSchema.statics.findUpcoming = function(userId) {
  return this.find({
    userId,
    status: 'scheduled',
    scheduledStartTime: { $gte: new Date() },
  })
    .sort({ scheduledStartTime: 1 })
    .lean();
};

const CalendlyBooking = mongoose.model('CalendlyBooking', calendlyBookingSchema);

export default CalendlyBooking;

