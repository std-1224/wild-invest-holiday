import { useState } from 'react';

// FAQ data with common investment questions
const faqData = [
  {
    question: "What's included in the cabin investment package?",
    answer: "Each cabin comes fully furnished and equipped, including furniture, appliances, and essential amenities. The package includes property management services, marketing through our platform, and regular maintenance.",
  },
  {
    question: "How is the return on investment calculated?",
    answer: "ROI is calculated based on rental income minus operating expenses. Typical returns range from 8-12% annually, depending on location, season, and occupancy rates. Use our ROI calculator for detailed projections.",
  },
  {
    question: "What are the ongoing maintenance costs?",
    answer: "Maintenance costs are approximately 2-3% of the purchase price annually, covering regular upkeep, repairs, and property management fees. This is deducted from rental income.",
  },
  {
    question: "Can I use the cabin for personal holidays?",
    answer: "Yes! Owners get priority booking periods and special rates for personal stays. We recommend balancing personal use with rental availability to maximize returns.",
  },
  {
    question: "What's the minimum investment period?",
    answer: "While there's no strict minimum period, we recommend viewing this as a 3-5 year investment to maximize returns and property appreciation potential.",
  },
  {
    question: "How is the booking process managed?",
    answer: "Our professional property management team handles all bookings, check-ins, cleaning, and guest communications through our automated booking platform.",
  },
  {
    question: "Are there financing options available?",
    answer: "Yes, we partner with several financial institutions offering competitive rates for cabin investments. Our team can connect you with suitable lenders.",
  },
  {
    question: "What insurance coverage is provided?",
    answer: "Comprehensive insurance covering property damage, public liability, and loss of rental income is included in the management package.",
  },
  {
    question: "How are peak seasons managed?",
    answer: "Premium rates apply during peak seasons (holidays, ski season, etc.). Owners receive priority booking windows for personal use during these periods.",
  },
  {
    question: "What happens if I want to sell my cabin?",
    answer: "You have the flexibility to sell your cabin at any time. We can assist with the sales process and potentially connect you with interested investors.",
  },
  {
    question: "Are there any tax benefits?",
    answer: "Investment properties may qualify for tax deductions including depreciation, maintenance costs, and interest payments. Consult your tax advisor for specific advice.",
  },
  {
    question: "How is property appreciation factored in?",
    answer: "While not guaranteed, our locations are chosen for their growth potential. Historical data shows 4-6% annual appreciation in our current markets.",
  },
  {
    question: "What's the occupancy rate guarantee?",
    answer: "While we don't guarantee specific occupancy rates, our properties typically achieve 65-80% annual occupancy through our marketing and booking platforms.",
  },
  {
    question: "How are maintenance issues handled?",
    answer: "Our on-site management team handles all maintenance issues promptly. 24/7 support is available for urgent matters, ensuring minimal disruption to bookings.",
  },
  {
    question: "What makes Wild Things different from other investment options?",
    answer: "We offer a unique blend of lifestyle and investment benefits, professional management, prime locations, and a proven track record of returns in the luxury outdoor accommodation sector.",
  },
];

export const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-[800px] mx-auto py-8">
      <h2 className="mb-8 text-[2.5rem] font-black italic text-[#0e181f] text-center [text-shadow:2px_2px_4px_rgba(0,0,0,0.1)] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
        Frequently Asked Questions
      </h2>

      <div className="flex flex-col gap-2">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border border-[#0e181f]/10 rounded-lg overflow-hidden bg-white transition-all duration-200"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-4 text-left bg-transparent border-none cursor-pointer flex justify-between items-center text-base font-semibold text-[#0e181f]"
              aria-expanded={openIndex === index}
            >
              {faq.question}
              <span className={`transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 text-[#666] leading-relaxed ${
                openIndex === index ? 'max-h-[500px] opacity-100 p-4' : 'max-h-0 opacity-0 px-4 py-0'
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};