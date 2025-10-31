import { useEffect, useState } from "react";
import { TikTokCarousel } from "./components/TikTokCarousel";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./sections/HeroSection";
import { InvestmentModal } from "./components/Modals/InvestmentModal";
import { ROICalculatorPane } from "./components/Panels/ROICalculatorPane";
import { CabinCard } from "./components/Cards/CabinCard";
import { MissionSection } from "./sections/MissionSection";
import { LoginModal } from "./components/Modals/LoginModal";
import { FAQAccordion } from "./components/FAQAccordion";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(null);

  // Check for existing login on load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (userData: any) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleCabinInvest = (cabin: any) => {
    setSelectedCabin(cabin);
    setShowInvestmentModal(true);
  };

  // Removed legacy ROI summary handler (caused undefined state crash)

  const cabins = [
    {
      id: "1BR",
      name: "1 Bedroom Cabin",
      price: 110000,
      image: "/1BR.jpg",
    },
    {
      id: "2BR",
      name: "2 Bedroom Cabin",
      price: 135000,
      image: "/2BR.jpg",
    },
    {
      id: "3BR",
      name: "3 Bedroom Cabin",
      price: 160000,
      image: "/3BR.jpg",
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navigation
        onLoginClick={handleLogin}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
      />

      <div style={{marginTop: '124px'}}>
        {currentPage === "home" && (
          <>
            <HeroSection onInvestClick={() => setCurrentPage("invest")} />
            <TikTokCarousel />
            <MissionSection />
            <div className="section">
              <h2 className="section-title">Investment Opportunities</h2>
              <div className="cabin-grid">
                {cabins.map((cabin) => (
                  <CabinCard
                    key={cabin.id}
                    cabin={cabin}
                    onInvest={handleCabinInvest}
                  />
                ))}
              </div>
              
              {/* FAQ Section */}
              <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(14, 24, 31, 0.1)' }}>
                <FAQAccordion />
              </div>
            </div>
          </>
        )}

        {currentPage === "invest" && (
          <div
            id="invest"
            style={{
              paddingTop: "120px",
              minHeight: "100vh",
              backgroundColor: "#F5F5F5",
            }}
          >
            <div
              style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "0 20px",
              }}
            >
              <h1
                style={{
                  fontFamily:
                    '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                  fontSize: "clamp(3rem, 8vw, 5rem)",
                  fontWeight: "900",
                  fontStyle: "italic",
                  color: "#0E181F",
                  textAlign: "center",
                  marginBottom: "1rem",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                INVEST IN A HOLIDAY HOME
              </h1>
              <p
                style={{
                  fontSize: "1.25rem",
                  textAlign: "center",
                  color: "#666",
                  marginBottom: "3rem",
                  maxWidth: "800px",
                  margin: "0 auto 3rem",
                }}
              >
                Invest in your own piece of paradise. Earn passive income while
                providing families with unforgettable outdoor experiences.
              </p>

              {/* Two Column Layout: Cabin Cards Left, ROI Calculator Right */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 350px",
                  gap: "1rem",
                  alignItems: "start",
                }}
              >
                {/* Left Side: Compact Cabin Cards */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {cabins.map((cabin) => (
                    <div
                      key={cabin.id}
                      className="cabin-card"
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                        border: "1px solid transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(0,0,0,0.12)";
                        e.currentTarget.style.borderColor = "#FFCF00";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 20px rgba(0,0,0,0.08)";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                      onClick={() => handleCabinInvest(cabin)}
                    >
                      <img
                        src={cabin.image}
                        alt={cabin.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ padding: "1.25rem" }}>
                        <h3
                          style={{
                            fontFamily:
                              '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                            fontSize: "1.25rem",
                            fontWeight: "900",
                            fontStyle: "italic",
                            color: "#0E181F",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {cabin.name.toUpperCase()}
                        </h3>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#FFCF00",
                            marginBottom: "1rem",
                          }}
                        >
                          ${cabin.price.toLocaleString("en-AU")} plus GST
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCabinInvest(cabin);
                          }}
                          className="btn btn-primary"
                          style={{
                            width: "100%",
                            fontSize: "0.9rem",
                            padding: "0.75rem 1rem",
                            fontWeight: "600",
                            borderRadius: "6px",
                          }}
                        >
                          Reserve Yours Today
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Side: Compact ROI Calculator Panel */}
                <div
                  style={{
                    position: "sticky",
                    top: "120px",
                    maxHeight: "calc(100vh - 140px)",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      border: "1px solid #FFCF00",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily:
                          '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                        fontSize: "1.25rem",
                        fontWeight: "900",
                        fontStyle: "italic",
                        color: "#0E181F",
                        textAlign: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      ROI CALCULATOR
                    </h2>
                    <p
                      style={{
                        textAlign: "center",
                        color: "#666",
                        marginBottom: "1rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      Calculate your potential returns
                    </p>
                    <ROICalculatorPane
                      onInvest={(data: any) => {
                        alert(
                          `Investment Details:\nCabin: ${
                            data.cabinType
                          }\nPrice: $${data.price.toLocaleString()}\nExtras: ${
                            data.extras.length
                          } selected\n\nInvestment process would start here!`
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === "locations" && (
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
                  fontFamily:
                    '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
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
                    e.currentTarget.style.boxShadow =
                      "0 16px 48px rgba(0,0,0,0.2)";
                    e.currentTarget.style.borderColor = "#FFCF00";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 32px rgba(0,0,0,0.15)";
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
                      Experience the beauty of the Victorian High Country with
                      skiing, hiking, and mountain adventures.
                    </p>
                    <a
                      href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Book Your Stay
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
                    e.currentTarget.style.boxShadow =
                      "0 16px 48px rgba(0,0,0,0.2)";
                    e.currentTarget.style.borderColor = "#FFCF00";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 32px rgba(0,0,0,0.15)";
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
                      Coastal paradise coming soon. Be the first to know when we
                      launch in Byron Bay.
                    </p>
                    <button
                      className="btn btn-secondary"
                      disabled
                      style={{ opacity: 0.5, fontSize: "0.9rem" }}
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* Investment Modal */}
        {showInvestmentModal && selectedCabin && (
          <InvestmentModal
            cabin={selectedCabin}
            onClose={() => {
              setShowInvestmentModal(false);
              setSelectedCabin(null);
            }}
            onInvest={handleCabinInvest}
          />
        )}
      </div>
    </div>
  );
}
