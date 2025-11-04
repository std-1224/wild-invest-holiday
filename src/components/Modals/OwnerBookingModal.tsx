import { useState } from "react";
import { Calendar, AlertCircle, X } from "lucide-react";

interface OwnerBookingModalProps {
  cabinId: number;
  cabinType: string;
  cabinName: string;
  onClose: () => void;
  onConfirm: (booking: {
    startDate: string;
    endDate: string;
    guests: number;
    specialRequests: string;
  }) => void;
  ownerDaysRemaining: number;
}

export const OwnerBookingModal = ({
  cabinId,
  cabinType,
  cabinName,
  onClose,
  onConfirm,
  ownerDaysRemaining,
}: OwnerBookingModalProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const validateBooking = () => {
    const newErrors: string[] = [];
    const nights = calculateNights();

    if (!startDate || !endDate) {
      newErrors.push("Please select check-in and check-out dates");
    }

    if (nights < 2) {
      newErrors.push("Minimum 2-night stay required");
    }

    if (nights > 14) {
      newErrors.push("Maximum 14 consecutive nights allowed");
    }

    if (nights > ownerDaysRemaining) {
      newErrors.push(
        `Insufficient days remaining (${ownerDaysRemaining} days available)`
      );
    }

    // Check if dates are in peak period (simplified - would need actual peak dates)
    const start = new Date(startDate);
    const month = start.getMonth();
    if (month === 11 || month === 0) {
      newErrors.push(
        "Peak periods (December-January) are blocked for owner bookings"
      );
    }

    // Check if start date is at least 48 hours from now
    const now = new Date();
    const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    if (start < minDate) {
      newErrors.push("Bookings must be made at least 48 hours in advance");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateBooking()) {
      onConfirm({
        startDate,
        endDate,
        guests,
        specialRequests,
      });
    }
  };

  const nights = calculateNights();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#ffcf00]" />
            <div>
              <h2 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                CREATE OWNER BOOKING
              </h2>
              <p className="text-sm text-gray-600">{cabinName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Owner Days Remaining */}
          <div className="mb-6 p-4 bg-[#ffcf00]/[0.1] rounded-lg border-2 border-[#ffcf00]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0e181f]">
                Owner Days Remaining
              </span>
              <span className="text-2xl font-black text-[#ffcf00]">
                {ownerDaysRemaining}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Annual allowance resets January 1
            </p>
          </div>

          {/* Booking Restrictions */}
          <div className="mb-6 p-4 bg-[#86dbdf]/[0.1] rounded-lg border border-[#86dbdf]">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-[#86dbdf] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#0e181f] mb-2">
                  Booking Restrictions
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Minimum 2-night stay required</li>
                  <li>• Maximum 14 consecutive nights</li>
                  <li>
                    • Peak periods (December-January, Easter, School holidays)
                    are blocked
                  </li>
                  <li>• Bookings must be made at least 48 hours in advance</li>
                  <li>• 48-hour cancellation policy applies</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={
                    new Date(Date.now() + 48 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg focus:outline-none focus:border-[#ffcf00]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={
                    startDate ||
                    new Date(Date.now() + 48 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg focus:outline-none focus:border-[#ffcf00]"
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                Number of Guests
              </label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                min={1}
                max={cabinType === "1BR" ? 2 : cabinType === "2BR" ? 4 : 6}
                className="w-full p-3 border-2 border-[#86dbdf] rounded-lg focus:outline-none focus:border-[#ffcf00]"
              />
              <p className="text-xs text-gray-600 mt-1">
                Maximum capacity:{" "}
                {cabinType === "1BR" ? 2 : cabinType === "2BR" ? 4 : 6} guests
              </p>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder="Any special requirements or requests..."
                className="w-full p-3 border-2 border-[#86dbdf] rounded-lg focus:outline-none focus:border-[#ffcf00] resize-none"
              />
            </div>

            {/* Booking Summary */}
            {startDate && endDate && nights > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-[#0e181f] mb-3">
                  Booking Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold">
                      {new Date(startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold">
                      {new Date(endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-semibold">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-semibold">{guests}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600">Days from allowance:</span>
                    <span className="font-bold text-[#ffcf00]">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Remaining after booking:
                    </span>
                    <span className="font-bold">
                      {ownerDaysRemaining - nights}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-600 mb-1">
                      Cannot Create Booking
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-[#ffcf00] text-[#0e181f] rounded-lg font-bold hover:opacity-90 transition-all"
          >
            Create Owner Booking
          </button>
        </div>
      </div>
    </div>
  );
};
