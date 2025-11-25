import React, { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import {
  cabins,
  calculateROI,
  defaultNightlyRates,
  getExtrasForCabin,
} from "../../config/mockCalculate";
import { InvestTimeline } from "../../components/InvestTimeline";
import { InvestFaqs } from "../../components/InvestFaqs";
import { CalendlyButton } from "../../components/CalendlyButton";
import { HoldingDepositModal } from "../../components/Modals/HoldingDepositModal";
import { SiteSelector } from "../../components/SiteSelector";
import apiClient from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

type CabinType = "1BR" | "2BR";

interface HolidayHomesProps {
  onInvest: (cabin: any) => void;
  setSelectedCabinForInvestment: (value: string) => void;
  setFloatingInvestmentData?: (data: any) => void;
  setShowInvestmentModal?: (show: boolean) => void;
}

export const InvestPage: React.FC<HolidayHomesProps> = ({
  onInvest,
  setSelectedCabinForInvestment,
  setFloatingInvestmentData,
  setShowInvestmentModal,
}) => {
  const { login } = useAuth(); // Get login function from auth context
  const [roiInputs, setRoiInputs] = useState<{
    cabinType: CabinType;
    occupancyRate: number;
    nightlyRate: number;
  }>({
    cabinType: "1BR",
    occupancyRate: 70,
    nightlyRate: 220,
  });
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showHoldingDepositModal, setShowHoldingDepositModal] = useState(false);
  const [selectedCabinForDeposit, setSelectedCabinForDeposit] = useState<any>(null);
  const [expandedExtras, setExpandedExtras] = useState<Record<string, boolean>>({});
  const [showSiteSelector, setShowSiteSelector] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await apiClient.getLocations();
        if (response.success && response.locations) {
          setLocations(response.locations);
          // Auto-select first active location
          const activeLocation = response.locations.find((loc: any) => loc.status === 'active');
          if (activeLocation) {
            setSelectedLocation(activeLocation);
          }
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };
    loadLocations();
  }, []);

  const handleCabinTypeChange = (newCabinType: CabinType) => {
    setRoiInputs({
      ...roiInputs,
      cabinType: newCabinType,
      nightlyRate:
        defaultNightlyRates[newCabinType as keyof typeof defaultNightlyRates],
    });
    setSelectedExtras([]); // Clear selected extras when changing cabin type
  };

  const roiResults = calculateROI(
    roiInputs.cabinType,
    roiInputs.occupancyRate,
    roiInputs.nightlyRate,
    selectedExtras
  );

  return (
    <div className="pt-20 min-h-screen w-full max-w-full overflow-x-hidden bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-5xl md:text-6xl font-black mb-4 text-center italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
          INVEST IN A HOLIDAY HOME
        </h1>
        <p className="text-xl text-center text-gray-700 mb-12 max-w-3xl mx-auto">
          Invest in your own piece of paradise. Earn passive income while
          providing families with unforgettable outdoor experiences.
        </p>

        {/* Investment Timeline */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <InvestTimeline />
          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <CalendlyButton
                url="https://calendly.com/jameswildthings"
                text="Book an Inspection"
                variant="orange"
                size="lg"
                eventType="inspection"
                source="invest_page"
              />
              <button
                onClick={() => document.getElementById("chat-widget")?.click()}
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 bg-[#86dbdf] text-[#0e181f]"
              >
                💬 Chat with James
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start flex-wrap">
          <div className="flex-[1_1_600px] min-w-[300px]">
            <div className="space-y-8 mb-8">
              {Object.entries(cabins).map(([key, cabin]) => (
                <div
                  key={key}
                  className="bg-white rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {key === "3BR" ? (
                      <div className="relative w-full h-full min-h-[320px]">
                        <video
                          src="/3br-cabin-video.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          webkit-playsinline="true"
                          preload="metadata"
                          className="w-full h-full object-cover min-h-[320px]"
                        />
                      </div>
                    ) : key === "1BR" ? (
                      <div className="relative w-full h-full min-h-[320px]">
                        <video
                          src="/1BR Motion.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          webkit-playsinline="true"
                          preload="metadata"
                          className="w-full h-full object-cover min-h-[320px]"
                        />
                      </div>
                    ) : key === "2BR" ? (
                      <div className="relative w-full h-full min-h-[320px]">
                        <video
                          src="/2BR Motion.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          webkit-playsinline="true"
                          preload="metadata"
                          className="w-full h-full object-cover min-h-[320px]"
                        />
                      </div>
                    ) : (
                      <img
                        src={cabin.image}
                        alt={cabin.name}
                        className="w-full h-full object-cover min-h-[320px]"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-black mb-2 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                        {cabin.name.toUpperCase()}
                      </h3>
                      <div className="text-3xl font-bold mb-4 text-[#ffcf00]">
                        ${cabin.price.toLocaleString("en-AU")}
                        <span className="text-sm ml-2 text-[#0e181f]">
                           + GST
                        </span>
                      </div>

                      <div className="mb-4 p-3 rounded-lg bg-[#86dbdf]/[0.2]">
                        <h4 className="font-bold text-sm mb-2 text-[#0e181f]">
                          Rental Rates:
                        </h4>
                        <div className="text-sm space-y-1 text-[#0e181f]">
                          <div className="flex justify-between">
                            <span>Off Peak:</span>
                            <span className="font-bold text-[#0e181f]">
                              ${cabin.rentOffPeak}/night
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peak{key === "3BR" ? " (snow)" : ""}:</span>
                            <span className="font-bold text-[#0e181f]">
                              ${cabin.rentPeak}/night
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-[#0e181f]">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#86dbdf] mr-2"></div>
                          <span>${cabin.siteFee} + GST site fee per week</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#86dbdf] mr-2"></div>
                          <span>20% management fee</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          // Scroll to ROI calculator to select extras and site
                          const roiCalculator = document.querySelector('.md\\:sticky');
                          if (roiCalculator) {
                            roiCalculator.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          // Set the cabin type in ROI calculator
                          handleCabinTypeChange(key as CabinType);
                        }}
                        className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 mb-2 bg-[#ffcf00] text-[#0e181f]"
                      >
                        Reserve Yours Today
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:sticky md:w-auto flex-[0_0_auto] min-w-[300px] md:top-[100px] max-w-full">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center mb-6">
                <Calculator size={28} className="text-[#ffcf00] mr-3" />
                <h2 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                  ROI CALCULATOR
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                    Cabin Type
                  </label>
                  <div className="space-y-2">
                    {Object.entries(cabins).map(([key, cabin]) => {
                      const cabinKey = key as CabinType;
                      return (
                        <div
                          key={key}
                          onClick={() => handleCabinTypeChange(cabinKey)}
                          className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                            roiInputs.cabinType === (key as CabinType)
                              ? "border-[3px] border-[#ffcf00] shadow-[0_4px_12px_rgba(255,207,0,0.3)]"
                              : "border-[3px] border-[#86dbdf]"
                          }`}
                        >
                          <div className="flex items-center gap-3 p-2">
                            <img
                              src={cabin.image}
                              alt={cabin.name}
                              className="w-20 h-[60px] object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-bold text-sm text-[#0e181f]">
                                {cabin.name}
                              </div>
                              <div className="text-base font-bold text-[#ffcf00]">
                                ${cabin.price.toLocaleString("en-AU")} + GST
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                    Occupancy Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={roiInputs.occupancyRate || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : parseFloat(e.target.value);
                      setRoiInputs({
                        ...roiInputs,
                        occupancyRate:
                          value === "" ? 0 : isNaN(value) ? 0 : value,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none border-2 border-[#86dbdf]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                    Nightly Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roiInputs.nightlyRate || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : parseFloat(e.target.value);
                      setRoiInputs({
                        ...roiInputs,
                        nightlyRate:
                          value === "" ? 0 : isNaN(value) ? 0 : value,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none border-2 border-[#86dbdf]"
                  />
                </div>
              </div>

              {/* Optional Extras Selection */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-[#0e181f]">
                  Optional Extras
                </h3>
                <div className="space-y-2">
                  {getExtrasForCabin(roiInputs.cabinType).map((extra) => {
                      const isExpanded = expandedExtras[extra.id] || false;

                      return (
                        <div
                          key={extra.id}
                          className={`rounded-lg border-2 transition-all ${
                            selectedExtras.includes(extra.id)
                              ? "bg-[#ffcf00]/[0.2] border-[#ffcf00]"
                              : "bg-[#f5f5f5] border-transparent"
                          }`}
                        >
                          <label className="flex items-center gap-3 p-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedExtras.includes(extra.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedExtras([...selectedExtras, extra.id]);
                                } else {
                                  setSelectedExtras(
                                    selectedExtras.filter((id) => id !== extra.id)
                                  );
                                }
                              }}
                              className="w-5 h-5"
                            />
                            <div className="flex-1">
                              {(() => {
                                const base = calculateROI(
                                  roiInputs.cabinType,
                                  roiInputs.occupancyRate,
                                  roiInputs.nightlyRate,
                                  []
                                );
                                const withExtra = calculateROI(
                                  roiInputs.cabinType,
                                  roiInputs.occupancyRate,
                                  roiInputs.nightlyRate,
                                  [extra.id]
                                );
                                const roiImpact =
                                  (withExtra.roi || 0) - (base.roi || 0);
                                return (
                                  <>
                                    <div className="font-bold text-sm text-[#0e181f]">
                                      {extra.name}
                                    </div>
                                    <div className="text-xs text-[#ec874c]">
                                      {extra.impactDescription}
                                    </div>
                                    {roiImpact > 0.01 && (
                                      <div className="text-xs mt-1 text-[#059669]">
                                        ROI Impact: +{roiImpact.toFixed(1)}%
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="font-bold text-sm text-[#0e181f]">
                                ${extra.price.toLocaleString()}
                              </div>
                              {(extra as any).items && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setExpandedExtras({
                                      ...expandedExtras,
                                      [extra.id]: !isExpanded,
                                    });
                                  }}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {isExpanded ? "Hide" : "Show"} details
                                </button>
                              )}
                            </div>
                          </label>

                          {/* Pack Details */}
                          {isExpanded && (extra as any).items && (
                            <div className="px-3 pb-3 pt-0">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs font-semibold text-[#0e181f] mb-2">
                                  What's included:
                                </p>
                                <ul className="text-xs text-gray-700 space-y-1">
                                  {(extra as any).items.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-[#ffcf00] mt-0.5">✓</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Dynamic Pricing Display */}
              <div className="rounded-lg p-4 mb-4 bg-[#ffcf00]/[0.2] border-2 border-[#ffcf00]">
                <h3 className="font-bold mb-3 text-sm text-[#0e181f]">
                  Dynamic Nightly Rate
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Rate ({roiInputs.cabinType}):</span>
                    <span className="font-bold">
                      ${defaultNightlyRates[roiInputs.cabinType]}
                    </span>
                  </div>
                  {selectedExtras.length > 0 && (
                    <div className="flex justify-between text-[#ec874c]">
                      <span>Options Impact:</span>
                      <span className="font-bold">
                        +${roiResults.extrasNightlyImpact.toFixed(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] font-bold">
                    <span>Final Rate:</span>
                    <span className="text-[#0e181f]">
                      ${roiResults.effectiveNightlyRate.toFixed(0)}/night
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Investment Display */}
              <div className="rounded-lg p-4 mb-4 bg-[#86dbdf]/[0.2]">
                <h3 className="font-bold mb-3 text-sm text-[#0e181f]">
                  Total Investment
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Cabin Price:</span>
                    <span className="font-bold">
                      ${cabins[roiInputs.cabinType].price.toLocaleString()}
                    </span>
                  </div>
                  {roiResults.extrasCost > 0 && (
                    <div className="flex justify-between text-[#ec874c]">
                      <span>Selected Extras:</span>
                      <span className="font-bold">
                        +${roiResults.extrasCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] font-bold">
                    <span>Total:</span>
                    <span className="text-[#0e181f]">
                      ${roiResults.totalInvestment.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 mb-4 bg-[#86dbdf]/[0.2]">
                <h3 className="font-bold mb-3 text-sm text-[#0e181f]">
                  Annual Revenue
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gross Revenue:</span>
                    <span className="font-bold">
                      $
                      {roiResults.grossAnnualRevenue.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      + GST
                    </span>
                  </div>
                  <div className="flex justify-between text-[#ec874c]">
                    <span>Management (20%):</span>
                    <span className="font-bold">
                      -$
                      {roiResults.wildThingsCommissionAmount.toLocaleString(
                        "en-AU",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#ec874c]">
                    <span>Site Fee:</span>
                    <span className="font-bold">
                      -$
                      {roiResults.siteFees.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#ec874c]">
                    <span>Energy Costs:</span>
                    <span className="font-bold">
                      -$
                      {roiResults.energyCosts.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  {(roiResults as any).annualCostSavings > 0 && (
                    <div className="flex justify-between text-[#059669]">
                      <span>Cost Savings (Solar):</span>
                      <span className="font-bold">
                        +$
                        {(
                          roiResults as any
                        ).annualCostSavings?.toLocaleString?.("en-AU") ?? "0"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] text-[#059669] font-bold">
                    <span>Net Income:</span>
                    <span>
                      $
                      {roiResults.annualProfit.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center bg-[#ec874c] rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-1 text-sm text-white">
                  Estimated Annual ROI
                </h3>
                <div className="text-4xl font-bold text-white">
                  {roiResults.roi.toFixed(2)}%
                </div>
                {roiResults.extrasCost > 0 && (
                  <p className="text-xs mt-2 text-white">
                    Based on ${roiResults.totalInvestment.toLocaleString()}{" "}
                    total investment
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedCabinForInvestment(roiInputs.cabinType);
                  setSelectedCabinForDeposit({
                    id: roiInputs.cabinType,
                    ...cabins[roiInputs.cabinType],
                    cabinType: roiInputs.cabinType,
                    totalAmount: roiResults.totalInvestment,
                    selectedExtras: selectedExtras,
                  });

                  // Also set floatingInvestmentData for InvestmentModal
                  if (setFloatingInvestmentData) {
                    setFloatingInvestmentData({
                      selectedExtras: selectedExtras,
                      paymentMethod: "external",
                    });
                  }

                  setShowSiteSelector(true);
                }}
                className="w-full py-4 rounded-lg font-bold transition-all hover:opacity-90 mb-4 bg-[#ffcf00] text-[#0e181f] text-lg"
              >
                Select Site & Reserve →
              </button>

              <p className="text-xs text-gray-600 italic">
                * High-level estimate. Insurance, interest, maintenance not
                included.
              </p>
            </div>
          </div>
        </div>
      </div>
      <InvestFaqs />

      {/* Site Selection Modal */}
      {showSiteSelector && selectedCabinForDeposit && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
              🗺️ Step 1: Select Your Site Location
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Choose your preferred site number at {selectedLocation.name}. Each site has a specific location within the park.
            </p>

            {/* Summary of selections */}
            <div className="bg-[#86dbdf]/10 border border-[#86dbdf] rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Cabin Type:</p>
                  <p className="font-bold text-[#0e181f]">{selectedCabinForDeposit.cabinType}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Total Investment:</p>
                  <p className="font-bold text-[#0e181f]">${selectedCabinForDeposit.totalAmount.toLocaleString()}</p>
                </div>
                {selectedCabinForDeposit.selectedExtras && selectedCabinForDeposit.selectedExtras.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-gray-600 mb-1">Selected Extras:</p>
                    <p className="font-bold text-[#0e181f]">
                      {selectedCabinForDeposit.selectedExtras.map((extraId: string) => {
                        const extra = getExtrasForCabin(selectedCabinForDeposit.cabinType).find(e => e.id === extraId);
                        return extra?.name;
                      }).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <SiteSelector
              locationId={selectedLocation._id}
              cabinType={selectedCabinForDeposit.cabinType}
              onSiteSelect={(site) => {
                setSelectedSite(site);
              }}
              selectedSiteId={selectedSite?._id}
            />

            {selectedSite && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowSiteSelector(false);
                    setSelectedSite(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSiteSelector(false);
                    setShowHoldingDepositModal(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-[#ffcf00] text-[#0e181f] hover:opacity-90"
                >
                  Continue to Deposit Payment →
                </button>
              </div>
            )}

            {!selectedSite && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowSiteSelector(false);
                    setSelectedCabinForDeposit(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Holding Deposit Modal */}
      {selectedCabinForDeposit && showHoldingDepositModal && (
        <HoldingDepositModal
          isOpen={showHoldingDepositModal}
          onClose={() => {
            setShowHoldingDepositModal(false);
            setSelectedCabinForDeposit(null);
            setSelectedSite(null);
          }}
          onSuccess={() => {
            setShowHoldingDepositModal(false);
            // Redirect to investor portal after successful payment
            onInvest(selectedCabinForDeposit);
          }}
          onLogin={login}
          cabinType={selectedCabinForDeposit.cabinType}
          location={selectedLocation?.name || "Wild Things Cabin Park"}
          totalAmount={selectedCabinForDeposit.totalAmount}
          selectedExtras={selectedCabinForDeposit.selectedExtras || []}
          selectedSite={selectedSite}
          siteMapUrl={selectedLocation?.siteMapUrl || null}
        />
      )}
    </div>
  );
};
