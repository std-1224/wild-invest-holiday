import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface XeroInvoice {
  invoiceID: string;
  invoiceNumber: string;
  type: string;
  contact: {
    contactID: string;
    name: string;
  };
  date: string;
  dueDate: string;
  status: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    lineAmount: number;
    accountCode: string;
  }>;
  subTotal: number;
  totalTax: number;
  total: number;
  amountDue: number;
  amountPaid: number;
  currencyCode: string;
  reference?: string;
}

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

interface XeroInvoicesProps {
  customerId: string; // Stripe customer ID
  xeroContactId: string; // Xero contact ID
  paymentMethods: PaymentMethod[];
}

export const XeroInvoices: React.FC<XeroInvoicesProps> = ({
  customerId,
  xeroContactId,
  paymentMethods,
}) => {
  const [invoices, setInvoices] = useState<XeroInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Set default payment method
  useEffect(() => {
    const defaultMethod = paymentMethods.find((pm) => pm.isDefault);
    if (defaultMethod) {
      setSelectedPaymentMethod(defaultMethod.id);
    } else if (paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods]);

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, [xeroContactId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/xero/get-invoices?contactId=${xeroContactId}&customerId=${customerId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoice: XeroInvoice) => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!confirm(`Pay $${invoice.amountDue.toFixed(2)} ${invoice.currencyCode} for invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      setPayingInvoiceId(invoice.invoiceID);

      const response = await fetch(`${API_URL}/api/xero/pay-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.invoiceID,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amountDue,
          currency: invoice.currencyCode,
          customerId: customerId,
          paymentMethodId: selectedPaymentMethod,
          xeroContactId: xeroContactId,
          description: `Payment for ${invoice.invoiceNumber} - ${invoice.lineItems[0]?.description || 'Invoice'}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }

      const data = await response.json();
      
      alert(`✅ Payment successful!\n\nStripe Payment ID: ${data.paymentIntent.id}\nXero Payment ID: ${data.xeroPayment.paymentID}`);

      // Refresh invoices
      await fetchInvoices();
    } catch (err: any) {
      console.error('Error paying invoice:', err);
      alert(`❌ Payment failed: ${err.message}`);
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'text-green-600 bg-green-50';
      case 'AUTHORISED':
      case 'SUBMITTED':
        return 'text-orange-600 bg-orange-50';
      case 'VOIDED':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    let iconName = '';
    
    if (brandLower === 'visa') iconName = 'visa';
    else if (brandLower === 'mastercard') iconName = 'mastercard';
    else if (brandLower === 'amex' || brandLower === 'american express') iconName = 'amex';
    else if (brandLower === 'discover') iconName = 'discover';
    else if (brandLower === 'jcb') iconName = 'jcb';
    else if (brandLower === 'diners' || brandLower === 'diners club') iconName = 'diners';
    else if (brandLower === 'unionpay') iconName = 'unionpay';
    
    if (iconName) {
      return (
        <img 
          src={`/card-icons/${iconName}.svg`} 
          alt={brand}
          className="w-8 h-6 object-contain"
        />
      );
    }
    
    return <CreditCard className="w-6 h-6 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-[#0e181f]">📄 Xero Invoices</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading invoices...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-[#0e181f]">📄 Xero Invoices</h3>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Error loading invoices</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchInvoices}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  console.log("invoices", invoices);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#0e181f]">📄 Xero Invoices</h3>
        <button
          onClick={fetchInvoices}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">No outstanding invoices</p>
          <p className="text-sm text-gray-500 mt-1">All invoices are paid!</p>
        </div>
      ) : (
        <>
          {/* Payment Method Selector */}
          {paymentMethods.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {getCardIcon(method.brand)}
                    <span className="text-sm font-medium">
                      •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices List */}
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.invoiceID}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-bold text-[#0e181f]">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600">{invoice.reference}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>

                {/* Line Items */}
                <div className="mb-3 space-y-1">
                  {invoice.lineItems.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      • {item.description} - ${item.lineAmount.toFixed(2)}
                    </div>
                  ))}
                </div>

                {/* Dates and Amount */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Due: {formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Amount Due</p>
                      <p className="text-xl font-bold text-[#0e181f]">
                        ${invoice.amountDue.toFixed(2)} {invoice.currencyCode}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePayInvoice(invoice)}
                      disabled={payingInvoiceId === invoice.invoiceID || !selectedPaymentMethod}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      {payingInvoiceId === invoice.invoiceID ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

