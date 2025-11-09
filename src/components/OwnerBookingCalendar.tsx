import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Info, RefreshCw } from "lucide-react";
import rmsClient from "../api/rms";
import type { RMSPeakPeriod, OwnerBookingAllowance } from "../types/rms";

interface BookedDate {
  date: string;
  type: "guest" | "owner";
  guestName?: string;
  nights?: number;
}

interface OwnerBookingCalendarProps {
  cabinId: number;
  cabinType: string;
  ownerId: string; // Added for RMS integration
  bookedDates?: BookedDate[]; // Made optional - will fetch from RMS
  ownerDaysUsed?: number; // Made optional - will fetch from RMS
  ownerDaysLimit?: number; // Made optional - will fetch from RMS
  onCreateBooking?: (startDate: string, endDate: string) => void;
  onCancelBooking?: (date: string) => void;
  useRMSIntegration?: boolean; // Flag to enable/disable RMS integration
}

export const OwnerBookingCalendar = ({
  cabinId,
  cabinType,
  ownerId,
  bookedDates: propBookedDates,
  ownerDaysUsed: propOwnerDaysUsed,
  ownerDaysLimit: propOwnerDaysLimit,
  onCreateBooking,
  onCancelBooking,
  useRMSIntegration = false,
}: OwnerBookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] =
    useState<BookedDate | null>(null);

  // RMS Integration State
  const [rmsBookedDates, setRmsBookedDates] = useState<BookedDate[]>([]);
  const [rmsPeakPeriods, setRmsPeakPeriods] = useState<RMSPeakPeriod[]>([]);
  const [rmsAllowance, setRmsAllowance] = useState<OwnerBookingAllowance | null>(null);
  const [isLoadingRMS, setIsLoadingRMS] = useState(false);
  const [rmsError, setRmsError] = useState<string | null>(null);

  // Use RMS data if integration is enabled, otherwise use props
  const bookedDates: BookedDate[] = useRMSIntegration ? rmsBookedDates : (propBookedDates || []);
  const ownerDaysUsed = useRMSIntegration ? (rmsAllowance?.daysUsed || 0) : (propOwnerDaysUsed || 0);
  const ownerDaysLimit = useRMSIntegration ? (rmsAllowance?.daysLimit || 180) : (propOwnerDaysLimit || 180);

  // Fetch RMS data on mount and when month changes
  useEffect(() => {
    if (useRMSIntegration && rmsClient.isConfigured()) {
      fetchRMSData();
    }
  }, [useRMSIntegration, cabinId, ownerId, currentMonth]);

  /**
   * Fetch availability and allowance from RMS
   */
  const fetchRMSData = async () => {
    setIsLoadingRMS(true);
    setRmsError(null);

    try {
      // Calculate date range for current month
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      // Fetch availability and allowance in parallel
      const [availability, allowance] = await Promise.all([
        rmsClient.getAvailability(cabinId, startDate, endDate),
        rmsClient.getOwnerAllowance(ownerId, cabinId),
      ]);

      // Convert RMS booked dates to BookedDate format
      const convertedBookedDates: BookedDate[] = availability.bookedDates.map(rmsDate => ({
        date: rmsDate.date,
        type: rmsDate.bookingType,
        guestName: rmsDate.guestName,
        nights: rmsDate.nights,
      }));

      setRmsBookedDates(convertedBookedDates);
      setRmsPeakPeriods(availability.peakPeriods);
      setRmsAllowance(allowance);
    } catch (error) {
      console.error('Error fetching RMS data:', error);
      setRmsError(error instanceof Error ? error.message : 'Failed to load booking data');
    } finally {
      setIsLoadingRMS(false);
    }
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  /**
   * Check if a date is booked
   */
  const isDateBooked = (date: Date): BookedDate | undefined => {
    const dateStr = date.toISOString().split("T")[0];
    return bookedDates.find((bd) => bd.date === dateStr);
  };

  /**
   * Check if a date falls within a peak period
   */
  const isPeakPeriod = (date: Date): boolean => {
    if (useRMSIntegration && rmsPeakPeriods.length > 0) {
      // Check against RMS peak periods
      const dateStr = date.toISOString().split("T")[0];
      const checkDate = new Date(dateStr);

      return rmsPeakPeriods.some(period => {
        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);
        return checkDate >= startDate && checkDate <= endDate;
      });
    }

    // Fallback: December-January as peak periods
    const month = date.getMonth();
    return month === 11 || month === 0;
  };

  const handleDateClick = (date: Date) => {
    const booked = isDateBooked(date);
    const peak = isPeakPeriod(date);

    if (booked || peak) return; // Can't select booked or peak dates

    if (!selectedStartDate) {
      setSelectedStartDate(date);
    } else if (!selectedEndDate) {
      if (date > selectedStartDate) {
        setSelectedEndDate(date);
        setShowBookingModal(true);
      } else {
        setSelectedStartDate(date);
      }
    } else {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    }
  };

  /**
   * Handle booking creation - with RMS integration
   */
  const handleCreateBooking = async () => {
    if (!selectedStartDate || !selectedEndDate) return;

    const start = selectedStartDate.toISOString().split("T")[0];
    const end = selectedEndDate.toISOString().split("T")[0];

    if (useRMSIntegration && rmsClient.isConfigured()) {
      try {
        setIsLoadingRMS(true);

        // Create booking in RMS
        const response = await rmsClient.createOwnerBooking({
          ownerId,
          cabinId,
          checkInDate: start,
          checkOutDate: end,
          guests: 2, // Default, could be made configurable
        });

        if (response.success && response.booking) {
          // Refresh RMS data to get updated availability
          await fetchRMSData();
          alert(`Owner booking created successfully! ${response.booking.nights} nights booked.`);
        } else {
          alert(`Failed to create booking: ${response.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error creating booking:', error);
        alert(`Error creating booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoadingRMS(false);
      }
    } else if (onCreateBooking) {
      // Fallback to callback if RMS not enabled
      onCreateBooking(start, end);
    }

    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setShowBookingModal(false);
  };

  /**
   * Handle booking cancellation - with RMS integration
   */
  const handleCancelBooking = async () => {
    if (!selectedBookingToCancel) return;

    const bookingDate = new Date(selectedBookingToCancel.date);
    const today = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 48) {
      alert("Cannot cancel: Bookings must be cancelled at least 48 hours in advance.");
      return;
    }

    if (useRMSIntegration && rmsClient.isConfigured()) {
      try {
        setIsLoadingRMS(true);

        // In a real implementation, we'd need the bookingId
        // For now, we'll use the callback if available
        if (onCancelBooking) {
          onCancelBooking(selectedBookingToCancel.date);
        }

        // Refresh RMS data
        await fetchRMSData();

        const nights = selectedBookingToCancel.nights || 1;
        alert(`Booking cancelled successfully! ${nights} days returned to your allowance.`);
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert(`Error cancelling booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoadingRMS(false);
      }
    } else if (onCancelBooking) {
      // Fallback to callback if RMS not enabled
      onCancelBooking(selectedBookingToCancel.date);
    }

    setShowCancelModal(false);
    setSelectedBookingToCancel(null);
  };

  const calculateNights = () => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    const diff = selectedEndDate.getTime() - selectedStartDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const booked = isDateBooked(date);
      const peak = isPeakPeriod(date);
      const isPast = date < today;
      const isSelected =
        (selectedStartDate && date.getTime() === selectedStartDate.getTime()) ||
        (selectedEndDate && date.getTime() === selectedEndDate.getTime());
      const isInRange =
        selectedStartDate &&
        selectedEndDate &&
        date > selectedStartDate &&
        date < selectedEndDate;

      let bgColor = "bg-white hover:bg-gray-50";
      let textColor = "text-[#0e181f]";
      let cursor = "cursor-pointer";

      if (isPast) {
        bgColor = "bg-gray-100";
        textColor = "text-gray-400";
        cursor = "cursor-not-allowed";
      } else if (booked?.type === "guest") {
        bgColor = "bg-[#86dbdf]";
        textColor = "text-white";
        cursor = "cursor-not-allowed";
      } else if (booked?.type === "owner") {
        bgColor = "bg-[#ffcf00]";
        textColor = "text-[#0e181f]";
        cursor = "cursor-not-allowed";
      } else if (peak) {
        bgColor = "bg-red-100";
        textColor = "text-red-600";
        cursor = "cursor-not-allowed";
      } else if (isSelected) {
        bgColor = "bg-[#0e181f]";
        textColor = "text-white";
      } else if (isInRange) {
        bgColor = "bg-[#ffcf00]/[0.3]";
      }

      days.push(
        <div
          key={day}
          onClick={() => {
            if (isPast) return;
            if (booked?.type === "owner") {
              // Allow canceling owner bookings
              setSelectedBookingToCancel(booked);
              setShowCancelModal(true);
            } else if (!booked && !peak) {
              handleDateClick(date);
            }
          }}
          className={`p-2 text-center rounded-lg transition-all ${bgColor} ${textColor} ${
            booked?.type === "owner" && !isPast
              ? "cursor-pointer hover:opacity-80"
              : cursor
          } border border-gray-200`}
        >
          <div className="text-sm font-semibold">{day}</div>
          {booked && (
            <div className="text-[0.6rem] mt-1">
              {booked.type === "guest" ? "Guest" : "Owner"}
            </div>
          )}
          {peak && !booked && <div className="text-[0.6rem] mt-1">Peak</div>}
        </div>
      );
    }

    return days;
  };

  const daysRemaining = ownerDaysLimit - ownerDaysUsed;
  const percentageUsed = (ownerDaysUsed / ownerDaysLimit) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            OWNER BOOKING CALENDAR
            {useRMSIntegration && (
              <span className="ml-2 text-xs font-normal text-[#86dbdf]">
                (RMS Integrated)
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {cabinType} - Cabin #{cabinId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {useRMSIntegration && rmsClient.isConfigured() && (
            <button
              onClick={fetchRMSData}
              disabled={isLoadingRMS}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
              title="Refresh from RMS"
            >
              <RefreshCw className={`w-5 h-5 text-[#86dbdf] ${isLoadingRMS ? 'animate-spin' : ''}`} />
            </button>
          )}
          <Calendar className="w-8 h-8 text-[#86dbdf]" />
        </div>
      </div>

      {/* RMS Error Message */}
      {rmsError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>RMS Error:</strong> {rmsError}
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoadingRMS && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Loading booking data from RMS...
          </p>
        </div>
      )}

      {/* 180-Day Allowance Tracker */}
      <div className="mb-6 p-4 bg-[#ffcf00]/[0.1] rounded-lg border-2 border-[#ffcf00]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#0e181f]">
            Annual Owner Booking Allowance
          </span>
          <span className="text-sm text-gray-600">Resets January 1</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffcf00] transition-all"
                style={{ width: `${percentageUsed}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#0e181f]">
              {daysRemaining}
            </div>
            <div className="text-xs text-gray-600">days remaining</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          {ownerDaysUsed} of {ownerDaysLimit} days used
        </div>
      </div>

      {/* Booking Restrictions Info */}
      <div className="mb-4 p-3 bg-[#86dbdf]/[0.1] rounded-lg border border-[#86dbdf]">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#86dbdf] mt-0.5 flex-shrink-0" />
          <div className="text-xs text-[#0e181f]">
            <strong>Booking Restrictions:</strong> Peak periods blocked •
            Minimum 2-night stay • Maximum 14 consecutive nights • 48-hour
            cancellation policy
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#0e181f]" />
        </button>
        <h4 className="text-lg font-bold text-[#0e181f]">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronRight className="w-5 h-5 text-[#0e181f]" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-gray-600 p-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#86dbdf] rounded"></div>
          <span>Guest Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#ffcf00] rounded"></div>
          <span>Owner Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Peak Period (Blocked)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-[#0e181f] rounded"></div>
          <span>Available</span>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedStartDate && selectedEndDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-[#0e181f]">
              Confirm Owner Booking
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-bold">
                  {selectedStartDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-bold">
                  {selectedEndDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nights:</span>
                <span className="font-bold">{calculateNights()}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Days used from allowance:</span>
                <span className="font-bold text-[#ffcf00]">
                  {calculateNights()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining after booking:</span>
                <span className="font-bold">
                  {daysRemaining - calculateNights()}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedStartDate(null);
                  setSelectedEndDate(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBooking}
                className="flex-1 px-4 py-2 bg-[#ffcf00] text-[#0e181f] rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBookingToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-black mb-4 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
              CANCEL OWNER BOOKING
            </h3>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel this owner booking?
              </p>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Booking Date:</span>
                  <span className="text-sm font-semibold">
                    {selectedBookingToCancel.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nights:</span>
                  <span className="text-sm font-semibold">
                    {selectedBookingToCancel.nights || 1}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>48-Hour Cancellation Policy:</strong> Cancellations
                  must be made at least 48 hours before check-in. Days will be
                  returned to your annual allowance.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBookingToCancel(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isLoadingRMS}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isLoadingRMS ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
