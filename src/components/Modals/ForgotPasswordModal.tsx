import { useState } from "react";
import { WildThingsAPI } from "../../api/client";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onResetCodeSent: (email: string) => void;
  isSubmitted: boolean;
  setIsSubmitted: (value: boolean) => void;
}

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onResetCodeSent,
  isSubmitted,
  setIsSubmitted,
}: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const api = new WildThingsAPI();
      const response = await api.forgotPassword(email);

      if (response.success) {
        setIsSubmitted(true);
        onResetCodeSent(email);
        // Keep modal open to show success alert
        // User can close manually by clicking X or outside
      } else {
        setError(response.message || "Failed to send reset email");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
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
            setEmail("");
            onClose();
          }}
          className="absolute top-4 right-4 text-[#0e181f] hover:text-[#86dbdf] text-2xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          Forgot Password
        </h2>

        {!isSubmitted ? (
          <>
            <p className="text-center mb-6 text-[#0e181f]">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    onClose();
                  }}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="text-center mt-4 text-sm text-[#0e181f]">
              Remember your password?{" "}
              <button
                onClick={() => {
                  setEmail("");
                  onSwitchToLogin();
                }}
                className="font-bold text-[#86dbdf] hover:text-[#0e181f]"
              >
                Login here
              </button>
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h3 className="text-xl font-bold mb-2 text-[#0e181f]">
              Reset Link Sent!
            </h3>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <p className="text-[#0e181f] mb-2">
                We've sent a password reset link to:
              </p>
              <p className="font-bold text-[#86dbdf] text-lg mb-2">{email}</p>
              <p className="text-sm text-gray-600 mb-3">
                Please check your email and click the link to reset your
                password. The link will expire in 10 minutes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
