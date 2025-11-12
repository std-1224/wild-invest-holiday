import { useState } from "react";
import {
  calculateROI,
  getAvailableExtrasForCabin,
} from "../../config/mockCalculate";

// ROI Calculator Pane Component (For Invest Page)
export const ROICalculatorPane = ({ onInvest }: any) => {
  type Inputs = {
    cabinType: "1BR" | "2BR" | "3BR";
    occupancyRate: number;
    nightlyRate: number;
    selectedExtras: string[];
    financingType: "paid" | "financed";
    depositAmount: number;
  };

  const [inputs, setInputs] = useState<Inputs>({
    cabinType: "1BR",
    occupancyRate: 70,
    nightlyRate: 220, // Default $220 for 1BR
    selectedExtras: [],
    financingType: "paid", // 'paid' or 'financed'
    depositAmount: 0,
  });

  const availableExtras = getAvailableExtrasForCabin(inputs.cabinType);

  const roi = calculateROI({
    cabinType: inputs.cabinType,
    occupancyRate: inputs.occupancyRate,
    nightlyRate: inputs.nightlyRate,
    selectedExtras: inputs.selectedExtras,
    financingType: inputs.financingType,
    depositAmount: inputs.depositAmount,
  });

  const handleCabinTypeChange = (newCabinType: any) => {
    setInputs({
      ...inputs,
      cabinType: newCabinType,
      selectedExtras: [], // Clear extras when changing cabin type
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#ffcf00]">
      <h3 className="font-black italic text-[#0e181f] mb-3 text-center text-base font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
        ROI CALCULATOR
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Inputs */}
        <div>
          <h4 className="text-[#0e181f] mb-2 text-[0.85rem] font-semibold">
            Investment Details
          </h4>

          <div className="mb-2">
            <label className="block mb-1 font-semibold text-xs">
              Cabin Type
            </label>
            <select
              value={inputs.cabinType}
              onChange={(e) => handleCabinTypeChange(e.target.value)}
              className="w-full p-1.5 border border-[#86dbdf] rounded text-xs"
            >
              <option value="1BR">1 Bedroom - $110,000</option>
              <option value="2BR">2 Bedroom - $135,000</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block mb-1 font-semibold text-xs">
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
              className="w-full p-1.5 border border-[#86dbdf] rounded text-xs"
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1 font-semibold text-xs">
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
              className="w-full p-1.5 border border-[#86dbdf] rounded text-xs"
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1 font-semibold text-xs">
              Payment Method
            </label>
            <select
              value={inputs.financingType}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  financingType: e.target.value as "paid" | "financed",
                })
              }
              className="w-full p-1.5 border border-[#86dbdf] rounded text-xs"
            >
              <option value="paid">Fully Paid</option>
              <option value="financed">Financed</option>
            </select>
          </div>

          {inputs.financingType === "financed" && (
            <div className="mb-2">
              <label className="block mb-1 font-semibold text-xs">
                Deposit Amount ($)
              </label>
              <input
                type="number"
                value={inputs.depositAmount}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    depositAmount: parseInt(e.target.value),
                  })
                }
                className="w-full p-1.5 border border-[#86dbdf] rounded text-xs"
                placeholder="Enter deposit amount"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 font-semibold text-xs">
              Premium Extras
            </label>
            <div className="max-h-[100px] overflow-y-auto">
              {availableExtras.map((extra: any) => (
                <label
                  key={extra.id}
                  className="flex items-center mb-1"
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
                    className="mr-1"
                  />
                  <span className="text-[0.7rem]">
                    {extra.name} (+${extra.nightlyImpact}/night) - $
                    {extra.price.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <h4 className="text-[#0e181f] mb-2 text-[0.85rem] font-semibold">
            Projected Returns
          </h4>

          <div className="bg-[linear-gradient(135deg,_rgb(255,207,0)_0%,_rgb(255,215,0)_100%)] p-3 rounded-md text-[#0e181f] mb-3 text-center">
            <div className="text-xl font-bold mb-1">
              {roi.roi.toFixed(1)}% ROI
            </div>
            <div className="text-[0.7rem] opacity-80">
              Annual Return
            </div>
          </div>

          <div className="grid gap-1 mb-3 text-[0.7rem]">
            <div className="flex justify-between py-1">
              <span className="font-semibold">Total Price:</span>
              <span className="font-bold">
                ${roi.totalCabinPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-semibold">Actual Investment:</span>
              <span className="font-bold text-[#ffcf00]">
                ${roi.actualInvestment.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-semibold">Annual Profit:</span>
              <span className="font-bold text-[#0e181f]">
                ${roi.annualProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-semibold">Monthly Profit:</span>
              <span className="font-bold text-[#0e181f]">
                ${roi.monthlyProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            className="w-full text-sm p-2 rounded-lg font-semibold border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f]"
            onClick={() =>
              onInvest &&
              onInvest({
                cabinType: inputs.cabinType,
                price: roi.totalCabinPrice,
                extras: inputs.selectedExtras,
              })
            }
          >
            Proceed with Investment
          </button>
        </div>
      </div>
    </div>
  );
};
