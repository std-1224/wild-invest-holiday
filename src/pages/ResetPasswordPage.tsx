import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordModal } from "../components/Modals/ResetPasswordModal";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    // Close modal and redirect to home (login modal will be shown by AuthContext)
    setIsModalOpen(false);
    navigate("/");
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

