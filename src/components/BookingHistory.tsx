import { useState } from "react";
import { Calendar, DollarSign, TrendingUp, Users, Filter } from "lucide-react";

interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  revenue: number;
  nightlyRate: number;
  status: "completed" | "upcoming" | "cancelled";
  bookingDate: string;
}

interface BookingHistoryProps {
  bookings: Booking[];
  cabinType: string;
}

export const BookingHistory = ({
  bookings,
  cabinType,
}: BookingHistoryProps) => {
  const [filter, setFilter] = useState<
    "all" | "completed" | "upcoming" | "cancelled"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "revenue">("date");

  const filteredBookings = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
      } else {
        return b.revenue - a.revenue;
      }
    });

  // Calculate statistics
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.revenue, 0);
  const totalNights = completedBookings.reduce((sum, b) => sum + b.nights, 0);
  const averageNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
  const totalGuests = completedBookings.reduce((sum, b) => sum + b.guests, 0);

  // Calculate occupancy rate (simplified - would need actual available days)
  const daysInYear = 365;
  const occupancyRate = (totalNights / daysInYear) * 100;

  // Calculate actual ROI based on bookings
  const cabinPrices: any = {
    "1BR": 110000,
    "2BR": 135000,
    "3BR": 160000,
  };
  const cabinPrice = cabinPrices[cabinType] || 0;
  const actualROI = cabinPrice > 0 ? (totalRevenue / cabinPrice) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "upcoming":
        return "text-[#86dbdf] bg-[#86dbdf]/[0.1]";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-[#86dbdf]" />
          <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            BOOKING HISTORY & REVENUE
          </h3>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            From {completedBookings.length} bookings
          </div>
        </div>

        <div className="p-4 bg-[#ffcf00]/[0.1] border-2 border-[#ffcf00] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#ffcf00]" />
            <span className="text-sm text-gray-600">Actual ROI</span>
          </div>
          <div className="text-2xl font-bold text-[#ffcf00]">
            {actualROI.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Based on real bookings
          </div>
        </div>

        <div className="p-4 bg-[#86dbdf]/[0.1] border-2 border-[#86dbdf] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#86dbdf]" />
            <span className="text-sm text-gray-600">Occupancy Rate</span>
          </div>
          <div className="text-2xl font-bold text-[#86dbdf]">
            {occupancyRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {totalNights} nights booked
          </div>
        </div>

        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Avg Nightly Rate</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            ${averageNightlyRate.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Across all bookings</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-600">Filter:</span>
        </div>
        <div className="flex gap-2">
          {["all", "completed", "upcoming", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                filter === status
                  ? "bg-[#ffcf00] text-[#0e181f]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="revenue">Sort by Revenue</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-3 text-sm font-bold text-gray-600">
                Guest
              </th>
              <th className="text-left p-3 text-sm font-bold text-gray-600">
                Check-in
              </th>
              <th className="text-left p-3 text-sm font-bold text-gray-600">
                Check-out
              </th>
              <th className="text-center p-3 text-sm font-bold text-gray-600">
                Nights
              </th>
              <th className="text-center p-3 text-sm font-bold text-gray-600">
                Guests
              </th>
              <th className="text-right p-3 text-sm font-bold text-gray-600">
                Nightly Rate
              </th>
              <th className="text-right p-3 text-sm font-bold text-gray-600">
                Revenue
              </th>
              <th className="text-center p-3 text-sm font-bold text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No bookings found</p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="p-3">
                    <div className="font-semibold text-[#0e181f]">
                      {booking.guestName}
                    </div>
                    <div className="text-xs text-gray-600">
                      Booked{" "}
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(booking.checkIn).toLocaleDateString("en-AU", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(booking.checkOut).toLocaleDateString("en-AU", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {booking.nights}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      {booking.guests}
                    </div>
                  </td>
                  <td className="p-3 text-right font-semibold">
                    ${booking.nightlyRate.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-bold text-green-600">
                    ${booking.revenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {completedBookings.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Bookings:</span>
              <span className="ml-2 font-bold">{completedBookings.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Nights:</span>
              <span className="ml-2 font-bold">{totalNights}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Guests:</span>
              <span className="ml-2 font-bold">{totalGuests}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Revenue:</span>
              <span className="ml-2 font-bold text-green-600">
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
