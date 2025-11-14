import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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

function AppContent() {
  const navigate = useNavigate();
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
  const { isLoggedIn, setIsLoggedIn, showLoginModal, showAdminLoginModal, logout } = useAuth();

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
        onAdminLoginClick={showAdminLoginModal}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
        onNavigate={(page) => navigate(`/${page === 'home' ? '' : page}`)}
        setCurrentPage={(page) => navigate(`/${page === 'home' ? '' : page}`)}
        currentPage={window.location.pathname.split('/')[1] || 'home'}
      />

      <div style={{ marginTop: "124px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                cabins={cabins}
                onInvest={handleCabinInvest}
                onInvestClick={() => navigate("/invest")}
              />
            }
          />

          <Route
            path="/invest"
            element={
              <InvestPage
                onInvest={handleCabinInvest}
                setSelectedCabinForInvestment={setSelectedCabinForInvestment}
              />
            }
          />

          <Route
            path="/holiday-homes"
            element={
              <HolidayHomesPage
                setSelectedCabinForInvestment={setSelectedCabinForInvestment}
                onInvest={handleCabinInvest}
              />
            }
          />

          <Route path="/locations" element={<LocationsPage />} />

          <Route
            path="/investor-portal/*"
            element={
              isLoggedIn ? (
                <InvestorPortal
                  setIsLoggedIn={setIsLoggedIn}
                  onInvestClick={() => navigate("/invest")}
                  setShowInvestmentModal={setShowInvestmentModal}
                  setSelectedCabinForInvestment={setSelectedCabinForInvestment}
                  userInvestments={userInvestments}
                  setUserInvestments={setUserInvestments}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/admin-portal"
            element={
              isLoggedIn ? (
                <AdminPortal
                  setIsLoggedIn={setIsLoggedIn}
                  onNavigate={(page) => navigate(`/${page === 'home' ? '' : page}`)}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/xero/callback"
            element={<XeroCallback setCurrentPage={(page) => navigate(`/${page === 'home' ? '' : page}`)} />}
          />
        </Routes>

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
          setCurrentPage={(page: string) => navigate(`/${page === 'home' ? '' : page}`)}
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

          {/* Admin Login Button */}
          {!isLoggedIn && (
            <div className="mt-6">
              <button
                onClick={showAdminLoginModal}
                className="px-6 py-3 bg-[#ec874c] text-white border-none rounded-lg cursor-pointer font-bold text-sm shadow-md transition-all duration-300 hover:bg-[#0e181f] hover:text-[#ffcf00]"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              >
                Admin Login
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider
        onNavigateToPortal={() => {}}
        onNavigateToAdminPortal={() => {}}
      >
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
