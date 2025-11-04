import { useState } from "react";
import {
  TrendingUp,
  Pause,
  XCircle,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

interface MarketingBoostManagerProps {
  isActive: boolean;
  monthlyFee: number;
  nextBillingDate: string;
  billingHistory: BillingRecord[];
  onPause: () => void;
  onCancel: () => void;
  onResume: () => void;
}

export const MarketingBoostManager = ({
  isActive,
  monthlyFee,
  nextBillingDate,
  billingHistory,
  onPause,
  onCancel,
  onResume,
}: MarketingBoostManagerProps) => {
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const totalPaid = billingHistory
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  const PauseModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Pause className="w-6 h-6 text-[#ffcf00]" />
          <h3 className="text-xl font-bold text-[#0e181f]">
            Pause Marketing Boost?
          </h3>
        </div>
        <p className="text-gray-700 mb-4">
          Pausing your Marketing Boost subscription will:
        </p>
        <ul className="text-sm text-gray-700 space-y-2 mb-6">
          <li>• Stop all premium marketing activities</li>
          <li>• Remove your cabin from featured listings</li>
          <li>• Pause monthly billing</li>
          <li>• You can resume anytime</li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPauseModal(false)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onPause();
              setShowPauseModal(false);
            }}
            className="flex-1 px-4 py-2 bg-[#ffcf00] text-[#0e181f] rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Pause Subscription
          </button>
        </div>
      </div>
    </div>
  );

  const CancelModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-bold text-[#0e181f]">
            Cancel Marketing Boost?
          </h3>
        </div>
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-700 font-semibold mb-2">
            ⚠️ This action cannot be undone
          </p>
          <p className="text-sm text-gray-700">
            Cancelling will permanently remove all Marketing Boost benefits.
            You'll need to resubscribe to regain access.
          </p>
        </div>
        <p className="text-gray-700 mb-4">You will lose:</p>
        <ul className="text-sm text-gray-700 space-y-2 mb-6">
          <li>• Premium listing placement</li>
          <li>• Social media promotion</li>
          <li>• Featured cabin status</li>
          <li>• Priority customer support</li>
          <li>• Advanced analytics</li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCancelModal(false)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Keep Subscription
          </button>
          <button
            onClick={() => {
              onCancel();
              setShowCancelModal(false);
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-[#86dbdf]" />
          <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            MARKETING BOOST
          </h3>
        </div>
        <div
          className={`px-3 py-1 rounded-lg font-semibold ${
            isActive
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isActive ? "ACTIVE" : "PAUSED"}
        </div>
      </div>

      {/* Subscription Status */}
      <div
        className={`p-6 rounded-lg border-2 mb-6 ${
          isActive
            ? "border-[#ffcf00] bg-[#ffcf00]/[0.05]"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Monthly Fee</div>
            <div className="text-2xl font-bold text-[#0e181f]">
              ${monthlyFee.toLocaleString()}/mo
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Next Billing Date</div>
            <div className="text-lg font-semibold text-[#0e181f]">
              {new Date(nextBillingDate).toLocaleDateString("en-AU", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-green-600">
              ${totalPaid.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <h4 className="font-bold text-[#0e181f] mb-3">Active Benefits:</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "Premium listing placement",
            "Social media promotion",
            "Featured cabin status",
            "Priority customer support",
            "Advanced analytics dashboard",
            "Professional photography",
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle
                className={`w-5 h-5 ${
                  isActive ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm ${
                  isActive ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {benefit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        {isActive ? (
          <>
            <button
              onClick={() => setShowPauseModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#ffcf00] text-[#ffcf00] rounded-lg font-semibold hover:bg-[#ffcf00] hover:text-[#0e181f] transition-all"
            >
              <Pause className="w-5 h-5" />
              Pause Subscription
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all"
            >
              <XCircle className="w-5 h-5" />
              Cancel Subscription
            </button>
          </>
        ) : (
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ffcf00] text-[#0e181f] rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            Resume Subscription
          </button>
        )}
      </div>

      {/* Billing History */}
      <div>
        <h4 className="font-bold text-[#0e181f] mb-3">Billing History:</h4>
        <div className="space-y-2">
          {billingHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No billing history yet
            </p>
          ) : (
            billingHistory.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#86dbdf] transition-all"
              >
                <div className="flex items-center gap-3">
                  {record.status === "paid" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : record.status === "pending" ? (
                    <AlertCircle className="w-5 h-5 text-[#ffcf00]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-semibold text-[#0e181f]">
                      ${record.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(record.date).toLocaleDateString("en-AU")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      record.status === "paid"
                        ? "bg-green-100 text-green-600"
                        : record.status === "pending"
                        ? "bg-[#ffcf00]/[0.2] text-[#ffcf00]"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {record.status.toUpperCase()}
                  </span>
                  {record.invoiceUrl && record.status === "paid" && (
                    <button
                      onClick={() => window.open(record.invoiceUrl, "_blank")}
                      className="text-sm text-[#86dbdf] hover:text-[#0e181f] transition-all"
                    >
                      Invoice
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showPauseModal && <PauseModal />}
      {showCancelModal && <CancelModal />}
    </div>
  );
};
