import { useEffect, useRef, useState } from "react";
import { Navigation } from "./components/Navigation";
import { InvestmentModal } from "./components/Modals/InvestmentModal";
import { LoginModal } from "./components/Modals/LoginModal";
import { HomePage } from "./sections/HomePage";
import { InvestPage } from "./sections/InvestPage";
import { LocationsPage } from "./sections/LocationsPage";

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
      video: "/1br-cabin-video.mp4",
    },
    {
      id: "2BR",
      name: "2 Bedroom Cabin",
      price: 135000,
      video: "/2BR.mp4",
    },
    {
      id: "3BR",
      name: "3 Bedroom Cabin",
      price: 160000,
      video: "/3br-cabin-video.mp4",
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

      <div style={{ marginTop: "124px" }}>
        {currentPage === "home" && (
          <HomePage
            cabins={cabins}
            onInvest={handleCabinInvest}
            onInvestClick={() => setCurrentPage("invest")}
          />
        )}

        {currentPage === "invest" && (
          <InvestPage
            cabins={cabins}
            onInvest={handleCabinInvest}
          />
        )}

        {currentPage === "locations" && (
          <LocationsPage />
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
