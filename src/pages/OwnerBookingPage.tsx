import React from "react";

export interface OwnerBookingPageProps {
  children: React.ReactNode;
}

export const OwnerBookingPage: React.FC<OwnerBookingPageProps> = ({ children }) => {
  return <div className="owner-booking-page">{children}</div>;
};

