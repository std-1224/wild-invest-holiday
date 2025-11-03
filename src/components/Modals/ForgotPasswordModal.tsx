import { useState } from "react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onResetCodeSent: (email: string) => void;
}

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onResetCodeSent,
}: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate sending reset code - in real app, this would call your auth API
      setIsSubmitted(true);
      onResetCodeSent(email);

      // Auto-close after 3 seconds and switch to login
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
        onClose();
        onSwitchToLogin();
      }, 3000);
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
              Enter your email address and we'll send you a code to reset your
              password.
            </p>

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
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
                >
                  Send Reset Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white"
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
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2 text-[#0e181f]">
              Reset Code Sent!
            </h3>
            <p className="text-[#0e181f] mb-4">
              We've sent a password reset code to:
            </p>
            <p className="font-bold text-[#86dbdf] mb-4">{email}</p>
            <p className="text-sm text-gray-600">
              Please check your email and follow the instructions to reset your
              password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

