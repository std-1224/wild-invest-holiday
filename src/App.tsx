import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { InvestmentModal } from "./components/Modals/InvestmentModal";
import { HomePage } from "./sections/HomePage";
import { LocationsPage } from "./sections/LocationsPage";
import { InvestPage } from "./sections/Invest/InvestPage";
import { InvestorPortal } from "./sections/InvestorPortal";
import { AdminPortal } from "./sections/AdminPortal";
import { HolidayHomesPage } from "./sections/HolidayHomes";
import { XeroCallback } from "./sections/XeroCallback";
import { colors } from "./config/mockCalculate";
import { ReservationModal } from "./components/Modals/ReservationModal";
import { ChatWidget } from "./components/ChatWidget";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

interface AppContentProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

function AppContent({ currentPage, setCurrentPage }: AppContentProps) {
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const [selectedCabinForInvestment, setSelectedCabinForInvestment] = useState<
    string | null
  >(null);

  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [floatingInvestmentData] = useState<{
    selectedExtras?: string[];
    paymentMethod?: string;
  }>({});

  // Use the auth context
  const { isLoggedIn, setIsLoggedIn, showLoginModal, logout } = useAuth();

  // Protect investor portal and admin portal - redirect to home if not logged in
  useEffect(() => {
    if (currentPage === "investor-portal" && !isLoggedIn) {
      setCurrentPage("home");
      showLoginModal(); // Show login modal to prompt user to login
    }
    if (currentPage === "admin-portal" && !isLoggedIn) {
      setCurrentPage("home");
      showLoginModal(); // Show login modal to prompt user to login
    }
  }, [currentPage, isLoggedIn, showLoginModal]);

  const handleCabinInvest = (cabin: any) => {
    setSelectedCabinForInvestment(cabin.id);
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
        currentPage={currentPage}
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
            onInvest={handleCabinInvest}
            setSelectedCabinForInvestment={setSelectedCabinForInvestment}
          />
        )}

        {currentPage === "holiday-homes" && (
          <HolidayHomesPage
            setSelectedCabinForInvestment={setSelectedCabinForInvestment}
            onInvest={handleCabinInvest}
          />
        )}

        {currentPage === "locations" && <LocationsPage />}

        {currentPage === "investor-portal" && (
          <InvestorPortal
            setIsLoggedIn={setIsLoggedIn}
            onInvestClick={() => setCurrentPage("invest")}
            setShowInvestmentModal={setShowInvestmentModal}
            setSelectedCabinForInvestment={setSelectedCabinForInvestment}
            userInvestments={userInvestments}
            setUserInvestments={setUserInvestments}
          />
        )}

        {currentPage === "admin-portal" && (
          <AdminPortal
            setIsLoggedIn={setIsLoggedIn}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === "xero-callback" && (
          <XeroCallback setCurrentPage={setCurrentPage} />
        )}

        {/* Investment Modal */}
        <InvestmentModal
          showInvestmentModal={showInvestmentModal}
          setShowInvestmentModal={setShowInvestmentModal}
          selectedCabinForInvestment={selectedCabinForInvestment}
          setSelectedCabinForInvestment={setSelectedCabinForInvestment}
          floatingInvestmentData={floatingInvestmentData}
          userInvestments={userInvestments}
          setUserInvestments={setUserInvestments}
          setIsLoggedIn={setIsLoggedIn}
          setCurrentPage={setCurrentPage}
        />
        <ReservationModal
          setShowReservationModal={setShowReservationModal}
          showReservationModal={showReservationModal}
          setIsLoggedIn={setIsLoggedIn}
          isLoggedIn={isLoggedIn}
          userProfile={
            isLoggedIn
              ? {
                  firstName: "John",
                  lastName: "Doe",
                  email: "john.doe@example.com",
                  phone: "+61 400 000 000",
                }
              : undefined
          }
        />
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
  const [currentPage, setCurrentPage] = useState("home");

  // Check if this is a Xero callback
  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;

    // Check for Xero callback with success or error parameters
    if (path === '/xero/callback' && (search.includes('success=') || search.includes('error='))) {
      setCurrentPage('xero-callback');
    }
  }, []);

  return (
    <AuthProvider onNavigateToPortal={() => setCurrentPage("investor-portal")}>
      <AppContent currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </AuthProvider>
  );
}
