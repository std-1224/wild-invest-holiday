// RMS (Rental Management System) Integration Types
// Supports integration with property management systems for Wild Things

/**
 * RMS Booking Status
 */
export type RMSBookingStatus = 
  | 'confirmed' 
  | 'pending' 
  | 'cancelled' 
  | 'completed' 
  | 'no-show';

/**
 * Booking Type - distinguishes between guest and owner bookings
 */
export type BookingType = 'guest' | 'owner';

/**
 * RMS Booking Record
 * Represents a booking in the RMS system
 */
export interface RMSBooking {
  id: string;
  propertyId: string;
  cabinId: number;
  bookingType: BookingType;
  guestName?: string;
  ownerName?: string;
  ownerId?: string;
  checkInDate: string; // ISO 8601 format: YYYY-MM-DD
  checkOutDate: string; // ISO 8601 format: YYYY-MM-DD
  nights: number;
  guests?: number;
  status: RMSBookingStatus;
  totalAmount?: number;
  currency?: string;
  specialRequests?: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  cancelledAt?: string; // ISO 8601 timestamp
  cancellationReason?: string;
}

/**
 * RMS Availability Response
 * Represents availability data for a property/cabin
 */
export interface RMSAvailability {
  propertyId: string;
  cabinId: number;
  availableDates: string[]; // Array of available dates in YYYY-MM-DD format
  bookedDates: RMSBookedDate[];
  peakPeriods: RMSPeakPeriod[];
  lastSyncedAt: string; // ISO 8601 timestamp
}

/**
 * Booked Date with metadata
 */
export interface RMSBookedDate {
  date: string; // YYYY-MM-DD
  bookingId: string;
  bookingType: BookingType;
  guestName?: string;
  nights?: number;
  checkIn?: boolean; // True if this is the check-in date
  checkOut?: boolean; // True if this is the check-out date
}

/**
 * Peak Period Definition
 * Periods when owner bookings are blocked
 */
export interface RMSPeakPeriod {
  id: string;
  name: string; // e.g., "Christmas Holiday", "Easter Weekend"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
}

/**
 * Owner Booking Rules
 * Business rules for owner bookings
 */
export interface OwnerBookingRules {
  annualDayLimit: number; // Default: 180 days
  minNights: number; // Default: 2 nights
  maxNights: number; // Default: 14 nights
  advanceBookingHours: number; // Default: 48 hours
  cancellationHours: number; // Default: 48 hours
  peakPeriodsBlocked: boolean; // Default: true
  resetDate: string; // Date when allowance resets (e.g., "01-01" for January 1)
}

/**
 * Owner Booking Allowance
 * Tracks owner's annual booking usage
 */
export interface OwnerBookingAllowance {
  ownerId: string;
  cabinId: number;
  year: number;
  daysUsed: number;
  daysLimit: number;
  daysRemaining: number;
  bookings: RMSBooking[];
  lastResetDate: string; // ISO 8601 date
  nextResetDate: string; // ISO 8601 date
}

/**
 * Create Owner Booking Request
 */
export interface CreateOwnerBookingRequest {
  ownerId: string;
  cabinId: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  guests: number;
  specialRequests?: string;
}

/**
 * Create Owner Booking Response
 */
export interface CreateOwnerBookingResponse {
  success: boolean;
  booking?: RMSBooking;
  error?: string;
  validationErrors?: string[];
}

/**
 * Cancel Booking Request
 */
export interface CancelBookingRequest {
  bookingId: string;
  ownerId: string;
  reason?: string;
}

/**
 * Cancel Booking Response
 */
export interface CancelBookingResponse {
  success: boolean;
  booking?: RMSBooking;
  daysReturned?: number;
  error?: string;
}

/**
 * RMS Sync Status
 */
export interface RMSSyncStatus {
  lastSyncAt: string; // ISO 8601 timestamp
  status: 'success' | 'failed' | 'in-progress';
  bookingsSynced: number;
  errors?: string[];
}

/**
 * RMS Webhook Event
 * Handles incoming webhook events from RMS
 */
export interface RMSWebhookEvent {
  eventId: string;
  eventType: 'booking.created' | 'booking.updated' | 'booking.cancelled' | 'availability.changed';
  timestamp: string; // ISO 8601 timestamp
  propertyId: string;
  cabinId?: number;
  booking?: RMSBooking;
  availability?: RMSAvailability;
  metadata?: Record<string, any>;
}

/**
 * RMS API Configuration
 */
export interface RMSConfig {
  apiUrl: string;
  apiKey: string;
  tenantId?: string;
  timeout?: number; // Request timeout in milliseconds
  retryAttempts?: number;
}

/**
 * RMS API Error Response
 */
export interface RMSErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

/**
 * Booking Validation Result
 */
export interface BookingValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  nightsRequested?: number;
  daysRemaining?: number;
  conflictingDates?: string[];
}

