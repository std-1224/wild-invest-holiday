// Lambda Function: Create Stripe PaymentIntent
// Handles one-time payment creation

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Create PaymentIntent Request
 */
interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string;
  customerId: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
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

    const request: CreatePaymentIntentRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.amount || request.amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid amount is required' }),
      };
    }

    if (!request.currency) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Currency is required' }),
      };
    }

    if (!request.customerId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID is required' }),
      };
    }

    console.log('Creating PaymentIntent:', {
      amount: request.amount,
      currency: request.currency,
      customerId: request.customerId,
    });

    // Create PaymentIntent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: request.amount,
      currency: request.currency.toLowerCase(),
      customer: request.customerId,
      description: request.description,
      metadata: request.metadata || {},
      receipt_email: request.receiptEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If payment method is provided, attach it
    if (request.paymentMethodId) {
      paymentIntentParams.payment_method = request.paymentMethodId;
      paymentIntentParams.confirm = true; // Auto-confirm if payment method provided
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    console.log('PaymentIntent created:', paymentIntent.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
          payment_method: paymentIntent.payment_method,
          customer: paymentIntent.customer,
          description: paymentIntent.description,
          metadata: paymentIntent.metadata,
          created: paymentIntent.created,
        },
        clientSecret: paymentIntent.client_secret,
      }),
    };
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
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
        error: error.message || 'Failed to create payment intent',
      }),
    };
  }
};

