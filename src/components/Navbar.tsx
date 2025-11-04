import { useState, useEffect } from "react";

// Simple Navigation Component
export const Navbar = ({
  onLoginClick,
  isLoggedIn,
  onLogout,
  onNavigate,
  setCurrentPage,
}: any) => {
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
              introActive ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.92]'
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
                className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
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
                className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("invest");
                }}
              >
                Invest
              </a>
            </li>
            <li>
              <a
                href="#invest"
                className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("investor-portal");
                }}
              >
                Invest Portal
              </a>
            </li>
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
                className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
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
                className="text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
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

          {/* Desktop Auth Button */}
          <div className="hidden lg:block">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate && onNavigate("portal")}
                  className="px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
                >
                  MY ACCOUNT
                </button>
                <button
                  onClick={onLogout}
                  className="px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              >
                Investor Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#86dbdf]/95 backdrop-blur-[10px] p-4 border-t border-[#0e181f]/10">
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <a
                  href="#home"
                  className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
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
                  className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("invest");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Invest
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#invest"
                  className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate && onNavigate("investor-portal");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Invest Portal
                </a>
              </li>
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
                  className="text-[#0e181f] no-underline font-semibold text-lg transition-colors duration-300 hover:text-[#ffcf00]"
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
                  className="text-[#FFCF00] text-[18px] font-black italic bg-transparent border-none cursor-pointer [font-family:'Eurostile_Condensed','Arial_Black',Impact,sans-serif] [text-shadow:2px_2px_0px_#0E181F] p-0 m-0 no-underline"
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
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};
