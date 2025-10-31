import { useState } from "react";
import { calculateROI } from "../config/mockCalculate";

type Inputs = {
  cabinType: "1BR" | "2BR" | "3BR";
  occupancyRate: number;
  nightlyRate: number;
  selectedExtras: string[];
};

// Investment System Components
export const ROICalculator = ({ cabinType, onClose }: any) => {
  const [inputs, setInputs] = useState<Inputs>({
    cabinType: (cabinType as Inputs["cabinType"]) || "1BR",
    occupancyRate: 66,
    nightlyRate: cabinType === "1BR" ? 160 : cabinType === "2BR" ? 200 : 250,
    selectedExtras: [],
  });

  const availableExtras = [
    {
      id: "furniture",
      name: "Premium Furniture Package",
      price: 12000,
      nightlyImpact: 25,
    },
    {
      id: "appliances",
      name: "High-End Appliances",
      price: 5000,
      nightlyImpact: 15,
    },
    {
      id: "solar",
      name: "Off Grid Solar & Battery Package",
      price: cabinType === "1BR" ? 20000 : cabinType === "2BR" ? 30000 : 40000,
      nightlyImpact: 0,
    },
    {
      id: "decor",
      name: "Professional Interior Decor",
      price: 2500,
      nightlyImpact: 12,
    },
    {
      id: "outdoor",
      name: "Outdoor Furniture Set",
      price: 2000,
      nightlyImpact: 8,
    },
    {
      id: "entertainment",
      name: "Entertainment System",
      price: 1500,
      nightlyImpact: 10,
    },
  ];

  const roi = calculateROI(
    inputs.cabinType,
    inputs.occupancyRate,
    inputs.nightlyRate,
    inputs.selectedExtras
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontFamily:
              '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
            fontSize: "2rem",
            fontWeight: "900",
            fontStyle: "italic",
            color: "#0E181F",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          ROI CALCULATOR
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Inputs */}
          <div>
            <h3 style={{ color: "#0E181F", marginBottom: "1rem" }}>
              Investment Details
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Cabin Type
              </label>
              <select
                value={inputs.cabinType}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    cabinType: e.target.value as Inputs["cabinType"],
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #86DBDF",
                  borderRadius: "8px",
                }}
              >
                <option value="1BR">1 Bedroom - $110,000</option>
                <option value="2BR">2 Bedroom - $135,000</option>
                <option value="3BR">3 Bedroom - $160,000</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Occupancy Rate (%)
              </label>
              <input
                type="number"
                value={inputs.occupancyRate}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    occupancyRate: parseInt(e.target.value),
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #86DBDF",
                  borderRadius: "8px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Nightly Rate ($)
              </label>
              <input
                type="number"
                value={inputs.nightlyRate}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    nightlyRate: parseInt(e.target.value),
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #86DBDF",
                  borderRadius: "8px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Premium Extras
              </label>
              {availableExtras.map((extra) => (
                <label
                  key={extra.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={inputs.selectedExtras.includes(extra.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInputs({
                          ...inputs,
                          selectedExtras: [...inputs.selectedExtras, extra.id],
                        });
                      } else {
                        setInputs({
                          ...inputs,
                          selectedExtras: inputs.selectedExtras.filter(
                            (id) => id !== extra.id
                          ),
                        });
                      }
                    }}
                    style={{ marginRight: "0.5rem" }}
                  />
                  <span style={{ fontSize: "0.9rem" }}>
                    {extra.name} (+${extra.nightlyImpact}/night) - $
                    {extra.price.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <h3 style={{ color: "#0E181F", marginBottom: "1rem" }}>
              Projected Returns
            </h3>

            <div
              style={{
                background: "linear-gradient(135deg, #FFCF00 0%, #FFD700 100%)",
                padding: "1.5rem",
                borderRadius: "12px",
                color: "#0E181F",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {roi.roi.toFixed(1)}% ROI
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Annual Return on Investment
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>Total Investment:</span>
                <span style={{ fontWeight: "bold" }}>
                  ${roi.totalInvestment.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>Annual Revenue:</span>
                <span style={{ fontWeight: "bold" }}>
                  ${roi.annualRevenue.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>Annual Profit:</span>
                <span style={{ fontWeight: "bold", color: "#0E181F" }}>
                  ${roi.annualProfit.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>Monthly Profit:</span>
                <span style={{ fontWeight: "bold", color: "#0E181F" }}>
                  ${roi.monthlyProfit.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                }}
              >
                <span>Effective Nightly Rate:</span>
                <span style={{ fontWeight: "bold" }}>
                  ${roi.effectiveNightlyRate}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1.5rem" }}
              onClick={() => {
                alert("Investment process would start here!");
                onClose();
              }}
            >
              Proceed with Investment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
