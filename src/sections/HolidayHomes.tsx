import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { cabins, calculateROI, colors, defaultNightlyRates, faqs, getExtrasForCabin } from "../config/mockCalculate";

type CabinType = "1BR" | "2BR" | "3BR";

interface HolidayHomesProps {
  setShowInvestmentModal: (value: boolean) => void;
  setSelectedCabin: (value: string) => void;
  setSelectedCabinForInvestment: (value: string) => void;
}

export const HolidayHomesPage: React.FC<HolidayHomesProps> = ({
  setShowInvestmentModal,
  setSelectedCabinForInvestment,
  setSelectedCabin,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [roiInputs, setRoiInputs] = useState<{
    cabinType: CabinType;
    occupancyRate: number;
    nightlyRate: number;
  }>({
    cabinType: "1BR",
    occupancyRate: 66,
    nightlyRate: 160,
  });
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const investmentSteps = [
    { title: "Reservation", subtitle: "Week 0", icon: "💳", timeline: "Start" },
    {
      title: "Sign Purchase Agreement",
      subtitle: "Week 1",
      icon: "📝",
      timeline: "1 week",
    },
    { title: "Pay Deposit", subtitle: "30%", icon: "💰", timeline: "2 weeks" },
    {
      title: "Build Complete",
      subtitle: "30% - 8 weeks",
      icon: "🏗️",
      timeline: "10 weeks",
    },
    {
      title: "Inspect Cabin",
      subtitle: "Week 11",
      icon: "🔍",
      timeline: "11 weeks",
    },
    {
      title: "Hand Over Keys",
      subtitle: "50% - Week 12",
      icon: "🗝️",
      timeline: "12 weeks",
    },
  ];

    const handleCabinTypeChange = (newCabinType: CabinType) => {
    setRoiInputs({
      ...roiInputs,
      cabinType: newCabinType,
      nightlyRate: defaultNightlyRates[newCabinType as keyof typeof defaultNightlyRates]
    });
    setSelectedExtras([]); // Clear selected extras when changing cabin type
  };

    const roiResults = calculateROI(roiInputs.cabinType, roiInputs.occupancyRate, roiInputs.nightlyRate, selectedExtras);

  return (
    <div
      className="pt-20 min-h-screen w-full max-w-full overflow-x-hidden"
      style={{ backgroundColor: colors.lightGray }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1
          className="text-5xl md:text-6xl font-bold mb-4 text-center italic"
          style={{
            fontFamily:
              '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
            fontWeight: "900",
            fontStyle: "italic",
            color: colors.darkBlue,
          }}
        >
          INVEST IN A HOLIDAY HOME
        </h1>
        <p className="text-xl text-center text-gray-700 mb-12 max-w-3xl mx-auto">
          Invest in your own piece of paradise. Earn passive income while
          providing families with unforgettable outdoor experiences.
        </p>

        {/* Investment Timeline */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h2
            className="text-3xl font-bold mb-8 text-center italic"
            style={{
              fontFamily:
                '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
              fontWeight: "900",
              fontStyle: "italic",
              color: colors.darkBlue,
            }}
          >
            YOUR INVESTMENT JOURNEY
          </h2>
          <div
            className="hidden md:flex"
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {investmentSteps.map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className="timeline-step"
                  style={{
                    flex: "1 1 120px",
                    minWidth: "120px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: colors.yellow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      margin: "0 auto 8px",
                      border: `3px solid ${colors.darkBlue}`,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(255, 207, 0, 0.4)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {step.icon}
                  </div>
                  <h3
                    className="font-bold mb-1 text-sm"
                    style={{
                      color: colors.darkBlue,
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      lineHeight: "1.2",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-xs text-gray-600 mb-1"
                    style={{
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      lineHeight: "1.2",
                    }}
                  >
                    {step.subtitle}
                  </p>
                  <div
                    style={{
                      backgroundColor: colors.aqua,
                      color: colors.darkBlue,
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      height: "20px",
                      lineHeight: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {step.timeline}
                  </div>
                </div>
                {index < investmentSteps.length - 1 && (
                  <div
                    style={{
                      flex: "0 0 30px",
                      height: "2px",
                      backgroundColor: colors.aqua,
                      position: "relative",
                      animation: "pulse 2s infinite",
                      marginBottom: "72px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: "-6px",
                        top: "-4px",
                        width: "0",
                        height: "0",
                        borderLeft: `6px solid ${colors.aqua}`,
                        borderTop: "4px solid transparent",
                        borderBottom: "4px solid transparent",
                      }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile vertical layout */}
          <div className="md:hidden space-y-6">
            {investmentSteps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="timeline-step flex flex-col items-center text-center">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: colors.yellow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "36px",
                      margin: "0 auto 12px",
                      border: `4px solid ${colors.darkBlue}`,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(255, 207, 0, 0.4)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {step.icon}
                  </div>
                  <h3
                    className="font-bold mb-1"
                    style={{
                      color: colors.darkBlue,
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      lineHeight: "1.2",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-gray-600 mb-1"
                    style={{
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      lineHeight: "1.2",
                    }}
                  >
                    {step.subtitle}
                  </p>
                  <div
                    style={{
                      backgroundColor: colors.aqua,
                      color: colors.darkBlue,
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      height: "24px",
                      lineHeight: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {step.timeline}
                  </div>
                </div>
                {index < investmentSteps.length - 1 && (
                  <div className="flex justify-center">
                    <div
                      style={{
                        width: "3px",
                        height: "40px",
                        backgroundColor: colors.aqua,
                        position: "relative",
                        animation: "pulse 2s infinite",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-8px",
                          left: "-5px",
                          width: "0",
                          height: "0",
                          borderTop: `8px solid ${colors.aqua}`,
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://calendly.com/james-s-wildthings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
                style={{ backgroundColor: colors.orange, color: colors.white }}
              >
                📅 Book an Inspection
              </a>
              <button
                onClick={() => document.getElementById("chat-widget")?.click()}
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
                style={{ backgroundColor: colors.aqua, color: colors.darkBlue }}
              >
                💬 Chat with James
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 600px", minWidth: "300px" }}>
            <div className="space-y-8 mb-8">
              {Object.entries(cabins).map(([key, cabin]) => (
                <div
                  key={key}
                  className="bg-white rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {key === "3BR" ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          minHeight: "320px",
                        }}
                      >
                        <video
                          src="/3br-cabin-video.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          webkit-playsinline="true"
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            minHeight: "320px",
                          }}
                        />
                      </div>
                    ) : key === "1BR" ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          minHeight: "320px",
                        }}
                      >
                        <video
                          src="/1br-cabin-video.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          webkit-playsinline="true"
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            minHeight: "320px",
                          }}
                        />
                      </div>
                    ) : key === "2BR" ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          minHeight: "320px",
                        }}
                      >
                        <video
                          src="/2BR.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          webkit-playsinline="true"
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            minHeight: "320px",
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={cabin.image}
                        alt={cabin.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          minHeight: "320px",
                        }}
                      />
                    )}
                    <div className="p-6">
                      <h3
                        className="text-2xl font-bold mb-2 italic"
                        style={{
                          fontFamily:
                            '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                          fontWeight: "900",
                          fontStyle: "italic",
                          color: colors.darkBlue,
                        }}
                      >
                        {cabin.name.toUpperCase()}
                      </h3>
                      <div
                        className="text-3xl font-bold mb-4"
                        style={{ color: colors.yellow }}
                      >
                        ${cabin.price.toLocaleString("en-AU")}
                        <span
                          className="text-sm ml-2"
                          style={{ color: colors.darkBlue }}
                        >
                          plus GST
                        </span>
                      </div>

                      <div
                        className="mb-4 p-3 rounded-lg"
                        style={{ backgroundColor: `${colors.aqua}33` }}
                      >
                        <h4
                          className="font-bold text-sm mb-2"
                          style={{ color: colors.darkBlue }}
                        >
                          Rental Rates:
                        </h4>
                        <div
                          className="text-sm space-y-1"
                          style={{ color: colors.darkBlue }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Off Peak:</span>
                            <span
                              className="font-bold"
                              style={{ color: colors.darkBlue }}
                            >
                              ${cabin.rentOffPeak}/night
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Peak{key === "3BR" ? " (snow)" : ""}:</span>
                            <span
                              className="font-bold"
                              style={{ color: colors.darkBlue }}
                            >
                              ${cabin.rentPeak}/night
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="space-y-2 mb-4 text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: colors.aqua,
                              marginRight: "8px",
                            }}
                          ></div>
                          <span>${cabin.siteFee}/week site fee</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: colors.aqua,
                              marginRight: "8px",
                            }}
                          ></div>
                          <span>20% management fee</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCabinForInvestment(key);
                          setShowInvestmentModal(true);
                        }}
                        className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 mb-2"
                        style={{
                          backgroundColor: colors.yellow,
                          color: colors.darkBlue,
                        }}
                      >
                        Reserve Yours Today
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="w-full md:sticky md:w-auto"
            style={{
              flex: "0 0 auto",
              minWidth: "300px",
              top: "100px",
              maxWidth: "100%",
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <Calculator
                  size={28}
                  style={{ color: colors.yellow, marginRight: "12px" }}
                />
                <h2
                  className="text-2xl font-bold italic"
                  style={{
                    fontFamily:
                      '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                    fontWeight: "900",
                    fontStyle: "italic",
                    color: colors.darkBlue,
                  }}
                >
                  ROI CALCULATOR
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Cabin Type
                  </label>
                  <div className="space-y-2">
                    {Object.entries(cabins).map(([key, cabin]) => {
                      const cabinKey = key as CabinType;
                      return (
                      <div
                        key={key}
                        onClick={() => handleCabinTypeChange(cabinKey)}
                        className="cursor-pointer rounded-lg overflow-hidden transition-all"
                        style={{
                          border: `3px solid ${
                            roiInputs.cabinType === (key as CabinType)
                              ? colors.yellow
                              : colors.aqua
                          }`,
                          boxShadow:
                            roiInputs.cabinType === (key as CabinType)
                              ? "0 4px 12px rgba(255, 207, 0, 0.3)"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px",
                          }}
                        >
                          <img
                            src={cabin.image}
                            alt={cabin.name}
                            style={{
                              width: "80px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "bold",
                                fontSize: "14px",
                                color: colors.darkBlue,
                              }}
                            >
                              {cabin.name}
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: colors.yellow,
                              }}
                            >
                              ${cabin.price.toLocaleString("en-AU")} plus GST
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Occupancy Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={roiInputs.occupancyRate || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : parseFloat(e.target.value);
                      setRoiInputs({
                        ...roiInputs,
                        occupancyRate:
                          value === "" ? 0 : isNaN(value) ? 0 : value,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none"
                    style={{ border: `2px solid ${colors.aqua}` }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-bold mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Nightly Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roiInputs.nightlyRate || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : parseFloat(e.target.value);
                      setRoiInputs({
                        ...roiInputs,
                        nightlyRate:
                          value === "" ? 0 : isNaN(value) ? 0 : value,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none"
                    style={{ border: `2px solid ${colors.aqua}` }}
                  />
                </div>
              </div>

              {/* Optional Extras Selection */}
              <div className="mb-6">
                <h3
                  className="font-bold mb-3"
                  style={{ color: colors.darkBlue }}
                >
                  Optional Extras
                </h3>
                <div className="space-y-2">
                  {getExtrasForCabin(roiInputs.cabinType).map((extra) => (
                    <label
                      key={extra.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                      style={{
                        backgroundColor: selectedExtras.includes(extra.id)
                          ? `${colors.yellow}33`
                          : colors.lightGray,
                        border: `2px solid ${
                          selectedExtras.includes(extra.id)
                            ? colors.yellow
                            : "transparent"
                        }`,
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
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        {(() => {
                          const base = calculateROI(
                            roiInputs.cabinType,
                            roiInputs.occupancyRate,
                            roiInputs.nightlyRate,
                            []
                          );
                          const withExtra = calculateROI(
                            roiInputs.cabinType,
                            roiInputs.occupancyRate,
                            roiInputs.nightlyRate,
                            [extra.id]
                          );
                          const roiImpact = (withExtra.roi || 0) - (base.roi || 0);
                          return (
                            <>
                              <div
                                className="font-bold text-sm"
                                style={{ color: colors.darkBlue }}
                              >
                                {extra.name}
                              </div>
                              <div className="text-xs" style={{ color: colors.orange }}>
                                {extra.impactDescription}
                              </div>
                              <div
                                className="text-xs mt-1"
                                style={{
                                  color:
                                    roiImpact > 0
                                      ? "#059669"
                                      : roiImpact < 0
                                      ? "#EF4444"
                                      : "#6B7280",
                                }}
                              >
                                ROI Impact: {roiImpact > 0 ? "+" : ""}
                                {roiImpact.toFixed(1)}%
                                {extra.id === "solar" && (
                                  <span className="ml-1">
                                    (Eliminates $
                                    {(
                                      (roiInputs.occupancyRate / 100) *
                                      365 *
                                      20
                                    ).toLocaleString()}{" "}
                                    energy costs)
                                  </span>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div
                        className="font-bold text-sm"
                        style={{ color: colors.darkBlue }}
                      >
                        ${extra.price.toLocaleString()}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Pricing Display */}
              <div
                className="rounded-lg p-4 mb-4"
                style={{
                  backgroundColor: `${colors.yellow}33`,
                  border: `2px solid ${colors.yellow}`,
                }}
              >
                <h3
                  className="font-bold mb-3 text-sm"
                  style={{ color: colors.darkBlue }}
                >
                  Dynamic Nightly Rate
                </h3>
                <div className="space-y-2 text-sm">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Base Rate ({roiInputs.cabinType}):</span>
                    <span className="font-bold">
                      ${defaultNightlyRates[roiInputs.cabinType]}
                    </span>
                  </div>
                  {selectedExtras.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: colors.orange,
                      }}
                    >
                      <span>Options Impact:</span>
                      <span className="font-bold">
                        {roiResults.effectiveNightlyRate -
                          defaultNightlyRates[roiInputs.cabinType] >=
                        0
                          ? "+"
                          : ""}
                        $
                        {(
                          roiResults.effectiveNightlyRate -
                          defaultNightlyRates[roiInputs.cabinType]
                        ).toFixed(0)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "8px",
                      borderTop: `2px solid ${colors.darkBlue}`,
                      fontWeight: "bold",
                    }}
                  >
                    <span>Final Rate:</span>
                    <span style={{ color: colors.darkBlue }}>
                      ${roiResults.effectiveNightlyRate.toFixed(0)}/night
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Investment Display */}
              <div
                className="rounded-lg p-4 mb-4"
                style={{ backgroundColor: `${colors.aqua}33` }}
              >
                <h3
                  className="font-bold mb-3 text-sm"
                  style={{ color: colors.darkBlue }}
                >
                  Total Investment
                </h3>
                <div className="space-y-2 text-sm">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Base Cabin Price:</span>
                    <span className="font-bold">
                      ${cabins[roiInputs.cabinType].price.toLocaleString()}
                    </span>
                  </div>
                  {roiResults.extrasCost > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: colors.orange,
                      }}
                    >
                      <span>Selected Extras:</span>
                      <span className="font-bold">
                        +${roiResults.extrasCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "8px",
                      borderTop: `2px solid ${colors.darkBlue}`,
                      fontWeight: "bold",
                    }}
                  >
                    <span>Total:</span>
                    <span style={{ color: colors.darkBlue }}>
                      ${roiResults.totalInvestment.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-4 mb-4"
                style={{ backgroundColor: `${colors.aqua}33` }}
              >
                <h3
                  className="font-bold mb-3 text-sm"
                  style={{ color: colors.darkBlue }}
                >
                  Annual Revenue
                </h3>
                <div className="space-y-2 text-sm">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Gross Revenue:</span>
                    <span className="font-bold">
                      $
                      {roiResults.grossAnnualRevenue.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      plus GST
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: colors.orange,
                    }}
                  >
                    <span>Management (20%):</span>
                    <span className="font-bold">
                      -$
                      {roiResults.wildThingsCommissionAmount.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: colors.orange,
                    }}
                  >
                    <span>Site Fee:</span>
                    <span className="font-bold">
                      -$
                      {roiResults.siteFees.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: colors.orange,
                    }}
                  >
                    <span>Energy Costs:</span>
                    <span className="font-bold">
                      -$
                      {(roiResults as any).totalEnergyCosts?.toLocaleString?.("en-AU") ?? "0"}
                    </span>
                  </div>
                  {(roiResults as any).annualCostSavings > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#059669",
                      }}
                    >
                      <span>Cost Savings (Solar):</span>
                      <span className="font-bold">
                        +$
                        {(roiResults as any).annualCostSavings?.toLocaleString?.("en-AU") ?? "0"}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "8px",
                      borderTop: `2px solid ${colors.darkBlue}`,
                      color: "#059669",
                      fontWeight: "bold",
                    }}
                  >
                    <span>Net Income:</span>
                    <span>
                      $
                      {roiResults.annualProfit.toLocaleString("en-AU", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.orange,
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  className="font-bold mb-1 text-sm"
                  style={{ color: colors.white }}
                >
                  Estimated Annual ROI
                </h3>
                <div
                  className="text-4xl font-bold"
                  style={{ color: colors.white }}
                >
                  {roiResults.roi.toFixed(1)}%
                </div>
                {roiResults.extrasCost > 0 && (
                  <p className="text-xs mt-2" style={{ color: colors.white }}>
                    Based on ${roiResults.totalInvestment.toLocaleString()}{" "}
                    total investment
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedCabinForInvestment(roiInputs.cabinType);
                  setShowInvestmentModal(true);
                }}
                className="w-full py-4 rounded-lg font-bold transition-all hover:opacity-90 mb-4"
                style={{
                  backgroundColor: colors.yellow,
                  color: colors.darkBlue,
                  fontSize: "18px",
                }}
              >
                Reserve {cabins[roiInputs.cabinType].name} Today
              </button>

              <p className="text-xs text-gray-600 italic">
                * High-level estimate. Insurance, interest, maintenance not
                included.
              </p>
            </div>
          </div>
        </div>
      </div>

    

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2
            className="text-3xl font-bold mb-8 text-center italic"
            style={{
              fontFamily:
                '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
              fontWeight: "900",
              fontStyle: "italic",
              color: colors.darkBlue,
            }}
          >
            INVESTOR FAQS
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden transition-all"
                style={{ border: `2px solid ${colors.aqua}` }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left font-bold transition-all hover:opacity-90 flex justify-between items-center"
                  style={{
                    backgroundColor:
                      openFaq === index ? colors.yellow : colors.white,
                    color: colors.darkBlue,
                  }}
                >
                  <span>{faq.question}</span>
                  <span
                    style={{
                      fontSize: "24px",
                      transition: "transform 0.3s",
                      transform:
                        openFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: `${colors.aqua}11`,
                      borderTop: `2px solid ${colors.aqua}`,
                    }}
                  >
                    <p style={{ color: colors.darkBlue, lineHeight: "1.6" }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
