import React, { useState, useEffect } from "react";
import { CreditCard, Lock, Plus } from "lucide-react";
import apiClient from "../../api/client";
import { getExtrasForCabin } from "../../config/mockCalculate";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripeClient } from '../../api/stripe';

// Initialize Stripe
const stripePromise = loadStripe(stripeClient.getPublishableKey());

// Wild Things brand colors
const colors = {
  darkBlue: '#0e181f',
  aqua: '#86dbdf',
  yellow: '#ffcf00',
  orange: '#ec874c',
};

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
  onLogin?: () => void; // Callback to update auth state after guest checkout
  cabinType: string;
  location: string;
  totalAmount: number;
  selectedExtras?: string[];
  locationId?: string;
  selectedSite?: Site | null;
  siteMapUrl?: string;
}

/**
 * Guest Checkout Form Component (uses Stripe Elements)
 * Allows non-logged-in users to pay deposit and create account
 */
const GuestCheckoutForm: React.FC<{
  onSuccess: () => void;
  onClose: () => void;
  onLogin?: () => void;
  cabinType: string;
  location: string;
  totalAmount: number;
  selectedExtras: string[];
  selectedSite: Site | null | undefined;
}> = ({ onSuccess, onClose, onLogin, cabinType, location, totalAmount, selectedExtras, selectedSite }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account creation fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate fields
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get CardElement
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${firstName} ${lastName}`,
          email: email,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      console.log('💳 Payment method created:', paymentMethod.id);

      // Call backend to register user and process payment
      const response = await apiClient.request('/api/holding-deposit-guest', {
        method: 'POST',
        body: JSON.stringify({
          // User registration data
          firstName,
          lastName,
          email,
          password,
          referralCode: referralCode || undefined,
          // Payment data
          paymentMethodId: paymentMethod.id,
          cabinType,
          location,
          totalAmount,
          siteId: selectedSite?._id,
        }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Payment failed');
      }

      console.log('✅ Guest checkout successful');

      // Auto-login: Store token and user data
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('✅ User auto-logged in');
      }

      // Success! Update auth state and continue flow
      onSuccess();

      // Call onLogin to update auth context (instead of reloading page)
      if (onLogin) {
        onLogin();
      }
    } catch (err: any) {
      console.error('❌ Error in guest checkout:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get extras details for display
  const extrasDetails = selectedExtras.length > 0
    ? getExtrasForCabin(cabinType).filter(extra => selectedExtras.includes(extra.id))
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary */}
      <div className="bg-gradient-to-r from-[#86dbdf]/20 to-[#ffcf00]/20 border-2 border-[#86dbdf] rounded-lg p-4 mb-4">
        <h3 className="font-bold text-[#0e181f] mb-3 flex items-center gap-2">
          📋 Your Selection Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Cabin Type:</span>
            <span className="font-bold text-[#0e181f]">{cabinType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Location:</span>
            <span className="font-bold text-[#0e181f]">{location}</span>
          </div>
          {selectedSite && (
            <div className="flex justify-between">
              <span className="text-gray-700">Site Number:</span>
              <span className="font-bold text-[#ec874c]">#{selectedSite.siteNumber}</span>
            </div>
          )}
          {selectedExtras.length > 0 && (
            <div className="pt-2 border-t border-[#86dbdf]">
              <p className="text-gray-700 mb-1">Extras:</p>
              {extrasDetails.map((extra) => (
                <div key={extra.id} className="flex justify-between pl-2">
                  <span className="text-gray-600 text-xs">• {extra.name}</span>
                  <span className="font-bold text-[#0e181f] text-xs">
                    ${extra.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] font-bold">
            <span className="text-[#0e181f]">Total Investment:</span>
            <span className="text-[#0e181f]">${totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-900">
          <strong>Holding Deposit:</strong> $100 USD
        </p>
        <p className="text-xs text-blue-700 mt-1">
          This deposit will be deducted from your total cabin price of $
          {totalAmount.toLocaleString()}.
        </p>
      </div>

      {/* Account Creation Section */}
      <div className="bg-[#86dbdf]/10 border border-[#86dbdf] rounded-lg p-4">
        <h3 className="font-bold text-[#0e181f] mb-3">Create Your Account</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Referral Code (Optional)
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
            placeholder="Enter referral code"
          />
        </div>
      </div>

      {/* Payment Card Section */}
      <div className="bg-white border-2 rounded-lg p-4" style={{ borderColor: colors.aqua }}>
        <h3 className="font-bold text-[#0e181f] mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Card Details
        </h3>
        <div className="border-2 rounded-lg p-4" style={{ borderColor: colors.aqua }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: colors.darkBlue,
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                },
              },
            }}
          />
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 mt-3">
          <Lock className="w-4 h-4 mt-0.5" style={{ color: colors.darkBlue }} />
          <p className="text-xs" style={{ color: colors.darkBlue }}>
            Your card details are encrypted and securely stored by Stripe. Wild Things never sees or stores your full card number.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-[#ffcf00] text-[#0e181f] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay $100 & Create Account"}
        </button>
      </div>
    </form>
  );
};

/**
 * LoggedInNewCardForm Component - For logged-in users to add a new card
 */
interface LoggedInNewCardFormProps {
  onCardAdded: (paymentMethodId: string) => void;
  onCancel: () => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

const LoggedInNewCardFormContent: React.FC<LoggedInNewCardFormProps> = ({
  onCardAdded,
  onCancel,
  processing,
  setProcessing,
  setError,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleAddCard = async () => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      console.log('💳 New card added:', paymentMethod.id);
      onCardAdded(paymentMethod.id);
    } catch (err: any) {
      console.error('Error adding card:', err);
      setError(err.message || 'Failed to add card');
      setProcessing(false);
    }
  };

  return (
    <div className="border-2 border-[#86dbdf] rounded-lg p-4 bg-[#86dbdf]/10">
      <h4 className="font-bold text-[#0e181f] mb-3 flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add New Card
      </h4>
      <div className="border-2 rounded-lg p-4 bg-white" style={{ borderColor: colors.aqua }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: colors.darkBlue,
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
              },
            },
          }}
        />
      </div>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 mt-3">
        <Lock className="w-4 h-4 mt-0.5 text-[#0e181f]" />
        <p className="text-xs text-[#0e181f]">
          Your card details are encrypted and securely stored by Stripe. Wild Things never sees your full card number.
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-4 py-2 rounded-lg font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAddCard}
          disabled={!stripe || processing}
          className="flex-1 px-4 py-2 rounded-lg font-bold bg-[#ffcf00] text-[#0e181f] hover:opacity-90 disabled:opacity-50"
        >
          {processing ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </div>
  );
};

const LoggedInNewCardForm: React.FC<LoggedInNewCardFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <LoggedInNewCardFormContent {...props} />
    </Elements>
  );
};

const HoldingDepositForm: React.FC<
  Omit<HoldingDepositModalProps, "isOpen">
> = ({ onClose, onSuccess, onLogin, cabinType, location, totalAmount, selectedExtras = [], selectedSite }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Check authentication and load data
  useEffect(() => {
    const initializeModal = async () => {
      // Check if user is logged in
      const authenticated = apiClient.isAuthenticated();
      setIsLoggedIn(authenticated);

      // Load saved payment methods only if logged in
      if (authenticated) {
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
        }
      }

      setLoading(false);
    };

    initializeModal();
  }, [selectedSite]);

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
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // If not logged in, show guest checkout form
  if (!isLoggedIn) {
    return (
      <Elements stripe={stripePromise}>
        <GuestCheckoutForm
          onSuccess={onSuccess}
          onClose={onClose}
          onLogin={onLogin}
          cabinType={cabinType}
          location={location}
          totalAmount={totalAmount}
          selectedExtras={selectedExtras}
          selectedSite={selectedSite}
        />
      </Elements>
    );
  }

  // If logged in but no saved payment methods and not showing new card form, show add card prompt
  if (savedPaymentMethods.length === 0 && !showNewCardForm) {
    return (
      <div className="text-center py-8 bg-[#86dbdf]/10 rounded-lg border-2 border-[#86dbdf]">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-700 font-bold mb-2">No Saved Payment Methods</p>
        <p className="text-sm text-gray-600 mb-4">
          Add a card to complete your $100 holding deposit payment.
        </p>
        <button
          onClick={() => setShowNewCardForm(true)}
          className="px-6 py-3 rounded-lg font-bold bg-[#ffcf00] text-[#0e181f] hover:opacity-90 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Card
        </button>
      </div>
    );
  }

  // If showing new card form for logged-in user with no saved methods
  if (showNewCardForm && savedPaymentMethods.length === 0) {
    return (
      <LoggedInNewCardForm
        onCardAdded={(paymentMethodId) => {
          setSelectedPaymentMethod(paymentMethodId);
          setShowNewCardForm(false);
          // Reload payment methods to show the new card
          const loadNewCard = async () => {
            try {
              const response = await apiClient.listPaymentMethods();
              if (response.success && response.paymentMethods) {
                const formattedMethods: PaymentMethod[] = response.paymentMethods.map((pm: any) => ({
                  id: pm.id,
                  last4: pm.card?.last4 || pm.last4 || '0000',
                  brand: pm.card?.brand || pm.brand || 'card',
                  expiry: pm.card ? `${pm.card.exp_month}/${pm.card.exp_year}` : pm.expiry || '',
                  isDefault: pm.isDefault || false,
                }));
                setSavedPaymentMethods(formattedMethods);
              }
            } catch (error) {
              console.error('Error reloading payment methods:', error);
            }
          };
          loadNewCard();
        }}
        onCancel={() => setShowNewCardForm(false)}
        processing={processing}
        setProcessing={setProcessing}
        setError={setError}
      />
    );
  }

  // Get extras details for display
  const extrasDetails = selectedExtras.length > 0
    ? getExtrasForCabin(cabinType).filter(extra => selectedExtras.includes(extra.id))
    : [];
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary */}
      <div className="bg-gradient-to-r from-[#86dbdf]/20 to-[#ffcf00]/20 border-2 border-[#86dbdf] rounded-lg p-4 mb-4">
        <h3 className="font-bold text-[#0e181f] mb-3 flex items-center gap-2">
          📋 Your Selection Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Cabin Type:</span>
            <span className="font-bold text-[#0e181f]">{cabinType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Location:</span>
            <span className="font-bold text-[#0e181f]">{location}</span>
          </div>
          {selectedSite && (
            <div className="flex justify-between">
              <span className="text-gray-700">Site Number:</span>
              <span className="font-bold text-[#ec874c]">#{selectedSite.siteNumber}</span>
            </div>
          )}
          {selectedExtras.length > 0 && (
            <div className="pt-2 border-t border-[#86dbdf]">
              <p className="text-gray-700 mb-1">Extras:</p>
              {extrasDetails.map((extra) => (
                <div key={extra.id} className="flex justify-between pl-2">
                  <span className="text-gray-600 text-xs">• {extra.name}</span>
                  <span className="font-bold text-[#0e181f] text-xs">
                    ${extra.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] font-bold">
            <span className="text-[#0e181f]">Total Investment:</span>
            <span className="text-[#0e181f]">${totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-900">
          <strong>Holding Deposit:</strong> $100 USD
        </p>
        <p className="text-xs text-blue-700 mt-1">
          This deposit will be deducted from your total cabin price of $
          {totalAmount.toLocaleString()}.
        </p>
      </div>

      {/* Saved Payment Methods or New Card Form */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Payment Method
        </label>

        {showNewCardForm ? (
          // Show new card form
          <LoggedInNewCardForm
            onCardAdded={(paymentMethodId) => {
              setSelectedPaymentMethod(paymentMethodId);
              setShowNewCardForm(false);
              // Reload payment methods to show the new card
              const loadNewCard = async () => {
                try {
                  const response = await apiClient.listPaymentMethods();
                  if (response.success && response.paymentMethods) {
                    const formattedMethods: PaymentMethod[] = response.paymentMethods.map((pm: any) => ({
                      id: pm.id,
                      last4: pm.card?.last4 || pm.last4 || '0000',
                      brand: pm.card?.brand || pm.brand || 'card',
                      expiry: pm.card ? `${pm.card.exp_month}/${pm.card.exp_year}` : pm.expiry || '',
                      isDefault: pm.isDefault || false,
                    }));
                    setSavedPaymentMethods(formattedMethods);
                  }
                } catch (error) {
                  console.error('Error reloading payment methods:', error);
                }
              };
              loadNewCard();
            }}
            onCancel={() => setShowNewCardForm(false)}
            processing={processing}
            setProcessing={setProcessing}
            setError={setError}
          />
        ) : (
          // Show saved payment methods
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
            {/* Add new card option */}
            <button
              type="button"
              onClick={() => setShowNewCardForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#86dbdf] hover:text-[#0e181f] hover:bg-[#86dbdf]/10 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-bold">Add New Card</span>
            </button>
          </div>
        )}
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
          disabled={processing || showNewCardForm || !selectedPaymentMethod}
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
  onLogin,
  cabinType,
  location,
  totalAmount,
  selectedExtras = [],
  selectedSite,
  siteMapUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 p-6 max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2 text-[#0e181f]">
          🏡 Step 3: Secure Your Cabin
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Pay a $100 holding deposit to reserve your {cabinType} cabin at {location}.
        </p>

        <HoldingDepositForm
          onClose={onClose}
          onSuccess={onSuccess}
          onLogin={onLogin}
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

