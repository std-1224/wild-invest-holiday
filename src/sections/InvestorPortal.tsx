import React, { useState } from "react";
import { cabins, colors, getExtrasForCabin } from "../config/mockCalculate";

type CabinType = "1BR" | "2BR" | "3BR";

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
}

// Investor Portal Component
export const InvestorPortal: React.FC<InvestorPortalProps> = ({
  setIsLoggedIn,
  onInvestClick,
  setShowInvestmentModal,
  setSelectedCabinForInvestment,
}) => {
  const [userInvestments, setUserInvestments] = useState<Investment[]>([
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
  ]);

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

  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    PaymentMethod[]
  >([
    { id: "1", last4: "4242", brand: "Visa", expiry: "12/25", isDefault: true },
  ]);

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
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'settings'
  const [userProfile, setUserProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+61 400 000 000",
  });

  return (
    <div
      className="min-h-screen py-8 w-full max-w-full overflow-x-hidden"
      style={{ backgroundColor: colors.lightGray }}
    >
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex-1">
          {/* Header */}
          <div className="text-center mb-8 pt-24">
            <h1
              className="text-4xl md:text-6xl font-bold mb-4 italic"
              style={{
                fontFamily:
                  '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                fontWeight: "900",
                fontStyle: "italic",
                color: colors.darkBlue,
              }}
            >
              My Wild Investments
            </h1>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-4 flex-wrap">
              <button
                onClick={() => setActiveTab("overview")}
                className="px-6 py-2 rounded-lg font-bold transition-all"
                style={{
                  backgroundColor:
                    activeTab === "overview" ? colors.yellow : colors.lightGray,
                  color: colors.darkBlue,
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className="px-6 py-2 rounded-lg font-bold transition-all"
                style={{
                  backgroundColor:
                    activeTab === "settings" ? colors.yellow : colors.lightGray,
                  color: colors.darkBlue,
                }}
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  onInvestClick("home");
                }}
                className="px-6 py-2 rounded-lg font-bold transition-all hover:opacity-80"
                style={{
                  backgroundColor: colors.orange,
                  color: colors.white,
                }}
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
                <div
                  className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between"
                  style={{ minHeight: "160px" }}
                >
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{
                      color: colors.darkBlue,
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Total Investment
                  </h3>
                  <div>
                    <p
                      className="text-3xl font-bold"
                      style={{
                        color: colors.darkBlue,
                        height: "45px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      $
                      {userInvestments
                        .reduce((sum, inv) => sum + inv.purchasePrice, 0)
                        .toLocaleString()}
                    </p>
                    <p
                      className="text-xs text-gray-600 mt-1"
                      style={{ height: "20px" }}
                    >
                      plus GST
                    </p>
                  </div>
                </div>
                <div
                  className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between"
                  style={{ minHeight: "160px" }}
                >
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{
                      color: colors.darkBlue,
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Total ROI
                  </h3>
                  <div>
                    <p
                      className="text-3xl font-bold"
                      style={{
                        color: colors.orange,
                        height: "45px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
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
                    <p
                      className="text-xs text-gray-600 mt-1"
                      style={{ height: "20px" }}
                    >
                      annual return
                    </p>
                  </div>
                </div>
                <div
                  className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between"
                  style={{ minHeight: "160px" }}
                >
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{
                      color: colors.darkBlue,
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Wild Things Account
                  </h3>
                  <div>
                    <p
                      className="text-3xl font-bold"
                      style={{
                        color: colors.yellow,
                        height: "45px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ${(totalIncome * 0.3).toLocaleString()}
                    </p>
                    <p
                      className="text-xs text-gray-600 mt-1"
                      style={{ height: "20px" }}
                    >
                      available balance
                    </p>
                  </div>
                </div>
                <div
                  className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between"
                  style={{ minHeight: "160px" }}
                >
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{
                      color: colors.darkBlue,
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Total Income (12mo)
                  </h3>
                  <div>
                    <p
                      className="text-3xl font-bold"
                      style={{
                        color: colors.aqua,
                        height: "45px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ${totalIncome.toLocaleString()}
                    </p>
                    <p
                      className="text-xs text-gray-600 mt-1"
                      style={{ height: "20px" }}
                    >
                      past year
                    </p>
                  </div>
                </div>
              </div>

              {/* Investment Attitude */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color: colors.darkBlue }}
                >
                  Investment Attitude
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (investmentAttitude !== "retain") {
                        setPendingAttitudeChange("retain");
                        setShowAttitudeChangeModal(true);
                      }
                    }}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                      investmentAttitude === "retain"
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                    style={{
                      backgroundColor:
                        investmentAttitude === "retain"
                          ? colors.yellow
                          : colors.lightGray,
                      color:
                        investmentAttitude === "retain"
                          ? colors.darkBlue
                          : colors.darkBlue,
                    }}
                  >
                    Retain Money to Reinvest
                  </button>
                  <button
                    onClick={() => {
                      if (investmentAttitude !== "payout") {
                        setPendingAttitudeChange("payout");
                        setShowAttitudeChangeModal(true);
                      }
                    }}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                      investmentAttitude === "payout"
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                    style={{
                      backgroundColor:
                        investmentAttitude === "payout"
                          ? colors.yellow
                          : colors.lightGray,
                      color:
                        investmentAttitude === "payout"
                          ? colors.darkBlue
                          : colors.darkBlue,
                    }}
                  >
                    Payout Monthly
                  </button>
                </div>
                <p className="text-sm mt-2" style={{ color: colors.darkBlue }}>
                  {investmentAttitude === "retain"
                    ? "Your earnings will be retained in your Wild Things account for reinvestment opportunities."
                    : "Your earnings will be paid out to your nominated bank account monthly."}
                </p>
              </div>

              {/* Referral Program */}
              <div
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 mb-12 border-2"
                style={{ borderColor: colors.orange }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3
                      className="text-2xl font-bold mb-2 italic"
                      style={{
                        fontFamily:
                          '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                        fontWeight: "900",
                        fontStyle: "italic",
                        color: colors.darkBlue,
                      }}
                    >
                      🎁 Refer & Earn $1,000
                    </h3>
                    <p
                      className="text-sm mb-3"
                      style={{ color: colors.darkBlue }}
                    >
                      Share your referral code with friends and family. When
                      they invest in a Wild Things cabin, you both get{" "}
                      <strong>$1,000</strong> towards your next cabin purchase!
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 bg-white rounded-lg p-3 border-2"
                        style={{ borderColor: colors.orange }}
                      >
                        <p className="text-xs text-gray-600 mb-1">
                          Your Referral Code
                        </p>
                        <p
                          className="text-2xl font-bold tracking-wider"
                          style={{ color: colors.orange }}
                        >
                          {referralCode}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(referralCode);
                          alert("Referral code copied to clipboard!");
                        }}
                        className="px-4 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                        style={{
                          backgroundColor: colors.orange,
                          color: colors.white,
                        }}
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
                      <p
                        className="text-4xl font-bold"
                        style={{ color: colors.orange }}
                      >
                        0
                      </p>
                      <p className="text-xs text-gray-600 mt-1">$0 earned</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cabins Owned */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                <h3
                  className="text-4xl font-bold mb-8 text-center italic"
                  style={{
                    fontFamily:
                      '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                    fontWeight: "900",
                    fontStyle: "italic",
                    color: colors.darkBlue,
                  }}
                >
                  CABINS OWNED
                </h3>
                <div className="space-y-8">
                  {userInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-lg overflow-hidden border-2"
                      style={{ borderColor: colors.aqua }}
                    >
                      {/* Cabin Header with Photo */}
                      <div className="relative">
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(/${investment.cabinType}.jpg)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4
                              className="text-3xl font-bold italic mb-1"
                              style={{
                                fontFamily:
                                  '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                                fontWeight: "900",
                                fontStyle: "italic",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                              }}
                            >
                              {investment.cabinType} CABIN
                            </h4>
                            <p
                              className="text-lg font-medium"
                              style={{ color: colors.aqua }}
                            >
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
                            <p
                              className="text-sm font-medium mb-1"
                              style={{ color: colors.darkBlue }}
                            >
                              Purchase Price
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: colors.darkBlue }}
                            >
                              ${investment.purchasePrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">plus GST</p>
                          </div>
                          <div className="text-center">
                            <p
                              className="text-sm font-medium mb-1"
                              style={{ color: colors.darkBlue }}
                            >
                              Current Value
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: colors.yellow }}
                            >
                              ${investment.currentValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">plus GST</p>
                          </div>
                          <div className="text-center">
                            <p
                              className="text-sm font-medium mb-1"
                              style={{ color: colors.darkBlue }}
                            >
                              ROI
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: colors.orange }}
                            >
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
                            <p
                              className="text-sm font-medium mb-1"
                              style={{ color: colors.darkBlue }}
                            >
                              Total Income
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: colors.aqua }}
                            >
                              ${investment.totalIncome.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">lifetime</p>
                          </div>
                          <div className="text-center">
                            <p
                              className="text-sm font-medium mb-1"
                              style={{ color: colors.darkBlue }}
                            >
                              Avg Per Night
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: colors.yellow }}
                            >
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
                          <h4
                            className="text-lg font-bold mb-3"
                            style={{ color: colors.darkBlue }}
                          >
                            📄 Legal Documents & Contracts
                          </h4>
                          <div className="space-y-2 mb-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2 sm:gap-0">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">📋</span>
                                <div>
                                  <p
                                    className="font-bold text-sm"
                                    style={{ color: colors.darkBlue }}
                                  >
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
                                  <p
                                    className="font-bold text-sm"
                                    style={{ color: colors.darkBlue }}
                                  >
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
                                  <p
                                    className="font-bold text-sm"
                                    style={{ color: colors.darkBlue }}
                                  >
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
                          <h4
                            className="text-lg font-bold mb-4"
                            style={{ color: colors.darkBlue }}
                          >
                            💰 Billing & Invoices
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                              className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400"
                              style={{ borderColor: colors.lightGray }}
                            >
                              <span className="text-3xl mb-2">🏢</span>
                              <p
                                className="font-bold text-sm mb-1"
                                style={{ color: colors.darkBlue }}
                              >
                                Management
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                Monthly invoices
                              </p>
                              <span className="text-blue-600 text-xs font-medium">
                                View →
                              </span>
                            </button>
                            <button
                              className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400"
                              style={{ borderColor: colors.lightGray }}
                            >
                              <span className="text-3xl mb-2">🏡</span>
                              <p
                                className="font-bold text-sm mb-1"
                                style={{ color: colors.darkBlue }}
                              >
                                Land Lease
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                Site fees
                              </p>
                              <span className="text-blue-600 text-xs font-medium">
                                View →
                              </span>
                            </button>
                            <button
                              className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400"
                              style={{ borderColor: colors.lightGray }}
                            >
                              <span className="text-3xl mb-2">🔧</span>
                              <p
                                className="font-bold text-sm mb-1"
                                style={{ color: colors.darkBlue }}
                              >
                                Maintenance
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                Service records
                              </p>
                              <span className="text-blue-600 text-xs font-medium">
                                View →
                              </span>
                            </button>
                            <button
                              className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400"
                              style={{ borderColor: colors.lightGray }}
                            >
                              <span className="text-3xl mb-2">🧹</span>
                              <p
                                className="font-bold text-sm mb-1"
                                style={{ color: colors.darkBlue }}
                              >
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
                        <div
                          className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-2"
                          style={{ borderColor: colors.orange }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4
                                className="text-lg font-bold flex items-center gap-2"
                                style={{ color: colors.darkBlue }}
                              >
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
                              className="px-4 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                              style={{
                                backgroundColor: colors.orange,
                                color: colors.white,
                              }}
                            >
                              Boost Now
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                            <div
                              className="bg-white rounded p-1 sm:p-2 text-center border"
                              style={{ borderColor: colors.aqua }}
                            >
                              <p
                                className="font-bold text-xs"
                                style={{ color: colors.darkBlue }}
                              >
                                Wild
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: colors.orange }}
                              >
                                $500/mo
                              </p>
                            </div>
                            <div
                              className="bg-white rounded p-1 sm:p-2 text-center border"
                              style={{ borderColor: colors.aqua }}
                            >
                              <p
                                className="font-bold text-xs"
                                style={{ color: colors.darkBlue }}
                              >
                                Wilder
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: colors.orange }}
                              >
                                $1k/mo
                              </p>
                            </div>
                            <div
                              className="bg-white rounded p-1 sm:p-2 text-center border"
                              style={{ borderColor: colors.aqua }}
                            >
                              <p
                                className="font-bold text-xs"
                                style={{ color: colors.darkBlue }}
                              >
                                Wildest
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: colors.orange }}
                              >
                                $2k/mo
                              </p>
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

          {/* Account Settings Tab Content */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3
                  className="text-2xl font-bold mb-6 italic"
                  style={{
                    fontFamily:
                      '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                    fontWeight: "900",
                    fontStyle: "italic",
                    color: colors.darkBlue,
                  }}
                >
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: colors.darkBlue }}
                    >
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
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: colors.aqua }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: colors.darkBlue }}
                    >
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
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: colors.aqua }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: colors.darkBlue }}
                    >
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
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: colors.aqua }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: colors.darkBlue }}
                    >
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
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: colors.aqua }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => alert("Profile updated successfully!")}
                  className="mt-4 px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: colors.yellow,
                    color: colors.darkBlue,
                  }}
                >
                  Save Changes
                </button>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3
                  className="text-2xl font-bold mb-6 italic"
                  style={{
                    fontFamily:
                      '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                    fontWeight: "900",
                    fontStyle: "italic",
                    color: colors.darkBlue,
                  }}
                >
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: colors.darkBlue }}
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: colors.aqua }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: colors.darkBlue }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: colors.aqua }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: colors.darkBlue }}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: colors.aqua }}
                    />
                  </div>
                  <button
                    onClick={() => alert("Password changed successfully!")}
                    className="px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                    style={{
                      backgroundColor: colors.aqua,
                      color: colors.darkBlue,
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3
                  className="text-2xl font-bold mb-6 italic"
                  style={{
                    fontFamily:
                      '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                    fontWeight: "900",
                    fontStyle: "italic",
                    color: colors.darkBlue,
                  }}
                >
                  Payment Methods
                </h3>
                <div className="space-y-3 mb-4">
                  {savedPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2"
                      style={{
                        borderColor: method.isDefault
                          ? colors.yellow
                          : colors.lightGray,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💳</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold"
                              style={{ color: colors.darkBlue }}
                            >
                              {method.brand} •••• {method.last4}
                            </span>
                            {method.isDefault && (
                              <span
                                className="px-2 py-1 rounded text-xs font-bold"
                                style={{
                                  backgroundColor: colors.yellow,
                                  color: colors.darkBlue,
                                }}
                              >
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
                            onClick={() => {
                              setSavedPaymentMethods(
                                savedPaymentMethods.map((pm) => ({
                                  ...pm,
                                  isDefault: pm.id === method.id,
                                }))
                              );
                              alert("Default payment method updated!");
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Remove this payment method?")) {
                              setSavedPaymentMethods(
                                savedPaymentMethods.filter(
                                  (pm) => pm.id !== method.id
                                )
                              );
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
                  onClick={() => {
                    const newCard = {
                      id: (savedPaymentMethods.length + 1).toString(),
                      last4: "1234",
                      brand: "Mastercard",
                      expiry: "06/26",
                      isDefault: savedPaymentMethods.length === 0,
                    };
                    setSavedPaymentMethods([...savedPaymentMethods, newCard]);
                    alert(
                      "New card added! (In production, this would open Stripe payment form)"
                    );
                  }}
                  className="w-full py-3 rounded-lg font-bold border-2 border-dashed transition-all hover:bg-gray-50"
                  style={{ borderColor: colors.aqua, color: colors.darkBlue }}
                >
                  + Add New Payment Method
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Investment Panel - Right Side - Only show on Overview tab */}
        {activeTab === "overview" && (
          <div
            className="w-full lg:w-[420px] lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)] overflow-y-auto p-4 lg:flex-shrink-0"
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3
                className="text-xl font-bold mb-4 italic"
                style={{
                  fontFamily:
                    "Roboto Condensed, Impact, Arial Black, sans-serif",
                  fontWeight: "900",
                  fontStyle: "italic",
                  color: colors.darkBlue,
                }}
              >
                Grow Your Wild Portfolio
              </h3>

              {/* Location Selection */}
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: colors.darkBlue }}
                >
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
                  className="w-full p-2 border-2 rounded-lg"
                  style={{ borderColor: colors.aqua }}
                >
                  <option value="mansfield">Mansfield</option>
                  <option value="byron">Byron Bay (Coming Soon)</option>
                </select>
              </div>

              {/* Cabin Selection */}
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: colors.darkBlue }}
                >
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
                      <h4
                        className="font-bold text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        {cabin.name}
                      </h4>
                      <p
                        className="font-bold text-sm"
                        style={{ color: colors.yellow }}
                      >
                        ${cabin.price.toLocaleString()} plus GST
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Estimated ROI:{" "}
                          <span
                            className="font-bold"
                            style={{ color: colors.darkBlue }}
                          >
                            {key === "1BR"
                              ? "53.1%"
                              : key === "2BR"
                              ? "43.7%"
                              : "42.7%"}
                          </span>
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: "#10B981" }}
                        >
                          ~$
                          {key === "1BR"
                            ? "58,447"
                            : key === "2BR"
                            ? "74,355"
                            : "106,650"}
                          /year potential income
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              {floatingInvestmentData.selectedCabin && (
                <div className="mb-4">
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: colors.darkBlue }}
                  >
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
                          <span
                            className="text-sm"
                            style={{ color: colors.darkBlue }}
                          >
                            {extra.name}
                          </span>
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: colors.darkBlue }}
                        >
                          ${extra.price.toLocaleString()} plus GST
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {floatingInvestmentData.selectedCabin && (
                <div className="mb-4">
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <label
                      className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{
                        borderColor:
                          floatingInvestmentData.paymentMethod === "external"
                            ? colors.yellow
                            : colors.lightGray,
                      }}
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
                      <span
                        className="text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        Pay with Card/Bank Transfer
                      </span>
                    </label>
                    {userInvestments.length > 0 && (
                      <label
                        className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{
                          borderColor:
                            floatingInvestmentData.paymentMethod === "account"
                              ? colors.aqua
                              : colors.lightGray,
                        }}
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
                          <span
                            className="text-sm block"
                            style={{ color: colors.darkBlue }}
                          >
                            Use Wild Things Account Balance
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: colors.aqua }}
                          >
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
                    <div
                      className="mb-4 p-4 rounded-lg"
                      style={{ backgroundColor: `${colors.yellow}20` }}
                    >
                      <h4
                        className="font-bold mb-2"
                        style={{ color: colors.darkBlue }}
                      >
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
                              {[
                                { id: "insurance", price: 1200 },
                                { id: "maintenance", price: 800 },
                                { id: "furniture", price: 12000 },
                                { id: "appliances", price: 5000 },
                              ]
                                .filter((e) =>
                                  floatingInvestmentData.selectedExtras.includes(
                                    e.id
                                  )
                                )
                                .reduce((sum, e) => sum + e.price, 0)
                                .toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-bold">Holding Deposit:</span>
                          <span
                            className="font-bold"
                            style={{ color: colors.yellow }}
                          >
                            ${holdingDeposit}
                          </span>
                        </div>
                        {floatingInvestmentData.paymentMethod === "account" &&
                          userInvestments.length > 0 && (
                            <div className="flex justify-between mt-1">
                              <span
                                className="text-xs"
                                style={{ color: colors.aqua }}
                              >
                                Less: Wild Things Account Balance:
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: colors.aqua }}
                              >
                                -${amountFromAccount.toLocaleString()}
                              </span>
                            </div>
                          )}
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-bold">Amount Due Today:</span>
                          <span
                            className="font-bold"
                            style={{
                              color:
                                amountDueToday === 0
                                  ? colors.aqua
                                  : colors.darkBlue,
                            }}
                          >
                            ${amountDueToday.toLocaleString()}
                          </span>
                        </div>
                        {floatingInvestmentData.paymentMethod === "account" &&
                          userInvestments.length > 0 &&
                          wildThingsBalance < holdingDeposit && (
                            <div
                              className="mt-2 p-2 rounded"
                              style={{ backgroundColor: `${colors.aqua}20` }}
                            >
                              <p
                                className="text-xs"
                                style={{ color: colors.darkBlue }}
                              >
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
                            <div
                              className="mt-2 p-2 rounded"
                              style={{ backgroundColor: `${colors.aqua}20` }}
                            >
                              <p
                                className="text-xs"
                                style={{ color: colors.darkBlue }}
                              >
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
                className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: colors.yellow,
                  color: colors.darkBlue,
                }}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
