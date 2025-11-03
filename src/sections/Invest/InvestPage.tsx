import { ROICalculatorPane } from "../../components/Panels/ROICalculatorPane";
import { CabinCard } from "../../components/Cards/CabinCard";
import "./InvestPage.css";

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
    <div className="invest-page">
      <div className="invest-container">
        <h1 className="invest-title">
          INVEST IN A HOLIDAY HOME
        </h1>
        <p className="invest-description">
          Invest in your own piece of paradise. Earn passive income while providing
          families with unforgettable outdoor experiences.
        </p>

        {/* Two Column Layout: Cabin Cards Left, ROI Calculator Right */}
        <div className="layout-grid">
          {/* Left Side: Compact Cabin Cards */}
          <div className="cabin-cards-container">
            {cabins.map((cabin) => (
              <CabinCard key={cabin.id} cabin={cabin} onInvest={onInvest} />
            ))}
          </div>

          {/* Right Side: Compact ROI Calculator Panel */}
          <div className="roi-calculator-wrapper">
            <div className="roi-calculator-panel">
              <h2 className="calculator-title">
                ROI CALCULATOR
              </h2>
              <p className="calculator-subtitle">
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