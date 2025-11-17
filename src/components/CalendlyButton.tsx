import { Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";

interface CalendlyButtonProps {
  url: string;
  text: string;
  variant?: "primary" | "secondary" | "outline" | "orange";
  size?: "sm" | "md" | "lg";
  className?: string;
  eventType?: "inspection" | "owner_consultation" | "general_inquiry";
  source?: "invest_page" | "investor_portal" | "holiday_homes" | "direct";
  onBookingComplete?: () => void;
}

export const CalendlyButton = ({
  url,
  text,
  variant = "primary",
  size = "md",
  className = "",
  eventType = "general_inquiry",
  source = "direct",
  onBookingComplete,
}: CalendlyButtonProps) => {
  const { currentUser } = useAuth();

  const openCalendly = async () => {
    // Track booking initiation
    try {
      await apiClient.request("/api/calendly/bookings/track", {
        method: "POST",
        body: JSON.stringify({
          eventType,
          source,
        }),
      });
    } catch (error) {
      console.error("Failed to track Calendly booking:", error);
    }

    // Prepare prefill data for logged-in users
    const prefill: any = {};
    if (currentUser) {
      prefill.name = currentUser.name || "";
      prefill.email = currentUser.email || "";
    }

    // Check if Calendly widget is loaded
    if (typeof window !== "undefined" && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url,
        prefill,
        utm: {
          utmSource: source,
          utmMedium: "website",
          utmCampaign: "wild_things_bookings",
        },
      });

      // Listen for Calendly events
      const handleCalendlyEvent = (e: MessageEvent) => {
        if (e.data.event === "calendly.event_scheduled") {
          console.log("✅ Calendly booking completed!");
          if (onBookingComplete) {
            onBookingComplete();
          }
        }
      };

      window.addEventListener("message", handleCalendlyEvent);

      // Cleanup listener after 5 minutes
      setTimeout(() => {
        window.removeEventListener("message", handleCalendlyEvent);
      }, 300000);
    } else {
      // Fallback to opening in new tab
      const urlWithParams = new URL(url);
      if (currentUser) {
        urlWithParams.searchParams.set("name", currentUser.name || "");
        urlWithParams.searchParams.set("email", currentUser.email || "");
      }
      window.open(urlWithParams.toString(), "_blank");
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-[#ffcf00] text-[#0e181f] hover:opacity-90";
      case "secondary":
        return "bg-[#86dbdf] text-white hover:opacity-90";
      case "outline":
        return "border-2 border-[#ffcf00] text-[#ffcf00] hover:bg-[#ffcf00] hover:text-[#0e181f]";
      case "orange":
        return "bg-[#ec874c] text-white hover:opacity-90";
      default:
        return "bg-[#ffcf00] text-[#0e181f] hover:opacity-90";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-sm";
      case "md":
        return "px-4 py-3 text-base";
      case "lg":
        return "px-6 py-4 text-lg";
      default:
        return "px-4 py-3 text-base";
    }
  };

  return (
    <button
      onClick={openCalendly}
      className={`flex items-center justify-center gap-2 rounded-lg font-bold transition-all ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      <Calendar
        className={`${
          size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
        }`}
      />
      {text}
    </button>
  );
};
