import { useState } from "react";

// Simple Navigation Component
export const Navigation = ({
  onLoginClick,
  isLoggedIn,
  onLogout,
  onNavigate,
  setCurrentPage,
}: any) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="logo-container" onClick={() => setCurrentPage("home")}>
          <img src="/logo-wildthings.svg" alt="Wild Things" className="logo" />
        </div>

        {/* Desktop Navigation */}
        <ul className="nav-links hidden lg:flex">
          <li>
            <a
              href="#home"
              className="nav-link"
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
              className="nav-link"
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
              href="#locations"
              className="nav-link"
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
              className="nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Stay
            </a>
          </li>
          <li>
            <a
              href="https://wildthings.myshopify.com"
              className="nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Merch
            </a>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "var(--dark-blue)",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ☰
        </button>

        {/* Desktop Auth Button */}
        <div className="hidden lg:block">
          {isLoggedIn ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => onNavigate && onNavigate("portal")}
                className="btn btn-primary"
                style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem" }}
              >
                MY ACCOUNT
              </button>
              <button
                onClick={onLogout}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem" }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button onClick={onLoginClick} className="btn btn-primary">
              Investor Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden"
          style={{
            background: "rgba(134, 219, 223, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "1rem",
            borderTop: "1px solid rgba(14, 24, 31, 0.1)",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <a
                href="#home"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("home");
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <a
                href="#invest"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("invest");
                  setIsMobileMenuOpen(false);
                }}
              >
                Invest
              </a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <a
                href="#locations"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("locations");
                  setIsMobileMenuOpen(false);
                }}
              >
                Locations
              </a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <a
                href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                className="nav-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Stay
              </a>
            </li>
            <li>
              <a
                style={{ marginBottom: "0.5rem" }}
                href="https://wildthings.myshopify.com"
                className="nav-link"
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
  );
};
