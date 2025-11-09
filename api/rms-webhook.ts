// Lambda Function: RMS Webhook Handler
// Handles incoming webhook events from RMS for bidirectional sync

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface RMSWebhookEvent {
  eventId: string;
  eventType: 'booking.created' | 'booking.updated' | 'booking.cancelled' | 'availability.changed';
  timestamp: string;
  propertyId: string;
  cabinId?: number;
  booking?: any;
  availability?: any;
  metadata?: Record<string, any>;
}

/**
 * Verify webhook signature (if RMS provides signature verification)
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) {
    console.warn('No webhook signature provided');
    return false;
  }

  // Implement signature verification based on RMS provider
  // Example: HMAC-SHA256 verification
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex');
  // return signature === expectedSignature;

  // For now, return true (implement based on RMS provider)
  return true;
}

/**
 * Handle booking.created event
 */
async function handleBookingCreated(event: RMSWebhookEvent): Promise<void> {
  console.log('Handling booking.created event:', event.eventId);

  if (!event.booking) {
    throw new Error('Booking data missing from event');
  }

  // Store booking in DynamoDB
  const tableName = process.env.BOOKINGS_TABLE || 'WildThingsBookings';

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        bookingId: event.booking.id,
        cabinId: event.cabinId,
        propertyId: event.propertyId,
        bookingType: event.booking.bookingType,
        checkInDate: event.booking.checkInDate,
        checkOutDate: event.booking.checkOutDate,
        nights: event.booking.nights,
        status: event.booking.status,
        createdAt: event.timestamp,
        updatedAt: event.timestamp,
        syncedFromRMS: true,
        rmsEventId: event.eventId,
      },
    })
  );

  console.log('Booking created in database:', event.booking.id);
}

/**
 * Handle booking.updated event
 */
async function handleBookingUpdated(event: RMSWebhookEvent): Promise<void> {
  console.log('Handling booking.updated event:', event.eventId);

  if (!event.booking) {
    throw new Error('Booking data missing from event');
  }

  // Update booking in DynamoDB
  const tableName = process.env.BOOKINGS_TABLE || 'WildThingsBookings';

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        bookingId: event.booking.id,
      },
      UpdateExpression:
        'SET #status = :status, updatedAt = :updatedAt, syncedFromRMS = :synced, rmsEventId = :eventId',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': event.booking.status,
        ':updatedAt': event.timestamp,
        ':synced': true,
        ':eventId': event.eventId,
      },
    })
  );

  console.log('Booking updated in database:', event.booking.id);
}

/**
 * Handle booking.cancelled event
 */
async function handleBookingCancelled(event: RMSWebhookEvent): Promise<void> {
  console.log('Handling booking.cancelled event:', event.eventId);

  if (!event.booking) {
    throw new Error('Booking data missing from event');
  }

  // Update booking status in DynamoDB
  const tableName = process.env.BOOKINGS_TABLE || 'WildThingsBookings';

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        bookingId: event.booking.id,
      },
      UpdateExpression:
        'SET #status = :status, cancelledAt = :cancelledAt, updatedAt = :updatedAt, syncedFromRMS = :synced, rmsEventId = :eventId',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'cancelled',
        ':cancelledAt': event.timestamp,
        ':updatedAt': event.timestamp,
        ':synced': true,
        ':eventId': event.eventId,
      },
    })
  );

  // If it's an owner booking, return days to allowance
  if (event.booking.bookingType === 'owner' && event.booking.ownerId) {
    const allowanceTable = process.env.OWNER_ALLOWANCE_TABLE || 'WildThingsOwnerAllowance';

    await docClient.send(
      new UpdateCommand({
        TableName: allowanceTable,
        Key: {
          ownerId: event.booking.ownerId,
          cabinId: event.cabinId,
        },
        UpdateExpression: 'SET daysUsed = daysUsed - :nights, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':nights': event.booking.nights,
          ':updatedAt': event.timestamp,
        },
      })
    );

    console.log(
      `Returned ${event.booking.nights} days to owner ${event.booking.ownerId} allowance`
    );
  }

  console.log('Booking cancelled in database:', event.booking.id);
}

/**
 * Handle availability.changed event
 */
async function handleAvailabilityChanged(event: RMSWebhookEvent): Promise<void> {
  console.log('Handling availability.changed event:', event.eventId);

  // Store availability update in DynamoDB
  const tableName = process.env.AVAILABILITY_TABLE || 'WildThingsAvailability';

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        cabinId: event.cabinId,
        propertyId: event.propertyId,
        lastSyncedAt: event.timestamp,
        availability: event.availability,
        rmsEventId: event.eventId,
      },
    })
  );

  console.log('Availability updated in database for cabin:', event.cabinId);
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
    'Access-Control-Allow-Headers': 'Content-Type,X-RMS-Signature',
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
    const signature = event.headers['X-RMS-Signature'] || event.headers['x-rms-signature'];
    const webhookSecret = process.env.RMS_WEBHOOK_SECRET || '';

    if (webhookSecret && !verifyWebhookSignature(event.body, signature, webhookSecret)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid webhook signature' }),
      };
    }

    const webhookEvent: RMSWebhookEvent = JSON.parse(event.body);

    // Validate event structure
    if (!webhookEvent.eventId || !webhookEvent.eventType || !webhookEvent.timestamp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid webhook event structure' }),
      };
    }

    // Handle event based on type
    switch (webhookEvent.eventType) {
      case 'booking.created':
        await handleBookingCreated(webhookEvent);
        break;

      case 'booking.updated':
        await handleBookingUpdated(webhookEvent);
        break;

      case 'booking.cancelled':
        await handleBookingCancelled(webhookEvent);
        break;

      case 'availability.changed':
        await handleAvailabilityChanged(webhookEvent);
        break;

      default:
        console.warn('Unknown event type:', webhookEvent.eventType);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unknown event type' }),
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        eventId: webhookEvent.eventId,
      }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

