import React from "react";

export interface BookingRevenuePageProps {
  children: React.ReactNode;
}

export const BookingRevenuePage: React.FC<BookingRevenuePageProps> = ({ children }) => {
  return <div className="booking-revenue-page">{children}</div>;
};

