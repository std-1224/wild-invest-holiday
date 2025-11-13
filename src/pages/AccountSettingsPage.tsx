import React from "react";

export interface AccountSettingsPageProps {
  children: React.ReactNode;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ children }) => {
  return <div className="account-settings-page">{children}</div>;
};

