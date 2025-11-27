import React, { useState, useEffect } from "react";
import {
  cabins,
  cabinImages,
  calculateROI,
  defaultNightlyRates,
  getExtrasForCabin,
} from "../../config/mockCalculate";
import apiClient from "../../api/client";
import { SiteSelector } from "../SiteSelector";
import CabinImageSlider from "../CabinImageSlider";
import { CreditCard, Lock, Plus } from 'lucide-react';
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

type CabinType = "1BR" | "2BR";



interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

interface InvestmentModalProps {
  showInvestmentModal: boolean;
  setShowInvestmentModal: (show: boolean) => void;
  selectedCabinForInvestment: string | null;
  setSelectedCabinForInvestment: (cabin: string | null) => void;
  floatingInvestmentData: {
    selectedExtras?: string[];
    paymentMethod?: string;
    selectedLocation?: string;
  };
  userInvestments: any[];
  setUserInvestments: (investments: any[]) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setCurrentPage: (page: string) => void;
}

const colors = {
  yellow: "#FFCF00",
  darkBlue: "#0E181F",
  aqua: "#86DBDF",
  orange: "#EC874C",
  peach: "#FFCDA3",
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
};

/**
 * NewCardForm Component - Allows users to add a new card using Stripe Elements
 */
interface NewCardFormProps {
  onCardAdded: (paymentMethodId: string) => void;
  onCancel: () => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

const NewCardFormContent: React.FC<NewCardFormProps> = ({
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
    <div className="border-2 border-[#86DBDF] rounded-lg p-4 bg-[#86DBDF]/10">
      <h4 className="font-bold text-[#0E181F] mb-3 flex items-center gap-2">
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
        <Lock className="w-4 h-4 mt-0.5 text-[#0E181F]" />
        <p className="text-xs text-[#0E181F]">
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

const NewCardForm: React.FC<NewCardFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <NewCardFormContent {...props} />
    </Elements>
  );
};

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  showInvestmentModal,
  setShowInvestmentModal,
  selectedCabinForInvestment,
  floatingInvestmentData,
  userInvestments,
  setUserInvestments,
  setIsLoggedIn,
  setCurrentPage,
}) => {
  // Check if user is logged in
  const currentUser = apiClient.getUser();
  const isLoggedIn = apiClient.isAuthenticated();

  const [investmentData, setInvestmentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "Mansfield",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agreeToTerms: false,
  });

  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(
    null
  );
  const [referralCodeValidating, setReferralCodeValidating] =
    useState<boolean>(false);
  const [referrerName, setReferrerName] = useState<string>("");

  // Pre-fill form with user data if logged in (only when modal first opens)
  useEffect(() => {
    if (showInvestmentModal && isLoggedIn && currentUser) {
      const nameParts = currentUser.name?.split(" ") || ["", ""];
      setInvestmentData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: "Mansfield",
        password: "",
        confirmPassword: "",
        referralCode: "",
        agreeToTerms: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInvestmentModal]);

  // Initialize selectedExtras from floatingInvestmentData
  const initializeExtras = () => {
    const extrasObj: { [key: string]: boolean } = {};
    if (floatingInvestmentData.selectedExtras) {
      floatingInvestmentData.selectedExtras.forEach((extraId) => {
        extrasObj[extraId] = true;
      });
    }
    return extrasObj;
  };

  const [selectedExtras, setSelectedExtras] = useState(initializeExtras());

  // Site selection state
  const [currentStep, setCurrentStep] = useState<"site" | "details">("site");
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [locationId, setLocationId] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("Mansfield");

  // Payment state
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Use selected location from InvestorPortal when modal opens
  useEffect(() => {
    const loadLocationDetails = async () => {
      if (!showInvestmentModal) return;

      // If selectedLocation is passed from InvestorPortal, use it
      if (floatingInvestmentData.selectedLocation) {
        setLocationId(floatingInvestmentData.selectedLocation);

        // Fetch location name for display
        try {
          const response = await apiClient.getLocations();
          if (response.success && response.locations) {
            const selectedLoc = response.locations.find(
              (loc: any) => loc._id === floatingInvestmentData.selectedLocation
            );
            if (selectedLoc) {
              setLocationName(selectedLoc.name);
              setInvestmentData(prev => ({ ...prev, location: selectedLoc.name }));
            }
          }
        } catch (error) {
          console.error("Failed to load location details:", error);
        }
      } else {
        // Fallback: load first available location if none selected
        try {
          const response = await apiClient.getLocations();
          if (response.success && response.locations.length > 0) {
            const defaultLocation = response.locations[0];
            setLocationId(defaultLocation._id);
            setLocationName(defaultLocation.name);
            setInvestmentData(prev => ({ ...prev, location: defaultLocation.name }));
          }
        } catch (error) {
          console.error("Failed to load locations:", error);
        }
      }

      setCurrentStep("site");
      setSelectedSite(null);
    };

    if (showInvestmentModal) {
      loadLocationDetails();
    }
  }, [showInvestmentModal, floatingInvestmentData.selectedLocation]);

  // Update extras when modal opens with floatingInvestmentData
  useEffect(() => {
    if (showInvestmentModal && floatingInvestmentData.selectedExtras) {
      const extrasObj: { [key: string]: boolean } = {};
      floatingInvestmentData.selectedExtras.forEach((extraId) => {
        extrasObj[extraId] = true;
      });
      setSelectedExtras(extrasObj);
    }
  }, [showInvestmentModal, floatingInvestmentData.selectedExtras]);

  // Load saved payment methods for logged-in users
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!showInvestmentModal || !isLoggedIn) return;

      setLoadingPaymentMethods(true);
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

          // Auto-select default payment method
          const defaultMethod = formattedMethods.find(m => m.isDefault);
          if (defaultMethod) {
            setSelectedPaymentMethod(defaultMethod.id);
          } else if (formattedMethods.length > 0) {
            setSelectedPaymentMethod(formattedMethods[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    loadPaymentMethods();
  }, [showInvestmentModal, isLoggedIn]);

  // Debounced referral code validation
  useEffect(() => {
    if (
      !investmentData.referralCode ||
      investmentData.referralCode.length < 6
    ) {
      setReferralCodeValid(null);
      setReferrerName("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setReferralCodeValidating(true);
      try {
        const response = await apiClient.validateReferralCode(
          investmentData.referralCode
        );
        setReferralCodeValid(response.valid);
        if (response.valid && response.referrerName) {
          setReferrerName(response.referrerName);
        }
      } catch (error) {
        console.error("Error validating referral code:", error);
        setReferralCodeValid(false);
      } finally {
        setReferralCodeValidating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [investmentData.referralCode]);

  // Early return after hooks
  if (!showInvestmentModal || !selectedCabinForInvestment) {
    return null;
  }

  const selectedCabin = selectedCabinForInvestment
    ? cabins[selectedCabinForInvestment as CabinType]
    : null;
  const holdingDeposit = 100; // $100 holding deposit
  const depositPercentage = 0.3; // 30% deposit
  const calculatedDeposit = selectedCabin
    ? Math.round(selectedCabin.price * depositPercentage)
    : 0;
  const balanceDue = selectedCabin ? calculatedDeposit : 0; // 30% becomes due after holding deposit

  // Wild Things Account Balance (for existing owners)
  const totalIncome = userInvestments.reduce(
    (sum, investment) => sum + investment.totalIncome,
    0
  );
  const wildThingsBalance = totalIncome * 0.3;
  const isUsingAccountBalance =
    floatingInvestmentData.paymentMethod === "account" &&
    userInvestments.length > 0;

  // Get cabin-specific extras
  const extras = getExtrasForCabin(selectedCabinForInvestment as CabinType);

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [extraId]: !prev[extraId],
    }));
  };

  const calculateExtrasTotal = () => {
    return extras.reduce((total, extra) => {
      return total + (selectedExtras[extra.id] ? extra.price : 0);
    }, 0);
  };

  const calculateTotalDeposit = () => {
    return holdingDeposit + balanceDue + calculateExtrasTotal();
  };

  // Calculate ROI impact for individual extras
  const calculateExtraROI = (extraId: string, cabinType: CabinType) => {
    const baseROI = calculateROI(
      cabinType,
      66,
      defaultNightlyRates[cabinType],
      []
    );
    const withExtraROI = calculateROI(
      cabinType,
      66,
      defaultNightlyRates[cabinType],
      [extraId]
    );

    return {
      baseROI: baseROI.roi,
      withExtraROI: withExtraROI.roi,
      roiImpact: withExtraROI.roi - baseROI.roi,
      extra: getExtrasForCabin(cabinType).find((e) => e.id === extraId),
    };
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Validate site selection
    if (!selectedSite) {
      alert("Please select a site location before proceeding.");
      setCurrentStep("site");
      return;
    }

    // For logged-in users, require payment method selection
    if (isLoggedIn && !selectedPaymentMethod) {
      setPaymentError("Please select a payment method");
      return;
    }

    console.log("Processing investment:", investmentData);
    console.log("Holding Deposit:", holdingDeposit);
    console.log("Balance Due:", balanceDue);
    console.log("Total Deposit:", calculateTotalDeposit());
    console.log("Cabin Type:", selectedCabinForInvestment);
    console.log("Selected Site:", selectedSite);

    setPaymentProcessing(true);

    try {
      // Calculate selected extras
      const purchasedExtras = Object.keys(selectedExtras).filter(
        (extraId) => selectedExtras[extraId]
      );

      if (isLoggedIn) {
        // Logged-in user flow: Process payment with saved payment method
        console.log("💳 Processing holding deposit payment...");

        const depositResponse: any = await apiClient.request("/api/holding-deposit", {
          method: "POST",
          body: JSON.stringify({
            paymentMethodId: selectedPaymentMethod,
            cabinType: selectedCabinForInvestment,
            location: locationName,
            totalAmount: calculateTotalDeposit(),
            extras: purchasedExtras,
            siteId: selectedSite._id,
            locationId: locationId,
          }),
        });

        if (!depositResponse.success) {
          throw new Error(depositResponse.message || "Payment failed");
        }

        console.log("✅ Holding deposit payment successful:", depositResponse);

        // Add to local state for immediate UI update
        const newInvestment = {
          id: depositResponse.cabinPurchase?.id || `INV-${Date.now()}`,
          cabinType: selectedCabinForInvestment,
          location: locationName,
          purchaseDate: new Date().toISOString().split("T")[0],
          purchasePrice: selectedCabin?.price || 0,
          currentValue: selectedCabin?.price || 0,
          totalIncome: 0,
          monthlyIncome: 0,
          status: "Deposit Paid",
          nextPayment: "Build Complete (30%)",
          siteId: selectedSite._id,
          siteNumber: selectedSite.siteNumber,
          siteLeaseFee: selectedSite.siteLeaseFee,
          purchasedExtras: purchasedExtras,
        };

        setUserInvestments([...userInvestments, newInvestment]);
        setShowInvestmentModal(false);

        alert(
          `🎉 Congratulations! Your $100 holding deposit has been processed!\n\n` +
          `Cabin: ${selectedCabin?.name}\n` +
          `Site: #${selectedSite.siteNumber}\n` +
          `Location: ${locationName}\n\n` +
          `You can view your investment in the Investor Portal.`
        );

        setCurrentPage("investor-portal");
      } else {
        // New user flow: Register and process payment via guest checkout
        console.log("Creating new investment account with payment...");

        // Validate passwords match
        if (investmentData.password !== investmentData.confirmPassword) {
          setPaymentError("Passwords do not match!");
          setPaymentProcessing(false);
          return;
        }

        // Use guest checkout endpoint that handles registration + payment
        const guestCheckoutResponse: any = await apiClient.request('/api/holding-deposit-guest', {
          method: 'POST',
          body: JSON.stringify({
            firstName: investmentData.firstName,
            lastName: investmentData.lastName,
            email: investmentData.email,
            password: investmentData.password,
            phone: investmentData.phone,
            referralCode: investmentData.referralCode || undefined,
            cabinType: selectedCabinForInvestment,
            location: locationName,
            totalAmount: calculateTotalDeposit(),
            extras: purchasedExtras,
            siteId: selectedSite._id,
            locationId: locationId,
            // Note: For guest checkout, we need to use Stripe Elements
            // which will be implemented in the CardPaymentForm component
          }),
        });

        if (!guestCheckoutResponse.success) {
          throw new Error(guestCheckoutResponse.message || "Registration/payment failed");
        }

        // Auto-login with returned token
        if (guestCheckoutResponse.token) {
          localStorage.setItem('authToken', guestCheckoutResponse.token);
          localStorage.setItem('user', JSON.stringify(guestCheckoutResponse.user));
          setIsLoggedIn(true);
        }

        console.log("✅ Guest checkout successful:", guestCheckoutResponse);

        const newInvestment = {
          id: guestCheckoutResponse.cabinPurchase?.id || `INV-${Date.now()}`,
          cabinType: selectedCabinForInvestment,
          location: locationName,
          purchaseDate: new Date().toISOString().split("T")[0],
          purchasePrice: selectedCabin?.price || 0,
          currentValue: selectedCabin?.price || 0,
          totalIncome: 0,
          monthlyIncome: 0,
          status: "Deposit Paid",
          nextPayment: "Build Complete (30%)",
          siteId: selectedSite._id,
          siteNumber: selectedSite.siteNumber,
          siteLeaseFee: selectedSite.siteLeaseFee,
          purchasedExtras: purchasedExtras,
        };

        setUserInvestments([...userInvestments, newInvestment]);
        setShowInvestmentModal(false);

        alert(
          `🎉 Congratulations! Your account has been created and $100 holding deposit processed!\n\n` +
          `Cabin: ${selectedCabin?.name}\n` +
          `Site: #${selectedSite.siteNumber}\n` +
          `Location: ${locationName}\n\n` +
          `You can view your investment in the Investor Portal.`
        );

        setCurrentPage("investor-portal");
      }

      // Apply referral credits if referral code was used
      if (investmentData.referralCode && referralCodeValid) {
        try {
          const user = apiClient.getUser();
          if (user?.id) {
            const investmentId = `INV-${Date.now()}`;
            const result = await apiClient.applyReferralCredits(
              user.id,
              investmentId
            );
            if (result.success && result.creditsApplied) {
              console.log("✅ Referral credits applied successfully!");
              alert(
                "🎉 Bonus! You and your referrer have each received $1,000 credit!"
              );
            }
          }
        } catch (error) {
          console.error("Error applying referral credits:", error);
        }
      }
    } catch (error: any) {
      console.error("Investment submission error:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Format brand name for display
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

  if (!showInvestmentModal || !selectedCabin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={() => setShowInvestmentModal(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: colors.darkBlue }}
        >
          <span className="text-2xl font-bold">×</span>
        </button>
        <h2
          className="text-2xl font-bold mb-6 text-center italic"
          style={{
            fontFamily:
              '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
            fontWeight: "900",
            fontStyle: "italic",
            color: colors.darkBlue,
          }}
        >
          Reserve Your Investment
        </h2>

        {/* Cabin Image Slider and Details */}
        <div className="mb-6">
          <div className="rounded-lg overflow-hidden mb-4">
            <CabinImageSlider
              images={cabinImages[selectedCabinForInvestment as CabinType] || [selectedCabin.image]}
              autoplay={true}
              interval={4000}
              className="h-48"
              showControls={true}
              showIndicators={true}
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-xl font-bold"
                style={{ color: colors.darkBlue }}
              >
                {selectedCabin.name}
              </h3>
              <p className="text-sm" style={{ color: colors.darkBlue }}>
                📍 {investmentData.location || "Mansfield"}, Victoria
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === "site" ? "bg-[#ec874c] text-white" : "bg-gray-300 text-gray-600"
            }`}>
              1
            </div>
            <span className={`text-sm font-semibold ${
              currentStep === "site" ? "text-[#ec874c]" : "text-gray-600"
            }`}>
              Select Site
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === "details" ? "bg-[#ec874c] text-white" : "bg-gray-300 text-gray-600"
            }`}>
              2
            </div>
            <span className={`text-sm font-semibold ${
              currentStep === "details" ? "text-[#ec874c]" : "text-gray-600"
            }`}>
              Your Details
            </span>
          </div>
        </div>

        {/* Site Selection Step */}
        {currentStep === "site" && (
          <div className="mb-6">
            {/* Selected Location Display */}
            <div className="mb-4 p-3 bg-[#f5f5f5] rounded-lg">
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-bold text-[#0e181f]">{locationName}</p>
            </div>

            {/* Site Selector */}
            {locationId ? (
              <SiteSelector
                locationId={locationId}
                cabinType={selectedCabinForInvestment as string}
                onSiteSelect={(site) => {
                  setSelectedSite(site);
                }}
                selectedSiteId={selectedSite?._id}
              />
            ) : (
              <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">Loading location...</p>
              </div>
            )}

            {selectedSite && (
              <div className="mt-6">
                <div className="bg-[#f5f5f5] rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-[#0e181f] mb-2">Selected Site</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-[#ec874c]">Site #{selectedSite.siteNumber}</p>
                      <p className="text-sm text-gray-600">
                        Annual Site Lease: ${selectedSite.siteLeaseFee?.toLocaleString()}/year
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSite(null)}
                      className="text-sm text-[#86dbdf] hover:underline"
                    >
                      Change Site
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep("details")}
                  className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ec874c] text-white"
                >
                  Continue to Details →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Details Step */}
        {currentStep === "details" && (
          <>
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: `${colors.yellow}20`,
                border: `2px solid ${colors.yellow}`,
              }}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium" style={{ color: colors.darkBlue }}>
                    Purchase Price
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: colors.darkBlue }}
                  >
                    ${selectedCabin.price.toLocaleString()} + GST
                  </p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: colors.darkBlue }}>
                    Site #{selectedSite?.siteNumber || "TBD"}
                  </p>
                  <p className="text-sm" style={{ color: colors.darkBlue }}>
                    Lease: ${selectedSite?.siteLeaseFee?.toLocaleString() || "14,000"}/yr
                  </p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: colors.darkBlue }}>
                    Holding Deposit
                  </p>
                  <p className="text-xl font-bold" style={{ color: colors.yellow }}>
                    ${holdingDeposit}
                  </p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: colors.darkBlue }}>
                    30% Due Later
                  </p>
                  <p className="text-xl font-bold" style={{ color: colors.aqua }}>
                    ${balanceDue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Site Selection Button */}
            <button
              onClick={() => setCurrentStep("site")}
              className="mb-4 text-sm text-[#86dbdf] hover:underline font-semibold"
            >
              ← Back to Site Selection
            </button>

            {/* Extras Selection - Only show selected extras */}
        {Object.keys(selectedExtras).filter(key => selectedExtras[key]).length > 0 && (
          <div className="mb-6">
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: colors.darkBlue }}
            >
              Selected Investment Extras
            </h3>
            <div className="space-y-3">
              {extras
                .filter(extra => selectedExtras[extra.id]) // Only show selected extras
                .map((extra) => (
                <div key={extra.id}>
                  <div
                    className="flex items-center justify-between p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: `${colors.yellow}20`,
                      borderColor: colors.yellow,
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-5 h-5 flex items-center justify-center rounded" style={{ backgroundColor: colors.yellow }}>
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <p
                          className="font-bold"
                          style={{ color: colors.darkBlue }}
                        >
                          {extra.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {extra.impactDescription}
                        </p>
                        {(() => {
                          const extraROI = calculateExtraROI(
                            extra.id,
                            selectedCabinForInvestment as CabinType
                          );
                          return (
                            <div
                              className="text-xs mt-1"
                              style={{
                                color:
                                  extraROI.roiImpact > 0
                                    ? "#059669"
                                    : extraROI.roiImpact < 0
                                    ? "#EF4444"
                                    : "#6B7280",
                              }}
                            >
                              ROI Impact: {extraROI.roiImpact > 0 ? "+" : ""}
                              {extraROI.roiImpact.toFixed(1)}%
                              {extra.id === "solar" && (
                                <span className="ml-1">
                                  (Eliminates $
                                  {((66 / 100) * 365 * 20).toLocaleString()}{" "}
                                  energy costs)
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-lg"
                        style={{ color: colors.yellow }}
                      >
                        ${extra.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {extra.id === "insurance" || extra.id === "maintenance"
                          ? "per year"
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Furniture Package Details - Unfurl when selected */}
                  {extra.id === "furniture" &&
                    (extra as any).items && (
                      <div
                        className="ml-12 mt-2 p-4 rounded-lg border-l-4"
                        style={{
                          backgroundColor: `${colors.yellow}10`,
                          borderColor: colors.yellow,
                        }}
                      >
                        <p
                          className="text-sm font-bold mb-2"
                          style={{ color: colors.darkBlue }}
                        >
                          📦 Package Includes:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {(extra as any).items.map(
                            (item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span style={{ color: colors.aqua }}>✓</span>
                                <span style={{ color: colors.darkBlue }}>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleInvestmentSubmit}>
          {/* Show profile summary if logged in, otherwise show editable fields */}
          {isLoggedIn ? (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: `${colors.aqua}10`,
                border: `1px solid ${colors.aqua}`,
              }}
            >
              <h3
                className="text-lg font-bold mb-3"
                style={{ color: colors.darkBlue }}
              >
                Your Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>{" "}
                  <span
                    className="font-medium"
                    style={{ color: colors.darkBlue }}
                  >
                    {investmentData.firstName} {investmentData.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>{" "}
                  <span
                    className="font-medium"
                    style={{ color: colors.darkBlue }}
                  >
                    {investmentData.email}
                  </span>
                </div>
                {investmentData.phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span
                      className="font-medium"
                      style={{ color: colors.darkBlue }}
                    >
                      {investmentData.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    value={investmentData.firstName}
                    onChange={(e) =>
                      setInvestmentData({
                        ...investmentData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86DBDF]"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={investmentData.lastName}
                    onChange={(e) =>
                      setInvestmentData({
                        ...investmentData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86DBDF]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={investmentData.email}
                    onChange={(e) =>
                      setInvestmentData({
                        ...investmentData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86DBDF]"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={investmentData.phone}
                    onChange={(e) =>
                      setInvestmentData({
                        ...investmentData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86DBDF]"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.darkBlue }}
            >
              Preferred Location
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              {locationName || "Loading..."}
            </div>
          </div>

          {/* Account Creation Fields - Only show if not logged in */}

          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: `${colors.aqua}10`,
              border: `1px solid ${colors.aqua}`,
            }}
          >
            {!isLoggedIn && (
              <>
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: colors.darkBlue }}
                >
                  Create Your Investment Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.darkBlue }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      value={investmentData.password}
                      onChange={(e) =>
                        setInvestmentData({
                          ...investmentData,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86DBDF]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.darkBlue }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={investmentData.confirmPassword}
                      onChange={(e) =>
                        setInvestmentData({
                          ...investmentData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86DBDF]"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Referral Code Field */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.darkBlue }}
              >
                Referral Code (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={investmentData.referralCode}
                  onChange={(e) =>
                    setInvestmentData({
                      ...investmentData,
                      referralCode: e.target.value.toUpperCase(),
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 uppercase ${
                    referralCodeValid === true
                      ? "border-green-500 focus:ring-green-500"
                      : referralCodeValid === false
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#86DBDF]"
                  }`}
                  placeholder="Enter referral code"
                  maxLength={8}
                />
                {referralCodeValidating && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                    ⏳
                  </span>
                )}
                {!referralCodeValidating && referralCodeValid !== null && (
                  <span className="absolute right-3 top-4/5 -translate-y-1/2 text-xl">
                    {referralCodeValid ? "✅" : "❌"}
                  </span>
                )}
              </div>
              {referralCodeValid === true && referrerName && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ Valid code from {referrerName}. You'll both get $1,000
                  credit!
                </p>
              )}
              {referralCodeValid === false && investmentData.referralCode && (
                <p className="mt-1 text-sm text-red-600">
                  ✗ Invalid referral code
                </p>
              )}
              {!investmentData.referralCode && (
                <p className="mt-1 text-xs text-gray-500">
                  Have a referral code? Get $1,000 credit when you invest!
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={investmentData.agreeToTerms}
                  onChange={(e) =>
                    setInvestmentData({
                      ...investmentData,
                      agreeToTerms: e.target.checked,
                    })
                  }
                  className="mr-2"
                  required
                />
                <span className="text-sm" style={{ color: colors.darkBlue }}>
                  I agree to the Investment Terms & Conditions and Privacy
                  Policy
                </span>
              </label>
            </div>
          </div>
          <div
            className="mb-6 p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: "white",
              border: `1px solid ${colors.lightGray}`,
            }}
          >
            <div className="flex items-center mb-6">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: colors.aqua }}
              >
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <h3
                className="text-xl font-bold"
                style={{
                  color: colors.darkBlue,
                  fontFamily:
                    '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                  fontStyle: "italic",
                }}
              >
                Investment Summary
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Cabin Type
                </span>
                <span
                  className="font-bold text-base"
                  style={{ color: colors.darkBlue }}
                >
                  {selectedCabin.name}
                </span>
              </div>

              {/* Base Cabin Price */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Base Cabin Price
                </span>
                <div className="text-right">
                  <div
                    className="font-bold text-base"
                    style={{ color: colors.darkBlue }}
                  >
                    $
                    {selectedCabin.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-gray-500">+ GST</div>
                </div>
              </div>

              {/* Extras Breakdown */}
              {calculateExtrasTotal() > 0 && (
                <>
                  <div
                    className="text-xs font-medium"
                    style={{ color: colors.darkBlue }}
                  >
                    Selected Extras:
                  </div>
                  {getExtrasForCabin(selectedCabinForInvestment).map(
                    (extra) =>
                      selectedExtras[extra.id] && (
                        <div
                          key={extra.id}
                          className="flex justify-between ml-4"
                        >
                          <span className="text-xs">{extra.name}:</span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: colors.yellow }}
                          >
                            $
                            {extra.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            + GST
                          </span>
                        </div>
                      )
                  )}
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium">Total Extras:</span>
                    <span
                      className="font-bold"
                      style={{ color: colors.yellow }}
                    >
                      $
                      {calculateExtrasTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      + GST
                    </span>
                  </div>
                </>
              )}

              {/* Total Purchase Price */}
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total Purchase Price:</span>
                <span className="font-bold text-lg">
                  $
                  {(
                    selectedCabin.price + calculateExtrasTotal()
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  + GST
                </span>
              </div>

              {/* Expected ROI Display */}
              {(() => {
                const selectedExtrasList = Object.keys(selectedExtras).filter(
                  (key) => selectedExtras[key]
                );
                const expectedROI = calculateROI(
                  selectedCabinForInvestment as CabinType,
                  66,
                  defaultNightlyRates[selectedCabinForInvestment as CabinType],
                  selectedExtrasList
                );
                const baseROI = calculateROI(
                  selectedCabinForInvestment as CabinType,
                  66,
                  defaultNightlyRates[selectedCabinForInvestment as CabinType],
                  []
                );
                const roiImprovement = expectedROI.roi - baseROI.roi;
                const annualIncomeImprovement =
                  expectedROI.annualProfit - baseROI.annualProfit;

                return (
                  <div
                    className="mt-4 p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: `${colors.yellow}20`,
                      borderColor: colors.yellow,
                    }}
                  >
                    <div className="text-center">
                      <h4
                        className="font-bold text-lg mb-2"
                        style={{ color: colors.darkBlue }}
                      >
                        Expected Annual ROI
                      </h4>
                      <div
                        className="text-3xl font-bold mb-2"
                        style={{ color: colors.orange }}
                      >
                        {expectedROI.roi.toFixed(1)}%
                      </div>

                      {/* ROI Improvement */}
                      {roiImprovement > 0 && (
                        <div
                          className="text-sm mb-1"
                          style={{ color: "#059669" }}
                        >
                          +{roiImprovement.toFixed(1)}% improvement with
                          selected options
                        </div>
                      )}

                      {/* Annual Income Improvement */}
                      {annualIncomeImprovement > 0 && (
                        <div
                          className="text-sm font-bold mb-2"
                          style={{ color: "#059669" }}
                        >
                          +$
                          {annualIncomeImprovement.toLocaleString("en-AU", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          extra annual income
                        </div>
                      )}

                      {/* Base vs Expected Income Comparison */}
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div className="bg-white p-2 rounded">
                          <div className="text-xs text-gray-600">
                            Base Annual Income
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: colors.darkBlue }}
                          >
                            $
                            {baseROI.annualProfit.toLocaleString("en-AU", {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <div className="text-xs text-gray-600">
                            With Selected Options
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: colors.orange }}
                          >
                            $
                            {expectedROI.annualProfit.toLocaleString("en-AU", {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs mt-2 text-gray-600">
                        Based on 66% occupancy rate and dynamic pricing
                      </div>
                      {selectedExtrasList.length > 0 && (
                        <div className="text-xs mt-1 text-gray-600">
                          Includes {selectedExtrasList.length} selected option
                          {selectedExtrasList.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Wild Things Account Balance Deduction */}
              {isUsingAccountBalance && wildThingsBalance > 0 && (
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium" style={{ color: colors.aqua }}>
                    Less: Wild Things Account Balance:
                  </span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: colors.aqua }}
                  >
                    -$
                    {wildThingsBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {/* Adjusted Total After Account Balance */}
              {isUsingAccountBalance && wildThingsBalance > 0 && (
                <div className="flex justify-between">
                  <span className="font-bold">
                    Adjusted Total Purchase Price:
                  </span>
                  <span className="font-bold text-lg">
                    $
                    {Math.max(
                      0,
                      selectedCabin.price +
                        calculateExtrasTotal() -
                        wildThingsBalance
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    + GST
                  </span>
                </div>
              )}

              {/* Payment Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div
                  className="text-sm font-bold mb-3"
                  style={{ color: colors.darkBlue }}
                >
                  Payment Milestones
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div
                        className="font-medium text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        Holding Deposit
                      </div>
                      <div className="text-xs" style={{ color: colors.aqua }}>
                        Due today
                      </div>
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: colors.yellow }}
                    >
                      $
                      {Math.max(
                        0,
                        holdingDeposit -
                          (isUsingAccountBalance
                            ? Math.min(wildThingsBalance, holdingDeposit)
                            : 0)
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-shrink-0 mr-2">
                      <div
                        className="font-medium text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        30% Deposit
                      </div>
                      <div className="text-xs" style={{ color: colors.aqua }}>
                        Due at signing
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm whitespace-nowrap">
                        $
                        {Math.max(
                          0,
                          (selectedCabin.price +
                            calculateExtrasTotal() -
                            (isUsingAccountBalance ? wildThingsBalance : 0)) *
                            0.3
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs">+ GST</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-shrink-0 mr-2">
                      <div
                        className="font-medium text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        30% Progress Payment
                      </div>
                      <div className="text-xs" style={{ color: colors.aqua }}>
                        Due at 50% completion
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm whitespace-nowrap">
                        $
                        {Math.max(
                          0,
                          (selectedCabin.price +
                            calculateExtrasTotal() -
                            (isUsingAccountBalance ? wildThingsBalance : 0)) *
                            0.3
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs">+ GST</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-shrink-0 mr-2">
                      <div
                        className="font-medium text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        40% Final Payment
                      </div>
                      <div className="text-xs" style={{ color: colors.aqua }}>
                        Due at handover
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm whitespace-nowrap">
                        $
                        {Math.max(
                          0,
                          (selectedCabin.price +
                            calculateExtrasTotal() -
                            (isUsingAccountBalance ? wildThingsBalance : 0)) *
                            0.4
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs">+ GST</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Amount Due Today */}
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold text-sm">
                  Total Amount Due Today:
                </span>
                <span
                  className="font-bold text-lg"
                  style={{
                    color:
                      isUsingAccountBalance &&
                      wildThingsBalance >= holdingDeposit
                        ? colors.aqua
                        : colors.yellow,
                  }}
                >
                  $
                  {Math.max(
                    0,
                    holdingDeposit -
                      (isUsingAccountBalance
                        ? Math.min(wildThingsBalance, holdingDeposit)
                        : 0)
                  ).toLocaleString()}
                </span>
              </div>

              {/* Account Balance Message */}
              {isUsingAccountBalance && (
                <div
                  className="mt-2 p-3 rounded"
                  style={{ backgroundColor: `${colors.aqua}20` }}
                >
                  <p className="text-xs" style={{ color: colors.darkBlue }}>
                    <strong>
                      Your Wild Things Account balance of $
                      {wildThingsBalance.toLocaleString()}
                    </strong>{" "}
                    has been applied to reduce your total purchase price.
                    {wildThingsBalance >= holdingDeposit ? (
                      <> The holding deposit is fully covered.</>
                    ) : (
                      <>
                        {" "}
                        $
                        {Math.max(
                          0,
                          holdingDeposit - wildThingsBalance
                        ).toLocaleString()}{" "}
                        holding deposit due today.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selection - For Logged In Users */}
          {isLoggedIn && (
            <div className="mb-6">
              <h3
                className="text-lg font-bold mb-3"
                style={{ color: colors.darkBlue }}
              >
                <Lock className="inline w-4 h-4 mr-2" />
                Payment Method
              </h3>

              {loadingPaymentMethods ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffcf00] mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading payment methods...</p>
                </div>
              ) : showNewCardForm ? (
                // Show new card form
                <NewCardForm
                  onCardAdded={(paymentMethodId) => {
                    setSelectedPaymentMethod(paymentMethodId);
                    setShowNewCardForm(false);
                    // Optionally reload payment methods to show the new card
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
                  processing={paymentProcessing}
                  setProcessing={setPaymentProcessing}
                  setError={setPaymentError}
                />
              ) : savedPaymentMethods.length === 0 ? (
                // No saved payment methods - show add card prompt
                <div className="text-center py-4 bg-[#86DBDF]/10 rounded-lg border-2 border-[#86DBDF]">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-[#0e181f] text-sm font-bold mb-1">No Saved Payment Methods</p>
                  <p className="text-gray-600 text-xs mb-4">
                    Add a card to complete your $100 holding deposit payment.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewCardForm(true)}
                    className="px-6 py-2 rounded-lg font-bold bg-[#ffcf00] text-[#0e181f] hover:opacity-90 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Card
                  </button>
                </div>
              ) : (
                // Show saved payment methods with option to add new
                <div className="space-y-2">
                  {savedPaymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-[#ffcf00] bg-[#ffcf00]/10"
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
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#86DBDF] hover:text-[#0e181f] hover:bg-[#86DBDF]/10 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">Add New Card</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Error Message */}
          {paymentError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{paymentError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={paymentProcessing || showNewCardForm || (isLoggedIn && !selectedPaymentMethod)}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.yellow,
                color: colors.darkBlue,
              }}
            >
              {paymentProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0e181f]"></div>
                  Processing...
                </span>
              ) : (
                "Pay Holding Deposit"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowInvestmentModal(false)}
              disabled={paymentProcessing}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: colors.darkBlue,
                color: colors.white,
              }}
            >
              Cancel Investment
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
};
