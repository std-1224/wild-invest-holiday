import { ROICalculatorPane } from "../components/Panels/ROICalculatorPane";
import { CabinCard } from "../components/Cards/CabinCard";

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
    <div
      id="invest"
      style={{
        paddingTop: "120px",
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
            fontSize: "clamp(3rem, 8vw, 5rem)",
            fontWeight: "900",
            fontStyle: "italic",
            color: "#0E181F",
            textAlign: "center",
            marginBottom: "1rem",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          INVEST IN A HOLIDAY HOME
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            textAlign: "center",
            color: "#666",
            marginBottom: "3rem",
            maxWidth: "800px",
            margin: "0 auto 3rem",
          }}
        >
          Invest in your own piece of paradise. Earn passive income while providing
          families with unforgettable outdoor experiences.
        </p>

        {/* Two Column Layout: Cabin Cards Left, ROI Calculator Right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          {/* Left Side: Compact Cabin Cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {cabins.map((cabin) => (
              <CabinCard key={cabin.id} cabin={cabin} onInvest={onInvest} />
            ))}
          </div>

          {/* Right Side: Compact ROI Calculator Panel */}
          <div
            style={{
              position: "sticky",
              top: "120px",
              maxHeight: "calc(100vh - 140px)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.25rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #FFCF00",
              }}
            >
              <h2
                style={{
                  fontFamily:
                    '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                  fontSize: "1.25rem",
                  fontWeight: "900",
                  fontStyle: "italic",
                  color: "#0E181F",
                  textAlign: "center",
                  marginBottom: "0.5rem",
                }}
              >
                ROI CALCULATOR
              </h2>
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  marginBottom: "1rem",
                  fontSize: "0.8rem",
                }}
              >
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