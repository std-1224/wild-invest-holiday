import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

/**
 * XeroConnect Component
 * Provides a button to connect to Xero via OAuth
 * Now uses database-backed authentication
 */
export const XeroConnect: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const [isConnected, setIsConnected] = useState(false);
  const [tenantName, setTenantName] = useState<string>("");
  const [connectedAt, setConnectedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Check connection status from API
  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getXeroStatus();

      if (response.success && response.connected) {
        setIsConnected(true);
        setTenantName(response.tenantName || '');
        setConnectedAt(response.connectedAt || '');

        // Also update localStorage for backward compatibility
        localStorage.setItem('xeroConnected', 'true');
        localStorage.setItem('xeroTenantName', response.tenantName || '');
        localStorage.setItem('xeroTenantId', response.tenantId || '');
        localStorage.setItem('xeroConnectedAt', response.connectedAt || '');
      } else {
        setIsConnected(false);
        setTenantName('');
        setConnectedAt('');

        // Clear localStorage
        localStorage.removeItem('xeroConnected');
        localStorage.removeItem('xeroTenantName');
        localStorage.removeItem('xeroTenantId');
        localStorage.removeItem('xeroConnectedAt');
      }
    } catch (error) {
      console.error('Error checking Xero connection status:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Check connection status on mount and when window gains focus
  useEffect(() => {
    // Check on mount
    checkConnectionStatus();

    // Check when window gains focus (user returns from OAuth)
    window.addEventListener('focus', checkConnectionStatus);

    // Check for custom event from XeroCallback
    window.addEventListener('xeroConnectionChanged', checkConnectionStatus);

    return () => {
      window.removeEventListener('focus', checkConnectionStatus);
      window.removeEventListener('xeroConnectionChanged', checkConnectionStatus);
    };
  }, []);

  const handleConnectXero = () => {
    // Get current user from apiClient
    const user = apiClient.getUser();

    if (!user || !user.id) {
      alert('Please log in first to connect Xero');
      return;
    }

    // Redirect to Xero authorization endpoint with userId
    window.location.href = `${API_URL}/api/xero-auth?userId=${user.id}`;
  };

  const handleDisconnect = async () => {
    try {
      const response = await apiClient.disconnectXero();

      if (response.success) {
        // Clear connection status
        localStorage.removeItem('xeroConnected');
        localStorage.removeItem('xeroTenantId');
        localStorage.removeItem('xeroTenantName');
        localStorage.removeItem('xeroConnectedAt');

        setIsConnected(false);
        setTenantName('');
        setConnectedAt('');

        // Dispatch event to notify other components
        window.dispatchEvent(new Event('xeroConnectionChanged'));
      } else {
        alert('Failed to disconnect Xero');
      }
    } catch (error) {
      console.error('Error disconnecting Xero:', error);
      alert('Failed to disconnect Xero');
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If connected, show connected state
  if (isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
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
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Connected to Xero
              </h3>
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                {tenantName && (
                  <p className="text-sm text-green-800">
                    <strong>Organization:</strong> {tenantName}
                  </p>
                )}
                {connectedAt && (
                  <p className="text-xs text-green-600">
                    Connected on {formatDate(connectedAt)}
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Your Xero account is connected. You can now view and pay invoices directly from the Wild Things portal.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDisconnect}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                Disconnect
              </button>
              <button
                onClick={handleConnectXero}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                Reconnect
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Need to switch organizations? Reconnect to authorize a different Xero account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not connected - show connect button
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
