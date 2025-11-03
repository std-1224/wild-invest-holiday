import { useEffect, useRef, useState } from "react";
import { Navbar } from "./components/Navbar";
import { InvestmentModal } from "./components/Modals/InvestmentModal";
import { HomePage } from "./sections/HomePage";
import { LocationsPage } from "./sections/LocationsPage";
import { InvestPage } from "./sections/Invest/InvestPage";
import { InvestorPortal } from "./sections/InvestorPortal";
import { HolidayHomesPage } from "./sections/HolidayHomes";
import { colors, getExtrasForCabin } from "./config/mockCalculate";
import { ReservationModal } from "./components/Modals/ReservationModal";
import { ChatWidget } from "./components/ChatWidget";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState<string | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const [selectedCabinForInvestment, setSelectedCabinForInvestment] = useState<
    string | null
  >(null);

  const extras = getExtrasForCabin("3BR"); // Default for ROI calculator

  // Use the auth context
  const {
    isLoggedIn,
    setIsLoggedIn,
    showLoginModal,
    logout,
    setOnNavigateToPortal,
  } = useAuth();

  // Set the navigation callback for the auth context
  useEffect(() => {
    setOnNavigateToPortal(() => () => setCurrentPage("investor-portal"));
  }, [setOnNavigateToPortal]);

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
      <Navbar
        onLoginClick={showLoginModal}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
        onNavigate={setCurrentPage}
        setCurrentPage={setCurrentPage}
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
          <InvestPage cabins={cabins} onInvest={handleCabinInvest} />
        )}

        {currentPage === "holiday-homes" && (
          <HolidayHomesPage
            setShowInvestmentModal={setShowInvestmentModal}
            setSelectedCabinForInvestment={setSelectedCabinForInvestment}
            setSelectedCabin={setSelectedCabin}
          />
        )}

        {currentPage === "locations" && <LocationsPage />}

        {currentPage === "investor-portal" && (
          <InvestorPortal
            setIsLoggedIn={setIsLoggedIn}
            onInvestClick={() => setCurrentPage("invest")}
            setShowInvestmentModal={setShowInvestmentModal}
            setSelectedCabinForInvestment={setSelectedCabinForInvestment}
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
        {selectedCabin && (
          <ReservationModal
            // cabin={cabins[selectedCabin]}
            // cabinType={selectedCabin}
            // onClose={() => setSelectedCabin(null)}
            // extras={extras}
            setShowReservationModal={setShowReservationModal}
            showReservationModal={showReservationModal}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </div>

       <ChatWidget />

      <footer
        className="text-white py-12 px-4"
        style={{ backgroundColor: colors.darkBlue }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Wild Things Pty Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
