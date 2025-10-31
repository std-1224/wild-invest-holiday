// Extras: single source of truth
export const getAvailableExtrasForCabin = (cabinType:any) => [
  {
    id: "offgrid",
    name: "Off Grid Pack",
    price: 30000,
    nightlyImpact: 0,
    energySavings: 2400,
  }, // $200/month energy savings
  {
    id: "furniture",
    name: "Premium Furniture Package",
    price: 15000,
    nightlyImpact: 30,
  },
  { id: "linen", name: "Linen Pack", price: 1000, nightlyImpact: 5 },
  {
    id: "artwork",
    name: "Artwork Package",
    price: 2000,
    nightlyImpact: 8,
  },
  { id: "decking", name: "Decking", price: 5000, nightlyImpact: 12 },
  {
    id: "marketingBoost",
    name: "Marketing Boost Package",
    price: 5000,
    nightlyImpact: 0,
    occupancyBoost: 10,
  }, // 10% occupancy boost
];

// ROI Calculation Functions (Root Level) - Wild Things Methodology
export const calculateROI = (
  {cabinType,
  occupancyRate,
  nightlyRate,
  selectedExtras,
  financingType,
  depositAmount}:any
) => {
  const cabinPrices:any = {
    "1BR": 110000,
    "2BR": 135000,
    "3BR": 160000,
  };
  const availableExtras = getAvailableExtrasForCabin(cabinType);

  // Base cabin price
  const basePrice = cabinPrices[cabinType];

  // Calculate extras cost and nightly rate impact
  const extrasCost = selectedExtras.reduce((total:any, extraId:any) => {
    const extra = availableExtras.find((e) => e.id === extraId);
    return total + (extra ? extra.price : 0);
  }, 0);

  const extrasNightlyImpact = selectedExtras.reduce((total:any, extraId:any) => {
    const extra = availableExtras.find((e) => e.id === extraId);
    return total + (extra ? extra.nightlyImpact : 0);
  }, 0);

  // Calculate occupancy boost from marketing package
  const occupancyBoost = selectedExtras.reduce(({total, extraId}:any) => {
    const extra = availableExtras.find((e) => e.id === extraId);
    return total + (extra && extra.occupancyBoost ? extra.occupancyBoost : 0);
  }, 0);

  // Total cabin price including extras
  const totalCabinPrice = basePrice + extrasCost;

  // Effective nightly rate (base + extras impact)
  const effectiveNightlyRate = nightlyRate + extrasNightlyImpact;

  // Actual money invested (deposit if financed, full price if paid)
  const actualInvestment =
    financingType === "financed" ? depositAmount : totalCabinPrice;

  // Wild Things specific costs
  const siteFees = 5000 * 1.1; // $5,000 + GST
  const annualMaintenance = 2000;
  const wildThingsCommission = 0.2; // 20% + GST = 22%

  // Revenue calculations with occupancy boost
  const effectiveOccupancyRate = Math.min(occupancyRate + occupancyBoost, 95); // Cap at 95%
  const nightsPerYear = 365 * (effectiveOccupancyRate / 100);
  const grossAnnualRevenue = nightsPerYear * effectiveNightlyRate;

  // Wild Things commission (20% + GST = 22%)
  const wildThingsCommissionAmount = grossAnnualRevenue * 0.22;

  // Net revenue after Wild Things commission
  const netAnnualRevenue = grossAnnualRevenue - wildThingsCommissionAmount;

  // Annual expenses
  const annualExpenses = siteFees + annualMaintenance;

  // Annual profit
  const annualProfit = netAnnualRevenue - annualExpenses;

  // ROI calculation based on actual money invested
  const roi = (annualProfit / actualInvestment) * 100;

  return {
    totalCabinPrice,
    actualInvestment,
    effectiveNightlyRate,
    effectiveOccupancyRate,
    grossAnnualRevenue,
    wildThingsCommissionAmount,
    netAnnualRevenue,
    annualExpenses,
    annualProfit,
    roi,
    monthlyProfit: annualProfit / 12,
    nightsPerYear,
    siteFees,
    annualMaintenance,
    extrasCost,
    extrasNightlyImpact,
    occupancyBoost,
  };
};
