export const getAvailableExtrasForCabin = (cabinType: any) => [
  {
    id: "offgrid",
    name: "Off Grid Pack",
    price: 20000,
    nightlyImpact: 0,
    energySavings: 2400,
  }, // $200/month energy savings
  {
    id: "furniture",
    name: "Premium Furniture Package",
    price: 10000,
    nightlyImpact: 30,
  },
  { id: "linen", name: "Linen Pack", price: 1000, nightlyImpact: 5 },
  {
    id: "artwork",
    name: "Artwork Package",
    price: 2000,
    nightlyImpact: 8,
  },
  { id: "decking", name: "Decking", price: 10000, nightlyImpact: 12 },
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
};

export const cabinPrices = {
  "1BR": 110000,
  "2BR": 135000,
};

export const cabinImages = {
  "1BR": "/1BR.jpg",
  "2BR": "/2BR.jpg",
};

export const cabinVideos = {
  "1BR": "/1br-cabin-video.mp4",
  "2BR": "/2BR.mp4",
};

export const colors = {
  yellow: "#FFCF00",
  darkBlue: "#0E181F",
  aqua: "#86DBDF",
  orange: "#EC874C",
  peach: "#FFCDA3",
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
};

export const cabins = {
  "1BR": {
    name: "1 Bedroom Cabin",
    price: 190000,
    siteFee: 134,
    bedrooms: 1,
    image: "/1BR.jpg",
    rentOffPeak: 150,
    rentPeak: 400,
  },
  "2BR": {
    name: "2 Bedroom Cabin",
    price: 320000,
    siteFee: 268,
    bedrooms: 2,
    image: "/2BR.jpg",
    rentOffPeak: 200,
    rentPeak: 500,
  },
  // "3BR": {
  //   name: "3 Bedroom Cabin",
  //   price: 250000,
  //   siteFee: 150,
  //   bedrooms: 3,
  //   image: "/3BR.jpg",
  //   rentOffPeak: 300,
  //   rentPeak: 700,
  // },
};

// Available extras for purchase
// Extras with cabin-specific pricing
export const getExtrasForCabin = (cabinType: any) => {
  // Cabin-specific pricing
  const furniturePrice = cabinType === "1BR" ? 10000 : 15000;
  const linenPrice = cabinType === "1BR" ? 1000 : 2000;
  const deckingPrice = cabinType === "1BR" ? 10000 : 15000;
  const entertainmentPrice = cabinType === "1BR" ? 1000 : 2000;

  return [
    {
      id: "furniture",
      name: "Furniture Pack",
      price: furniturePrice,
      nightlyImpact: 25,
      impactDescription: "+$25/night - Premium appeal increases rates",
      annualCostSavings: 0,
    },
    {
      id: "linen",
      name: "Linen Pack",
      price: linenPrice,
      nightlyImpact: 5,
      impactDescription: "+$5/night - Luxury comfort attracts guests",
      annualCostSavings: 0,
    },
    {
      id: "solar",
      name: "Off Grid Pack (Solar & Battery)",
      price: 20000,
      nightlyImpact: 0,
      impactDescription:
        "No impact on nightly rate - Eliminates $20/night energy costs",
      annualCostSavings: 0,
    },
    {
      id: "decking",
      name: "Decking",
      price: deckingPrice,
      nightlyImpact: 12,
      impactDescription: "+$12/night - Enhanced outdoor space increases appeal",
      annualCostSavings: 0,
    },
    {
      id: "outdoor",
      name: "Outdoor Furniture Pack",
      price: 1500,
      nightlyImpact: 8,
      impactDescription: "+$8/night - Outdoor luxury adds value",
      annualCostSavings: 0,
    },
    {
      id: "entertainment",
      name: "Entertainment System",
      price: entertainmentPrice,
      nightlyImpact: 10,
      impactDescription: "+$10/night - Premium entertainment increases rates",
      annualCostSavings: 0,
    },
  ];
};

