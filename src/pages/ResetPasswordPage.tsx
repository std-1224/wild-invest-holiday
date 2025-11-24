import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordModal } from "../components/Modals/ResetPasswordModal";
import { useAuth } from "../contexts/AuthContext";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const [token, setToken] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Get token from URL query parameter
    const tokenParam = searchParams.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
      setIsModalOpen(true);
    } else {
      // No token provided, redirect to home
      navigate("/");
    }
  }, [searchParams, navigate]);

  const handleResetComplete = () => {
    // After password reset, user is automatically logged in
    // The token is already saved in localStorage by api.resetPassword()
    setIsLoggedIn(true);
    setIsModalOpen(false);
    navigate("/investor-portal");
  };

  const handleClose = () => {
    // User closed the modal, redirect to home
    setIsModalOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <ResetPasswordModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onResetComplete={handleResetComplete}
        token={token}
      />
    </div>
  );
};

