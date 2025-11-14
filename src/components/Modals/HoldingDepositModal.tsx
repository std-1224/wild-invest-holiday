import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import apiClient from "../../api/client";
import { getExtrasForCabin } from "../../config/mockCalculate";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

interface Site {
  _id: string;
  siteNumber: string;
  cabinType: string;
  price: number;
  siteLeaseFee: number;
  status: string;
  locationId: string;
}

interface HoldingDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cabinType: string;
  location: string;
  totalAmount: number;
  selectedExtras?: string[];
  locationId?: string;
  selectedSite?: Site | null;
  siteMapUrl?: string;
}

const HoldingDepositForm: React.FC<
  Omit<HoldingDepositModalProps, "isOpen">
> = ({ onClose, onSuccess, cabinType, location, totalAmount, selectedExtras = [], selectedSite, siteMapUrl }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState<any>(null);

  // Load location data - same approach as InvestmentModal
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const response = await apiClient.getLocations();
        if (response.success && response.locations.length > 0) {
          // For now, use the first location (Mansfield)
          // In the future, this could be based on selectedSite.locationId
          const mansfield = response.locations.find((loc: any) =>
            loc.name.toLowerCase().includes('mansfield')
          );
          if (mansfield) {
            setLocationData(mansfield);
          } else {
            setLocationData(response.locations[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load location:", error);
      }
    };

    loadLocationData();
  }, [selectedSite]);

  // Load saved payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await apiClient.listPaymentMethods();

        if (response.success && response.paymentMethods) {
          const formattedMethods: PaymentMethod[] = response.paymentMethods.map((pm: any) => ({
            id: pm.id,
            last4: pm.card?.last4 || '0000',
            brand: pm.card?.brand || 'Unknown',
            expiry: pm.card ? `${String(pm.card.exp_month).padStart(2, '0')}/${String(pm.card.exp_year).slice(-2)}` : '00/00',
            isDefault: pm.isDefault || false,
          }));

          setSavedPaymentMethods(formattedMethods);

          // Auto-select default payment method
          const defaultMethod = formattedMethods.find(m => m.isDefault);
          if (defaultMethod) {
            setSelectedPaymentMethod(defaultMethod.id);
          } else if (formattedMethods.length > 0) {
            setSelectedPaymentMethod(formattedMethods[0].id);
          }
        }
      } catch (err: any) {
        console.error('Error loading payment methods:', err);
        setError('Failed to load payment methods. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const formatBrandName = (brand: string) => {
    const brandMap: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      diners: "Diners Club",
      jcb: "JCB",
      unionpay: "UnionPay",
    };
    return brandMap[brand.toLowerCase()] || brand;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Process holding deposit payment with saved payment method
      const response: any = await apiClient.request("/api/holding-deposit", {
        method: "POST",
        body: JSON.stringify({
          paymentMethodId: selectedPaymentMethod,
          cabinType,
          location,
          totalAmount,
        }),
      });

      if (!response.success) {
        throw new Error(response.error || "Payment failed");
      }

      // Success!
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffcf00] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment methods...</p>
      </div>
    );
  }

  if (savedPaymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-700 font-bold mb-2">No Saved Payment Methods</p>
        <p className="text-sm text-gray-600 mb-4">
          Please add a payment method in your Account Settings before making a deposit.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-lg font-bold bg-[#ffcf00] text-[#0e181f] hover:opacity-90"
        >
          Go to Account Settings
        </button>
      </div>
    );
  }

  // Get extras details for display
  const extrasDetails = selectedExtras.length > 0
    ? getExtrasForCabin(cabinType).filter(extra => selectedExtras.includes(extra.id))
    : [];
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-900">
          <strong>Holding Deposit:</strong> $100 USD
        </p>
        <p className="text-xs text-blue-700 mt-1">
          This deposit will be deducted from your total cabin price of $
          {totalAmount.toLocaleString()}.
        </p>
      </div>

      {/* Selected Site Display */}
      {selectedSite && (
        <div className="bg-[#86dbdf]/10 border border-[#86dbdf] rounded-lg p-4 mb-4">
          <p className="text-sm font-bold text-[#0e181f] mb-3">
            Selected Site:
          </p>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-lg font-bold text-[#ec874c]">
                Site #{selectedSite.siteNumber}
              </p>
              <p className="text-xs text-gray-600">
                {selectedSite.cabinType} • ${selectedSite.siteLeaseFee?.toLocaleString()}/year lease
              </p>
            </div>
          </div>
          {(locationData?.siteMapUrl || siteMapUrl) ? (
            <a
              href={locationData?.siteMapUrl || siteMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-[#86dbdf] text-[#0e181f] hover:opacity-90"
            >
              📄 Open Site Map
            </a>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Site map not available. Contact admin to upload site map.
            </p>
          )}
        </div>
      )}

      {/* Selected Extras Display */}
      {selectedExtras.length > 0 && (
        <div className="bg-[#ffcf00]/10 border border-[#ffcf00] rounded-lg p-4 mb-4">
          <p className="text-sm font-bold text-[#0e181f] mb-2">
            Selected Extras:
          </p>
          <div className="space-y-1">
            {extrasDetails.map((extra) => (
              <div key={extra.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{extra.name}</span>
                <span className="font-bold text-[#0e181f]">
                  ${extra.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#ffcf00] mt-2 pt-2 flex justify-between text-sm font-bold">
            <span className="text-[#0e181f]">Total Extras:</span>
            <span className="text-[#0e181f]">
              ${extrasDetails.reduce((sum, extra) => sum + extra.price, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Saved Payment Methods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Payment Method
        </label>
        <div className="space-y-2">
          {savedPaymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all ${
                selectedPaymentMethod === method.id
                  ? "border-[#ffcf00] bg-[#ffcf00]/[0.1]"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedPaymentMethod === method.id}
                onChange={() => setSelectedPaymentMethod(method.id)}
                className="w-4 h-4 text-[#ffcf00] mr-3"
              />
              <CreditCard className="w-8 h-8 text-gray-600 mr-3" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0e181f]">
                    {formatBrandName(method.brand)} •••• {method.last4}
                  </span>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#ffcf00] text-[#0e181f]">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Expires {method.expiry}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing || !selectedPaymentMethod}
          className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-[#ffcf00] text-[#0e181f] hover:opacity-90 disabled:opacity-50"
        >
          {processing ? "Processing..." : "Pay $100 Deposit"}
        </button>
      </div>
    </form>
  );
};

export const HoldingDepositModal: React.FC<HoldingDepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cabinType,
  location,
  totalAmount,
  selectedExtras = [],
  selectedSite,
  siteMapUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
          🏡 Secure Your Cabin
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Pay a $100 holding deposit to reserve your {cabinType} cabin at{" "}
          {location}.
        </p>

        <HoldingDepositForm
          onClose={onClose}
          onSuccess={onSuccess}
          cabinType={cabinType}
          location={location}
          totalAmount={totalAmount}
          selectedExtras={selectedExtras}
          selectedSite={selectedSite}
          siteMapUrl={siteMapUrl}
        />
      </div>
    </div>
  );
};