export const faqs = [
  {
    question: "Can I claim depreciation if I don't own the land?",
    answer:
      "Absolutely. Because you own the entire cabin structure and its internal fittings, you're entitled to claim full depreciation—just like any other income-producing property. Capital Works (Division 43): Up to 2.5% per year of the build cost for 40 years. Plant & Equipment (Division 40): Accelerated deductions on appliances, air-conditioning, furniture and fixtures. Wild Things provides an itemised depreciation schedule with every sale so investors can maximise their allowable deductions from day one.",
  },
  {
    question: "Can I deduct the annual site lease payments?",
    answer:
      "Yes — the site lease or ground rent is a fully deductible operating expense because it's paid solely for the purpose of earning rental income. Unlike a traditional property, you don't tie up capital in the land, yet still receive a steady income stream and tax-deductible rent payments.",
  },
  {
    question: "Are management, cleaning and booking fees deductible?",
    answer:
      "Yes. All ongoing costs—management fees, cleaning, repairs, marketing, utilities, insurance and online booking commissions—are 100% deductible. Wild Things handles these services under a transparent management agreement, meaning investors enjoy hands-off returns with strong tax efficiency.",
  },
  {
    question: "Can I claim interest if I finance my cabin purchase?",
    answer:
      "Yes. Any interest or bank charges on finance used to acquire or improve your cabin are deductible, provided the cabin is used to generate income. Many Wild Things investors use this to create negatively geared benefits in the early years while building long-term capital value.",
  },
  {
    question: "How does GST apply?",
    answer:
      "On purchase: GST applies to new cabins, but registered investors can claim back input tax credits, reducing the effective purchase price. On income: If your total turnover exceeds $75,000 p.a., you register for GST, charge it on nightly stays, and claim GST on your expenses. Wild Things can assist your accountant in setting up a simple structure that ensures all GST benefits are captured correctly.",
  },
  {
    question: "Can I offset losses against my other income (negative gearing)?",
    answer:
      "Yes. If interest, rent, depreciation and other deductible costs exceed your rental income, the net loss can offset your other taxable income. This makes the early investment years especially attractive from a cash-flow and tax-minimisation perspective.",
  },
  {
    question:
      "Can I buy a Wild Things cabin through my Self-Managed Super Fund (SMSF)?",
    answer:
      "Yes — many investors do. An SMSF can purchase a cabin at market value from Wild Things provided: It's held purely as an investment, not used personally. It meets the sole-purpose test of generating retirement benefits. Because cabins are operated as short-term accommodation within a commercial business, they may qualify as business real property, making SMSF ownership entirely compliant when structured correctly. Our team can connect you with SMSF-specialist accountants familiar with the Wild Things model.",
  },
  {
    question: "Does the land lease itself increase in value?",
    answer:
      "While you don't own the underlying land, the leasehold rights and cabin value can appreciate over time due to: Upgrades in park infrastructure and amenities, Rising nightly tariffs and occupancy rates, and Limited supply of quality cabin sites in prime holiday destinations. As the park brand and demand grow, your cabin's resale and income potential both rise, delivering the benefits of appreciation without landholding costs.",
  },
  {
    question: "Can I sell or transfer my cabin later on?",
    answer:
      "Yes — you're free to on-sell your cabin at any time. The new buyer simply takes over the remaining lease term (subject to standard park approval). Wild Things cabins are designed as liquid assets: they can be sold privately, via agents, or directly through the Wild Things resale program, often achieving premiums in high-occupancy parks. A modest transfer fee may apply, disclosed upfront.",
  },
  {
    question: "Is the eventual sale subject to Capital Gains Tax (CGT)?",
    answer:
      "Yes. As with any investment, CGT applies on sale, but you can claim the 50% CGT discount after 12 months (for individuals or trusts). Because purchase costs, depreciation and selling expenses can be included in the cost base, many investors find their effective tax rate on gains is very low.",
  },
  {
    question: "Can I use the cabin personally?",
    answer:
      "Yes — occasional personal stays are allowed under most management agreements. You simply apportion deductions for the rental and private-use periods. This gives you the rare combination of a profitable investment that can also deliver lifestyle value when desired.",
  },
  {
    question: "Can I claim travel expenses to inspect or maintain my cabin?",
    answer:
      "If your cabin is part of a commercial short-stay operation (as with Wild Things' managed parks), reasonable travel to inspect or manage the investment may be deductible, subject to ATO guidelines. This can include mileage or accommodation for periodic visits.",
  },
  {
    question: "What happens if the park relocates, upgrades or renews sites?",
    answer:
      "Your investment remains protected. Wild Things cabins are relocatable assets, meaning they can be repositioned or upgraded as the park evolves. Any new capital works or improvements become additional depreciable items, enhancing future deductions and value.",
  },
  {
    question: "What ownership structures work best for investors?",
    answer:
      "Personal ownership: Simple, full access to CGT discount. Company or trust: Income splitting and asset-protection advantages. SMSF: 15% tax in accumulation phase, 0% in pension phase. Wild Things can coordinate with your accountant to select the structure that delivers the best after-tax outcome.",
  },
  {
    question: "Does the remaining lease term affect resale value?",
    answer:
      "Yes—but in a positive, predictable way. Cabins with long remaining leases (10–25 years) and strong park branding command the highest resale prices. Wild Things offers long initial lease terms with renewal options, preserving value and investor confidence well into the future.",
  },
];

export const defaultNightlyRates = {
  "1BR": 160,
  "2BR": 200,
};

export const investmentSteps = [
  { title: "Reservation", subtitle: "$100 deposit", icon: "💳", timeline: "Today" },
  {
    title: "Sign Purchase Agreement",
    subtitle: "%30 deposit",
    icon: "📝",
    timeline: "Tomorrow",
  },
  {
    title: "Finish building",
    subtitle: "30% deposit",
    icon: "🏗️",
    timeline: "8 weeks",
  },
  {
    title: "Inspect Home",
    subtitle: "",
    icon: "🔍",
    timeline: "9 weeks",
  },
  {
    title: "Own your home",
    subtitle: "40% deposit",
    icon: "🗝️",
    timeline: "10 weeks",
  },
];
