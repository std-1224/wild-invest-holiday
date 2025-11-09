import { useEffect, useState } from 'react';
import { colors } from '../config/mockCalculate';

interface XeroCallbackProps {
  setCurrentPage: (page: string) => void;
}

export function XeroCallback({ setCurrentPage }: XeroCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Xero...');
  const [tenantInfo, setTenantInfo] = useState<{
    name?: string;
    tenantId?: string;
  }>({});

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        const tenantId = urlParams.get('tenantId');
        const tenantName = urlParams.get('tenantName');

        if (error) {
          console.log('XeroCallback - Error detected:', error);
          setStatus('error');
          setMessage(errorDescription || `Authorization failed: ${error}`);
          return;
        }

        if (success === 'true') {
          // Backend successfully exchanged tokens and redirected here
          setStatus('success');
          setMessage('Successfully connected to Xero!');
          setTenantInfo({
            name: tenantName || undefined,
            tenantId: tenantId || undefined,
          });

          // Store connection status in localStorage
          localStorage.setItem('xeroConnected', 'true');
          localStorage.setItem('xeroTenantId', tenantId || '');
          localStorage.setItem('xeroTenantName', tenantName || '');
          localStorage.setItem('xeroConnectedAt', new Date().toISOString());
          // Dispatch custom event to notify other components
          window.dispatchEvent(new Event('xeroConnectionChanged'));

          // Redirect to investor portal after 3 seconds
          setTimeout(() => {
            setCurrentPage('investor-portal');
          }, 3000);
        } else {
          // This shouldn't happen - backend should redirect with success=true
          setStatus('error');
          setMessage('Invalid callback parameters');
        }

      } catch (err) {
        console.error('Xero callback error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to connect to Xero');
      }
    };

    handleCallback();
  }, [setCurrentPage]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.lightGray }}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.darkBlue }}>
            Xero Connection
          </h1>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{ borderColor: colors.orange }}></div>
          )}
          {status === 'success' && (
            <div className="rounded-full h-16 w-16 flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-full h-16 w-16 flex items-center justify-center" style={{ backgroundColor: '#EF4444' }}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-lg mb-4" style={{ color: colors.darkBlue }}>
            {message}
          </p>

          {status === 'success' && tenantInfo.name && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 mb-2">
                <strong>Organization:</strong> {tenantInfo.name}
              </p>
              {tenantInfo.tenantId && (
                <p className="text-xs text-green-600">
                  Tenant ID: {tenantInfo.tenantId}
                </p>
              )}
            </div>
          )}

          {status === 'success' && (
            <p className="text-sm text-gray-600">
              Redirecting to Investor Portal in 3 seconds...
            </p>
          )}

          {status === 'error' && (
            <button
              onClick={() => setCurrentPage('investor-portal')}
              className="mt-4 px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.orange }}
            >
              Return to Portal
            </button>
          )}
        </div>

        {/* Loading Details */}
        {status === 'loading' && (
          <div className="text-center text-sm text-gray-600">
            <p>Please wait while we complete the connection...</p>
          </div>
        )}
      </div>
    </div>
  );
}

