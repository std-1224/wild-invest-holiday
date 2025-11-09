// Lambda Function: RMS Cancel Owner Booking
// Cancels owner bookings in RMS with 48-hour cancellation policy

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface CancelBookingRequest {
  bookingId: string;
  ownerId: string;
  reason?: string;
}

interface RMSBooking {
  id: string;
  propertyId: string;
  cabinId: number;
  bookingType: 'guest' | 'owner';
  ownerName?: string;
  ownerId?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests?: number;
  status: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

/**
 * Validate cancellation request
 */
function validateCancelRequest(request: CancelBookingRequest): string[] {
  const errors: string[] = [];

  if (!request.bookingId) {
    errors.push('bookingId is required');
  }

  if (!request.ownerId) {
    errors.push('ownerId is required');
  }

  return errors;
}

/**
 * Fetch booking details from RMS
 */
async function fetchBooking(bookingId: string): Promise<RMSBooking> {
  const RMS_API_URL = process.env.RMS_API_URL;
  const RMS_API_KEY = process.env.RMS_API_KEY;

  if (!RMS_API_URL || !RMS_API_KEY) {
    throw new Error('RMS API credentials not configured');
  }

  const response = await fetch(`${RMS_API_URL}/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RMS_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch booking: ${response.status}`);
  }

  return await response.json();
}

/**
 * Cancel booking in RMS
 */
async function cancelBookingInRMS(
  bookingId: string,
  request: CancelBookingRequest
): Promise<RMSBooking> {
  const RMS_API_URL = process.env.RMS_API_URL;
  const RMS_API_KEY = process.env.RMS_API_KEY;

  if (!RMS_API_URL || !RMS_API_KEY) {
    throw new Error('RMS API credentials not configured');
  }

  const response = await fetch(`${RMS_API_URL}/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RMS_API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to cancel booking: ${response.status}`);
  }

  return await response.json();
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
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
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

    const request: CancelBookingRequest = JSON.parse(event.body);

    // Validate request
    const validationErrors = validateCancelRequest(request);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Validation failed',
          validationErrors,
        }),
      };
    }

    // Fetch booking details
    const booking = await fetchBooking(request.bookingId);

    // Verify booking belongs to owner
    if (booking.ownerId !== request.ownerId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'You are not authorized to cancel this booking',
        }),
      };
    }

    // Verify booking is an owner booking
    if (booking.bookingType !== 'owner') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Only owner bookings can be cancelled through this endpoint',
        }),
      };
    }

    // Verify booking is not already cancelled
    if (booking.status === 'cancelled') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Booking is already cancelled',
        }),
      };
    }

    // Check 48-hour cancellation policy
    const CANCELLATION_HOURS = 48;
    const checkIn = new Date(booking.checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < CANCELLATION_HOURS) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Bookings must be cancelled at least ${CANCELLATION_HOURS} hours before check-in. You have ${Math.floor(hoursUntilCheckIn)} hours remaining.`,
        }),
      };
    }

    // Cancel booking in RMS
    const cancelledBooking = await cancelBookingInRMS(request.bookingId, request);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        booking: cancelledBooking,
        daysReturned: booking.nights,
        message: `Booking cancelled successfully. ${booking.nights} days returned to your annual allowance.`,
      }),
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);

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

