interface AccountExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onForgotPassword: () => void;
  email: string;
}

export const AccountExistsModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onForgotPassword,
  email,
}: AccountExistsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0e181f] hover:text-[#86dbdf] text-2xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>

          <h2 className="text-2xl font-bold mb-4 italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
            Account Already Exists
          </h2>

          <p className="text-[#0e181f] mb-6">
            An account with the email{" "}
            <span className="font-bold text-[#86dbdf]">{email}</span> already
            exists.
          </p>

          <div className="space-y-3">
            <button
              onClick={onSwitchToLogin}
              className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
            >
              Login to Existing Account
            </button>

            <button
              onClick={onForgotPassword}
              className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#86dbdf] text-[#0e181f]"
            >
              Forgot Password?
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

