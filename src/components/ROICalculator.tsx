import React, { useState } from "react";
import { Calculator } from "lucide-react";
import {
  cabins,
  calculateROI,
  defaultNightlyRates,
  getExtrasForCabin,
  cabinImages,
} from "../config/mockCalculate";
import CabinImageSlider from "./CabinImageSlider";

type CabinType = "1BR" | "2BR";

interface ROICalculatorProps {
  cabinType: CabinType;
  selectedExtras: string[];
  onExtrasChange: (extras: string[]) => void;
  onReserve: () => void;
  showCabinSelector?: boolean;
  onCabinTypeChange?: (type: CabinType) => void;
  occupancyRate?: number;
  onOccupancyRateChange?: (rate: number) => void;
  nightlyRate?: number;
  onNightlyRateChange?: (rate: number) => void;
  cabin?: any;
  actionTitle?: string;
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({
  cabinType,
  selectedExtras,
  onExtrasChange,
  onReserve,
  showCabinSelector = true,
  onCabinTypeChange,
  occupancyRate = 70,
  onOccupancyRateChange,
  nightlyRate,
  onNightlyRateChange,
  cabin: propCabin,
  actionTitle = "Select Site & Reserve →",
}) => {
  const [expandedExtras, setExpandedExtras] = useState<Record<string, boolean>>({});

  const cabin = propCabin || cabins[cabinType];
  const effectiveNightlyRate = nightlyRate ?? defaultNightlyRates[cabinType];

  const roiResults = calculateROI(
    cabinType,
    occupancyRate,
    effectiveNightlyRate,
    selectedExtras
  );

  const toggleExtra = (extraId: string) => {
    if (selectedExtras.includes(extraId)) {
      onExtrasChange(selectedExtras.filter((id) => id !== extraId));
    } else {
      onExtrasChange([...selectedExtras, extraId]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center mb-6">
        <Calculator size={28} className="text-[#ffcf00] mr-3" />
        <h2 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
          ROI CALCULATOR
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* Cabin Type Selector */}
        {showCabinSelector && onCabinTypeChange && (
          <div>
            <label className="block text-sm font-bold mb-2 text-[#0e181f]">
              Cabin Type
            </label>
            <div className="space-y-3">
              {Object.entries(cabins).map(([key, cabinData]) => {
                const cabinKey = key as CabinType;
                const isSelected = cabinType === cabinKey;
                return (
                  <div
                    key={key}
                    onClick={() => onCabinTypeChange(cabinKey)}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? "border-[3px] border-[#ffcf00] shadow-[0_4px_12px_rgba(255,207,0,0.3)]"
                        : "border-[3px] border-[#86dbdf]"
                    }`}
                  >
                    <CabinImageSlider
                      images={cabinImages[cabinKey] || []}
                      autoplay={isSelected}
                      interval={3000}
                      className="h-32"
                      showControls={false}
                      showIndicators={true}
                    />
                    <div className="p-3 bg-white">
                      <div className="font-bold text-sm text-[#0e181f]">
                        {cabinData.name}
                      </div>
                      <div className="text-base font-bold text-[#ffcf00]">
                        ${cabinData.price.toLocaleString("en-AU")} + GST
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Occupancy Rate Input */}
        {onOccupancyRateChange && (
          <div>
            <label className="block text-sm font-bold mb-2 text-[#0e181f]">
              Occupancy Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={occupancyRate || ""}
              onChange={(e) => {
                const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                onOccupancyRateChange(value === "" ? 0 : isNaN(value as number) ? 0 : value as number);
              }}
              className="w-full px-4 py-3 rounded-lg focus:outline-none border-2 border-[#86dbdf]"
            />
          </div>
        )}

        {/* Nightly Rate Input */}
        {onNightlyRateChange && (
          <div>
            <label className="block text-sm font-bold mb-2 text-[#0e181f]">
              Nightly Rate ($)
            </label>
            <input
              type="number"
              min="0"
              value={effectiveNightlyRate || ""}
              onChange={(e) => {
                const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                onNightlyRateChange(value === "" ? 0 : isNaN(value as number) ? 0 : value as number);
              }}
              className="w-full px-4 py-3 rounded-lg focus:outline-none border-2 border-[#86dbdf]"
            />
          </div>
        )}
      </div>

      {/* Optional Extras Selection */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-[#0e181f]">Optional Extras</h3>
        <div className="space-y-2">
          {getExtrasForCabin(cabinType).map((extra) => {
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
                    onChange={() => toggleExtra(extra.id)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    {(() => {
                      const base = calculateROI(cabinType, occupancyRate, effectiveNightlyRate, []);
                      const withExtra = calculateROI(cabinType, occupancyRate, effectiveNightlyRate, [extra.id]);
                      const roiImpact = (withExtra.roi || 0) - (base.roi || 0);
                      return (
                        <>
                          <div className="font-bold text-sm text-[#0e181f]">{extra.name}</div>
                          <div className="text-xs text-[#ec874c]">{extra.impactDescription}</div>
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
                          setExpandedExtras({ ...expandedExtras, [extra.id]: !isExpanded });
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
                      <p className="text-xs font-semibold text-[#0e181f] mb-2">What's included:</p>
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
        <h3 className="font-bold mb-3 text-sm text-[#0e181f]">Dynamic Nightly Rate</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Rate ({cabinType}):</span>
            <span className="font-bold">${defaultNightlyRates[cabinType]}</span>
          </div>
          {selectedExtras.length > 0 && (
            <div className="flex justify-between text-[#ec874c]">
              <span>Options Impact:</span>
              <span className="font-bold">+${roiResults.extrasNightlyImpact.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] font-bold">
            <span>Final Rate:</span>
            <span className="text-[#0e181f]">${roiResults.effectiveNightlyRate.toFixed(0)}/night</span>
          </div>
        </div>
      </div>

      {/* Total Investment Display */}
      <div className="rounded-lg p-4 mb-4 bg-[#86dbdf]/[0.2]">
        <h3 className="font-bold mb-3 text-sm text-[#0e181f]">Total Investment</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Cabin Price:</span>
            <span className="font-bold">${cabin.price.toLocaleString()}</span>
          </div>
          {roiResults.extrasCost > 0 && (
            <div className="flex justify-between text-[#ec874c]">
              <span>Selected Extras:</span>
              <span className="font-bold">+${roiResults.extrasCost.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] font-bold">
            <span>Total:</span>
            <span className="text-[#0e181f]">${roiResults.totalInvestment.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Annual Revenue Display */}
      <div className="rounded-lg p-4 mb-4 bg-[#86dbdf]/[0.2]">
        <h3 className="font-bold mb-3 text-sm text-[#0e181f]">Annual Revenue</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Gross Revenue:</span>
            <span className="font-bold">
              ${roiResults.grossAnnualRevenue.toLocaleString("en-AU", { maximumFractionDigits: 0 })} + GST
            </span>
          </div>
          <div className="flex justify-between text-[#ec874c]">
            <span>Management (20%):</span>
            <span className="font-bold">
              -${roiResults.wildThingsCommissionAmount.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-[#ec874c]">
            <span>Site Fee:</span>
            <span className="font-bold">
              -${roiResults.siteFees.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-[#ec874c]">
            <span>Energy Costs:</span>
            <span className="font-bold">
              -${roiResults.energyCosts.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
            </span>
          </div>
          {(roiResults as any).annualCostSavings > 0 && (
            <div className="flex justify-between text-[#059669]">
              <span>Cost Savings (Solar):</span>
              <span className="font-bold">
                +${((roiResults as any).annualCostSavings || 0).toLocaleString("en-AU")}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-[#0e181f] text-[#059669] font-bold">
            <span>Net Income:</span>
            <span>${roiResults.annualProfit.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Estimated Annual ROI */}
      <div className="flex flex-col justify-center items-center bg-[#ec874c] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-1 text-sm text-white">Estimated Annual ROI</h3>
        <div className="text-4xl font-bold text-white">{roiResults.roi.toFixed(2)}%</div>
        {roiResults.extrasCost > 0 && (
          <p className="text-xs mt-2 text-white">
            Based on ${roiResults.totalInvestment.toLocaleString()} total investment
          </p>
        )}
      </div>

      {/* Reserve Button */}
      <button
        onClick={onReserve}
        className="w-full py-4 rounded-lg font-bold transition-all hover:opacity-90 mb-4 bg-[#ffcf00] text-[#0e181f] text-lg"
      >
        {actionTitle}
      </button>

      <p className="text-xs text-gray-600 italic">
        * High-level estimate. Insurance, interest, maintenance not included.
      </p>
    </div>
  );
};
