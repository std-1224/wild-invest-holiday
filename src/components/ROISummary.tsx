// ROI Summary Component (Root Level)

import { calculateROI } from "../config/mockCalculate";

export const ROISummary = ({
  cabinType,
  occupancyRate,
  nightlyRate,
  selectedExtras,
  onClose,
}: any) => {
  // depositAmount isn't provided as a prop for the summary; use 0 as default here
  const roi = calculateROI({
    cabinType,
    occupancyRate,
    nightlyRate,
    selectedExtras,
    depositAmount: 0,
  });

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        zIndex: 1000,
        border: "3px solid #FFCF00",
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

      <h3
        style={{
          fontFamily:
            '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
          fontSize: "1.5rem",
          fontWeight: "900",
          fontStyle: "italic",
          color: "#0E181F",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        ROI SUMMARY
      </h3>

      <div
        style={{
          background: "linear-gradient(135deg, #FFCF00 0%, #FFD700 100%)",
          padding: "1.5rem",
          borderRadius: "12px",
          color: "#0E181F",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          {roi.roi.toFixed(1)}% ROI
        </div>
        <div style={{ fontSize: "1rem", opacity: 0.8 }}>
          Annual Return on Investment
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.75rem 0",
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: "600" }}>Total Investment:</span>
          <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            ${roi.totalInvestment.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.75rem 0",
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: "600" }}>Annual Revenue:</span>
          <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            ${roi.annualRevenue.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.75rem 0",
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: "600" }}>Annual Profit:</span>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#0E181F",
            }}
          >
            ${roi.annualProfit.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.75rem 0",
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: "600" }}>Monthly Profit:</span>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#0E181F",
            }}
          >
            ${roi.monthlyProfit.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.75rem 0",
          }}
        >
          <span style={{ fontWeight: "600" }}>Effective Nightly Rate:</span>
          <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            ${roi.effectiveNightlyRate}
          </span>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            alert("Investment process would start here!");
            onClose();
          }}
          style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
        >
          Proceed with Investment
        </button>
      </div>
    </div>
  );
};
