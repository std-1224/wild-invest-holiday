import { useState } from "react";
import { calculateROI } from "../config/mockCalculate";

type Inputs = {
  cabinType: "1BR" | "2BR" | "3BR";
  occupancyRate: number;
  nightlyRate: number;
  selectedExtras: string[];
};

// Investment System Components
export const ROICalculator = ({ cabinType, onClose }: any) => {
  const [inputs, setInputs] = useState<Inputs>({
    cabinType: (cabinType as Inputs["cabinType"]) || "1BR",
    occupancyRate: 70,
    nightlyRate: cabinType === "1BR" ? 220 : cabinType === "2BR" ? 350 : 250,
    selectedExtras: [],
  });

  const availableExtras = [
    {
      id: "furniture",
      name: "Premium Furniture Package",
      price: 12000,
      nightlyImpact: 25,
    },
    {
      id: "appliances",
      name: "High-End Appliances",
      price: 5000,
      nightlyImpact: 15,
    },
    {
      id: "solar",
      name: "Off Grid Solar & Battery Package",
      price: cabinType === "1BR" ? 20000 : cabinType === "2BR" ? 30000 : 40000,
      nightlyImpact: 0,
    },
    {
      id: "decor",
      name: "Professional Interior Decor",
      price: 2500,
      nightlyImpact: 12,
    },
    {
      id: "outdoor",
      name: "Outdoor Furniture Set",
      price: 2000,
      nightlyImpact: 8,
    },
    {
      id: "entertainment",
      name: "Entertainment System",
      price: 1500,
      nightlyImpact: 10,
    },
  ];

  const roi = calculateROI(
    inputs.cabinType,
    inputs.occupancyRate,
    inputs.nightlyRate,
    inputs.selectedExtras
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-8 max-w-[800px] w-[90%] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer"
        >
          ×
        </button>

        <h2 className="text-[2rem] font-black italic text-[#0e181f] mb-8 text-center font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
          ROI CALCULATOR
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {/* Inputs */}
          <div>
            <h3 className="text-[#0e181f] mb-4">
              Investment Details
            </h3>

            <div className="mb-4">
              <label className="block mb-2 font-bold">
                Cabin Type
              </label>
              <select
                value={inputs.cabinType}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    cabinType: e.target.value as Inputs["cabinType"],
                  })
                }
                className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
              >
                <option value="1BR">1 Bedroom - $110,000</option>
                <option value="2BR">2 Bedroom - $135,000</option>
                <option value="3BR">3 Bedroom - $160,000</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">
                Occupancy Rate (%)
              </label>
              <input
                type="number"
                value={inputs.occupancyRate}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    occupancyRate: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">
                Nightly Rate ($)
              </label>
              <input
                type="number"
                value={inputs.nightlyRate}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    nightlyRate: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2 font-bold">
                Premium Extras
              </label>
              {availableExtras.map((extra) => (
                <label
                  key={extra.id}
                  className="flex items-center mb-2"
                >
                  <input
                    type="checkbox"
                    checked={inputs.selectedExtras.includes(extra.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInputs({
                          ...inputs,
                          selectedExtras: [...inputs.selectedExtras, extra.id],
                        });
                      } else {
                        setInputs({
                          ...inputs,
                          selectedExtras: inputs.selectedExtras.filter(
                            (id) => id !== extra.id
                          ),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-[0.9rem]">
                    {extra.name} (+${extra.nightlyImpact}/night) - $
                    {extra.price.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <h3 className="text-[#0e181f] mb-4">
              Projected Returns
            </h3>

            <div className="bg-gradient-to-br from-[#ffcf00] to-[#ffd700] p-6 rounded-xl text-[#0e181f] mb-4">
              <div className="text-[2rem] font-bold mb-2">
                {roi.roi.toFixed(1)}% ROI
              </div>
              <div className="text-[0.9rem] opacity-80">
                Annual Return on Investment
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex justify-between py-2 border-b border-[#eee]">
                <span>Total Investment:</span>
                <span className="font-bold">
                  ${roi.totalInvestment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#eee]">
                <span>Annual Revenue:</span>
                <span className="font-bold">
                  ${roi.annualRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#eee]">
                <span>Annual Profit:</span>
                <span className="font-bold text-[#0e181f]">
                  ${roi.annualProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#eee]">
                <span>Monthly Profit:</span>
                <span className="font-bold text-[#0e181f]">
                  ${roi.monthlyProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Effective Nightly Rate:</span>
                <span className="font-bold">
                  ${roi.effectiveNightlyRate}
                </span>
              </div>
            </div>

            <button
              className="w-full mt-6 px-6 py-3 rounded-lg font-semibold text-base no-underline inline-block transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              onClick={() => {
                alert("Investment process would start here!");
                onClose();
              }}
            >
              Proceed with Investment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
