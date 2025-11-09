import React, { useState, useEffect } from "react";
import {
  cabins,
  getExtrasForCabin,
  calculateROI,
} from "../config/mockCalculate";
import { AttitudeChangeModal } from "../components/Modals/AttitudeChangeModal";
import { BoostModal } from "../components/Modals/BoostModal";
import { OwnerBookingCalendar } from "../components/OwnerBookingCalendar";
import { OwnerBookingModal } from "../components/Modals/OwnerBookingModal";
import { OccupancyTypeModal } from "../components/Modals/OccupancyTypeModal";
import { PaymentHistory } from "../components/PaymentHistory";
import { SavedPaymentMethods } from "../components/SavedPaymentMethods";
import { AddPaymentMethodModal } from "../components/AddPaymentMethodModal";
import { BookingHistory } from "../components/BookingHistory";
import { MarketingBoostManager } from "../components/MarketingBoostManager";
import { CalendlyButton } from "../components/CalendlyButton";
import { PayoutHistory, Payout } from "../components/PayoutHistory";
import {
  PayoutRequestModal,
  PayoutData,
} from "../components/Modals/PayoutRequestModal";
import { stripeClient } from "../api/stripe";
import { XeroInvoices } from "../components/XeroInvoices";
import { XeroConnect } from "../components/XeroConnect";

type CabinType = "1BR" | "2BR";

interface Investment {
  cabinType: CabinType;
  id: number;
  location: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  totalIncome: number;
  monthlyIncome: number;
  averagePerNight: number;
  status: string;
  nextPayment: string;
  occupancyRate: number;
  nightsBooked: number;
  roi: number;
  bookedDates: string[];
}

interface FloatingInvestmentData {
  selectedCabin: string | null;
  selectedLocation: string;
  selectedExtras: string[];
  paymentMethod: "account" | "external";
}

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface InvestorPortalProps {
  setIsLoggedIn: (value: boolean) => void;
  onInvestClick: (value: string) => void;
  setSelectedCabinForInvestment: (value: string) => void;
  setShowInvestmentModal: (value: boolean) => void;
  userInvestments: any[];
  setUserInvestments: (investments: any[]) => void;
}

