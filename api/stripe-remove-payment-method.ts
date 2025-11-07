// Lambda Function: Remove Stripe Payment Method
// Detaches a payment method from a customer

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Remove Payment Method Request
 */
interface RemovePaymentMethodRequest {
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

    const request: RemovePaymentMethodRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.paymentMethodId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment method ID is required' }),
      };
    }

    console.log('Removing payment method:', request.paymentMethodId);

    // Detach payment method from customer
    await stripe.paymentMethods.detach(request.paymentMethodId);

    console.log('Payment method removed');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (error: any) {
    console.error('Error removing payment method:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to remove payment method',
      }),
    };
  }
};

