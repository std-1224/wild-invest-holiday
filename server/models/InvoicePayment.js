/**
 * InvoicePayment Model
 * Tracks payments made for Xero invoices via Stripe
 */
import mongoose from 'mongoose';

const invoicePaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Xero invoice details
  xeroInvoiceId: {
    type: String,
    required: true,
    index: true,
  },
  xeroInvoiceNumber: {
    type: String,
    required: true,
  },
  xeroContactId: {
    type: String,
    required: true,
  },
  // Stripe payment details
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true, // unique already creates an index, no need for index: true
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripePaymentMethodId: {
    type: String,
    required: true,
  },
  // Xero payment details
  xeroPaymentId: {
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
  // Description
  description: {
    type: String,
    default: '',
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
invoicePaymentSchema.index({ userId: 1, createdAt: -1 });
invoicePaymentSchema.index({ xeroInvoiceId: 1, status: 1 });
invoicePaymentSchema.index({ stripePaymentIntentId: 1 });

// Static method to find payments by user
invoicePaymentSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find payment by Stripe PaymentIntent ID
invoicePaymentSchema.statics.findByPaymentIntentId = function(paymentIntentId) {
  return this.findOne({ stripePaymentIntentId: paymentIntentId });
};

// Static method to find payments by Xero invoice ID
invoicePaymentSchema.statics.findByXeroInvoiceId = function(xeroInvoiceId) {
  return this.find({ xeroInvoiceId }).sort({ createdAt: -1 });
};

const InvoicePayment = mongoose.models.InvoicePayment || mongoose.model('InvoicePayment', invoicePaymentSchema);

export default InvoicePayment;

