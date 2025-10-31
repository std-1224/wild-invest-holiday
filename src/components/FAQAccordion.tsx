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
    <div className="faq-section" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h2 
        className="section-title" 
        style={{ 
          marginBottom: '2rem',
          fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
          fontSize: '2.5rem',
          fontWeight: '900',
          fontStyle: 'italic',
          color: '#0E181F',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        Frequently Asked Questions
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {faqData.map((faq, index) => (
          <div
            key={index}
            style={{
              border: '1px solid rgba(14, 24, 31, 0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'white',
              transition: 'all 0.2s ease',
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{
                width: '100%',
                padding: '1rem',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#0E181F',
              }}
              aria-expanded={openIndex === index}
            >
              {faq.question}
              <span 
                style={{
                  transform: openIndex === index ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                ▼
              </span>
            </button>
            <div
              style={{
                padding: openIndex === index ? '1rem' : '0 1rem',
                maxHeight: openIndex === index ? '500px' : '0',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                opacity: openIndex === index ? 1 : 0,
                color: '#666',
                lineHeight: '1.5',
              }}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};