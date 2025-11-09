// Owner Booking Rules Engine
// Validates owner bookings against business rules

import {
  OwnerBookingRules,
  RMSBookedDate,
  RMSPeakPeriod,
  BookingValidationResult,
  OwnerBookingAllowance,
} from '../types/rms';

/**
 * Default owner booking rules for Wild Things
 */
export const DEFAULT_OWNER_BOOKING_RULES: OwnerBookingRules = {
  annualDayLimit: 180, // 180 days per year
  minNights: 2, // Minimum 2-night stay
  maxNights: 14, // Maximum 14 consecutive nights
  advanceBookingHours: 48, // Must book at least 48 hours in advance
  cancellationHours: 48, // Must cancel at least 48 hours before check-in
  peakPeriodsBlocked: true, // Peak periods are blocked for owner bookings
  resetDate: '01-01', // Resets January 1st
};

/**
 * Calculate the number of nights between two dates
 */
export function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if a date falls within a peak period
 */
export function isDateInPeakPeriod(date: string, peakPeriods: RMSPeakPeriod[]): boolean {
  const checkDate = new Date(date);
  
  return peakPeriods.some(period => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return checkDate >= startDate && checkDate <= endDate;
  });
}

/**
 * Check if any date in a range falls within peak periods
 */
export function hasDateInPeakPeriod(
  checkInDate: string,
  checkOutDate: string,
  peakPeriods: RMSPeakPeriod[]
): boolean {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  // Check each date in the range
  const currentDate = new Date(checkIn);
  while (currentDate < checkOut) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (isDateInPeakPeriod(dateStr, peakPeriods)) {
      return true;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return false;
}

/**
 * Check if a date is already booked
 */
export function isDateBooked(date: string, bookedDates: RMSBookedDate[]): boolean {
  return bookedDates.some(booked => booked.date === date);
}

/**
 * Check if any date in a range is already booked
 */
export function hasConflictingBooking(
  checkInDate: string,
  checkOutDate: string,
  bookedDates: RMSBookedDate[]
): { hasConflict: boolean; conflictingDates: string[] } {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const conflictingDates: string[] = [];
  
  // Check each date in the range
  const currentDate = new Date(checkIn);
  while (currentDate < checkOut) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (isDateBooked(dateStr, bookedDates)) {
      conflictingDates.push(dateStr);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    hasConflict: conflictingDates.length > 0,
    conflictingDates,
  };
}

/**
 * Check if booking is made with sufficient advance notice
 */
export function hasAdvanceNotice(
  checkInDate: string,
  advanceHours: number = DEFAULT_OWNER_BOOKING_RULES.advanceBookingHours
): boolean {
  const checkIn = new Date(checkInDate);
  const now = new Date();
  const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilCheckIn >= advanceHours;
}

/**
 * Check if cancellation is within allowed timeframe
 */
export function canCancelBooking(
  checkInDate: string,
  cancellationHours: number = DEFAULT_OWNER_BOOKING_RULES.cancellationHours
): boolean {
  const checkIn = new Date(checkInDate);
  const now = new Date();
  const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilCheckIn >= cancellationHours;
}

/**
 * Validate owner booking against all rules
 */
export function validateOwnerBooking(
  checkInDate: string,
  checkOutDate: string,
  bookedDates: RMSBookedDate[],
  peakPeriods: RMSPeakPeriod[],
  ownerAllowance: OwnerBookingAllowance,
  rules: OwnerBookingRules = DEFAULT_OWNER_BOOKING_RULES
): BookingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Calculate nights
  const nights = calculateNights(checkInDate, checkOutDate);
  
  // Validate dates
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  if (checkOut <= checkIn) {
    errors.push('Check-out date must be after check-in date');
  }
  
  // Validate minimum nights
  if (nights < rules.minNights) {
    errors.push(`Minimum stay is ${rules.minNights} nights`);
  }
  
  // Validate maximum nights
  if (nights > rules.maxNights) {
    errors.push(`Maximum stay is ${rules.maxNights} consecutive nights`);
  }
  
  // Validate advance booking
  if (!hasAdvanceNotice(checkInDate, rules.advanceBookingHours)) {
    errors.push(`Bookings must be made at least ${rules.advanceBookingHours} hours in advance`);
  }
  
  // Check for conflicting bookings
  const { hasConflict, conflictingDates } = hasConflictingBooking(
    checkInDate,
    checkOutDate,
    bookedDates
  );
  
  if (hasConflict) {
    errors.push(`Selected dates conflict with existing bookings: ${conflictingDates.join(', ')}`);
  }
  
  // Check peak periods
  if (rules.peakPeriodsBlocked && hasDateInPeakPeriod(checkInDate, checkOutDate, peakPeriods)) {
    errors.push('Owner bookings are not allowed during peak periods');
  }
  
  // Check annual day limit
  const daysRemaining = ownerAllowance.daysRemaining;
  if (nights > daysRemaining) {
    errors.push(
      `Insufficient days remaining. You have ${daysRemaining} days left, but requested ${nights} nights`
    );
  }
  
  // Warnings
  if (daysRemaining - nights < 7) {
    warnings.push(`After this booking, you will have only ${daysRemaining - nights} days remaining`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    nightsRequested: nights,
    daysRemaining,
    conflictingDates: hasConflict ? conflictingDates : undefined,
  };
}

/**
 * Calculate next reset date for owner allowance
 */
export function calculateNextResetDate(resetDate: string = '01-01'): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [month, day] = resetDate.split('-').map(Number);
  
  let nextReset = new Date(currentYear, month - 1, day);
  
  // If reset date has passed this year, use next year
  if (nextReset <= now) {
    nextReset = new Date(currentYear + 1, month - 1, day);
  }
  
  return nextReset.toISOString().split('T')[0];
}

/**
 * Calculate last reset date for owner allowance
 */
export function calculateLastResetDate(resetDate: string = '01-01'): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [month, day] = resetDate.split('-').map(Number);
  
  let lastReset = new Date(currentYear, month - 1, day);
  
  // If reset date hasn't occurred yet this year, use last year
  if (lastReset > now) {
    lastReset = new Date(currentYear - 1, month - 1, day);
  }
  
  return lastReset.toISOString().split('T')[0];
}

/**
 * Check if allowance needs to be reset
 */
export function shouldResetAllowance(lastResetDate: string, resetDate: string = '01-01'): boolean {
  const lastReset = new Date(lastResetDate);
  const calculatedLastReset = new Date(calculateLastResetDate(resetDate));
  
  return calculatedLastReset > lastReset;
}

/**
 * Get all dates in a booking range
 */
export function getBookingDates(checkInDate: string, checkOutDate: string): string[] {
  const dates: string[] = [];
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  const currentDate = new Date(checkIn);
  while (currentDate < checkOut) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

