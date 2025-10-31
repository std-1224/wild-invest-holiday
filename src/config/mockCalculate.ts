export const getAvailableExtrasForCabin = (cabinType: any) => [
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
export const calculateROI = (...args: any[]) => {
  // Accept either a single object or positional args for compatibility
  let cabinType: any;
  let occupancyRate: number;
  let nightlyRate: number;
  let selectedExtras: string[] = [];
  let financingType: string | undefined;
  let depositAmount: number | undefined;

  if (args.length === 1 && typeof args[0] === "object") {
    ({
      cabinType,
      occupancyRate,
      nightlyRate,
      selectedExtras = [],
      financingType,
      depositAmount,
    } = args[0]);
  } else {
    [
      cabinType,
      occupancyRate,
      nightlyRate,
      selectedExtras = [],
      financingType,
      depositAmount,
    ] = args;
  }

  const cabinPrices: any = {
    "1BR": 110000,
    "2BR": 135000,
    "3BR": 160000,
  };
  const availableExtras = getAvailableExtrasForCabin(cabinType);

  // Base cabin price
  const basePrice = cabinPrices[cabinType] || 0;

  // selectedExtras is expected to be an array of extra IDs
  const extrasCost = Array.isArray(selectedExtras)
    ? selectedExtras.reduce((total: number, extraId: string) => {
        const extra: any = availableExtras.find((e: any) => e.id === extraId);
        return total + (extra ? extra.price || 0 : 0);
      }, 0)
    : 0;

  const extrasNightlyImpact = Array.isArray(selectedExtras)
    ? selectedExtras.reduce((total: number, extraId: string) => {
        const extra: any = availableExtras.find((e: any) => e.id === extraId);
        return total + (extra ? extra.nightlyImpact || 0 : 0);
      }, 0)
    : 0;

  // Calculate occupancy boost from marketing package
  const occupancyBoost = Array.isArray(selectedExtras)
    ? selectedExtras.reduce((total: number, extraId: string) => {
        const extra: any = availableExtras.find((e: any) => e.id === extraId);
        return (
          total + (extra && extra.occupancyBoost ? extra.occupancyBoost : 0)
        );
      }, 0)
    : 0;

  // Total cabin price including extras
  const totalCabinPrice = basePrice + extrasCost;

  // Effective nightly rate (base + extras impact)
  const effectiveNightlyRate = (nightlyRate || 0) + extrasNightlyImpact;

  // Actual money invested (deposit if financed, full price if paid)
  const actualInvestment =
    financingType === "financed" ? depositAmount || 0 : totalCabinPrice;

  // Wild Things specific costs
  const siteFees = 5000 * 1.1; // $5,000 + GST
  const annualMaintenance = 2000;
  const wildThingsCommission = 0.2; // 20% + GST = 22%

  // Revenue calculations with occupancy boost
  const effectiveOccupancyRate = Math.min(
    (occupancyRate || 0) + occupancyBoost,
    95
  ); // Cap at 95%
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
  const roi = actualInvestment ? (annualProfit / actualInvestment) * 100 : 0;

  // Return both legacy and new property names to keep compatibility
  return {
    totalCabinPrice,
    totalInvestment: totalCabinPrice,
    actualInvestment,
    effectiveNightlyRate,
    effectiveOccupancyRate,
    grossAnnualRevenue,
    annualRevenue: grossAnnualRevenue,
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
  } as const;
};

export const cabinFeatures = {
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

export const cabinPrices = {
  "1BR": 110000,
  "2BR": 135000,
  "3BR": 160000,
};

export const cabinImages = {
  "1BR": "/1BR.jpg",
  "2BR": "/2BR.jpg",
  "3BR": "/3BR.jpg",
};

export const cabinVideos = {
  "1BR": "/1br-cabin-video.mp4",
  "2BR": "/2BR.mp4",
  "3BR": "/3br-cabin-video.mp4",
};
