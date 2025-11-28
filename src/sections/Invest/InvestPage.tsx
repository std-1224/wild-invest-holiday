import React, { useState, useEffect, useRef } from "react";
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
import { ROICalculator } from "../../components/ROICalculator";
import { CabinDetailPage } from "../CabinDetailPage";
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
  const [selectedCabinForDeposit, setSelectedCabinForDeposit] =
    useState<any>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showSiteSelector, setShowSiteSelector] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [locationSiteCounts, setLocationSiteCounts] = useState<
    Record<string, number>
  >({});
  const [showCabinDetail, setShowCabinDetail] = useState(false);
  const [selectedCabinType, setSelectedCabinType] = useState<CabinType | null>(
    null
  );

  // Video refs for autoplay management
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Setup IntersectionObserver for video autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          video.play().catch((error) => {
            console.log("Video autoplay failed:", error);
          });
        });
      },
      {
        threshold: 0.1, // Video must be at least 50% visible
      }
    );

    // Observe all video elements
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        observer.observe(video);
        // Also try to play immediately on mount if visible
        video.play().catch((error) => {
          console.log("Initial video autoplay failed:", error);
        });
      }
    });

    return () => {
      // Cleanup observer
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          observer.unobserve(video);
        }
      });
    };
  }, []); // Run once on mount

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await apiClient.getLocations();
        if (response.success && response.locations) {
          setLocations(response.locations);
        }
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    };
    loadLocations();
  }, []);

  // Load available site counts for each location when location selector is shown
  useEffect(() => {
    if (showLocationSelector && selectedCabinForDeposit) {
      const loadSiteCounts = async () => {
        const counts: Record<string, number> = {};

        // Fetch available sites count for each active location
        for (const location of locations.filter(
          (loc: any) => loc.status === "active"
        )) {
          try {
            const response = await apiClient.getAvailableSites(
              location._id,
              selectedCabinForDeposit.cabinType
            );
            if (response.success) {
              counts[location._id] = response.count || 0;
            }
          } catch (error) {
            console.error(
              `Failed to load site count for ${location.name}:`,
              error
            );
            counts[location._id] = 0;
          }
        }

        setLocationSiteCounts(counts);
      };

      loadSiteCounts();
    }
  }, [showLocationSelector, selectedCabinForDeposit, locations]);

  const handleCabinTypeChange = (newCabinType: CabinType) => {
    setRoiInputs({
      ...roiInputs,
      cabinType: newCabinType,
      nightlyRate:
        defaultNightlyRates[newCabinType as keyof typeof defaultNightlyRates],
    });
    setSelectedExtras([]); // Clear selected extras when changing cabin type
  };

  // Show cabin detail page if a cabin is selected
  if (showCabinDetail && selectedCabinType) {
    return (
      <CabinDetailPage
        cabinType={selectedCabinType}
        onBack={() => {
          setShowCabinDetail(false);
          setSelectedCabinType(null);
        }}
        onSuccess={() => {
          setShowCabinDetail(false);
          setSelectedCabinType(null);
          onInvest({ cabinType: selectedCabinType });
        }}
        cabin={cabins[selectedCabinType]}
        roiInputs={roiInputs}
        setRoiInputs={setRoiInputs}
      />
    );
  }

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
                          ref={(el) => {
                            videoRefs.current["3BR"] = el;
                          }}
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
                          ref={(el) => {
                            videoRefs.current["1BR"] = el;
                          }}
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
                          ref={(el) => {
                            videoRefs.current["2BR"] = el;
                          }}
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
                          setSelectedCabinType(key as CabinType);
                          setShowCabinDetail(true);
                          setRoiInputs({
                            ...roiInputs,
                            cabinType: key as CabinType,
                          });
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
            <ROICalculator
              cabinType={roiInputs.cabinType}
              selectedExtras={selectedExtras}
              onExtrasChange={setSelectedExtras}
              showCabinSelector={true}
              onCabinTypeChange={handleCabinTypeChange}
              occupancyRate={roiInputs.occupancyRate}
              onOccupancyRateChange={(rate) =>
                setRoiInputs({ ...roiInputs, occupancyRate: rate })
              }
              nightlyRate={roiInputs.nightlyRate}
              onNightlyRateChange={(rate) =>
                setRoiInputs({ ...roiInputs, nightlyRate: rate })
              }
              cabin={cabins[roiInputs.cabinType]}
              onReserve={() => {
                setSelectedCabinForInvestment(roiInputs.cabinType);
                setSelectedCabinForDeposit({
                  id: roiInputs.cabinType,
                  ...cabins[roiInputs.cabinType],
                  cabinType: roiInputs.cabinType,
                  totalAmount: calculateROI(
                    roiInputs.cabinType,
                    roiInputs.occupancyRate,
                    roiInputs.nightlyRate,
                    selectedExtras
                  ).totalInvestment,
                  selectedExtras: selectedExtras,
                });

                // Also set floatingInvestmentData for InvestmentModal
                if (setFloatingInvestmentData) {
                  setFloatingInvestmentData({
                    selectedExtras: selectedExtras,
                    paymentMethod: "external",
                  });
                }

                // Reset selections and show location selector first
                setSelectedLocation(null);
                setSelectedSite(null);
                setShowLocationSelector(true);
              }}
            />
          </div>
        </div>
      </div>
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
      <InvestFaqs />

      {/* Location Selection Modal - Step 1 */}
      {showLocationSelector && selectedCabinForDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
              📍 Step 1: Select Your Location
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Choose the location where you'd like to invest in a cabin.
            </p>

            {/* Summary of selections */}
            <div className="bg-[#86dbdf]/10 border border-[#86dbdf] rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Cabin Type:</p>
                  <p className="font-bold text-[#0e181f]">
                    {selectedCabinForDeposit.cabinType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Total Investment:</p>
                  <p className="font-bold text-[#0e181f]">
                    ${selectedCabinForDeposit.totalAmount.toLocaleString()}
                  </p>
                </div>
                {selectedCabinForDeposit.selectedExtras &&
                  selectedCabinForDeposit.selectedExtras.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-gray-600 mb-1">Selected Extras:</p>
                      <p className="font-bold text-[#0e181f]">
                        {selectedCabinForDeposit.selectedExtras
                          .map((extraId: string) => {
                            const extra = getExtrasForCabin(
                              selectedCabinForDeposit.cabinType
                            ).find((e) => e.id === extraId);
                            return extra?.name;
                          })
                          .join(", ")}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {locations
                .filter((loc: any) => loc.status === "active")
                .map((location: any) => {
                  const availableCount = locationSiteCounts[location._id];
                  const isLoading = availableCount === undefined;

                  return (
                    <button
                      key={location._id}
                      onClick={() => setSelectedLocation(location)}
                      className={`p-6 rounded-lg border-2 transition-all text-left hover:scale-[1.02] ${
                        selectedLocation?._id === location._id
                          ? "border-[#ec874c] bg-[#ec874c]/10"
                          : "border-gray-300 bg-white hover:border-[#86dbdf]"
                      }`}
                    >
                      <h3 className="text-xl font-bold text-[#0e181f] mb-2">
                        {location.name}
                      </h3>
                      {location.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {location.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-3 py-1 bg-[#86dbdf]/20 text-[#0e181f] rounded-full font-semibold flex items-center gap-2">
                          {isLoading ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-[#0e181f]"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </>
                          ) : (
                            `${availableCount} ${
                              selectedCabinForDeposit.cabinType
                            } ${
                              availableCount === 1 ? "site" : "sites"
                            } available`
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>

            {locations.filter((loc: any) => loc.status === "active").length ===
              0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  No active locations available at the moment. Please contact us
                  for more information.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLocationSelector(false);
                  setSelectedCabinForDeposit(null);
                  setSelectedLocation(null);
                }}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              {selectedLocation && (
                <button
                  onClick={() => {
                    setShowLocationSelector(false);
                    setShowSiteSelector(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-[#ffcf00] text-[#0e181f] hover:opacity-90"
                >
                  Continue to Site Selection →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Site Selection Modal - Step 2 */}
      {showSiteSelector && selectedCabinForDeposit && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
              🗺️ Step 2: Select Your Site Number
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Choose your preferred site number at {selectedLocation.name}. Each
              site has a specific location within the park.
            </p>

            {/* Summary of selections */}
            <div className="bg-[#86dbdf]/10 border border-[#86dbdf] rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Location:</p>
                  <p className="font-bold text-[#0e181f]">
                    {selectedLocation.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Cabin Type:</p>
                  <p className="font-bold text-[#0e181f]">
                    {selectedCabinForDeposit.cabinType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Total Investment:</p>
                  <p className="font-bold text-[#0e181f]">
                    ${selectedCabinForDeposit.totalAmount.toLocaleString()}
                  </p>
                </div>
                {selectedCabinForDeposit.selectedExtras &&
                  selectedCabinForDeposit.selectedExtras.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-gray-600 mb-1">Selected Extras:</p>
                      <p className="font-bold text-[#0e181f]">
                        {selectedCabinForDeposit.selectedExtras
                          .map((extraId: string) => {
                            const extra = getExtrasForCabin(
                              selectedCabinForDeposit.cabinType
                            ).find((e) => e.id === extraId);
                            return extra?.name;
                          })
                          .join(", ")}
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

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowSiteSelector(false);
                  setSelectedSite(null);
                  setShowLocationSelector(true);
                }}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                ← Back to Locations
              </button>
              {selectedSite && (
                <button
                  onClick={() => {
                    setShowSiteSelector(false);
                    setShowHoldingDepositModal(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-[#ffcf00] text-[#0e181f] hover:opacity-90"
                >
                  Continue to Deposit Payment →
                </button>
              )}
            </div>
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
