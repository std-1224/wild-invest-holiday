import { useState } from "react";
import { WildThingsAPI } from "../../api/client";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete: () => void;
  token: string;
}

export const ResetPasswordModal = ({
  isOpen,
  onClose,
  onResetComplete,
  token,
}: ResetPasswordModalProps) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const api = new WildThingsAPI();
      const response = await api.resetPassword(token, formData.newPassword);

      if (response.success) {
        setIsSubmitted(true);

        // Auto-close after 2 seconds and automatically log in user
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ newPassword: "", confirmPassword: "" });
          onClose();
          onResetComplete();
        }, 2000);
      } else {
        setError(response.error || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
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
            setFormData({ newPassword: "", confirmPassword: "" });
            setError("");
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
              Enter your new password below.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                  minLength={6}
                  placeholder="At least 6 characters"
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
                  minLength={6}
                  placeholder="Re-enter password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      newPassword: "",
                      confirmPassword: "",
                    });
                    onClose();
                  }}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h3 className="text-xl font-bold mb-2 text-[#0e181f]">
              Password Reset Successful!
            </h3>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <p className="text-[#0e181f] mb-2">
                Your password has been successfully reset.
              </p>
              <p className="text-sm text-gray-600">
                You can now log in with your new password.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

