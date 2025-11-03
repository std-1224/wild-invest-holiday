import { useState } from "react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
  email: string;
}

export const VerificationModal = ({
  isOpen,
  onClose,
  onVerificationComplete,
  email,
}: VerificationModalProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode) {
      // Simulate verification - in real app, this would call your auth API
      setIsSubmitted(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setVerificationCode("");
        onClose();
        onVerificationComplete();
      }, 2000);
    }
  };

  const handleResendCode = () => {
    // Simulate resending code - in real app, this would call your auth API
    setResendMessage("Code resent! Check your email.");
    setTimeout(() => {
      setResendMessage("");
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsSubmitted(false);
            setVerificationCode("");
            setResendMessage("");
            onClose();
          }}
          className="absolute top-4 right-4 text-[#0e181f] hover:text-[#86dbdf] text-2xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          Verify Your Email
        </h2>

        {!isSubmitted ? (
          <>
            <p className="text-center mb-6 text-[#0e181f]">
              We've sent a verification code to{" "}
              <span className="font-bold text-[#86dbdf]">{email}</span>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf] text-center text-2xl tracking-widest"
                  required
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {resendMessage && (
                <div className="mb-4 p-3 bg-[#86dbdf]/20 rounded-lg text-center text-sm text-[#0e181f]">
                  {resendMessage}
                </div>
              )}

              <div className="flex gap-3 mb-4">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
                >
                  Verify Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationCode("");
                    setResendMessage("");
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-[#0e181f]">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendCode}
                className="font-bold text-[#86dbdf] hover:text-[#0e181f]"
              >
                Resend code
              </button>
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2 text-[#0e181f]">
              Email Verified!
            </h3>
            <p className="text-[#0e181f]">
              Your email has been successfully verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

