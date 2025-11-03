import { createContext, useContext, useState, ReactNode } from "react";
import { AuthLoginModal } from "../components/Modals/AuthLoginModal";
import { AuthRegisterModal } from "../components/Modals/AuthRegisterModal";
import { ForgotPasswordModal } from "../components/Modals/ForgotPasswordModal";
import { ResetPasswordModal } from "../components/Modals/ResetPasswordModal";
import { VerificationModal } from "../components/Modals/VerificationModal";
import { AccountExistsModal } from "../components/Modals/AccountExistsModal";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  showLoginModal: () => void;
  showRegisterModal: () => void;
  showForgotPasswordModal: () => void;
  login: () => void;
  logout: () => void;
  setOnNavigateToPortal: (callback: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [onNavigateToPortal, setOnNavigateToPortal] = useState<
    (() => void) | null
  >(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState<
    | "login"
    | "register"
    | "forgotPassword"
    | "resetPassword"
    | "verification"
    | "accountExists"
    | null
  >(null);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [existingAccountEmail, setExistingAccountEmail] = useState("");

  const showLoginModal = () => setActiveModal("login");
  const showRegisterModal = () => setActiveModal("register");
  const showForgotPasswordModal = () => setActiveModal("forgotPassword");
  const closeAllModals = () => setActiveModal(null);

  const login = () => {
    setIsLoggedIn(true);
    closeAllModals();
    onNavigateToPortal?.();
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const handleRegister = () => {
    // In a real app, you might want to show verification modal first
    // For now, we'll just log in directly
    setIsLoggedIn(true);
    closeAllModals();
    onNavigateToPortal?.();
  };

  const handleResetCodeSent = (email: string) => {
    setResetPasswordEmail(email);
    closeAllModals();
    // Optionally show reset password modal
    // setActiveModal("resetPassword");
  };

  const handleResetComplete = () => {
    closeAllModals();
    setActiveModal("login");
  };

  const handleVerificationComplete = () => {
    setIsLoggedIn(true);
    closeAllModals();
    onNavigateToPortal?.();
  };

  const value: AuthContextType = {
    isLoggedIn,
    setIsLoggedIn,
    showLoginModal,
    showRegisterModal,
    showForgotPasswordModal,
    login,
    logout,
    setOnNavigateToPortal: (callback: () => void) =>
      setOnNavigateToPortal(() => callback),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Login Modal */}
      <AuthLoginModal
        isOpen={activeModal === "login"}
        onClose={closeAllModals}
        onLogin={login}
        onSwitchToRegister={() => setActiveModal("register")}
        onForgotPassword={() => setActiveModal("forgotPassword")}
      />

      {/* Register Modal */}
      <AuthRegisterModal
        isOpen={activeModal === "register"}
        onClose={closeAllModals}
        onRegister={handleRegister}
        onSwitchToLogin={() => setActiveModal("login")}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={activeModal === "forgotPassword"}
        onClose={closeAllModals}
        onSwitchToLogin={() => setActiveModal("login")}
        onResetCodeSent={handleResetCodeSent}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={activeModal === "resetPassword"}
        onClose={closeAllModals}
        onResetComplete={handleResetComplete}
        email={resetPasswordEmail}
      />

      {/* Verification Modal */}
      <VerificationModal
        isOpen={activeModal === "verification"}
        onClose={closeAllModals}
        onVerificationComplete={handleVerificationComplete}
        email={verificationEmail}
      />

      {/* Account Exists Modal */}
      <AccountExistsModal
        isOpen={activeModal === "accountExists"}
        onClose={closeAllModals}
        onSwitchToLogin={() => setActiveModal("login")}
        onForgotPassword={() => setActiveModal("forgotPassword")}
        email={existingAccountEmail}
      />
    </AuthContext.Provider>
  );
};

