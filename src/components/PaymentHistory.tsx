import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import apiClient from "../api/client";

interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  method: string;
  invoiceUrl?: string;
  type: "deposit" | "payment" | "refund" | "fee";
  category?: "invoice" | "boost";
  metadata?: any;
}

interface PaymentHistoryProps {
  // Optional: can pass payments directly or fetch from API
  payments?: Payment[];
}

export const PaymentHistory = ({ payments: propPayments }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>(propPayments || []);
  const [loading, setLoading] = useState(!propPayments);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  // Fetch payment history from API if not provided via props
  useEffect(() => {
    if (!propPayments) {
      fetchPaymentHistory();
    }
  }, [propPayments]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPaymentHistory();
      setPayments(data.payments || []);
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments
    .filter((p) => filter === "all" || p.status === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-[#ffcf00]" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-[#ffcf00] bg-[#ffcf00]/[0.1]";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "completed" && p.type !== "refund")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-[#86dbdf]" />
            <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
              PAYMENT HISTORY
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading payment history...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-[#86dbdf]" />
            <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
              PAYMENT HISTORY
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Error loading payment history</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchPaymentHistory}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-[#86dbdf]" />
          <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            PAYMENT HISTORY
          </h3>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalPaid.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-[#ffcf00]/[0.1] border-2 border-[#ffcf00] rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-[#ffcf00]">
            ${totalPending.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-[#86dbdf]/[0.1] border-2 border-[#86dbdf] rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-[#0e181f]">
            {payments.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-600">Filter:</span>
        </div>
        <div className="flex gap-2">
          {["all", "completed", "pending", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                filter === status
                  ? "bg-[#ffcf00] text-[#0e181f]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No payments found</p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#86dbdf] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(payment.status)}
                    <div>
                      <h4 className="font-bold text-[#0e181f]">
                        {payment.description}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Method: {payment.method}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${
                      payment.type === "refund"
                        ? "text-green-600"
                        : "text-[#0e181f]"
                    }`}
                  >
                    {payment.type === "refund" ? "+" : "-"}$
                    {payment.amount.toLocaleString()}
                  </div>
                  {payment.invoiceUrl && payment.status === "completed" && (
                    <button
                      onClick={() => window.open(payment.invoiceUrl, "_blank")}
                      className="mt-2 flex items-center gap-1 text-sm text-[#86dbdf] hover:text-[#0e181f] transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (if needed) */}
      {filteredPayments.length > 10 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page 1 of 1</span>
          <button className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all">
            Next
          </button>
        </div>
      )}
    </div>
  );
};
