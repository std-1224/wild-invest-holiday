// TikTok Carousel Component
export const TikTokCarousel = () => (
  <div
    className="section"
    style={{ backgroundColor: "#0E181F", color: "white" }}
  >
    <h2 className="section-title" style={{ color: "#FFCF00" }}>
      WILD ADVENTURES
    </h2>
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        gap: "1rem",
        padding: "1rem 0",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div style={{ minWidth: "300px", textAlign: "center" }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "2rem",
            borderRadius: "12px",
            border: "2px solid #FFCF00",
          }}
        >
          <h3 style={{ color: "#FFCF00", marginBottom: "1rem" }}>
            🏔️ Mountain Adventures
          </h3>
          <p style={{ color: "white", marginBottom: "1rem" }}>
            Experience breathtaking mountain views and outdoor adventures
          </p>
          <a
            href="https://www.tiktok.com/@wildthingsaustralia"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            Follow @wildthingsaustralia
          </a>
        </div>
      </div>
      <div style={{ minWidth: "300px", textAlign: "center" }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "2rem",
            borderRadius: "12px",
            border: "2px solid #86DBDF",
          }}
        >
          <h3 style={{ color: "#86DBDF", marginBottom: "1rem" }}>
            🌲 Nature's Playground
          </h3>
          <p style={{ color: "white", marginBottom: "1rem" }}>
            Discover the beauty of nature in our pristine locations
          </p>
          <a
            href="https://www.tiktok.com/@wildthingsaustralia"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            Watch More
          </a>
        </div>
      </div>
      <div style={{ minWidth: "300px", textAlign: "center" }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "2rem",
            borderRadius: "12px",
            border: "2px solid #EC874C",
          }}
        >
          <h3 style={{ color: "#EC874C", marginBottom: "1rem" }}>
            🏕️ Cabin Life
          </h3>
          <p style={{ color: "white", marginBottom: "1rem" }}>
            Experience the perfect blend of comfort and adventure
          </p>
          <a
            href="https://www.tiktok.com/@wildthingsaustralia"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            See More
          </a>
        </div>
      </div>
    </div>
  </div>
);
