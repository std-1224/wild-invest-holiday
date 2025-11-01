interface LocationsPageProps {}

export const LocationsPage = ({}: LocationsPageProps) => {
  return (
    <div
      style={{
        paddingTop: "120px",
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
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
            marginBottom: "4rem",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          OUR LOCATIONS
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "3rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              border: "2px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.2)";
              e.currentTarget.style.borderColor = "#FFCF00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <video
              src="/mansfield-flythrough.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
              }}
            />
            <div style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#0E181F",
                  marginBottom: "1rem",
                }}
              >
                Mansfield, Victoria
              </h3>
              <p style={{ color: "#666", marginBottom: "1rem" }}>
                Experience the beauty of the Victorian High Country with skiing,
                hiking, and mountain adventures.
              </p>
              {/* Attractions icons grid */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  alignItems: "center",
                  marginTop: "0.5rem",
                }}
              >
                {[
                  { key: "water-skiing", label: "Water Skiing", src: "/water-ski.svg" },
                  { key: "playground", label: "Playground", src: "/playground.svg" },
                  { key: "pool", label: "Pool", src: "/pool.svg" },
                  { key: "skiing", label: "Skiing", src: "/skiing.svg" },
                  { key: "hiking", label: "Hiking", src: "/hiking.svg" },
                  { key: "museum", label: "Museum", src: "/museum.svg" },
                  { key: "mt-buller", label: "Mt Buller", src: "/mt-buller.svg" },
                  { key: "food-trucks", label: "Food Trucks", src: "/food-trucks.svg" },
                  { key: "bottle-shop", label: "Bottle Shop", src: "/bottle-shop.svg" },
                  { key: "pizza-ovens", label: "Pizza Ovens", src: "/pizza-ovens.svg" },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 90,
                      fontSize: "0.8rem",
                      color: "#0E181F",
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      onError={(e: any) => {
                        // If the specific icon is missing, fall back to a generic icon
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/attractions/default.png";
                      }}  
                      style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 6 }}
                    />
                    <div style={{ textAlign: "center" }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <a
                href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: "0.9rem" }}
              >
                Book a Stay
              </a>
            </div>
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              border: "2px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.2)";
              e.currentTarget.style.borderColor = "#FFCF00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <video
              src="/byron-coming-soon.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
              }}
            />
            <div style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#0E181F",
                  marginBottom: "1rem",
                }}
              >
                Byron Bay, NSW
              </h3>
              <div
                style={{
                  background: "#EC874C",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  display: "inline-block",
                  marginBottom: "1rem",
                }}
              >
                Coming Soon
              </div>
              <p style={{ color: "#666", marginBottom: "1rem" }}>
                Coastal paradise coming soon. Be the first to know when we launch in
                Byron Bay.
              </p>
              <button
                className="btn btn-secondary"
                disabled
                style={{ opacity: 0.5, fontSize: "0.9rem" }}
              >
                Book a Stay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};