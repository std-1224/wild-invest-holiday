// Lambda Function: Stripe Webhook Handler
// Handles Stripe webhook events for payments, subscriptions, and payment methods

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Stripe from 'stripe';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
  // apiVersion: '2024-11-20.acacia',
});

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * Verify Stripe webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string
): Stripe.Event | null {
  if (!signature) {
    console.error('No signature provided');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return null;
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Handling payment_intent.succeeded:', paymentIntent.id);

  const tableName = process.env.PAYMENTS_TABLE || 'WildThingsPayments';

  // Store payment record in DynamoDB
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        paymentId: paymentIntent.id,
        customerId: paymentIntent.customer,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'completed',
        description: paymentIntent.description,
        paymentMethodId: paymentIntent.payment_method,
        receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
        metadata: paymentIntent.metadata,
        createdAt: new Date(paymentIntent.created * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  );

  console.log('Payment record created:', paymentIntent.id);

  // TODO: Send email notification to customer
  // TODO: Update invoice status in Xero
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Handling payment_intent.payment_failed:', paymentIntent.id);

  const tableName = process.env.PAYMENTS_TABLE || 'WildThingsPayments';

  // Update payment record in DynamoDB
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        paymentId: paymentIntent.id,
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, failureReason = :reason',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'failed',
        ':updatedAt': new Date().toISOString(),
        ':reason': paymentIntent.last_payment_error?.message || 'Unknown error',
      },
    })
  );

  console.log('Payment record updated as failed:', paymentIntent.id);

  // TODO: Send failure notification to customer
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.created:', subscription.id);

  const tableName = process.env.SUBSCRIPTIONS_TABLE || 'WildThingsSubscriptions';

  // Store subscription record in DynamoDB
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        priceId: subscription.items.data[0]?.price.id,
        amount: subscription.items.data[0]?.price.unit_amount,
        currency: subscription.items.data[0]?.price.currency,
        interval: subscription.items.data[0]?.price.recurring?.interval,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        metadata: subscription.metadata,
        createdAt: new Date(subscription.created * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  );

  console.log('Subscription record created:', subscription.id);

  // TODO: Send subscription confirmation email
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.updated:', subscription.id);

  const tableName = process.env.SUBSCRIPTIONS_TABLE || 'WildThingsSubscriptions';

  // Update subscription record in DynamoDB
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        subscriptionId: subscription.id,
      },
      UpdateExpression:
        'SET #status = :status, currentPeriodStart = :start, currentPeriodEnd = :end, cancelAtPeriodEnd = :cancel, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': subscription.status,
        ':start': new Date(subscription.current_period_start * 1000).toISOString(),
        ':end': new Date(subscription.current_period_end * 1000).toISOString(),
        ':cancel': subscription.cancel_at_period_end,
        ':updatedAt': new Date().toISOString(),
      },
    })
  );

  console.log('Subscription record updated:', subscription.id);
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.deleted:', subscription.id);

  const tableName = process.env.SUBSCRIPTIONS_TABLE || 'WildThingsSubscriptions';

  // Update subscription record in DynamoDB
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        subscriptionId: subscription.id,
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, deletedAt = :deletedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'canceled',
        ':updatedAt': new Date().toISOString(),
        ':deletedAt': new Date().toISOString(),
      },
    })
  );

  console.log('Subscription record marked as deleted:', subscription.id);

  // TODO: Send cancellation confirmation email
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log('Handling invoice.paid:', invoice.id);

  // TODO: Update invoice status in Xero
  // TODO: Send receipt to customer
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Handling invoice.payment_failed:', invoice.id);

  // TODO: Send payment failure notification
  // TODO: Update subscription status if needed
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
    'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature',
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

    // Verify webhook signature
    const signature = event.headers['Stripe-Signature'] || event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    const stripeEvent = verifyWebhookSignature(event.body, signature, webhookSecret);

    if (!stripeEvent) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid webhook signature' }),
      };
    }

    console.log('Webhook event received:', stripeEvent.type);

    // Handle event based on type
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(stripeEvent.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(stripeEvent.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(stripeEvent.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object as Stripe.Invoice);
        break;

      default:
        console.log('Unhandled event type:', stripeEvent.type);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        eventId: stripeEvent.id,
      }),
    };
  } catch (error: any) {
    console.error('Error processing webhook:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to process webhook',
      }),
    };
  }
};

