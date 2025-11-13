import React from "react";

export interface OverviewPageProps {
  children: React.ReactNode;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ children }) => {
  return <div className="overview-page">{children}</div>;
};

