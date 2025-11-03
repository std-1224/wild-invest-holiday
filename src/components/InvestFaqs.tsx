import { useState } from "react";
import { faqs } from "../config/mockCalculate";

export const InvestFaqs = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  return (
    <>
      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-black mb-8 text-center italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            INVESTOR FAQS
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden transition-all border-2 border-[#86dbdf]"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`w-full p-4 text-left font-bold transition-all hover:opacity-90 flex justify-between items-center text-[#0e181f] ${
                    openFaq === index ? "bg-[#ffcf00]" : "bg-white"
                  }`}
                >
                  <span>{faq.question}</span>
                  <span
                    className={`text-2xl transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div className="p-4 bg-[#86dbdf]/[0.07] border-t-2 border-[#86dbdf]">
                    <p className="text-[#0e181f] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
