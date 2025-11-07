// Lambda Function: List Stripe Payment Methods
// Retrieves all saved payment methods for a customer

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

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
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Get query parameters
    const customerId = event.queryStringParameters?.customerId;
    const type = event.queryStringParameters?.type || 'card';

    if (!customerId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID is required' }),
      };
    }

    console.log('Listing payment methods for customer:', customerId);

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(customerId);

    let defaultPaymentMethodId: string | null = null;
    if (customer && !customer.deleted) {
      defaultPaymentMethodId =
        typeof customer.invoice_settings.default_payment_method === 'string'
          ? customer.invoice_settings.default_payment_method
          : customer.invoice_settings.default_payment_method?.id || null;
    }

    // List payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: type as 'card' | 'us_bank_account',
    });

    console.log(`Found ${paymentMethods.data.length} payment methods`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        paymentMethods: paymentMethods.data.map((pm) => ({
          id: pm.id,
          type: pm.type,
          card: pm.card,
          billing_details: pm.billing_details,
          created: pm.created,
          isDefault: pm.id === defaultPaymentMethodId,
        })),
      }),
    };
  } catch (error: any) {
    console.error('Error listing payment methods:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to list payment methods',
      }),
    };
  }
};

