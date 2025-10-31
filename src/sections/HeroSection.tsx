// Hero Section Component
export const HeroSection = ({ onInvestClick }: any) => (
  <div className="hero-section">
    <video
      src="/hero-video.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="hero-video"
    />
    <div className="hero-overlay"></div>
    <div className="hero-content">
      <h1 className="hero-title">RECONNECT WITH THE WILD</h1>
      <p className="hero-subtitle">
        Invest in sustainable holiday homes and create lasting memories in
        nature
      </p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
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
          className="btn btn-secondary"
        >
          Invest in Holiday Homes
        </button>
      </div>
    </div>
  </div>
);
