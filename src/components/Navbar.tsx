import { useState, useEffect } from "react";
import apiClient from "../api/client";

// Simple Navigation Component
export const Navbar = ({
  onLoginClick,
  onAdminLoginClick,
  isLoggedIn,
  onLogout,
  onNavigate,
  setCurrentPage,
  currentPage,
}: any) => {
  const currentUser = apiClient.getUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Intro overlay state: shows on first mount and hides after 3s
  const [showIntro, setShowIntro] = useState(true);
  // Used to trigger enter/exit transitions for the logo
  const [introActive, setIntroActive] = useState(false);

  useEffect(() => {
    // Start enter animation on mount
    setIntroActive(true);

    // Start fade-out shortly before the 3s mark so the hide feels smooth
    const startFadeOut = setTimeout(() => setIntroActive(false), 600);

    // Remove overlay after 3s
    const remove = setTimeout(() => setShowIntro(false), 1000);

    return () => {
      clearTimeout(startFadeOut);
      clearTimeout(remove);
    };
  }, []);

  return (
    <>
      {/* Intro overlay */}
      {showIntro && (
        <div
          role="dialog"
          aria-hidden={!showIntro}
          onClick={() => setShowIntro(false)}
          className="fixed inset-0 flex items-center justify-center bg-white z-[9999] cursor-pointer"
        >
          <div
            className={`flex items-center justify-center transition-all duration-[360ms] ease-in-out will-change-[opacity,transform] ${
              introActive ? "opacity-100 scale-100" : "opacity-0 scale-[0.92]"
            }`}
          >
            <img
              src="/logo-wildthings.svg"
              alt="Wild Things"
              className="w-[220px] h-auto block"
            />
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 bg-[#86dbdf]/90 backdrop-blur-[10px] border-b-4 border-[#ffcf00] z-50 py-[15px]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setCurrentPage("home")}
          >
            <img
              src="/logo-wildthings.svg"
              alt="Wild Things"
              className="h-[90px] max-w-[90px]"
            />
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex list-none gap-8 m-0 p-0">
            <li>
              <a
                href="#home"
                className={
                  currentPage === "home"
                    ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                    : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                }
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("home");
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#invest"
                className={
                  currentPage === "invest"
                    ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                    : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                }
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("invest");
                }}
              >
                Invest
              </a>
            </li>
            {isLoggedIn && (
              <li>
                <a
                  href="#investor-portal"
                  className={
                    currentPage === "investor-portal"
                      ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                      : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("investor-portal");
                  }}
                >
                  Investor Portal
                </a>
              </li>
            )}
            {isLoggedIn && currentUser?.role === "admin" && (
              <li>
                <a
                  href="#admin-portal"
                  className={
                    currentPage === "admin-portal"
                      ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                      : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("admin-portal");
                  }}
                >
                  Admin Portal
                </a>
              </li>
            )}
            {/* <li>
              <a
                href="#invest"
                className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("holiday-homes");
                }}
              >
                Holiday
              </a>
            </li> */}
            <li>
              <a
                href="#locations"
                className={
                  currentPage === "locations"
                    ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                    : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                }
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("locations");
                }}
              >
                Locations
              </a>
            </li>
            <li>
              <a
                href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                className="text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 underline decoration-[#FFCF00] decoration-2 underline-offset-4 hover:decoration-[#86dbdf] transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Stay
              </a>
            </li>
            <li>
              <a
                href="https://wildthings.myshopify.com"
                className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Merch
              </a>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden bg-transparent border-none text-[#0e181f] text-2xl cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#86dbdf]/95 backdrop-blur-[10px] p-4 border-t border-[#0e181f]/10">
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <a
                  href="#home"
                  className={
                    currentPage === "home"
                      ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                      : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("home");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#invest"
                  className={
                    currentPage === "invest"
                      ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                      : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("invest");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Invest
                </a>
              </li>
              {isLoggedIn && (
                <li className="mb-2">
                  <a
                    href="#investor-portal"
                    className={
                      currentPage === "investor-portal"
                        ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                        : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate && onNavigate("investor-portal");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Investor Portal
                  </a>
                </li>
              )}
              {isLoggedIn && currentUser?.role === "admin" && (
                <li className="mb-2">
                  <a
                    href="#admin-portal"
                    className={
                      currentPage === "admin-portal"
                        ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                        : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate && onNavigate("admin-portal");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Admin Portal
                  </a>
                </li>
              )}
              {/* <li className="mb-2">
                <a
                  href="#invest"
                  className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("holiday-homes");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Holiday
                </a>
              </li> */}
              <li className="mb-2">
                <a
                  href="#locations"
                  className={
                    currentPage === "locations"
                      ? "text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
                      : "text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("locations");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Locations
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                  className="text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 underline decoration-[#FFCF00] decoration-2 underline-offset-4 hover:decoration-[#86dbdf] transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a Stay
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://wildthings.myshopify.com"
                  className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Merch
                </a>
              </li>

              {isLoggedIn && (
                <>
                  <li className="mb-2">
                    <button
                      onClick={() =>
                        onNavigate && onNavigate("investor-portal")
                      }
                      className="px-4 py-2 bg-[#ffcf00] text-[#0e181f] border-none rounded-b-lg cursor-pointer font-bold text-xs shadow-md transition-all duration-300 hover:bg-[#0e181f] hover:text-[#ffcf00] hover:translate-y-0.5"
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      MY ACCOUNT
                    </button>
                  </li>
                  <li className="mb-2">
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 bg-[#ffcf00] text-[#0e181f] border-none rounded-b-lg cursor-pointer font-bold text-xs shadow-md transition-all duration-300 hover:bg-[#0e181f] hover:text-[#ffcf00] hover:translate-y-0.5"
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>

      {/* Investor Login Tab - Top Right (Fixed Position) */}
      {!isLoggedIn && (
        <div className="fixed top-0 right-5 z-[1000]">
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-[#ffcf00] text-[#0e181f] border-none rounded-b-lg cursor-pointer font-bold text-xs shadow-md transition-all duration-300 hover:bg-[#0e181f] hover:text-[#ffcf00] hover:translate-y-0.5"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Investor Login
          </button>
        </div>
      )}

      {/* Logged In User Actions - Top Right (Fixed Position) */}
      {isLoggedIn && (
        <div className="fixed top-0 right-5 flex gap-2 z-[1000] hidden lg:flex">
          {currentUser && (
            <div className="px-4 py-2 bg-[#0e181f] text-[#ffcf00] border-none rounded-b-lg font-bold text-xs shadow-md flex items-center gap-2">
              <span>👋</span>
              <span>{currentUser.email || `${currentUser.name}`}</span>
            </div>
          )}
          <button
            onClick={() => onNavigate && onNavigate("investor-portal")}
            className="px-4 py-2 bg-[#ffcf00] text-[#0e181f] border-none rounded-b-lg cursor-pointer font-bold text-xs shadow-md transition-all duration-300 hover:bg-[#0e181f] hover:text-[#ffcf00] hover:translate-y-0.5"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            MY ACCOUNT
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-[#ffcf00] text-[#0e181f] border-none rounded-b-lg cursor-pointer font-bold text-xs shadow-md transition-all duration-300 hover:bg-[#0e181f] hover:text-[#ffcf00] hover:translate-y-0.5"
            style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
};
