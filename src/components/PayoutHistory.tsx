import React, { useState } from "react";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

export interface Payout {
  id: string;
  date: string;
  amount: number;
  status: "pending" | "approved" | "denied" | "processing" | "completed";
  bankDetails: {
    accountName: string;
    bsb: string;
    accountNumber: string;
  };
  denialReason?: string;
  completedDate?: string;
}

interface PayoutHistoryProps {
  payouts: Payout[];
  onRequestPayout: () => void;
  availableBalance: number;
}

export const PayoutHistory = ({
  payouts,
  onRequestPayout,
  availableBalance,
}: PayoutHistoryProps) => {
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "denied" | "processing" | "completed"
  >("all");

  const filteredPayouts = payouts
    .filter((p) => filter === "all" || p.status === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusIcon = (status: Payout["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "processing":
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "denied":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Payout["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Payout["status"]) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "denied":
        return "Denied";
      default:
        return status;
    }
  };

  const totalPending = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCompleted = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-[#86dbdf]" />
          <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            PAYOUT HISTORY
          </h3>
        </div>
        <button
          onClick={onRequestPayout}
          className="px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#86dbdf] text-white"
        >
          Request Payout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#86dbdf]/10 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-[#86dbdf]">
            ${availableBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
          <p className="text-2xl font-bold text-yellow-600">
            ${totalPending.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Paid Out</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalCompleted.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "all",
          "pending",
          "approved",
          "processing",
          "completed",
          "denied",
        ].map((status) => (
          <button
            key={status}
            onClick={() =>
              setFilter(
                status as
                  | "all"
                  | "pending"
                  | "approved"
                  | "denied"
                  | "processing"
                  | "completed"
              )
            }
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              filter === status
                ? "bg-[#86dbdf] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payout List */}
      <div className="space-y-3">
        {filteredPayouts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium mb-2">No payout requests found</p>
            <p className="text-sm">
              {filter === "all"
                ? "Request your first payout to get started"
                : `No ${filter} payouts`}
            </p>
          </div>
        ) : (
          filteredPayouts.map((payout) => (
            <div
              key={payout.id}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#86dbdf] transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(payout.status)}
                    <div>
                      <h4 className="font-bold text-[#0e181f]">
                        Payout Request
                      </h4>
                      <p className="text-sm text-gray-600">
                        Requested on{" "}
                        {new Date(payout.date).toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="ml-8 text-sm text-gray-600 mb-2">
                    <p>
                      <strong>Account:</strong> {payout.bankDetails.accountName}
                    </p>
                    <p>
                      <strong>BSB:</strong> {payout.bankDetails.bsb} |{" "}
                      <strong>Account:</strong> ••••
                      {payout.bankDetails.accountNumber.slice(-4)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="ml-8">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        payout.status
                      )}`}
                    >
                      {getStatusLabel(payout.status)}
                    </span>
                  </div>

                  {/* Completed Date */}
                  {payout.status === "completed" && payout.completedDate && (
                    <p className="ml-8 text-xs text-green-600 mt-2">
                      Completed on{" "}
                      {new Date(payout.completedDate).toLocaleDateString(
                        "en-AU",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}

                  {/* Denial Reason */}
                  {payout.status === "denied" && payout.denialReason && (
                    <div className="ml-8 mt-2 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs text-red-700">
                        <strong>Reason:</strong> {payout.denialReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#86dbdf]">
                    ${payout.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