// Investor Portal Component
export const InvestorPortal: React.FC<InvestorPortalProps> = ({
  setIsLoggedIn,
  onInvestClick,
  setShowInvestmentModal,
  setSelectedCabinForInvestment,
  userInvestments: propUserInvestments,
  setUserInvestments: propSetUserInvestments,
}) => {
  // Merge prop investments with mock data for display purposes
  // If there are no investments from props, show mock data
  const mockInvestments: Investment[] = [
    {
      id: 1,
      cabinType: "2BR",
      location: "Mansfield",
      purchaseDate: "2024-01-15",
      purchasePrice: 125000,
      currentValue: 135000,
      totalIncome: 8500,
      monthlyIncome: 850,
      averagePerNight: 285,
      status: "Active",
      nextPayment: "2024-11-15",
      occupancyRate: 72,
      nightsBooked: 21,
      roi: 6.8,
      bookedDates: [
        "2024-11-15",
        "2024-11-16",
        "2024-11-22",
        "2024-11-23",
        "2024-11-24",
        "2024-12-20",
        "2024-12-21",
        "2024-12-22",
        "2024-12-23",
        "2024-12-24",
        "2024-12-25",
        "2024-12-26",
        "2024-12-27",
        "2024-12-28",
        "2024-12-29",
      ],
    },
    {
      id: 2,
      cabinType: "1BR",
      location: "Mansfield",
      purchaseDate: "2024-03-20",
      purchasePrice: 100000,
      currentValue: 108000,
      totalIncome: 6200,
      monthlyIncome: 620,
      averagePerNight: 240,
      status: "Active",
      nextPayment: "2024-11-20",
      occupancyRate: 65,
      nightsBooked: 19,
      roi: 6.2,
      bookedDates: [
        "2024-11-10",
        "2024-11-11",
        "2024-11-17",
        "2024-11-18",
        "2024-12-14",
        "2024-12-15",
        "2024-12-16",
        "2024-12-30",
        "2024-12-31",
      ],
    },
  ];

  // Convert prop investments to full Investment objects with default values
  const convertedPropInvestments: Investment[] = propUserInvestments.map((inv, index) => ({
    id: inv.id || mockInvestments.length + index + 1,
    cabinType: inv.cabinType || "2BR",
    location: inv.location || "Mansfield",
    purchaseDate: inv.purchaseDate || new Date().toISOString().split("T")[0],
    purchasePrice: inv.purchasePrice || 0,
    currentValue: inv.currentValue || inv.purchasePrice || 0,
    totalIncome: inv.totalIncome || 0,
    monthlyIncome: inv.monthlyIncome || 0,
    averagePerNight: inv.averagePerNight || 0,
    status: inv.status || "Pending Build",
    nextPayment: inv.nextPayment || "TBD",
    occupancyRate: inv.occupancyRate || 0,
    nightsBooked: inv.nightsBooked || 0,
    roi: inv.roi || 0,
    bookedDates: inv.bookedDates || [],
  }));

  // ALWAYS show mock data + new investments combined
  // This way users see both demo cabins and their new reservations
  const userInvestments = [...mockInvestments, ...convertedPropInvestments];

  const setUserInvestments = propSetUserInvestments;

  const [showAttitudeChangeModal, setShowAttitudeChangeModal] = useState(false);
  const [pendingAttitudeChange, setPendingAttitudeChange] = useState<
    "retain" | "payout" | null
  >(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedInvestmentForBoost, setSelectedInvestmentForBoost] =
    useState<Investment | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [floatingInvestmentData, setFloatingInvestmentData] =
    useState<FloatingInvestmentData>({
      selectedCabin: null,
      selectedLocation: "mansfield",
      selectedExtras: [],
      paymentMethod: "external",
    });

  // Stripe Payment Methods State
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Mock Stripe Customer ID (in production, this would come from user authentication)
  const stripeCustomerId = "cus_mock_customer_id";

  // Load payment methods from Stripe on mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // Listen for Xero connection changes
  useEffect(() => {
    const handleXeroConnectionChange = () => {
      console.log('Xero connection changed, refreshing XeroConnect component');
      setXeroRefreshKey(prev => prev + 1);
    };

    window.addEventListener('xeroConnectionChanged', handleXeroConnectionChange);

    return () => {
      window.removeEventListener('xeroConnectionChanged', handleXeroConnectionChange);
    };
  }, []);

  const loadPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const response = await stripeClient.listPaymentMethods({
        customerId: stripeCustomerId,
        type: 'card',
      });

      if (response.success && response.paymentMethods) {
        // Convert Stripe payment methods to UI format
        const formattedMethods: PaymentMethod[] = response.paymentMethods.map((pm: any) => ({
          id: pm.id,
          last4: pm.card?.last4 || '0000',
          brand: pm.card?.brand || 'Unknown',
          expiry: pm.card ? `${String(pm.card.exp_month).padStart(2, '0')}/${String(pm.card.exp_year).slice(-2)}` : '00/00',
          isDefault: pm.isDefault || false,
          stripePaymentMethodId: pm.id,
        }));
        setSavedPaymentMethods(formattedMethods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Fallback to mock data if Stripe is not configured
      setSavedPaymentMethods([
        { id: "1", last4: "4242", brand: "Visa", expiry: "12/25", isDefault: true },
        { id: "2", last4: "5555", brand: "Mastercard", expiry: "06/26", isDefault: false },
      ]);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowAddPaymentMethodModal(true);
  };

  const handleRemovePaymentMethod = async (id: string) => {
    try {
      const response = await stripeClient.removePaymentMethod({
        paymentMethodId: id,
      });

      if (response.success) {
        // Reload payment methods
        await loadPaymentMethods();
      } else {
        alert(response.error || 'Failed to remove payment method');
      }
    } catch (error: any) {
      console.error('Error removing payment method:', error);
      alert(error.message || 'Failed to remove payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const response = await stripeClient.setDefaultPaymentMethod({
        customerId: stripeCustomerId,
        paymentMethodId: id,
      });

      if (response.success) {
        // Reload payment methods
        await loadPaymentMethods();
      } else {
        alert(response.error || 'Failed to set default payment method');
      }
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      alert(error.message || 'Failed to set default payment method');
    }
  };

  // Helper function to get card brand icon
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

    // Default/Unknown - use emoji
    return <span className="text-2xl">💳</span>;
  };

  // Helper function to format brand name
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

  const totalValue = userInvestments.reduce(
    (sum, investment) => sum + investment.currentValue,
    0
  );
  const totalIncome = userInvestments.reduce(
    (sum, investment) => sum + investment.totalIncome,
    0
  );
  const monthlyIncome = userInvestments.reduce(
    (sum, investment) => sum + investment.monthlyIncome,
    0
  );
  const [investmentAttitude, setInvestmentAttitude] = useState("retain"); // 'retain' or 'payout'
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'bookings' | 'payments' | 'owner-booking' | 'settings'
  const [xeroRefreshKey, setXeroRefreshKey] = useState(0); // Key to force XeroConnect refresh
  const [userProfile, setUserProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+61 400 000 000",
  });

  // Owner Booking State
  const [showOwnerBookingModal, setShowOwnerBookingModal] = useState(false);
  const [showOccupancyTypeModal, setShowOccupancyTypeModal] = useState(false);
  const [ownerDaysUsed, setOwnerDaysUsed] = useState(45);
  const [ownerDaysLimit] = useState(180);
  const [occupancyType, setOccupancyType] = useState<
    "investment" | "permanent"
  >("investment");

  // Mock booking data
  const mockBookings = [
    {
      id: "1",
      guestName: "Sarah Johnson",
      checkIn: "2024-10-15",
      checkOut: "2024-10-18",
      nights: 3,
      guests: 2,
      revenue: 855,
      nightlyRate: 285,
      status: "completed" as const,
      bookingDate: "2024-09-20",
    },
    {
      id: "2",
      guestName: "Michael Chen",
      checkIn: "2024-11-05",
      checkOut: "2024-11-09",
      nights: 4,
      guests: 4,
      revenue: 1140,
      nightlyRate: 285,
      status: "completed" as const,
      bookingDate: "2024-10-10",
    },
    {
      id: "3",
      guestName: "Emma Wilson",
      checkIn: "2024-12-20",
      checkOut: "2024-12-27",
      nights: 7,
      guests: 3,
      revenue: 2800,
      nightlyRate: 400,
      status: "upcoming" as const,
      bookingDate: "2024-11-01",
    },
  ];

  // Mock payment data
  const mockPayments = [
    {
      id: "1",
      date: "2024-10-01",
      description: "Monthly Payment - Cabin #1",
      amount: 2500,
      status: "completed" as const,
      method: "Bank Transfer",
      invoiceUrl: "#",
      type: "payment" as const,
    },
    {
      id: "2",
      date: "2024-09-01",
      description: "Monthly Payment - Cabin #1",
      amount: 2500,
      status: "completed" as const,
      method: "Bank Transfer",
      invoiceUrl: "#",
      type: "payment" as const,
    },
    {
      id: "3",
      date: "2024-08-15",
      description: "Deposit - Cabin #1",
      amount: 25000,
      status: "completed" as const,
      method: "Bank Transfer",
      invoiceUrl: "#",
      type: "deposit" as const,
    },
  ];

  // Mock Marketing Boost data
  const [marketingBoostActive, setMarketingBoostActive] = useState(true);
  const mockMarketingBoostBilling = [
    {
      id: "1",
      date: "2024-11-01",
      amount: 199,
      status: "paid" as const,
      invoiceUrl: "#",
    },
    {
      id: "2",
      date: "2024-10-01",
      amount: 199,
      status: "paid" as const,
      invoiceUrl: "#",
    },
  ];

  // Payout System State
  const [showPayoutRequestModal, setShowPayoutRequestModal] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<Payout[]>([
    {
      id: "1",
      date: "2024-10-15",
      amount: 2500,
      status: "completed",
      bankDetails: {
        accountName: "John Doe",
        bsb: "123-456",
        accountNumber: "12345678",
      },
      completedDate: "2024-10-18",
    },
    {
      id: "2",
      date: "2024-09-10",
      amount: 1800,
      status: "completed",
      bankDetails: {
        accountName: "John Doe",
        bsb: "123-456",
        accountNumber: "12345678",
      },
      completedDate: "2024-09-13",
    },
    {
      id: "3",
      date: "2024-11-01",
      amount: 1200,
      status: "processing",
      bankDetails: {
        accountName: "John Doe",
        bsb: "123-456",
        accountNumber: "12345678",
      },
    },
  ]);

  // Calculate Wild Things Account Balance (30% of total income)
  const wildThingsAccountBalance = totalIncome * 0.3;

  // Mock booked dates for owner booking calendar
  const mockBookedDates = [
    {
      date: "2025-11-15",
      type: "guest" as const,
      guestName: "John Smith",
      nights: 3,
    },
    {
      date: "2025-11-16",
      type: "guest" as const,
      guestName: "John Smith",
      nights: 3,
    },
    {
      date: "2025-11-17",
      type: "guest" as const,
      guestName: "John Smith",
      nights: 3,
    },
    { date: "2025-12-20", type: "owner" as const, nights: 5 },
    { date: "2025-12-21", type: "owner" as const, nights: 5 },
    { date: "2025-12-22", type: "owner" as const, nights: 5 },
    { date: "2025-12-23", type: "owner" as const, nights: 5 },
    { date: "2025-12-24", type: "owner" as const, nights: 5 },
  ];

  return (
    <div className="min-h-screen pb-8 w-full max-w-full overflow-x-hidden bg-[#f5f5f5]">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex-1">
          {/* Header */}
          <div className="text-center mb-8 pt-24">
            <h1 className="text-4xl md:text-6xl font-black mb-4 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
              My Wild Investments
            </h1>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-4 flex-wrap">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-2 rounded-lg font-bold transition-all text-[#0e181f] ${
                  activeTab === "overview" ? "bg-[#ffcf00]" : "bg-[#f5f5f5]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-6 py-2 rounded-lg font-bold transition-all text-[#0e181f] ${
                  activeTab === "bookings" ? "bg-[#ffcf00]" : "bg-[#f5f5f5]"
                }`}
              >
                Bookings & Revenue
              </button>
              <button
                onClick={() => setActiveTab("owner-booking")}
                className={`px-6 py-2 rounded-lg font-bold transition-all text-[#0e181f] ${
                  activeTab === "owner-booking"
                    ? "bg-[#ffcf00]"
                    : "bg-[#f5f5f5]"
                }`}
              >
                Owner Booking
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-6 py-2 rounded-lg font-bold transition-all text-[#0e181f] ${
                  activeTab === "payments" ? "bg-[#ffcf00]" : "bg-[#f5f5f5]"
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-2 rounded-lg font-bold transition-all text-[#0e181f] ${
                  activeTab === "settings" ? "bg-[#ffcf00]" : "bg-[#f5f5f5]"
                }`}
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  onInvestClick("home");
                }}
                className="px-6 py-2 rounded-lg font-bold transition-all hover:opacity-80 bg-[#ec874c] text-white"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Overview Tab Content */}
          {activeTab === "overview" && (
            <>
              {/* Account Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between min-h-[160px]">
                  <h3 className="text-lg font-bold mb-2 text-[#0e181f] h-12 flex items-center justify-center">
                    Total Investment
                  </h3>
                  <div>
                    <p className="text-3xl font-bold text-[#0e181f] h-[45px] flex items-center justify-center">
                      $
                      {userInvestments
                        .reduce((sum, inv) => sum + inv.purchasePrice, 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 h-5">+ GST</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between min-h-[160px]">
                  <h3 className="text-lg font-bold mb-2 text-[#0e181f] h-12 flex items-center justify-center">
                    Total ROI
                  </h3>
                  <div>
                    <p className="text-3xl font-bold text-[#ec874c] h-[45px] flex items-center justify-center">
                      {(
                        (totalIncome /
                          userInvestments.reduce(
                            (sum, inv) => sum + inv.purchasePrice,
                            0
                          )) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                    <p className="text-xs text-gray-600 mt-1 h-5">
                      annual return
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#ffcf00]/20 to-[#86dbdf]/20 rounded-lg shadow-lg p-6 text-center flex flex-col justify-between min-h-[160px] border-2 border-[#ffcf00]">
                  <h3 className="text-lg font-bold mb-2 text-[#0e181f] h-12 flex items-center justify-center">
                    Wild Things Account 💰
                  </h3>
                  <div>
                    <p className="text-3xl font-bold text-[#ffcf00] h-[45px] flex items-center justify-center">
                      ${wildThingsAccountBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 h-5">
                      available balance
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("payments");
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }, 100);
                    }}
                    className="mt-2 text-xs text-[#86dbdf] hover:text-[#0e181f] font-semibold transition-all"
                  >
                    Request Payout →
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between min-h-[160px]">
                  <h3 className="text-lg font-bold mb-2 text-[#0e181f] h-12 flex items-center justify-center">
                    Total Income (12mo)
                  </h3>
                  <div>
                    <p className="text-3xl font-bold text-[#86dbdf] h-[45px] flex items-center justify-center">
                      ${totalIncome.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 h-5">past year</p>
                  </div>
                </div>
              </div>

              {/* Wild Things Account Info */}
              <div className="bg-gradient-to-r from-[#ffcf00]/10 to-[#86dbdf]/10 rounded-lg shadow-lg p-6 mb-12 border-2 border-[#86dbdf]">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💰</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-[#0e181f]">
                      Your Wild Things Account Balance
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Your Wild Things Account holds <strong>30% of your total
                      income</strong> (${wildThingsAccountBalance.toLocaleString()})
                      which can be used for:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-2 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-[#86dbdf] font-bold">✓</span>
                        <span>
                          <strong>Reinvesting:</strong> Use your balance to reduce
                          the purchase price of additional cabins
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#86dbdf] font-bold">✓</span>
                        <span>
                          <strong>Payouts:</strong> Request to withdraw funds to
                          your bank account (processed within 3-5 business days)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#86dbdf] font-bold">✓</span>
                        <span>
                          <strong>Automatic Coverage:</strong> When investing, your
                          balance is automatically applied to reduce amounts due
                        </span>
                      </li>
                    </ul>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setActiveTab("payments");
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }, 100);
                        }}
                        className="px-4 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#86dbdf] text-white text-sm"
                      >
                        Request Payout
                      </button>
                      <button
                        onClick={() => {
                          window.scrollTo({
                            top: document.documentElement.scrollHeight,
                            behavior: "smooth",
                          });
                        }}
                        className="px-4 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f] text-sm"
                      >
                        Invest More
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Attitude */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
                <h3 className="text-2xl font-bold mb-4 text-[#0e181f]">
                  Investment Attitude
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setPendingAttitudeChange("retain");
                      setShowAttitudeChangeModal(true);
                    }}
                    className={`px-6 py-3 rounded-lg font-bold transition-all text-[#0e181f] ${
                      investmentAttitude === "retain"
                        ? "bg-[#ffcf00]"
                        : "bg-[#f5f5f5]"
                    }`}
                  >
                    Retain Money to Reinvest
                  </button>
                  <button
                    onClick={() => {
                      setPendingAttitudeChange("payout");
                      setShowAttitudeChangeModal(true);
                    }}
                    className={`px-6 py-3 rounded-lg font-bold transition-all text-[#0e181f] ${
                      investmentAttitude === "payout"
                        ? "bg-[#ffcf00]"
                        : "bg-[#f5f5f5]"
                    }`}
                  >
                    Payout Monthly
                  </button>
                </div>
                <p className="text-sm mt-2 text-[#0e181f]">
                  {investmentAttitude === "retain"
                    ? "Your earnings will be retained in your Wild Things account for reinvestment opportunities."
                    : "Your earnings will be paid out to your nominated bank account monthly."}
                </p>
              </div>

              {/* Referral Program */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 mb-12 border-2 border-[#ec874c]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-2 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                      🎁 Refer & Earn $1,000
                    </h3>
                    <p className="text-sm mb-3 text-[#0e181f]">
                      Share your referral code with friends and family. When
                      they invest in a Wild Things cabin, you both get{" "}
                      <strong>$1,000</strong> towards your next cabin purchase!
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white rounded-lg p-3 border-2 border-[#ec874c]">
                        <p className="text-xs text-gray-600 mb-1">
                          Your Referral Code
                        </p>
                        <p className="text-2xl font-bold tracking-wider text-[#ec874c]">
                          {referralCode}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(referralCode);
                          alert("Referral code copied to clipboard!");
                        }}
                        className="px-4 py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ec874c] text-white"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <p className="text-xs text-gray-600 mb-1">
                        Referrals Made
                      </p>
                      <p className="text-4xl font-bold text-[#ec874c]">0</p>
                      <p className="text-xs text-gray-600 mt-1">$0 earned</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cabins Owned */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                <h3 className="text-4xl font-black mb-8 text-center italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                  CABINS OWNED
                </h3>
                <div className="space-y-8">
                  {userInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-lg overflow-hidden border-2 border-[#86dbdf]"
                    >
                      {/* Cabin Header with Photo */}
                      <div className="relative">
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(/${investment.cabinType}.jpg)`,
                          }}
                        >
                          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4 className="text-3xl font-black italic mb-1 shadow-[2px_2px_4px_rgba(0,0,0,0.7)] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                              {investment.cabinType} CABIN
                            </h4>
                            <p className="text-lg font-medium text-[#86dbdf]">
                              📍 {investment.location}
                            </p>
                          </div>
                          <div className="absolute top-4 right-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold ${
                                investment.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {investment.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Investment Details */}
                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1 text-[#0e181f]">
                              Purchase Price
                            </p>
                            <p className="text-xl font-bold text-[#0e181f]">
                              ${investment.purchasePrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">+ GST</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1 text-[#0e181f]">
                              Current Value
                            </p>
                            <p className="text-xl font-bold text-[#ffcf00]">
                              ${investment.currentValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">+ GST</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1 text-[#0e181f]">
                              ROI
                            </p>
                            <p className="text-xl font-bold text-[#ec874c]">
                              {investment.roi
                                ? investment.roi.toFixed(2)
                                : "0.00"}
                              %
                            </p>
                            <p className="text-xs text-gray-600">
                              annual return
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1 text-[#0e181f]">
                              Total Income
                            </p>
                            <p className="text-xl font-bold text-[#86dbdf]">
                              ${investment.totalIncome.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">lifetime</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-1 text-[#0e181f]">
                              Avg Per Night
                            </p>
                            <p className="text-xl font-bold text-[#ffcf00]">
                              $
                              {investment.averagePerNight
                                ? investment.averagePerNight.toLocaleString()
                                : Math.round(
                                    investment.monthlyIncome / 30
                                  ).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">per night</p>
                          </div>
                        </div>

                        {/* Documents Section */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-lg font-bold mb-3 text-[#0e181f]">
                            📄 Legal Documents & Contracts
                          </h4>
                          <div className="space-y-2 mb-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2 sm:gap-0">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">📋</span>
                                <div>
                                  <p className="font-bold text-sm text-[#0e181f]">
                                    Sale Agreement
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Signed {investment.purchaseDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                  Signed
                                </span>
                                <button className="text-blue-600 text-sm hover:underline">
                                  View →
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2 sm:gap-0">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">🏠</span>
                                <div>
                                  <p className="font-bold text-sm text-[#0e181f]">
                                    Land Lease Agreement
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Signed {investment.purchaseDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                  Signed
                                </span>
                                <button className="text-blue-600 text-sm hover:underline">
                                  View →
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2 sm:gap-0">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">⚙️</span>
                                <div>
                                  <p className="font-bold text-sm text-[#0e181f]">
                                    Site Management Agreement
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Signed {investment.purchaseDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                  Signed
                                </span>
                                <button className="text-blue-600 text-sm hover:underline">
                                  View →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Billing Section */}
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4">
                          <h4 className="text-lg font-bold mb-4 text-[#0e181f]">
                            💰 Billing & Invoices
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 border-[#f5f5f5] hover:shadow-lg transition-all hover:border-aqua-400">
                              <span className="text-3xl mb-2">🏢</span>
                              <p className="font-bold text-sm mb-1 text-[#0e181f]">
                                Management
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                Monthly invoices
                              </p>
                              <span className="text-blue-600 text-xs font-medium">
                                View →
                              </span>
                            </button>
                            <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 border-[#f5f5f5] hover:shadow-lg transition-all hover:border-aqua-400">
                              <span className="text-3xl mb-2">🏡</span>
                              <p className="font-bold text-sm mb-1 text-[#0e181f]">
                                Land Lease
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                Site fees
                              </p>
                              <span className="text-blue-600 text-xs font-medium">
                                View →
                              </span>
                            </button>
                            <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 border-[#f5f5f5] hover:shadow-lg transition-all hover:border-aqua-400">
                              <span className="text-3xl mb-2">🔧</span>
                              <p className="font-bold text-sm mb-1 text-[#0e181f]">
                                Maintenance
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                Service records
                              </p>
                              <span className="text-blue-600 text-xs font-medium">
                                View →
                              </span>
                            </button>
                            <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 border-[#f5f5f5] hover:shadow-lg transition-all hover:border-aqua-400">
                              <span className="text-3xl mb-2">🧹</span>
                              <p className="font-bold text-sm mb-1 text-[#0e181f]">
                                Cleaning
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                Service invoices
                              </p>
                              <span className="text-blue-600 text-xs font-medium">
                                View →
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Boost Marketing Section */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-[#ec874c]">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-bold flex items-center gap-2 text-[#0e181f]">
                                🚀 Boost Your Cabin
                              </h4>
                              <p className="text-xs text-gray-600">
                                Increase bookings with targeted marketing
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedInvestmentForBoost(investment);
                                setShowBoostModal(true);
                              }}
                              className="px-4 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ec874c] text-white"
                            >
                              Boost Now
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                            <div className="bg-white rounded p-1 sm:p-2 text-center border border-[#86dbdf]">
                              <p className="font-bold text-xs text-[#0e181f]">
                                Wild
                              </p>
                              <p className="text-xs text-[#ec874c]">$500/mo</p>
                            </div>
                            <div className="bg-white rounded p-1 sm:p-2 text-center border border-[#86dbdf]">
                              <p className="font-bold text-xs text-[#0e181f]">
                                Wilder
                              </p>
                              <p className="text-xs text-[#ec874c]">$1k/mo</p>
                            </div>
                            <div className="bg-white rounded p-1 sm:p-2 text-center border border-[#86dbdf]">
                              <p className="font-bold text-xs text-[#0e181f]">
                                Wildest
                              </p>
                              <p className="text-xs text-[#ec874c]">$2k/mo</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Bookings & Revenue Tab Content */}
          {activeTab === "bookings" && (
            <div className="space-y-8">
              <BookingHistory
                bookings={mockBookings}
                cabinType={userInvestments[0]?.cabinType || "2BR"}
              />
            </div>
          )}

          {/* Owner Booking Tab Content */}
          {activeTab === "owner-booking" && (
            <div className="space-y-8">
              <OwnerBookingCalendar
                cabinId={userInvestments[0]?.id || 1}
                cabinType={userInvestments[0]?.cabinType || "2BR"}
                ownerId={userProfile.email} // Using email as ownerId for now
                useRMSIntegration={true} // ✅ RMS INTEGRATION ENABLED
                // When RMS is enabled, these props are optional (fetched from RMS)
                bookedDates={mockBookedDates} // Fallback if RMS fails
                ownerDaysUsed={ownerDaysUsed} // Fallback if RMS fails
                ownerDaysLimit={ownerDaysLimit} // Fallback if RMS fails
                // Callbacks still work as fallback for non-RMS mode
                onCreateBooking={(startDate, endDate) => {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  const nights = Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  setOwnerDaysUsed(ownerDaysUsed + nights);
                  alert(`Owner booking created! ${nights} nights booked.`);
                }}
                onCancelBooking={(date) => {
                  const booking = mockBookedDates.find(
                    (b) => b.date === date && b.type === "owner"
                  );
                  if (booking && booking.nights) {
                    setOwnerDaysUsed(ownerDaysUsed - booking.nights);
                    alert(
                      `Owner booking cancelled! ${booking.nights} days returned to your allowance.`
                    );
                  }
                }}
              />

              {/* Occupancy Type Manager */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                      OCCUPANCY TYPE
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Current:{" "}
                      <span className="font-bold">
                        {occupancyType === "investment"
                          ? "Investment Property"
                          : "Permanent Residence"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOccupancyTypeModal(true)}
                    className="px-4 py-2 bg-[#ffcf00] text-[#0e181f] rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    Change Type
                  </button>
                </div>
              </div>

              {/* Calendly Integration */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-black mb-4 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                  SCHEDULE A MEETING
                </h3>
                <p className="text-gray-700 mb-4">
                  Need help with your owner bookings or have questions? Schedule
                  a meeting with our team.
                </p>
                <CalendlyButton
                  url="https://calendly.com/wild-things/owner-consultation"
                  text="Schedule Owner Consultation"
                  variant="primary"
                  size="lg"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Payments Tab Content */}
          {activeTab === "payments" && (
            <div className="space-y-8">
              {/* Payout History */}
              <PayoutHistory
                payouts={payoutHistory}
                onRequestPayout={() => setShowPayoutRequestModal(true)}
                availableBalance={wildThingsAccountBalance}
              />

              {/* Xero Connection */}
              <XeroConnect key={xeroRefreshKey} />

              {/* Xero Invoices - Pay with Saved Cards */}
              <XeroInvoices
                customerId={stripeCustomerId}
                xeroContactId="CONTACT-001" // In production, this would come from user profile
                paymentMethods={savedPaymentMethods}
              />

              <PaymentHistory payments={mockPayments} />
              <SavedPaymentMethods
                paymentMethods={savedPaymentMethods}
                onAddPaymentMethod={handleAddPaymentMethod}
                onRemovePaymentMethod={handleRemovePaymentMethod}
                onSetDefault={handleSetDefaultPaymentMethod}
              />
              <MarketingBoostManager
                isActive={marketingBoostActive}
                monthlyFee={199}
                nextBillingDate="2024-12-01"
                billingHistory={mockMarketingBoostBilling}
                onPause={() => {
                  setMarketingBoostActive(false);
                  alert("Marketing Boost paused");
                }}
                onCancel={() => {
                  setMarketingBoostActive(false);
                  alert("Marketing Boost cancelled");
                }}
                onResume={() => {
                  setMarketingBoostActive(true);
                  alert("Marketing Boost resumed");
                }}
              />
            </div>
          )}

          {/* Account Settings Tab Content */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-black mb-6 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.firstName}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#86dbdf] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.lastName}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#86dbdf] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#86dbdf] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-[#86dbdf] rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={() => alert("Profile updated successfully!")}
                  className="mt-4 px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
                >
                  Save Changes
                </button>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-black mb-6 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border-2 border-[#86dbdf] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border-2 border-[#86dbdf] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border-2 border-[#86dbdf] rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => alert("Password changed successfully!")}
                    className="px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#86dbdf] text-[#0e181f]"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-black mb-6 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                  Payment Methods
                </h3>
                <div className="space-y-3 mb-4">
                  {savedPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        method.isDefault
                          ? "border-[#ffcf00]"
                          : "border-[#f5f5f5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getCardIcon(method.brand)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0e181f]">
                              {formatBrandName(method.brand)} •••• {method.last4}
                            </span>
                            {method.isDefault && (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-[#ffcf00] text-[#0e181f]">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            Expires {method.expiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Remove this payment method?")) {
                              handleRemovePaymentMethod(method.id);
                            }
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddPaymentMethod}
                  className="w-full py-3 rounded-lg font-bold border-2 border-dashed border-[#86dbdf] text-[#0e181f] transition-all hover:bg-gray-50"
                >
                  + Add New Payment Method
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Investment Panel - Right Side - Only show on Overview tab */}
        {activeTab === "overview" && (
          <div className="w-full lg:w-[420px] lg:sticky lg:top-32 p-4 lg:flex-shrink-0 scroll-smooth">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-black mb-4 italic text-[#0e181f] font-[family-name:var(--font-roboto-condensed,_'Roboto_Condensed',_Impact,_'Arial_Black',_sans-serif)]">
                Grow Your Wild Portfolio
              </h3>

              {/* Location Selection */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                  Location
                </label>
                <select
                  value={floatingInvestmentData.selectedLocation}
                  onChange={(e) =>
                    setFloatingInvestmentData({
                      ...floatingInvestmentData,
                      selectedLocation: e.target.value,
                    })
                  }
                  className="w-full p-2 border-2 border-[#86dbdf] rounded-lg"
                >
                  <option value="mansfield">Mansfield</option>
                  <option value="byron">Byron Bay (Coming Soon)</option>
                </select>
              </div>

              {/* Cabin Selection */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                  Cabin Type
                </label>
                <div className="space-y-2">
                  {Object.entries(cabins).map(([key, cabin]) => (
                    <div
                      key={key}
                      onClick={() =>
                        setFloatingInvestmentData({
                          ...floatingInvestmentData,
                          selectedCabin: key,
                        })
                      }
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        floatingInvestmentData.selectedCabin === key
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <h4 className="font-bold text-sm text-[#0e181f]">
                        {cabin.name}
                      </h4>
                      <p className="font-bold text-sm text-[#ffcf00]">
                        ${cabin.price.toLocaleString()} + GST
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        {(() => {
                          // Calculate ROI with default values (66% occupancy, $200 nightly rate)
                          const roiData = calculateROI({
                            cabinType: key as CabinType,
                            occupancyRate: 66,
                            nightlyRate: 200,
                            selectedExtras: [],
                            financingType: "paid",
                            depositAmount: 0,
                          });
                          return (
                            <>
                              <p className="text-xs text-gray-600">
                                Estimated ROI:{" "}
                                <span className="font-bold text-[#0e181f]">
                                  {roiData.roi.toFixed(1)}%
                                </span>
                              </p>
                              <p className="text-xs font-bold text-[#10B981]">
                                ~${roiData.annualProfit.toLocaleString()}/year
                                potential income
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              {floatingInvestmentData.selectedCabin && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                    Optional Extras
                  </label>
                  <div className="space-y-2">
                    {getExtrasForCabin(
                      floatingInvestmentData.selectedCabin
                    ).map((extra) => (
                      <label
                        key={extra.id}
                        className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              floatingInvestmentData.selectedExtras?.includes(
                                extra.id
                              ) || false
                            }
                            onChange={(e) => {
                              const currentExtras =
                                floatingInvestmentData.selectedExtras || [];
                              if (e.target.checked) {
                                setFloatingInvestmentData({
                                  ...floatingInvestmentData,
                                  selectedExtras: [...currentExtras, extra.id],
                                });
                              } else {
                                setFloatingInvestmentData({
                                  ...floatingInvestmentData,
                                  selectedExtras: currentExtras.filter(
                                    (id) => id !== extra.id
                                  ),
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-[#0e181f]">
                            {extra.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-[#0e181f]">
                          ${extra.price.toLocaleString()} + GST
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {floatingInvestmentData.selectedCabin && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        floatingInvestmentData.paymentMethod === "external"
                          ? "border-[#ffcf00]"
                          : "border-[#f5f5f5]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="external"
                        checked={
                          floatingInvestmentData.paymentMethod === "external"
                        }
                        onChange={(e) =>
                          setFloatingInvestmentData({
                            ...floatingInvestmentData,
                            paymentMethod: e.target.value as
                              | "external"
                              | "account",
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-[#0e181f]">
                        Pay with Card/Bank Transfer
                      </span>
                    </label>
                    {userInvestments.length > 0 && (
                      <label
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          floatingInvestmentData.paymentMethod === "account"
                            ? "border-[#86dbdf]"
                            : "border-[#f5f5f5]"
                        }`}
                        onClick={(e) => {
                          e.currentTarget.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                          });
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="account"
                          checked={
                            floatingInvestmentData.paymentMethod === "account"
                          }
                          onChange={(e) => {
                            setFloatingInvestmentData({
                              ...floatingInvestmentData,
                              paymentMethod: e.target.value as
                                | "account"
                                | "external",
                            });
                          }}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <span className="text-sm block text-[#0e181f]">
                            Use Wild Things Account Balance
                          </span>
                          <span className="text-xs text-[#86dbdf]">
                            Available: ${(totalIncome * 0.3).toLocaleString()}
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              {floatingInvestmentData.selectedCabin &&
                (() => {
                  const holdingDeposit = 100;
                  const wildThingsBalance = totalIncome * 0.3;
                  const amountFromAccount =
                    floatingInvestmentData.paymentMethod === "account" &&
                    userInvestments.length > 0
                      ? Math.min(wildThingsBalance, holdingDeposit)
                      : 0;
                  const amountDueToday = holdingDeposit - amountFromAccount;

                  return (
                    <div className="mb-4 p-4 rounded-lg bg-[#ffcf00]/[0.2]">
                      <h4 className="font-bold mb-2 text-[#0e181f]">
                        Investment Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Cabin:</span>
                          <span className="font-bold">
                            $
                            {floatingInvestmentData.selectedCabin &&
                              cabins[
                                floatingInvestmentData.selectedCabin as keyof typeof cabins
                              ].price.toLocaleString()}
                          </span>
                        </div>
                        {floatingInvestmentData.selectedExtras?.length > 0 && (
                          <div className="flex justify-between">
                            <span>Extras:</span>
                            <span className="font-bold">
                              $
                              {(() => {
                                const availableExtras = getExtrasForCabin(
                                  floatingInvestmentData.selectedCabin
                                );
                                return availableExtras
                                  .filter((e) =>
                                    floatingInvestmentData.selectedExtras.includes(
                                      e.id
                                    )
                                  )
                                  .reduce((sum, e) => sum + e.price, 0)
                                  .toLocaleString();
                              })()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-bold">Total Investment:</span>
                          <span className="font-bold text-[#0e181f]">
                            $
                            {(() => {
                              const cabinPrice =
                                cabins[
                                  floatingInvestmentData.selectedCabin as keyof typeof cabins
                                ].price;
                              const availableExtras = getExtrasForCabin(
                                floatingInvestmentData.selectedCabin
                              );
                              const extrasTotal = availableExtras
                                .filter((e) =>
                                  floatingInvestmentData.selectedExtras.includes(
                                    e.id
                                  )
                                )
                                .reduce((sum, e) => sum + e.price, 0);
                              return (
                                cabinPrice + extrasTotal
                              ).toLocaleString();
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-bold">Holding Deposit:</span>
                          <span className="font-bold text-[#ffcf00]">
                            ${holdingDeposit}
                          </span>
                        </div>
                        {floatingInvestmentData.paymentMethod === "account" &&
                          userInvestments.length > 0 && (
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-[#86dbdf]">
                                Less: Wild Things Account Balance:
                              </span>
                              <span className="text-xs font-bold text-[#86dbdf]">
                                -${amountFromAccount.toLocaleString()}
                              </span>
                            </div>
                          )}
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-bold">Amount Due Today:</span>
                          <span
                            className={`font-bold ${
                              amountDueToday === 0
                                ? "text-[#86dbdf]"
                                : "text-[#0e181f]"
                            }`}
                          >
                            ${amountDueToday.toLocaleString()}
                          </span>
                        </div>
                        {floatingInvestmentData.paymentMethod === "account" &&
                          userInvestments.length > 0 &&
                          wildThingsBalance < holdingDeposit && (
                            <div className="mt-2 p-2 rounded bg-[#86dbdf]/[0.2]">
                              <p className="text-xs text-[#0e181f]">
                                Your Wild Things Account balance ($
                                {wildThingsBalance.toLocaleString()}) will be
                                applied. Remaining $
                                {(
                                  holdingDeposit - wildThingsBalance
                                ).toLocaleString()}{" "}
                                due via external payment.
                              </p>
                            </div>
                          )}
                        {floatingInvestmentData.paymentMethod === "account" &&
                          userInvestments.length > 0 &&
                          wildThingsBalance >= holdingDeposit && (
                            <div className="mt-2 p-2 rounded bg-[#86dbdf]/[0.2]">
                              <p className="text-xs text-[#0e181f]">
                                Fully covered by your Wild Things Account
                                balance (${wildThingsBalance.toLocaleString()}{" "}
                                available).
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })()}

              {/* Proceed Button */}
              <button
                onClick={() => {
                  if (floatingInvestmentData.selectedCabin) {
                    setSelectedCabinForInvestment(
                      floatingInvestmentData.selectedCabin
                    );
                    setShowInvestmentModal(true);
                  }
                }}
                disabled={!floatingInvestmentData.selectedCabin}
                className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50 bg-[#ffcf00] text-[#0e181f]"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {/* Attitude Change Modal */}
        <AttitudeChangeModal
          isOpen={showAttitudeChangeModal}
          onClose={() => {
            setShowAttitudeChangeModal(false);
            setPendingAttitudeChange(null);
          }}
          onConfirm={() => {
            if (pendingAttitudeChange) {
              setInvestmentAttitude(pendingAttitudeChange);
              setShowAttitudeChangeModal(false);
              setPendingAttitudeChange(null);
            }
          }}
          pendingAttitude={pendingAttitudeChange}
        />

        {/* Boost Modal */}
        <BoostModal
          isOpen={showBoostModal}
          onClose={() => {
            setShowBoostModal(false);
            setSelectedInvestmentForBoost(null);
          }}
          selectedInvestment={selectedInvestmentForBoost}
          savedPaymentMethods={savedPaymentMethods}
          onAddPaymentMethod={(newCard) => {
            if (newCard.isDefault) {
              setSavedPaymentMethods(
                savedPaymentMethods.map((pm) => ({ ...pm, isDefault: false }))
              );
            }
            setSavedPaymentMethods([...savedPaymentMethods, newCard]);
          }}
        />
      </div>

      {/* Modals */}
      {showOwnerBookingModal && (
        <OwnerBookingModal
          cabinId={userInvestments[0]?.id || 1}
          cabinType={userInvestments[0]?.cabinType || "2BR"}
          cabinName={`${userInvestments[0]?.cabinType || "2BR"} Cabin - ${
            userInvestments[0]?.location || "Mansfield"
          }`}
          onClose={() => setShowOwnerBookingModal(false)}
          onConfirm={(booking) => {
            const nights = Math.ceil(
              (new Date(booking.endDate).getTime() -
                new Date(booking.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            setOwnerDaysUsed(ownerDaysUsed + nights);
            setShowOwnerBookingModal(false);
            alert(`Owner booking created! ${nights} nights booked.`);
          }}
          ownerDaysRemaining={ownerDaysLimit - ownerDaysUsed}
        />
      )}

      {showOccupancyTypeModal && (
        <OccupancyTypeModal
          currentType={occupancyType}
          cabinName={`${userInvestments[0]?.cabinType || "2BR"} Cabin - ${
            userInvestments[0]?.location || "Mansfield"
          }`}
          onClose={() => setShowOccupancyTypeModal(false)}
          onSubmitRequest={(newType, reason) => {
            setShowOccupancyTypeModal(false);
            alert(
              `Occupancy type change request submitted!\nNew Type: ${newType}\nReason: ${reason}\n\nYou will receive an email when your request is reviewed.`
            );
          }}
        />
      )}

      {/* Payout Request Modal */}
      <PayoutRequestModal
        isOpen={showPayoutRequestModal}
        onClose={() => setShowPayoutRequestModal(false)}
        onSubmit={(payoutData: PayoutData) => {
          // Create new payout request
          const newPayout: Payout = {
            id: (payoutHistory.length + 1).toString(),
            date: new Date().toISOString().split("T")[0],
            amount: payoutData.amount,
            status: "pending",
            bankDetails: payoutData.bankDetails,
          };

          setPayoutHistory([newPayout, ...payoutHistory]);
          alert(
            `Payout request submitted successfully!\n\nAmount: $${payoutData.amount.toLocaleString()}\nAccount: ${
              payoutData.bankDetails.accountName
            }\n\nYou will receive an email confirmation shortly.`
          );
        }}
        availableBalance={wildThingsAccountBalance}
      />

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddPaymentMethodModal}
        onClose={() => setShowAddPaymentMethodModal(false)}
        onSuccess={() => {
          loadPaymentMethods();
        }}
        customerId={stripeCustomerId}
      />
    </div>
  );
};
