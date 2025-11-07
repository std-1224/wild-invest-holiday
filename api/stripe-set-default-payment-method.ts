// Lambda Function: Set Default Stripe Payment Method
// Sets a payment method as the default for a customer

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Set Default Payment Method Request
 */
interface SetDefaultPaymentMethodRequest {
  customerId: string;
  paymentMethodId: string;
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

    const request: SetDefaultPaymentMethodRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.customerId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID is required' }),
      };
    }

    if (!request.paymentMethodId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment method ID is required' }),
      };
    }

    console.log('Setting default payment method:', {
      customerId: request.customerId,
      paymentMethodId: request.paymentMethodId,
    });

    // Update customer's default payment method
    const customer = await stripe.customers.update(request.customerId, {
      invoice_settings: {
        default_payment_method: request.paymentMethodId,
      },
    });

    console.log('Default payment method updated');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata,
          created: customer.created,
        },
      }),
    };
  } catch (error: any) {
    console.error('Error setting default payment method:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to set default payment method',
      }),
    };
  }
};

