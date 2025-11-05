import React, { useState, useEffect } from "react";
import {
  cabins,
  calculateROI,
  defaultNightlyRates,
  getExtrasForCabin,
} from "../../config/mockCalculate";

type CabinType = "1BR" | "2BR" | "3BR";

interface InvestmentModalProps {
  showInvestmentModal: boolean;
  setShowInvestmentModal: (show: boolean) => void;
  selectedCabinForInvestment: string | null;
  setSelectedCabinForInvestment: (cabin: string | null) => void;
  floatingInvestmentData: {
    selectedExtras?: string[];
    paymentMethod?: string;
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
  const [investmentData, setInvestmentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "Mansfield",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

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
    const baseROI = calculateROI(cabinType, 66, defaultNightlyRates[cabinType], []);
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

  const handleInvestmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create investment account and process deposit
    console.log("Investment Account Created:", investmentData);
    console.log("Holding Deposit:", holdingDeposit);
    console.log("Balance Due:", balanceDue);
    console.log("Total Deposit:", calculateTotalDeposit());
    console.log("Cabin Type:", selectedCabinForInvestment);

    // Simulate account creation and login
    setIsLoggedIn(true);
    setShowInvestmentModal(false);

    // Add to user investments
    const newInvestment = {
      id: userInvestments.length + 1,
      cabinType: selectedCabinForInvestment,
      location: investmentData.location,
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: selectedCabin?.price || 0,
      currentValue: selectedCabin?.price || 0,
      totalIncome: 0,
      monthlyIncome: 0,
      status: "Pending Build",
      nextPayment: "Build Complete (30%)",
    };
    setUserInvestments([...userInvestments, newInvestment]);

    // Redirect to investor portal
    setCurrentPage("investor-portal");
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

        {/* Cabin Image and Details */}
        <div className="mb-6">
          <img
            src={selectedCabin.image}
            alt={selectedCabin.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
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
                Holding Deposit
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: colors.yellow }}
              >
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

        {/* Extras Selection */}
        <div className="mb-6">
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: colors.darkBlue }}
          >
            Optional Investment Extras
          </h3>
          <div className="space-y-3">
            {extras.map((extra) => (
              <div key={extra.id}>
                <label
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border-2"
                  style={{
                    backgroundColor: selectedExtras[extra.id]
                      ? `${colors.yellow}20`
                      : "white",
                    borderColor: selectedExtras[extra.id]
                      ? colors.yellow
                      : colors.aqua,
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedExtras[extra.id] || false}
                      onChange={() => toggleExtra(extra.id)}
                      className="w-5 h-5"
                      style={{ accentColor: colors.yellow }}
                    />
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
                </label>

                {/* Furniture Package Details - Unfurl when selected */}
                {extra.id === "furniture" &&
                  selectedExtras[extra.id] &&
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
                        {(extra as any).items.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span style={{ color: colors.aqua }}>✓</span>
                            <span style={{ color: colors.darkBlue }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleInvestmentSubmit}>
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

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.darkBlue }}
            >
              Preferred Location
            </label>
            <select
              value={investmentData.location}
              onChange={(e) =>
                setInvestmentData({
                  ...investmentData,
                  location: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86DBDF]"
              required
            >
              <option value="Mansfield">Mansfield, Victoria</option>
              <option value="Byron Bay">Byron Bay, NSW</option>
            </select>
          </div>

          {/* Account Creation Fields */}
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: `${colors.aqua}10`,
              border: `1px solid ${colors.aqua}`,
            }}
          >
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
                  <span
                    className="font-medium"
                    style={{ color: colors.aqua }}
                  >
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

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{
                backgroundColor: colors.yellow,
                color: colors.darkBlue,
              }}
            >
              Pay Holding Deposit
            </button>
            <button
              type="button"
              onClick={() => setShowInvestmentModal(false)}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{
                backgroundColor: colors.darkBlue,
                color: colors.white,
              }}
            >
              Cancel Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};