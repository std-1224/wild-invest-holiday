// Lambda Function: Save Stripe Payment Method
// Attaches a payment method to a customer and optionally sets it as default

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Save Payment Method Request
 */
interface SavePaymentMethodRequest {
  paymentMethodId: string;
  customerId: string;
  setAsDefault?: boolean;
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

    const request: SavePaymentMethodRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.paymentMethodId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment method ID is required' }),
      };
    }

    if (!request.customerId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID is required' }),
      };
    }

    console.log('Saving payment method:', {
      paymentMethodId: request.paymentMethodId,
      customerId: request.customerId,
      setAsDefault: request.setAsDefault,
    });

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(
      request.paymentMethodId,
      {
        customer: request.customerId,
      }
    );

    console.log('Payment method attached:', paymentMethod.id);

    // Set as default if requested
    if (request.setAsDefault) {
      await stripe.customers.update(request.customerId, {
        invoice_settings: {
          default_payment_method: request.paymentMethodId,
        },
      });

      console.log('Payment method set as default');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card,
          billing_details: paymentMethod.billing_details,
          created: paymentMethod.created,
        },
      }),
    };
  } catch (error: any) {
    console.error('Error saving payment method:', error);

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
        error: error.message || 'Failed to save payment method',
      }),
    };
  }
};

