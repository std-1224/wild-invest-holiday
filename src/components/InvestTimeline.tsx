import React, { useState, useEffect } from "react";
import { investmentSteps } from "../config/mockCalculate";

export const InvestTimeline = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Auto-progress animation through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % investmentSteps.length);
    }, 2000); // Change step every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12 px-4">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-[2.5rem] font-black italic text-[#ffcf00] mb-2 font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
          YOUR INVESTMENT JOURNEY
        </h2>
        <p className="text-[#0e181f] text-lg">
          From reservation to keys in hand — 10 weeks to ownership
        </p>
        <a
          href="https://wildthingsim.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f] no-underline"
        >
          📄 Information Memorandum
        </a>
      </div>

      {/* Desktop Timeline */}
      <div className="hidden md:flex justify-between items-center gap-2 max-w-6xl mx-auto">
        {investmentSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isHovered = index === hoveredStep;
          const isPast = index < activeStep;

          return (
            <React.Fragment key={index}>
              <div
                className="timeline-step flex-[1_1_120px] min-w-[120px] text-center flex flex-col items-center cursor-pointer"
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setActiveStep(index)}
              >
                {/* Icon Circle */}
                <div
                  className={`w-[70px] h-[70px] rounded-full flex items-center justify-center text-[32px] mx-auto mb-3 border-[4px] transition-all duration-500 flex-shrink-0 relative ${
                    isActive || isHovered
                      ? "bg-[#ffcf00] border-[#0e181f] scale-110 shadow-[0_12px_30px_rgba(255,207,0,0.5)]"
                      : isPast
                      ? "bg-[#86dbdf] border-[#0e181f] scale-100"
                      : "bg-white border-[#86dbdf] scale-90 opacity-60"
                  }`}
                  style={{
                    animation: isActive
                      ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                      : "none",
                  }}
                >
                  {step.icon}

                  {/* Checkmark for completed steps */}
                  {isPast && !isActive && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      ✓
                    </div>
                  )}

                  {/* Active indicator ring */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-4 border-[#ffcf00] animate-ping opacity-75"></div>
                  )}
                </div>

                {/* Step Title */}
                <h3
                  className={`font-bold mb-1 text-sm h-6 flex items-center justify-center text-center leading-[1.2] transition-all duration-300 ${
                    isActive || isHovered
                      ? "text-[#ffcf00] scale-105"
                      : "text-[#0e181f]"
                  }`}
                >
                  {step.title}
                </h3>

                {/* Subtitle */}
                <p
                  className={`text-xs mb-1 h-5 flex items-center justify-center text-center leading-[1.2] transition-all duration-300 ${
                    isActive || isHovered
                      ? "text-[#0e181f] font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {step.subtitle}
                </p>

                {/* Timeline Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-bold h-6 leading-[12px] flex items-center justify-center text-center transition-all duration-300 ${
                    isActive || isHovered
                      ? "bg-[#ffcf00] text-[#0e181f] scale-105"
                      : isPast
                      ? "bg-[#86dbdf] text-[#0e181f]"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.timeline}
                </div>
              </div>

              {/* Connector Arrow */}
              {index < investmentSteps.length - 1 && (
                <div className="flex-[0_0_40px] relative mb-[80px]">
                  {/* Animated progress line */}
                  <div
                    className={`h-1 rounded-full transition-all duration-700 ${
                      isPast ? "bg-[#86dbdf]" : "bg-gray-300"
                    }`}
                    style={{
                      width: isPast
                        ? "100%"
                        : index === activeStep
                        ? "50%"
                        : "0%",
                      transition: "width 0.7s ease-in-out",
                    }}
                  ></div>

                  {/* Arrow head */}
                  <div
                    className={`absolute -right-1.5 -top-1 w-0 h-0 border-l-[8px] border-t-[5px] border-b-[5px] border-t-transparent border-b-transparent transition-all duration-500 ${
                      isPast ? "border-l-[#86dbdf]" : "border-l-gray-300"
                    }`}
                  ></div>

                  {/* Animated dots */}
                  {index === activeStep && (
                    <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
                      <div
                        className="h-full w-2 bg-[#ffcf00] rounded-full animate-pulse"
                        style={{
                          animation: "slide 1.5s linear infinite",
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Timeline (Vertical) */}
      <div className="md:hidden max-w-md mx-auto">
        {investmentSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isPast = index < activeStep;

          return (
            <div key={index} className="relative">
              <div
                className="flex items-start gap-4 pb-8"
                onClick={() => setActiveStep(index)}
              >
                {/* Icon Circle */}
                <div
                  className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-[28px] border-[3px] transition-all duration-500 flex-shrink-0 relative ${
                    isActive
                      ? "bg-[#ffcf00] border-[#0e181f] scale-110 shadow-[0_12px_30px_rgba(255,207,0,0.5)]"
                      : isPast
                      ? "bg-[#86dbdf] border-[#0e181f]"
                      : "bg-white border-[#86dbdf] opacity-60"
                  }`}
                >
                  {step.icon}
                  {isPast && !isActive && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      ✓
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3
                    className={`font-bold text-base mb-1 transition-all duration-300 ${
                      isActive ? "text-[#ffcf00]" : "text-[#0e181f]"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{step.subtitle}</p>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-[#ffcf00] text-[#0e181f]"
                        : isPast
                        ? "bg-[#86dbdf] text-[#0e181f]"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.timeline}
                  </div>
                </div>
              </div>

              {/* Vertical Connector */}
              {index < investmentSteps.length - 1 && (
                <div className="absolute left-[29px] top-[60px] w-0.5 h-8 bg-[#86dbdf]"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(2000%);
          }
        }
      `}</style>
    </div>
  );
};
