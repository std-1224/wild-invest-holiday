import React from "react";

export interface PaymentsPageProps {
  children: React.ReactNode;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ children }) => {
  return <div className="payments-page">{children}</div>;
};

