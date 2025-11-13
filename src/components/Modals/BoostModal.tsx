import { useState } from "react";
import { AddPaymentMethodModal } from "../AddPaymentMethodModal";
import apiClient from "../../api/client";

interface Investment {
  cabinType: string;
  location: string;
  id: number | string;
}

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvestment: Investment | null;
  savedPaymentMethods: PaymentMethod[];
  onPaymentMethodsRefresh: () => void;
}

interface BoostTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export const BoostModal = ({
  isOpen,
  onClose,
  selectedInvestment,
  savedPaymentMethods,
  onPaymentMethodsRefresh,
}: BoostModalProps) => {
  const [selectedBoostTier, setSelectedBoostTier] = useState<string | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(savedPaymentMethods.find((pm) => pm.isDefault)?.id || null);
  const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boostTiers: BoostTier[] = [
    {
      id: "wild",
      name: "Wild",
      price: 500,
      features: [
        "Featured listing on homepage",
        "Social media posts (2/month)",
        "Email newsletter feature",
        "Priority search placement",
      ],
    },
    {
      id: "wilder",
      name: "Wilder",
      price: 1000,
      features: [
        "Everything in Wild",
        "Targeted Facebook ads",
        "Instagram story campaigns",
        "Google Ads placement",
        "Professional photo shoot",
      ],
      popular: true,
    },
    {
      id: "wildest",
      name: "Wildest",
      price: 2000,
      features: [
        "Everything in Wilder",
        "Dedicated marketing manager",
        "Video content creation",
        "Influencer partnerships",
        "Premium ad placements",
        "Monthly performance reports",
      ],
    },
  ];

  const handlePaymentMethodAdded = () => {
    // Refresh payment methods list
    onPaymentMethodsRefresh();
    setShowAddPaymentMethodModal(false);
  };

  const handleBoostSubmit = async () => {
    const tier = boostTiers.find((t) => t.id === selectedBoostTier);
    if (!tier || !selectedPaymentMethod || !selectedInvestment) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.activateMarketingBoost({
        investmentId: selectedInvestment.id.toString(),
        cabinType: selectedInvestment.cabinType,
        location: selectedInvestment.location,
        tier: tier.id,
        tierName: tier.name,
        monthlyPrice: tier.price,
        paymentMethodId: selectedPaymentMethod,
      });

      if (!response.success) {
        throw new Error((response as any).error || 'Failed to activate boost');
      }

      console.log("✅ Boost activated:", response);

      // Show success message
      alert(
        `Boost activated! Your ${tier.name} package ($${tier.price}/month) is now active.\n\n` +
        `Payment ID: ${response.payment.id}\n` +
        (response.xero ? `Xero Invoice: ${response.xero.invoiceId}` : 'Xero invoice will be created on next sync.')
      );

      onClose();
      setSelectedBoostTier(null);
    } catch (err: any) {
      console.error("❌ Error activating boost:", err);
      setError(err.message || 'Failed to activate marketing boost');
      alert(`Error: ${err.message || 'Failed to activate marketing boost'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !selectedInvestment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#0e181f]"
        >
          <span className="text-2xl font-bold">×</span>
        </button>

        <h2 className="text-3xl font-bold mb-2 italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          🚀 Boost Your Cabin
        </h2>
        <p className="text-sm mb-6 text-[#0e181f]">
          {selectedInvestment.cabinType} Cabin - {selectedInvestment.location}
        </p>

        {/* Boost Tiers */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 text-[#0e181f]">
            Select Your Marketing Package
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boostTiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedBoostTier(tier.id)}
                className={`relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedBoostTier === tier.id
                    ? "ring-2 ring-offset-2 ring-[#ec874c] border-[#ec874c] bg-[#ec874c]/[0.1]"
                    : "border-[#86dbdf] bg-white"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-[#ec874c] text-white">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h4 className="text-xl sm:text-2xl font-bold mb-2 italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
                  {tier.name}
                </h4>
                <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-[#ec874c]">
                  ${tier.price}
                  <span className="text-xs sm:text-sm font-normal text-gray-600">
                    /month
                  </span>
                </p>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#86dbdf] flex-shrink-0">✓</span>
                      <span className="text-[#0e181f]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Selection */}
        {selectedBoostTier && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-[#0e181f]">
              Payment Method
            </h3>

            {/* Saved Payment Methods */}
            <div className="space-y-3 mb-4">
              {savedPaymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all ${
                    selectedPaymentMethod === method.id
                      ? "border-[#ec874c] bg-[#ec874c]/[0.1]"
                      : "border-[#f5f5f5] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedPaymentMethod === method.id}
                    onChange={() => setSelectedPaymentMethod(method.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0e181f]">
                        {method.brand} •••• {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-[#86dbdf] text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Expires {method.expiry}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Add New Card */}
            <button
              onClick={() => setShowAddPaymentMethodModal(true)}
              className="w-full py-3 rounded-lg font-bold border-2 border-dashed transition-all hover:bg-gray-50 border-[#86dbdf] text-[#0e181f]"
            >
              + Add New Card
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Summary & Confirm */}
        {selectedBoostTier && selectedPaymentMethod && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-bold mb-2 text-[#0e181f]">Boost Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-bold">
                  {boostTiers.find((t) => t.id === selectedBoostTier)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Cost:</span>
                <span className="font-bold text-[#ec874c]">
                  ${boostTiers.find((t) => t.id === selectedBoostTier)?.price}
                  /month
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold">
                  {
                    savedPaymentMethods.find(
                      (pm) => pm.id === selectedPaymentMethod
                    )?.brand
                  }{" "}
                  ••••{" "}
                  {
                    savedPaymentMethods.find(
                      (pm) => pm.id === selectedPaymentMethod
                    )?.last4
                  }
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">First Payment:</span>
                <span className="font-bold text-lg text-[#ec874c]">
                  ${boostTiers.find((t) => t.id === selectedBoostTier)?.price}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              * Recurring monthly charge. Cancel anytime from your account
              settings.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBoostSubmit}
            disabled={!selectedBoostTier || !selectedPaymentMethod || loading}
            className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-[#ec874c] text-white"
          >
            {loading ? 'Processing...' : 'Activate Boost'}
          </button>
          <button
            onClick={() => {
              onClose();
              setSelectedBoostTier(null);
            }}
            className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddPaymentMethodModal}
        onClose={() => setShowAddPaymentMethodModal(false)}
        onSuccess={handlePaymentMethodAdded}
      />
    </div>
  );
};
