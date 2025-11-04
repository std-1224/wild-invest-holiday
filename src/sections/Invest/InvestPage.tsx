import { ROICalculatorPane } from "../../components/Panels/ROICalculatorPane";
import { CabinCard } from "../../components/Cards/CabinCard";
import { CalendlyButton } from "../../components/CalendlyButton";

interface InvestPageProps {
  cabins: Array<{
    id: string;
    name: string;
    price: number;
    video: string;
  }>;
  onInvest: (cabin: any) => void;
}

export const InvestPage = ({ cabins, onInvest }: InvestPageProps) => {
  return (
    <div className="pt-[120px] min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1400px] mx-auto px-5">
        <h1 className="text-[clamp(3rem,8vw,5rem)] font-black italic text-[#0e181f] text-center mb-4 [text-shadow:2px_2px_4px_rgba(0,0,0,0.1)] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
          INVEST IN A HOLIDAY HOME
        </h1>
        <p className="text-xl text-center text-gray-600 mx-auto mb-8 max-w-[800px]">
          Invest in your own piece of paradise. Earn passive income while
          providing families with unforgettable outdoor experiences.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <CalendlyButton
            url="https://calendly.com/james-s-wildthings"
            text="Schedule Investment Consultation"
            variant="primary"
            size="lg"
          />
          <button
            onClick={() => document.getElementById("chat-widget")?.click()}
            className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 bg-[#86dbdf] text-white"
          >
            💬 Chat with James
          </button>
        </div>

        {/* Two Column Layout: Cabin Cards Left, ROI Calculator Right */}
        <div className="grid gap-4 items-start grid-cols-1 lg:grid-cols-[1fr_350px]">
          {/* Left Side: Compact Cabin Cards */}
          <div className="flex flex-col gap-4">
            {cabins.map((cabin) => (
              <CabinCard key={cabin.id} cabin={cabin} onInvest={onInvest} />
            ))}
          </div>

          {/* Right Side: Compact ROI Calculator Panel */}
          <div className="relative mt-8 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:mt-0">
            <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#ffcf00]">
              <h2 className="text-xl font-black italic text-[#0e181f] text-center mb-2 font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                ROI CALCULATOR
              </h2>
              <p className="text-center text-gray-600 mb-4 text-xs">
                Calculate your potential returns
              </p>
              <ROICalculatorPane
                onInvest={(data: any) => {
                  alert(
                    `Investment Details:\nCabin: ${
                      data.cabinType
                    }\nPrice: $${data.price.toLocaleString()}\nExtras: ${
                      data.extras.length
                    } selected\n\nInvestment process would start here!`
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
