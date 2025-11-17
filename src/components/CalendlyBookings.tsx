import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, X, ExternalLink, RefreshCw, CheckCircle } from "lucide-react";
import apiClient from "../api/client";

interface CalendlyBooking {
  _id: string;
  eventType: string;
  eventTypeName: string;
  inviteeName: string;
  inviteeEmail: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  timezone: string;
  location: string;
  status: "scheduled" | "completed" | "canceled" | "no_show" | "rescheduled";
  canceledAt?: string;
  cancellationReason?: string;
  calendlyEventUri: string;
  createdAt: string;
}

export const CalendlyBookings = () => {
  const [bookings, setBookings] = useState<CalendlyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request("/api/calendly/bookings");
      if (response.success) {
        setBookings(response.bookings || []);
      } else {
        setError("Failed to load bookings");
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? This will cancel it in both Calendly and our system.")) {
      return;
    }

    try {
      const response = await apiClient.request(`/api/calendly/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.success) {
        if (response.calendlyCanceled) {
          alert("Booking canceled successfully in both Calendly and our system!");
        } else {
          alert("Booking canceled in our system. " + (response.calendlyError || "Calendly cancellation may have failed."));
        }
        fetchBookings();
      } else {
        alert("Failed to cancel booking");
      }
    } catch (err: any) {
      console.error("Error canceling booking:", err);
      alert(err.message || "Failed to cancel booking");
    }
  };

  const handleSyncBookings = async () => {
    setSyncing(true);
    setSyncMessage("");

    try {
      const response = await apiClient.request("/api/calendly/bookings/sync", {
        method: "POST",
      });

      if (response.success) {
        setSyncMessage(`✅ Synced ${response.totalProcessed} bookings (${response.syncedCount} new, ${response.updatedCount} updated)`);
        fetchBookings();

        // Clear message after 5 seconds
        setTimeout(() => setSyncMessage(""), 5000);
      } else {
        setSyncMessage("❌ Failed to sync bookings");
      }
    } catch (err: any) {
      console.error("Error syncing bookings:", err);
      setSyncMessage("❌ " + (err.message || "Failed to sync bookings"));
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      inspection: "Property Inspection",
      owner_consultation: "Owner Consultation",
      general_inquiry: "General Inquiry",
    };
    return labels[eventType] || eventType;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      canceled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
      rescheduled: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.scheduledStartTime);

    if (filter === "upcoming") {
      return booking.status === "scheduled" && bookingDate >= now;
    } else if (filter === "past") {
      return bookingDate < now || booking.status !== "scheduled";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffcf00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Button and Message */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSyncBookings}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-[#86dbdf] text-white rounded-lg hover:bg-[#0e181f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync with Calendly"}
        </button>
        {syncMessage && (
          <div className="flex items-center gap-2 text-sm font-semibold">
            {syncMessage.startsWith("✅") ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : null}
            <span className={syncMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}>
              {syncMessage}
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 font-semibold transition-colors ${
            filter === "upcoming"
              ? "border-b-2 border-[#ffcf00] text-[#0e181f]"
              : "text-gray-500 hover:text-[#0e181f]"
          }`}
        >
          Upcoming ({bookings.filter(b => b.status === "scheduled" && new Date(b.scheduledStartTime) >= new Date()).length})
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 font-semibold transition-colors ${
            filter === "past"
              ? "border-b-2 border-[#ffcf00] text-[#0e181f]"
              : "text-gray-500 hover:text-[#0e181f]"
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-semibold transition-colors ${
            filter === "all"
              ? "border-b-2 border-[#ffcf00] text-[#0e181f]"
              : "text-gray-500 hover:text-[#0e181f]"
          }`}
        >
          All ({bookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No bookings found</p>
          <p className="text-gray-500 text-sm mt-2">
            {filter === "upcoming" ? "You don't have any upcoming meetings scheduled." : "No bookings to display."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white border-2 border-[#86dbdf] rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-[#0e181f]">
                      {booking.eventTypeName || getEventTypeLabel(booking.eventType)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {getEventTypeLabel(booking.eventType)}
                  </p>
                </div>

                {booking.status === "scheduled" && new Date(booking.scheduledStartTime) >= new Date() && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="text-red-600 hover:text-red-800 transition-colors p-2"
                    title="Cancel booking"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-[#86dbdf]" />
                  <span className="font-semibold">
                    {formatDate(booking.scheduledStartTime)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-[#86dbdf]" />
                  <span>
                    {formatTime(booking.scheduledStartTime)} - {formatTime(booking.scheduledEndTime)}
                    <span className="text-gray-500 text-sm ml-2">({booking.timezone})</span>
                  </span>
                </div>

                {booking.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-[#86dbdf]" />
                    <span className="text-sm">{booking.location}</span>
                  </div>
                )}

                {booking.status === "canceled" && booking.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Cancellation reason:</strong> {booking.cancellationReason}
                    </p>
                  </div>
                )}
              </div>

              {booking.calendlyEventUri && booking.status === "scheduled" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={booking.calendlyEventUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#86dbdf] hover:text-[#0e181f] transition-colors text-sm font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View in Calendly
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

