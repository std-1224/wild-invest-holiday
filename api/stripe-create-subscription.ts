// Lambda Function: Create Stripe Subscription
// Handles recurring payment subscriptions (e.g., Marketing Boost tiers)

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Create Subscription Request
 */
interface CreateSubscriptionRequest {
  customerId: string;
  priceId: string; // Stripe Price ID for recurring product
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

/**
 * Lambda Handler
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Validate request method
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const request: CreateSubscriptionRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.customerId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID is required' }),
      };
    }

    if (!request.priceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Price ID is required' }),
      };
    }

    console.log('Creating subscription:', {
      customerId: request.customerId,
      priceId: request.priceId,
    });

    // If payment method is provided, set it as default
    if (request.paymentMethodId) {
      await stripe.customers.update(request.customerId, {
        invoice_settings: {
          default_payment_method: request.paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: request.customerId,
      items: [
        {
          price: request.priceId,
        },
      ],
      metadata: request.metadata || {},
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    };

    // Add trial period if specified
    if (request.trialPeriodDays && request.trialPeriodDays > 0) {
      subscriptionParams.trial_period_days = request.trialPeriodDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    console.log('Subscription created:', subscription.id);

    // Extract client secret for 3D Secure authentication
    let clientSecret: string | undefined;
    if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string') {
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      if (invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
        clientSecret = paymentIntent.client_secret || undefined;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          items: subscription.items.data.map((item) => ({
            id: item.id,
            price: {
              id: item.price.id,
              unit_amount: item.price.unit_amount,
              currency: item.price.currency,
              recurring: item.price.recurring,
            },
          })),
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          metadata: subscription.metadata,
          created: subscription.created,
        },
        clientSecret,
      }),
    };
  } catch (error: any) {
    console.error('Error creating subscription:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: error.message,
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to create subscription',
      }),
    };
  }
};

