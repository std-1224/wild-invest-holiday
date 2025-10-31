// Mission Section Component
export const MissionSection = () => (
  <div
    className="section"
    style={{ backgroundColor: "#0E181F", color: "white" }}
  >
    <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <h2
        style={{
          fontFamily:
            '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
          fontSize: "2.5rem",
          fontWeight: "900",
          fontStyle: "italic",
          color: "#FFCF00",
          marginBottom: "2rem",
        }}
      >
        OUR MISSION
      </h2>
      <p
        style={{
          fontSize: "1.25rem",
          lineHeight: "1.6",
          color: "white",
          marginBottom: "2rem",
        }}
      >
        We are on a mission to create havens where everyone can come to
        disconnect from the world, from technology, and reconnect with family
        and nature.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌲</div>
          <h3 style={{ color: "#86DBDF", marginBottom: "0.5rem" }}>
            Nature First
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
            Preserving natural beauty
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👨‍👩‍👧‍👦</div>
          <h3 style={{ color: "#86DBDF", marginBottom: "0.5rem" }}>
            Family Focus
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
            Creating lasting memories
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💰</div>
          <h3 style={{ color: "#86DBDF", marginBottom: "0.5rem" }}>
            Smart Investment
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
            Sustainable returns
          </p>
        </div>
      </div>
    </div>
  </div>
);
