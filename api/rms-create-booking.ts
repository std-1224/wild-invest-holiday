// Lambda Function: RMS Create Owner Booking
// Creates owner bookings in RMS with validation against business rules

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface CreateOwnerBookingRequest {
  ownerId: string;
  cabinId: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  specialRequests?: string;
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
}

interface OwnerBookingAllowance {
  ownerId: string;
  cabinId: number;
  year: number;
  daysUsed: number;
  daysLimit: number;
  daysRemaining: number;
  lastResetDate: string;
  nextResetDate: string;
}

/**
 * Validate owner booking request
 */
function validateBookingRequest(request: CreateOwnerBookingRequest): string[] {
  const errors: string[] = [];

  if (!request.ownerId) {
    errors.push('ownerId is required');
  }

  if (!request.cabinId || isNaN(request.cabinId)) {
    errors.push('Valid cabinId is required');
  }

  if (!request.checkInDate) {
    errors.push('checkInDate is required');
  }

  if (!request.checkOutDate) {
    errors.push('checkOutDate is required');
  }

  if (!request.guests || request.guests < 1) {
    errors.push('guests must be at least 1');
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (request.checkInDate && !dateRegex.test(request.checkInDate)) {
    errors.push('checkInDate must be in YYYY-MM-DD format');
  }

  if (request.checkOutDate && !dateRegex.test(request.checkOutDate)) {
    errors.push('checkOutDate must be in YYYY-MM-DD format');
  }

  // Validate check-out is after check-in
  if (request.checkInDate && request.checkOutDate) {
    const checkIn = new Date(request.checkInDate);
    const checkOut = new Date(request.checkOutDate);
    if (checkOut <= checkIn) {
      errors.push('checkOutDate must be after checkInDate');
    }
  }

  return errors;
}

/**
 * Calculate nights between dates
 */
function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Fetch owner allowance from RMS
 */
async function fetchOwnerAllowance(
  ownerId: string,
  cabinId: number
): Promise<OwnerBookingAllowance> {
  const RMS_API_URL = process.env.RMS_API_URL;
  const RMS_API_KEY = process.env.RMS_API_KEY;

  if (!RMS_API_URL || !RMS_API_KEY) {
    throw new Error('RMS API credentials not configured');
  }

  const response = await fetch(
    `${RMS_API_URL}/owner/${ownerId}/allowance?cabinId=${cabinId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RMS_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch owner allowance: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create booking in RMS
 */
async function createBookingInRMS(
  request: CreateOwnerBookingRequest
): Promise<RMSBooking> {
  const RMS_API_URL = process.env.RMS_API_URL;
  const RMS_API_KEY = process.env.RMS_API_KEY;

  if (!RMS_API_URL || !RMS_API_KEY) {
    throw new Error('RMS API credentials not configured');
  }

  const response = await fetch(`${RMS_API_URL}/bookings/owner`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RMS_API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create booking: ${response.status}`);
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

    const request: CreateOwnerBookingRequest = JSON.parse(event.body);

    // Validate request
    const validationErrors = validateBookingRequest(request);
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

    // Calculate nights
    const nights = calculateNights(request.checkInDate, request.checkOutDate);

    // Business rule validations
    const MIN_NIGHTS = 2;
    const MAX_NIGHTS = 14;
    const ADVANCE_HOURS = 48;

    if (nights < MIN_NIGHTS) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Minimum stay is ${MIN_NIGHTS} nights`,
        }),
      };
    }

    if (nights > MAX_NIGHTS) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Maximum stay is ${MAX_NIGHTS} consecutive nights`,
        }),
      };
    }

    // Check advance booking requirement
    const checkIn = new Date(request.checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < ADVANCE_HOURS) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Bookings must be made at least ${ADVANCE_HOURS} hours in advance`,
        }),
      };
    }

    // Fetch owner allowance
    const allowance = await fetchOwnerAllowance(request.ownerId, request.cabinId);

    // Check if owner has enough days remaining
    if (nights > allowance.daysRemaining) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Insufficient days remaining. You have ${allowance.daysRemaining} days left, but requested ${nights} nights`,
        }),
      };
    }

    // Create booking in RMS
    const booking = await createBookingInRMS(request);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        booking,
        message: 'Owner booking created successfully',
      }),
    };
  } catch (error) {
    console.error('Error creating owner booking:', error);

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

