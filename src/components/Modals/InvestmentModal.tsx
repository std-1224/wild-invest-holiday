import { useState } from "react";
import {
  calculateROI,
  getAvailableExtrasForCabin,
} from "../../config/mockCalculate";

// Investment Modal Component - Tesla-style design
export const InvestmentModal = ({ cabin, onClose, onInvest }: any) => {
  type CabinType = "1BR" | "2BR" | "3BR";

  const [selectedCabinType, setSelectedCabinType] = useState<CabinType>(
    (cabin.id as CabinType) || "1BR"
  );
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [financingType, setFinancingType] = useState<"paid" | "financed">(
    "paid"
  );
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [occupancyRate, setOccupancyRate] = useState<number>(66);
  const [nightlyRate, setNightlyRate] = useState<number>(200);

  const availableExtras = getAvailableExtrasForCabin(selectedCabinType);
  const roi = calculateROI(
    selectedCabinType,
    occupancyRate,
    nightlyRate,
    selectedExtras,
    financingType,
    depositAmount
  );

  const cabinFeatures: Record<"1BR" | "2BR" | "3BR", string[]> = {
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
    "3BR": [
      "3 Bedrooms",
      "2 Bathrooms",
      "Full Kitchen",
      "Living Area",
      "Outdoor Deck",
      "Parking",
      "Laundry",
    ],
  };

  const cabinPrices: Record<"1BR" | "2BR" | "3BR", number> = {
    "1BR": 110000,
    "2BR": 135000,
    "3BR": 160000,
  };

  const cabinImages: Record<"1BR" | "2BR" | "3BR", string> = {
    "1BR": "/1BR.jpg",
    "2BR": "/2BR.jpg",
    "3BR": "/3BR.jpg",
  };

  const cabinVideos: Record<"1BR" | "2BR" | "3BR", string> = {
    "1BR": "/1br-cabin-video.mp4",
    "2BR": "/2BR.mp4",
    "3BR": "/3br-cabin-video.mp4",
  };

  const handleCabinTypeChange = (newCabinType: "1BR" | "2BR" | "3BR") => {
    setSelectedCabinType(newCabinType);
    setSelectedExtras([]); // Clear extras when changing cabin type
  };

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
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* Main Content Area - Scrollable */}
      <div
        style={{
          background: "white",
          flex: 1,
          overflowY: "auto",
          paddingBottom: "180px", // Space for sticky footer
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "fixed",
              top: "1rem",
              right: "1rem",
              background: "white",
              border: "2px solid #86DBDF",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#666",
              zIndex: 101,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          <h2
            style={{
              fontFamily:
                '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
              fontSize: "3rem",
              fontWeight: "900",
              fontStyle: "italic",
              color: "#0E181F",
              marginBottom: "3rem",
              textAlign: "center",
            }}
          >
            INVEST IN A HOLIDAY HOME
          </h2>

          {/* Cabin Selection Cards - Tesla Style */}
          <div style={{ marginBottom: "4rem" }}>
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#0E181F",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Select Your Cabin
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {(["1BR", "2BR", "3BR"] as CabinType[]).map((cabinType) => (
                <div
                  key={cabinType}
                  onClick={() => handleCabinTypeChange(cabinType)}
                  style={{
                    background:
                      selectedCabinType === cabinType ? "#FFCF00" : "white",
                    border:
                      selectedCabinType === cabinType
                        ? "4px solid #0E181F"
                        : "2px solid #86DBDF",
                    borderRadius: "16px",
                    padding: "2rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "grid",
                    gridTemplateColumns: "300px 1fr",
                    gap: "2rem",
                    alignItems: "center",
                  }}
                >
                  <video
                    src={cabinVideos[cabinType]}
                    poster={cabinImages[cabinType]}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                      backgroundColor: "#000",
                    }}
                    onMouseEnter={(e) => {
                      try {
                        e.currentTarget.play();
                      } catch (_) {}
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      try {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      } catch (_) {}
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onError={(e) => {
                      // Hide video if it fails; poster still shows
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div>
                    <h4
                      style={{
                        fontFamily:
                          '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                        fontSize: "2rem",
                        fontWeight: "900",
                        fontStyle: "italic",
                        color: "#0E181F",
                        marginBottom: "1rem",
                      }}
                    >
                      {cabinType === "1BR"
                        ? "1 BEDROOM CABIN"
                        : cabinType === "2BR"
                        ? "2 BEDROOM CABIN"
                        : "3 BEDROOM CABIN"}
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Price
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#0E181F",
                          }}
                        >
                          ${cabinPrices[cabinType].toLocaleString("en-AU")}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>
                          plus GST
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Typical Nightly Rate
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#0E181F",
                          }}
                        >
                          ${nightlyRate}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>
                          per night
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Occupancy Rate
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#0E181F",
                          }}
                        >
                          {roi.effectiveOccupancyRate.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>
                          {roi.occupancyBoost > 0 &&
                            `(+${roi.occupancyBoost}% boost)`}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Projected Annual ROI
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#FFCF00",
                          }}
                        >
                          {roi.roi.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>
                          annual return
                        </div>
                      </div>
                    </div>
                    {selectedCabinType === cabinType && (
                      <div style={{ marginTop: "1rem" }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Features:
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          }}
                        >
                          {cabinFeatures[cabinType]?.map((feature, index) => (
                            <span
                              key={index}
                              style={{
                                background: "#86DBDF",
                                color: "#0E181F",
                                padding: "0.375rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                fontWeight: "500",
                              }}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Calculator Inputs - Stacked Vertically */}
          <div style={{ marginBottom: "4rem" }}>
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "#0E181F",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Configure Your Investment
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Nightly Rate */}
              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #eee",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    fontWeight: "600",
                    fontSize: "1rem",
                    color: "#0E181F",
                  }}
                >
                  Typical Nightly Rental Amount ($)
                </label>
                <input
                  type="number"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                />
              </div>

              {/* Occupancy Rate */}
              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #eee",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    fontWeight: "600",
                    fontSize: "1rem",
                    color: "#0E181F",
                  }}
                >
                  Base Occupancy Rate (%)
                </label>
                <input
                  type="number"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                />
              </div>

              {/* Payment Method */}
              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #eee",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    fontWeight: "600",
                    fontSize: "1rem",
                    color: "#0E181F",
                  }}
                >
                  Payment Method
                </label>
                <select
                  value={financingType}
                  onChange={(e) =>
                    setFinancingType(e.target.value as "paid" | "financed")
                  }
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  <option value="paid">Fully Paid</option>
                  <option value="financed">Financed</option>
                </select>
              </div>

              {/* Deposit Amount */}
              {financingType === "financed" && (
                <div
                  style={{
                    background: "#f9f9f9",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: "1px solid #eee",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: "600",
                      fontSize: "1rem",
                      color: "#0E181F",
                    }}
                  >
                    Deposit Amount ($)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseInt(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #86DBDF",
                      borderRadius: "8px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                    placeholder="Enter deposit amount"
                  />
                </div>
              )}

              {/* Premium Extras */}
              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #eee",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    fontWeight: "600",
                    fontSize: "1rem",
                    color: "#0E181F",
                  }}
                >
                  Premium Extras
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                  }}
                >
                  {availableExtras.map((extra) => (
                    <label
                      key={extra.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        padding: "1rem",
                        background: selectedExtras.includes(extra.id)
                          ? "#FFCF00"
                          : "white",
                        border: selectedExtras.includes(extra.id)
                          ? "2px solid #0E181F"
                          : "2px solid #86DBDF",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(extra.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExtras([...selectedExtras, extra.id]);
                          } else {
                            setSelectedExtras(
                              selectedExtras.filter((id) => id !== extra.id)
                            );
                          }
                        }}
                        style={{
                          marginRight: "0.75rem",
                          marginTop: "0.25rem",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            marginBottom: "0.25rem",
                            fontSize: "0.95rem",
                          }}
                        >
                          {extra.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#666",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {extra.nightlyImpact > 0 &&
                            `+$${extra.nightlyImpact}/night`}
                          {(extra.occupancyBoost ?? 0) > 0 &&
                            ` +${extra.occupancyBoost}% occupancy`}
                          {(extra.energySavings ?? 0) > 0 &&
                            ` Save $${extra.energySavings}/year`}
                        </div>
                        <div style={{ fontWeight: "bold", color: "#0E181F" }}>
                          ${extra.price.toLocaleString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky ROI Summary Footer - Tesla Style */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "white",
          borderTop: "4px solid #FFCF00",
          padding: "1.5rem 2rem",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.5rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Total Investment
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#0E181F",
                  }}
                >
                  ${roi.actualInvestment.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Annual Profit
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#0E181F",
                  }}
                >
                  ${roi.annualProfit.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Monthly Profit
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#0E181F",
                  }}
                >
                  ${roi.monthlyProfit.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Annual ROI
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#FFCF00",
                  }}
                >
                  {roi.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              alert("Investment process would start here!");
              onInvest &&
                onInvest({
                  ...cabin,
                  id: selectedCabinType,
                  price: cabinPrices[selectedCabinType],
                });
              onClose();
            }}
            style={{
              padding: "1rem 3rem",
              fontSize: "1.2rem",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            Proceed with Investment
          </button>
        </div>
      </div>
    </div>
  );
};
