// ROI Summary Component (Root Level)

import { calculateROI } from "../config/mockCalculate";

export const ROISummary = ({
  cabinType,
  occupancyRate,
  nightlyRate,
  selectedExtras,
  onClose,
}: any) => {
  // depositAmount isn't provided as a prop for the summary; use 0 as default here
  const roi = calculateROI({
    cabinType,
    occupancyRate,
    nightlyRate,
    selectedExtras,
    depositAmount: 0,
  });

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 max-w-[500px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-[1000] border-[3px] border-[#ffcf00]">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer"
      >
        ×
      </button>

      <h3 className="text-2xl font-black italic text-[#0e181f] mb-6 text-center font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
        ROI SUMMARY
      </h3>

      <div className="bg-gradient-to-br from-[#ffcf00] to-[#ffd700] p-6 rounded-xl text-[#0e181f] mb-6 text-center">
        <div className="text-[2.5rem] font-bold mb-2">
          {roi.roi.toFixed(1)}% ROI
        </div>
        <div className="text-base opacity-80">
          Annual Return on Investment
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex justify-between py-3 border-b-2 border-[#f0f0f0]">
          <span className="font-semibold">Total Investment:</span>
          <span className="font-bold text-[1.1rem]">
            ${roi.totalInvestment.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b-2 border-[#f0f0f0]">
          <span className="font-semibold">Annual Revenue:</span>
          <span className="font-bold text-[1.1rem]">
            ${roi.annualRevenue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b-2 border-[#f0f0f0]">
          <span className="font-semibold">Annual Profit:</span>
          <span className="font-bold text-[1.1rem] text-[#0e181f]">
            ${roi.annualProfit.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between py-3 border-b-2 border-[#f0f0f0]">
          <span className="font-semibold">Monthly Profit:</span>
          <span className="font-bold text-[1.1rem] text-[#0e181f]">
            ${roi.monthlyProfit.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between py-3">
          <span className="font-semibold">Effective Nightly Rate:</span>
          <span className="font-bold text-[1.1rem]">
            ${roi.effectiveNightlyRate}
          </span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          className="px-6 py-3 rounded-lg font-semibold text-base no-underline inline-block transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5 p-3 px-8"
          onClick={() => {
            alert("Investment process would start here!");
            onClose();
          }}
        >
          Proceed with Investment
        </button>
      </div>
    </div>
  );
};
