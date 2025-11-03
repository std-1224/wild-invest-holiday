import { useState } from "react";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete: () => void;
  email: string;
}

export const ResetPasswordModal = ({
  isOpen,
  onClose,
  onResetComplete,
  email,
}: ResetPasswordModalProps) => {
  const [formData, setFormData] = useState({
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.resetCode &&
      formData.newPassword === formData.confirmPassword
    ) {
      // Simulate password reset - in real app, this would call your auth API
      setIsSubmitted(true);

      // Auto-close after 2 seconds and redirect to login
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ resetCode: "", newPassword: "", confirmPassword: "" });
        onClose();
        onResetComplete();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ resetCode: "", newPassword: "", confirmPassword: "" });
            onClose();
          }}
          className="absolute top-4 right-4 text-[#0e181f] hover:text-[#86dbdf] text-2xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          Reset Password
        </h2>

        {!isSubmitted ? (
          <>
            <p className="text-center mb-6 text-[#0e181f]">
              Enter the reset code sent to{" "}
              <span className="font-bold text-[#86dbdf]">{email}</span>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={formData.resetCode}
                  onChange={(e) =>
                    setFormData({ ...formData, resetCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                  required
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      resetCode: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2 text-[#0e181f]">
              Password Reset Successful!
            </h3>
            <p className="text-[#0e181f]">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

