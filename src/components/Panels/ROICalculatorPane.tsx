import { useState } from "react";
import {
  calculateROI,
  getAvailableExtrasForCabin,
} from "../../config/mockCalculate";

// ROI Calculator Pane Component (For Invest Page)
export const ROICalculatorPane = ({ onInvest }: any) => {
  type Inputs = {
    cabinType: "1BR" | "2BR" | "3BR";
    occupancyRate: number;
    nightlyRate: number;
    selectedExtras: string[];
    financingType: "paid" | "financed";
    depositAmount: number;
  };

  const [inputs, setInputs] = useState<Inputs>({
    cabinType: "1BR",
    occupancyRate: 66,
    nightlyRate: 200, // Default $200 as specified
    selectedExtras: [],
    financingType: "paid", // 'paid' or 'financed'
    depositAmount: 0,
  });

  const availableExtras = getAvailableExtrasForCabin(inputs.cabinType);

  const roi = calculateROI({
    cabinType: inputs.cabinType,
    occupancyRate: inputs.occupancyRate,
    nightlyRate: inputs.nightlyRate,
    selectedExtras: inputs.selectedExtras,
    financingType: inputs.financingType,
    depositAmount: inputs.depositAmount,
  });

  const handleCabinTypeChange = (newCabinType: any) => {
    setInputs({
      ...inputs,
      cabinType: newCabinType,
      selectedExtras: [], // Clear extras when changing cabin type
    });
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #FFCF00",
      }}
    >
      <h3
        style={{
          fontFamily:
            '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
          fontSize: "1rem",
          fontWeight: "900",
          fontStyle: "italic",
          color: "#0E181F",
          marginBottom: "0.75rem",
          textAlign: "center",
        }}
      >
        ROI CALCULATOR
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
        }}
      >
        {/* Inputs */}
        <div>
          <h4
            style={{
              color: "#0E181F",
              marginBottom: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            Investment Details
          </h4>

          <div style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontWeight: "600",
                fontSize: "0.75rem",
              }}
            >
              Cabin Type
            </label>
            <select
              value={inputs.cabinType}
              onChange={(e) => handleCabinTypeChange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.375rem",
                border: "1px solid #86DBDF",
                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            >
              <option value="1BR">1 Bedroom - $110,000</option>
              <option value="2BR">2 Bedroom - $135,000</option>
              <option value="3BR">3 Bedroom - $160,000</option>
            </select>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontWeight: "600",
                fontSize: "0.75rem",
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
                padding: "0.375rem",
                border: "1px solid #86DBDF",
                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontWeight: "600",
                fontSize: "0.75rem",
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
                padding: "0.375rem",
                border: "1px solid #86DBDF",
                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontWeight: "600",
                fontSize: "0.75rem",
              }}
            >
              Payment Method
            </label>
            <select
              value={inputs.financingType}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  financingType: e.target.value as "paid" | "financed",
                })
              }
              style={{
                width: "100%",
                padding: "0.375rem",
                border: "1px solid #86DBDF",
                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            >
              <option value="paid">Fully Paid</option>
              <option value="financed">Financed</option>
            </select>
          </div>

          {inputs.financingType === "financed" && (
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontWeight: "600",
                  fontSize: "0.75rem",
                }}
              >
                Deposit Amount ($)
              </label>
              <input
                type="number"
                value={inputs.depositAmount}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    depositAmount: parseInt(e.target.value),
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.375rem",
                  border: "1px solid #86DBDF",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
                placeholder="Enter deposit amount"
              />
            </div>
          )}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontWeight: "600",
                fontSize: "0.75rem",
              }}
            >
              Premium Extras
            </label>
            <div style={{ maxHeight: "100px", overflowY: "auto" }}>
              {availableExtras.map((extra: any) => (
                <label
                  key={extra.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.25rem",
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
                    style={{ marginRight: "0.25rem" }}
                  />
                  <span style={{ fontSize: "0.7rem" }}>
                    {extra.name} (+${extra.nightlyImpact}/night) - $
                    {extra.price.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <h4
            style={{
              color: "#0E181F",
              marginBottom: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            Projected Returns
          </h4>

          <div
            style={{
              background: "linear-gradient(135deg, #FFCF00 0%, #FFD700 100%)",
              padding: "0.75rem",
              borderRadius: "6px",
              color: "#0E181F",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "0.25rem",
              }}
            >
              {roi.roi.toFixed(1)}% ROI
            </div>
            <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
              Annual Return
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "0.25rem",
              marginBottom: "0.75rem",
              fontSize: "0.7rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.25rem 0",
              }}
            >
              <span style={{ fontWeight: "600" }}>Total Price:</span>
              <span style={{ fontWeight: "bold" }}>
                ${roi.totalCabinPrice.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.25rem 0",
              }}
            >
              <span style={{ fontWeight: "600" }}>Actual Investment:</span>
              <span style={{ fontWeight: "bold", color: "#FFCF00" }}>
                ${roi.actualInvestment.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.25rem 0",
              }}
            >
              <span style={{ fontWeight: "600" }}>Annual Profit:</span>
              <span style={{ fontWeight: "bold", color: "#0E181F" }}>
                ${roi.annualProfit.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.25rem 0",
              }}
            >
              <span style={{ fontWeight: "600" }}>Monthly Profit:</span>
              <span style={{ fontWeight: "bold", color: "#0E181F" }}>
                ${roi.monthlyProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() =>
              onInvest &&
              onInvest({
                cabinType: inputs.cabinType,
                price: roi.totalCabinPrice,
                extras: inputs.selectedExtras,
              })
            }
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: "600",
            }}
          >
            Proceed with Investment
          </button>
        </div>
      </div>
    </div>
  );
};
