// Lambda Function: RMS Availability
// Fetches live availability data from RMS for a specific cabin

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface RMSBookedDate {
  date: string;
  bookingId: string;
  bookingType: 'guest' | 'owner';
  guestName?: string;
  nights?: number;
  checkIn?: boolean;
  checkOut?: boolean;
}

interface RMSPeakPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface RMSAvailability {
  propertyId: string;
  cabinId: number;
  availableDates: string[];
  bookedDates: RMSBookedDate[];
  peakPeriods: RMSPeakPeriod[];
  lastSyncedAt: string;
}

/**
 * Fetch availability from RMS API
 */
async function fetchRMSAvailability(
  cabinId: number,
  startDate?: string,
  endDate?: string
): Promise<RMSAvailability> {
  const RMS_API_URL = process.env.RMS_API_URL;
  const RMS_API_KEY = process.env.RMS_API_KEY;

  if (!RMS_API_URL || !RMS_API_KEY) {
    throw new Error('RMS API credentials not configured');
  }

  const params = new URLSearchParams({
    cabinId: cabinId.toString(),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const response = await fetch(`${RMS_API_URL}/availability?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RMS_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `RMS API Error: ${response.status}`);
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
    const cabinId = event.queryStringParameters?.cabinId;
    const startDate = event.queryStringParameters?.startDate;
    const endDate = event.queryStringParameters?.endDate;

    // Validate cabinId
    if (!cabinId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'cabinId is required' }),
      };
    }

    const cabinIdNum = parseInt(cabinId, 10);
    if (isNaN(cabinIdNum)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'cabinId must be a number' }),
      };
    }

    // Fetch availability from RMS
    const availability = await fetchRMSAvailability(cabinIdNum, startDate, endDate);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: availability,
      }),
    };
  } catch (error) {
    console.error('Error fetching RMS availability:', error);

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

