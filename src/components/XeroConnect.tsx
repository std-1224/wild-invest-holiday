import React from "react";

/**
 * XeroConnect Component
 * Provides a button to connect to Xero via OAuth
 */
export const XeroConnect: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleConnectXero = () => {
    // Redirect to Xero authorization endpoint
    window.location.href = `${API_URL}/api/xero-auth`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        {/* Xero Logo */}
        <div className="flex-shrink-0">
          <img
            src={`/xero.png`}
            alt={"xero-logo"}
            className="w-12 h-8 object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect to Xero
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Xero account to view and pay invoices directly from the
            Wild Things portal. You'll be redirected to Xero to authorize the
            connection.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              ℹ️ What you'll need:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Access to your Xero account</li>
              <li>• Permission to authorize third-party apps</li>
              <li>• Your organization's Xero login credentials</li>
            </ul>
          </div>

          <button
            onClick={handleConnectXero}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
            Connect to Xero
          </button>

          <p className="text-xs text-gray-500 mt-3">
            By connecting, you authorize Wild Things to access your Xero
            invoices and payment data.
          </p>
        </div>
      </div>
    </div>
  );
};
