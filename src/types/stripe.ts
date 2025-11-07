// Stripe Payment Integration Types
// TypeScript interfaces for Stripe payment data structures

/**
 * Stripe Configuration
 */
export interface StripeConfig {
  publishableKey: string;
  apiVersion?: string;
  secretKey?: string;
  webhookSecret?: string;
}

/**
 * Stripe Customer
 */
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
  created: number;
}

/**
 * Stripe Payment Method
 */
export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
  };
  billing_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
  created: number;
}

/**
 * Payment Method for UI Display
 */
export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string; // Format: "MM/YY"
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

/**
 * Stripe PaymentIntent
 */
export interface StripePaymentIntent {
  id: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  payment_method?: string;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
  created: number;
}

/**
 * Create PaymentIntent Request
 */
export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string; // e.g., "aud"
  customerId: string; // Stripe Customer ID
  paymentMethodId?: string; // Optional: use saved payment method
  description?: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
}

/**
 * Create PaymentIntent Response
 */
export interface CreatePaymentIntentResponse {
  success: boolean;
  paymentIntent?: StripePaymentIntent;
  clientSecret?: string;
  error?: string;
}

/**
 * Save Payment Method Request
 */
export interface SavePaymentMethodRequest {
  paymentMethodId: string; // Stripe PaymentMethod ID from Stripe Elements
  customerId: string; // Stripe Customer ID
  setAsDefault?: boolean;
}

/**
 * Save Payment Method Response
 */
export interface SavePaymentMethodResponse {
  success: boolean;
  paymentMethod?: StripePaymentMethod;
  error?: string;
}

/**
 * Stripe Subscription
 */
export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing';
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: 'day' | 'week' | 'month' | 'year';
          interval_count: number;
        };
      };
    }>;
  };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  metadata?: Record<string, string>;
  created: number;
}

/**
 * Create Subscription Request
 */
export interface CreateSubscriptionRequest {
  customerId: string;
  priceId: string; // Stripe Price ID for recurring product
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

/**
 * Create Subscription Response
 */
export interface CreateSubscriptionResponse {
  success: boolean;
  subscription?: StripeSubscription;
  clientSecret?: string; // For 3D Secure authentication
  error?: string;
}

/**
 * Cancel Subscription Request
 */
export interface CancelSubscriptionRequest {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean; // If true, cancel at end of billing period
}

/**
 * Cancel Subscription Response
 */
export interface CancelSubscriptionResponse {
  success: boolean;
  subscription?: StripeSubscription;
  error?: string;
}

/**
 * Stripe Webhook Event
 */
export interface StripeWebhookEvent {
  id: string;
  type: string; // e.g., "payment_intent.succeeded", "customer.subscription.updated"
  data: {
    object: any; // The Stripe object (PaymentIntent, Subscription, etc.)
  };
  created: number;
}

/**
 * Payment Intent Webhook Events
 */
export type PaymentIntentWebhookType =
  | 'payment_intent.created'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled';

/**
 * Subscription Webhook Events
 */
export type SubscriptionWebhookType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end';

/**
 * Payment Method Webhook Events
 */
export type PaymentMethodWebhookType =
  | 'payment_method.attached'
  | 'payment_method.detached'
  | 'payment_method.updated';

/**
 * Invoice Webhook Events
 */
export type InvoiceWebhookType =
  | 'invoice.created'
  | 'invoice.finalized'
  | 'invoice.paid'
  | 'invoice.payment_failed';

/**
 * Payment Record (for database storage)
 */
export interface PaymentRecord {
  id: string;
  userId: string;
  investmentId?: string;
  stripePaymentIntentId: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  paymentMethodId?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

/**
 * Subscription Record (for database storage)
 */
export interface SubscriptionRecord {
  id: string;
  userId: string;
  investmentId?: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number; // Amount in cents
  currency: string;
  interval: 'month' | 'year';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

/**
 * Refund Request
 */
export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // Optional: partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

/**
 * Refund Response
 */
export interface RefundResponse {
  success: boolean;
  refund?: {
    id: string;
    amount: number;
    status: 'succeeded' | 'pending' | 'failed';
    created: number;
  };
  error?: string;
}

/**
 * List Payment Methods Request
 */
export interface ListPaymentMethodsRequest {
  customerId: string;
  type?: 'card' | 'bank_account';
}

/**
 * List Payment Methods Response
 */
export interface ListPaymentMethodsResponse {
  success: boolean;
  paymentMethods?: StripePaymentMethod[];
  error?: string;
}

/**
 * Set Default Payment Method Request
 */
export interface SetDefaultPaymentMethodRequest {
  customerId: string;
  paymentMethodId: string;
}

/**
 * Set Default Payment Method Response
 */
export interface SetDefaultPaymentMethodResponse {
  success: boolean;
  customer?: StripeCustomer;
  error?: string;
}

/**
 * Remove Payment Method Request
 */
export interface RemovePaymentMethodRequest {
  paymentMethodId: string;
}

/**
 * Remove Payment Method Response
 */
export interface RemovePaymentMethodResponse {
  success: boolean;
  error?: string;
}

