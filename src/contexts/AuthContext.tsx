import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthLoginModal } from "../components/Modals/AuthLoginModal";
import { AuthAdminLoginModal } from "../components/Modals/AuthAdminLoginModal";
import { AuthRegisterModal } from "../components/Modals/AuthRegisterModal";
import { ForgotPasswordModal } from "../components/Modals/ForgotPasswordModal";
import { ResetPasswordModal } from "../components/Modals/ResetPasswordModal";
import { VerificationModal } from "../components/Modals/VerificationModal";
import { AccountExistsModal } from "../components/Modals/AccountExistsModal";
import apiClient from "../api/client";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  showLoginModal: () => void;
  showAdminLoginModal: () => void;
  showRegisterModal: () => void;
  showForgotPasswordModal: () => void;
  login: () => void;
  adminLogin: () => void;
  logout: () => void;
  currentUser: any;
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
  onNavigateToPortal?: () => void;
  onNavigateToAdminPortal?: () => void;
}

export const AuthProvider = ({
  children,
  onNavigateToPortal,
  onNavigateToAdminPortal,
}: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(apiClient.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(apiClient.getUser());

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = apiClient.isAuthenticated();
      const user = apiClient.getUser();
      setIsLoggedIn(authenticated);
      setCurrentUser(user);
    };

    checkAuth();
  }, []);
  const [activeModal, setActiveModal] = useState<
    | "login"
    | "adminLogin"
    | "register"
    | "forgotPassword"
    | "resetPassword"
    | "verification"
    | "accountExists"
    | null
  >(null);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [verificationEmail] = useState("");
  const [existingAccountEmail] = useState("");

  const showLoginModal = () => setActiveModal("login");
  const showAdminLoginModal = () => setActiveModal("adminLogin");
  const showRegisterModal = () => setActiveModal("register");
  const showForgotPasswordModal = () => setActiveModal("forgotPassword");
  const closeAllModals = () => setActiveModal(null);

  const login = () => {
    setIsLoggedIn(true);
    setCurrentUser(apiClient.getUser());
    closeAllModals();
    onNavigateToPortal?.();
  };

  const adminLogin = () => {
    setIsLoggedIn(true);
    setCurrentUser(apiClient.getUser());
    closeAllModals();
    onNavigateToAdminPortal?.();
  };

  const logout = () => {
    apiClient.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleRegister = () => {
    // In a real app, you might want to show verification modal first
    // For now, we'll just log in directly
    setIsLoggedIn(true);
    setCurrentUser(apiClient.getUser());
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
    showAdminLoginModal,
    showRegisterModal,
    showForgotPasswordModal,
    login,
    adminLogin,
    logout,
    currentUser,
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

      {/* Admin Login Modal */}
      <AuthAdminLoginModal
        isOpen={activeModal === "adminLogin"}
        onClose={closeAllModals}
        onLogin={adminLogin}
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

