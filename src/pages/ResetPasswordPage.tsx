import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordModal } from "../components/Modals/ResetPasswordModal";
import { useAuth } from "../contexts/AuthContext";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showLoginModal } = useAuth();
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
    // Close modal, redirect to home, and open login modal
    setIsModalOpen(false);
    navigate("/");
    // Open login modal after a short delay to ensure navigation completes
    setTimeout(() => {
      showLoginModal();
    }, 100);
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

