import { Calendar } from "lucide-react";

interface CalendlyButtonProps {
  url: string;
  text: string;
  variant?: "primary" | "secondary" | "outline" | "orange";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CalendlyButton = ({
  url,
  text,
  variant = "primary",
  size = "md",
  className = "",
}: CalendlyButtonProps) => {
  const openCalendly = () => {
    // Check if Calendly widget is loaded
    if (typeof window !== "undefined" && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({ url });
    } else {
      // Fallback to opening in new tab
      window.open(url, "_blank");
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
