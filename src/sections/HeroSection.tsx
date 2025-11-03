// Hero Section Component
export const HeroSection = ({ onInvestClick }: any) => (
  <div className="relative h-[calc(100vh-90px)] flex items-center justify-center overflow-hidden">
    <video
      src="/hero-video.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute top-0 left-0 w-full h-full object-cover z-[1]"
    />
    <div className="absolute top-0 left-0 w-full h-full bg-[#0e181f]/40 z-[2] pointer-events-none"></div>
    <div className="relative z-[3] text-center text-white max-w-[800px] px-4">
      <h1 className="text-[clamp(3rem,8vw,5rem)] font-black italic mb-6 text-[#ffcf00] [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
        RECONNECT WITH THE WILD
      </h1>
      <p className="text-xl mb-8 opacity-90">
        Invest in sustainable holiday homes and create lasting memories in
        nature
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <a
          href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-lg font-semibold text-base no-underline inline-block transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
        >
          Book Your Next Holiday
        </a>
        <button
          onClick={() => {
            if (onInvestClick) onInvestClick();
            setTimeout(() => {
              const investSection = document.getElementById("invest");
              if (investSection) {
                investSection.scrollIntoView({ behavior: "smooth" });
              }
            }, 0);
          }}
          className="px-6 py-3 rounded-lg font-semibold text-base no-underline inline-block transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
        >
          Invest in Holiday Homes
        </button>
      </div>
    </div>
  </div>
);
