import { useState } from "react";
import { CreditCard, Plus, Trash2, Check, Star } from "lucide-react";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

interface SavedPaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: () => void;
  onRemovePaymentMethod: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const SavedPaymentMethods = ({
  paymentMethods,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefault,
}: SavedPaymentMethodsProps) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();

    // Map brand names to icon file names
    let iconName = '';

    if (brandLower === 'visa') {
      iconName = 'visa';
    } else if (brandLower === 'mastercard') {
      iconName = 'mastercard';
    } else if (brandLower === 'amex' || brandLower === 'american express') {
      iconName = 'amex';
    } else if (brandLower === 'discover') {
      iconName = 'discover';
    } else if (brandLower === 'jcb') {
      iconName = 'jcb';
    } else if (brandLower === 'diners' || brandLower === 'diners club') {
      iconName = 'diners';
    } else if (brandLower === 'unionpay') {
      iconName = 'unionpay';
    }

    // If we have a matching icon, use it
    if (iconName) {
      return (
        <img
          src={`/card-icons/${iconName}.svg`}
          alt={brand}
          className="w-12 h-8 object-contain"
        />
      );
    }

    // Default/Unknown - use generic credit card icon
    return (
      <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
        <CreditCard className="w-6 h-6 text-white" />
      </div>
    );
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onRemovePaymentMethod(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const formatBrandName = (brand: string) => {
    const brandLower = brand.toLowerCase();

    if (brandLower === 'visa') return 'Visa';
    if (brandLower === 'mastercard') return 'Mastercard';
    if (brandLower === 'amex' || brandLower === 'american express') return 'American Express';
    if (brandLower === 'discover') return 'Discover';
    if (brandLower === 'jcb') return 'JCB';
    if (brandLower === 'diners' || brandLower === 'diners club') return 'Diners Club';
    if (brandLower === 'unionpay') return 'UnionPay';

    // Capitalize first letter for unknown brands
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-[#86dbdf]" />
          <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            SAVED PAYMENT METHODS
          </h3>
        </div>
        <button
          onClick={onAddPaymentMethod}
          className="flex items-center gap-2 px-4 py-2 bg-[#ffcf00] text-[#0e181f] rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Card
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-3">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="mb-4">No saved payment methods</p>
            <button
              onClick={onAddPaymentMethod}
              className="px-6 py-3 bg-[#ffcf00] text-[#0e181f] rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Add Your First Card
            </button>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                method.isDefault
                  ? "border-[#ffcf00] bg-[#ffcf00]/[0.05]"
                  : "border-gray-200 hover:border-[#86dbdf]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getCardIcon(method.brand)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#0e181f]">
                        {formatBrandName(method.brand)} •••• {method.last4}
                      </h4>
                      {method.isDefault && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#ffcf00] text-[#0e181f] rounded text-xs font-semibold">
                          <Star className="w-3 h-3 fill-current" />
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Expires {method.expiry}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => onSetDefault(method.id)}
                      className="flex items-center gap-1 px-3 py-2 border-2 border-[#86dbdf] text-[#86dbdf] rounded-lg text-sm font-semibold hover:bg-[#86dbdf] hover:text-white transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className={`p-2 rounded-lg transition-all ${
                      confirmDelete === method.id
                        ? "bg-red-600 text-white"
                        : "hover:bg-red-50 text-red-600"
                    }`}
                    title={
                      confirmDelete === method.id
                        ? "Click again to confirm"
                        : "Remove card"
                    }
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {confirmDelete === method.id && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  Click delete again to confirm removal
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-[#86dbdf]/[0.1] rounded-lg border border-[#86dbdf]">
        <p className="text-sm text-gray-700">
          <strong>Secure Payment:</strong> All payment information is encrypted
          and securely stored via Stripe. We never store your full card details
          on our servers.
        </p>
      </div>
    </div>
  );
};
