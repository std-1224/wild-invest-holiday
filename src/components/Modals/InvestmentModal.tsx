import { useState } from "react";
import {
  calculateROI,
  getAvailableExtrasForCabin,
} from "../../config/mockCalculate";

// Investment Modal Component - Tesla-style design
export const InvestmentModal = ({ cabin, onClose, onInvest }: any) => {
  type CabinType = "1BR" | "2BR" | "3BR";

  const [selectedCabinType, setSelectedCabinType] = useState<CabinType>(
    (cabin.id as CabinType) || "1BR"
  );
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [financingType, setFinancingType] = useState<"paid" | "financed">(
    "paid"
  );
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [occupancyRate, setOccupancyRate] = useState<number>(66);
  const [nightlyRate, setNightlyRate] = useState<number>(200);

  const availableExtras = getAvailableExtrasForCabin(selectedCabinType);
  const roi = calculateROI(
    selectedCabinType,
    occupancyRate,
    nightlyRate,
    selectedExtras,
    financingType,
    depositAmount
  );

  const cabinFeatures: Record<"1BR" | "2BR" | "3BR", string[]> = {
    "1BR": [
      "1 Bedroom",
      "1 Bathroom",
      "Kitchenette",
      "Living Area",
      "Outdoor Deck",
      "Parking",
    ],
    "2BR": [
      "2 Bedrooms",
      "1 Bathroom",
      "Full Kitchen",
      "Living Area",
      "Outdoor Deck",
      "Parking",
    ],
    "3BR": [
      "3 Bedrooms",
      "2 Bathrooms",
      "Full Kitchen",
      "Living Area",
      "Outdoor Deck",
      "Parking",
      "Laundry",
    ],
  };

  const cabinPrices: Record<"1BR" | "2BR" | "3BR", number> = {
    "1BR": 110000,
    "2BR": 135000,
    "3BR": 160000,
  };

  const cabinImages: Record<"1BR" | "2BR" | "3BR", string> = {
    "1BR": "/1BR.jpg",
    "2BR": "/2BR.jpg",
    "3BR": "/3BR.jpg",
  };

  const cabinVideos: Record<"1BR" | "2BR" | "3BR", string> = {
    "1BR": "/1br-cabin-video.mp4",
    "2BR": "/2BR.mp4",
    "3BR": "/3br-cabin-video.mp4",
  };

  const handleCabinTypeChange = (newCabinType: "1BR" | "2BR" | "3BR") => {
    setSelectedCabinType(newCabinType);
    setSelectedExtras([]); // Clear extras when changing cabin type
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex flex-col z-[100]">
      {/* Main Content Area - Scrollable */}
      <div className="bg-white flex-1 overflow-y-auto pb-[180px]">
        <div className="max-w-[1200px] mx-auto p-8">
          <button
            onClick={onClose}
            className="fixed top-4 right-4 bg-white border-2 border-[#86dbdf] rounded-full w-10 h-10 text-2xl cursor-pointer text-[#666] z-[101] flex items-center justify-center"
          >
            ×
          </button>

          <h2 className="text-5xl font-black italic text-[#0e181f] mb-12 text-center font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            INVEST IN A HOLIDAY HOME
          </h2>

          {/* Cabin Selection Cards - Tesla Style */}
          <div className="mb-16">
            <h3 className="text-[1.75rem] font-bold text-[#0e181f] mb-8 text-center">
              Select Your Cabin
            </h3>
            <div className="flex flex-col gap-6">
              {(["1BR", "2BR", "3BR"] as CabinType[]).map((cabinType) => (
                <div
                  key={cabinType}
                  onClick={() => handleCabinTypeChange(cabinType)}
                  className={`rounded-2xl p-8 cursor-pointer transition-all duration-300 grid grid-cols-[300px_1fr] gap-8 items-center ${
                    selectedCabinType === cabinType
                      ? "bg-[#ffcf00] border-4 border-[#0e181f]"
                      : "bg-white border-2 border-[#86dbdf]"
                  }`}
                >
                  <video
                    src={cabinVideos[cabinType]}
                    poster={cabinImages[cabinType]}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    className="w-full h-[200px] object-cover rounded-xl transition-all duration-300 cursor-pointer bg-black"
                    onMouseEnter={(e) => {
                      try {
                        e.currentTarget.play();
                      } catch (_) {}
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      try {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      } catch (_) {}
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onError={(e) => {
                      // Hide video if it fails; poster still shows
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div>
                    <h4 className="text-[2rem] font-black italic text-[#0e181f] mb-4 font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                      {cabinType === "1BR"
                        ? "1 BEDROOM CABIN"
                        : cabinType === "2BR"
                        ? "2 BEDROOM CABIN"
                        : "3 BEDROOM CABIN"}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-[0.85rem] text-[#666] mb-1">
                          Price
                        </div>
                        <div className="text-2xl font-bold text-[#0e181f]">
                          ${cabinPrices[cabinType].toLocaleString("en-AU")}
                        </div>
                        <div className="text-xs text-[#666]">
                          plus GST
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.85rem] text-[#666] mb-1">
                          Typical Nightly Rate
                        </div>
                        <div className="text-2xl font-bold text-[#0e181f]">
                          ${nightlyRate}
                        </div>
                        <div className="text-xs text-[#666]">
                          per night
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.85rem] text-[#666] mb-1">
                          Occupancy Rate
                        </div>
                        <div className="text-2xl font-bold text-[#0e181f]">
                          {roi.effectiveOccupancyRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-[#666]">
                          {roi.occupancyBoost > 0 &&
                            `(+${roi.occupancyBoost}% boost)`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.85rem] text-[#666] mb-1">
                          Projected Annual ROI
                        </div>
                        <div className="text-2xl font-bold text-[#ffcf00]">
                          {roi.roi.toFixed(1)}%
                        </div>
                        <div className="text-xs text-[#666]">
                          annual return
                        </div>
                      </div>
                    </div>
                    {selectedCabinType === cabinType && (
                      <div className="mt-4">
                        <div className="text-[0.85rem] text-[#666] mb-2">
                          Features:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cabinFeatures[cabinType]?.map((feature, index) => (
                            <span
                              key={index}
                              className="bg-[#86dbdf] text-[#0e181f] py-1.5 px-3 rounded-md text-[0.85rem] font-medium"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Calculator Inputs - Stacked Vertically */}
          <div className="mb-16">
            <h3 className="text-[1.75rem] font-bold text-[#0e181f] mb-8 text-center">
              Configure Your Investment
            </h3>

            <div className="flex flex-col gap-6">
              {/* Nightly Rate */}
              <div className="bg-[#f9f9f9] rounded-xl p-6 border border-[#eee]">
                <label className="block mb-3 font-semibold text-base text-[#0e181f]">
                  Typical Nightly Rental Amount ($)
                </label>
                <input
                  type="number"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(parseInt(e.target.value))}
                  className="w-full p-4 border-2 border-[#86dbdf] rounded-lg text-[1.1rem] font-semibold"
                />
              </div>

              {/* Occupancy Rate */}
              <div className="bg-[#f9f9f9] rounded-xl p-6 border border-[#eee]">
                <label className="block mb-3 font-semibold text-base text-[#0e181f]">
                  Base Occupancy Rate (%)
                </label>
                <input
                  type="number"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(parseInt(e.target.value))}
                  className="w-full p-4 border-2 border-[#86dbdf] rounded-lg text-[1.1rem] font-semibold"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-[#f9f9f9] rounded-xl p-6 border border-[#eee]">
                <label className="block mb-3 font-semibold text-base text-[#0e181f]">
                  Payment Method
                </label>
                <select
                  value={financingType}
                  onChange={(e) =>
                    setFinancingType(e.target.value as "paid" | "financed")
                  }
                  className="w-full p-4 border-2 border-[#86dbdf] rounded-lg text-[1.1rem] font-semibold"
                >
                  <option value="paid">Fully Paid</option>
                  <option value="financed">Financed</option>
                </select>
              </div>

              {/* Deposit Amount */}
              {financingType === "financed" && (
                <div className="bg-[#f9f9f9] rounded-xl p-6 border border-[#eee]">
                  <label className="block mb-3 font-semibold text-base text-[#0e181f]">
                    Deposit Amount ($)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseInt(e.target.value))}
                    className="w-full p-4 border-2 border-[#86dbdf] rounded-lg text-[1.1rem] font-semibold"
                    placeholder="Enter deposit amount"
                  />
                </div>
              )}

              {/* Premium Extras */}
              <div className="bg-[#f9f9f9] rounded-xl p-6 border border-[#eee]">
                <label className="block mb-3 font-semibold text-base text-[#0e181f]">
                  Premium Extras
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {availableExtras.map((extra) => (
                    <label
                      key={extra.id}
                      className={`flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedExtras.includes(extra.id)
                          ? "bg-[#ffcf00] border-2 border-[#0e181f]"
                          : "bg-white border-2 border-[#86dbdf]"
                      }`}
                    >
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
                        className="mr-3 mt-1"
                      />
                      <div>
                        <div className="font-semibold mb-1 text-[0.95rem]">
                          {extra.name}
                        </div>
                        <div className="text-[0.8rem] text-[#666] mb-1">
                          {extra.nightlyImpact > 0 &&
                            `+$${extra.nightlyImpact}/night`}
                          {(extra.occupancyBoost ?? 0) > 0 &&
                            ` +${extra.occupancyBoost}% occupancy`}
                          {(extra.energySavings ?? 0) > 0 &&
                            ` Save $${extra.energySavings}/year`}
                        </div>
                        <div className="font-bold text-[#0e181f]">
                          ${extra.price.toLocaleString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky ROI Summary Footer - Tesla Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-[#ffcf00] py-6 px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[100]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-[#666] mb-1">
                  Total Investment
                </div>
                <div className="text-xl font-bold text-[#0e181f]">
                  ${roi.actualInvestment.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#666] mb-1">
                  Annual Profit
                </div>
                <div className="text-xl font-bold text-[#0e181f]">
                  ${roi.annualProfit.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#666] mb-1">
                  Monthly Profit
                </div>
                <div className="text-xl font-bold text-[#0e181f]">
                  ${roi.monthlyProfit.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#666] mb-1">
                  Annual ROI
                </div>
                <div className="text-[2rem] font-bold text-[#ffcf00]">
                  {roi.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
          <button
            className="py-4 px-12 rounded-lg font-semibold text-base no-underline inline-block transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
            onClick={() => {
              alert("Investment process would start here!");
              onInvest &&
                onInvest({
                  ...cabin,
                  id: selectedCabinType,
                  price: cabinPrices[selectedCabinType],
                });
              onClose();
            }}
          >
            Proceed with Investment
          </button>
        </div>
      </div>
    </div>
  );
};
