import React, { useState } from "react";
import { DollarSign, X } from "lucide-react";

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payoutData: PayoutData) => void;
  availableBalance: number;
}

export interface PayoutData {
  amount: number;
  bankDetails: {
    accountName: string;
    bsb: string;
    accountNumber: string;
  };
}

export const PayoutRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  availableBalance,
}: PayoutRequestModalProps) => {
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bsb, setBsb] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = "Please enter a valid amount";
    } else if (amountNum <= 0) {
      newErrors.amount = "Amount must be greater than $0";
    } else if (amountNum > availableBalance) {
      newErrors.amount = `Amount cannot exceed available balance ($${availableBalance.toLocaleString()})`;
    }

    // Validate account name
    if (!accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    // Validate BSB
    const bsbClean = bsb.replace(/[^0-9]/g, "");
    if (!bsbClean || bsbClean.length !== 6) {
      newErrors.bsb = "BSB must be 6 digits";
    }

    // Validate account number
    const accountClean = accountNumber.replace(/[^0-9]/g, "");
    if (!accountClean || accountClean.length < 6 || accountClean.length > 10) {
      newErrors.accountNumber = "Account number must be 6-10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payoutData: PayoutData = {
      amount: parseFloat(amount),
      bankDetails: {
        accountName: accountName.trim(),
        bsb: bsb.replace(/[^0-9]/g, ""),
        accountNumber: accountNumber.replace(/[^0-9]/g, ""),
      },
    };

    onSubmit(payoutData);
    handleClose();
  };

  const handleClose = () => {
    setAmount("");
    setAccountName("");
    setBsb("");
    setAccountNumber("");
    setErrors({});
    onClose();
  };

  const formatBSB = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-[#86dbdf] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-[#86dbdf]" />
            <h2 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
              REQUEST PAYOUT
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#0e181f] hover:text-[#86dbdf] transition-all"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Available Balance */}
          <div className="bg-[#86dbdf]/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-[#86dbdf]">
              ${availableBalance.toLocaleString()}
            </p>
          </div>

          {/* Payout Amount */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-[#0e181f]">
              Payout Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf] ${
                  errors.amount ? "border-red-500" : "border-[#86dbdf]"
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Bank Details Section */}
          <div className="border-t-2 border-gray-200 pt-4 mb-4">
            <h3 className="text-lg font-bold mb-4 text-[#0e181f]">
              Bank Account Details
            </h3>

            {/* Account Name */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                Account Name *
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf] ${
                  errors.accountName ? "border-red-500" : "border-[#86dbdf]"
                }`}
                placeholder="John Doe"
              />
              {errors.accountName && (
                <p className="text-red-500 text-xs mt-1">{errors.accountName}</p>
              )}
            </div>

            {/* BSB */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                BSB *
              </label>
              <input
                type="text"
                value={bsb}
                onChange={(e) => setBsb(formatBSB(e.target.value))}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf] ${
                  errors.bsb ? "border-red-500" : "border-[#86dbdf]"
                }`}
                placeholder="123-456"
                maxLength={7}
              />
              {errors.bsb && (
                <p className="text-red-500 text-xs mt-1">{errors.bsb}</p>
              )}
            </div>

            {/* Account Number */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                Account Number *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
                }
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf] ${
                  errors.accountNumber ? "border-red-500" : "border-[#86dbdf]"
                }`}
                placeholder="12345678"
                maxLength={10}
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accountNumber}
                </p>
              )}
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Processing Time:</strong> Payout requests are typically
              processed within 3-5 business days. You'll receive an email
              confirmation once your request is approved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-lg font-bold transition-all hover:opacity-80 bg-gray-200 text-[#0e181f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#86dbdf] text-white"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

