import { useState } from "react";

interface AuthRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export const AuthRegisterModal = ({
  isOpen,
  onClose,
  onRegister,
  onSwitchToLogin,
}: AuthRegisterModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(
    null
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
      // Simulate registration - in real app, this would call your auth API
      onRegister();
    }
  };

  const handleReferralCodeChange = (value: string) => {
    setFormData({ ...formData, referralCode: value });

    // Simulate referral code validation
    if (value.length > 0) {
      // In real app, this would call your API to validate the code
      setReferralCodeValid(value.length >= 6);
    } else {
      setReferralCodeValid(null);
    }
  };

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

        <h2 className="text-2xl font-bold mb-6 text-center italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          Create Your Account
        </h2>

        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[#0e181f]">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[#0e181f]">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[#0e181f]">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
              required
            />
          </div>

          {/* Referral Code Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-[#0e181f]">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => handleReferralCodeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf] pr-10"
                placeholder="Enter referral code"
              />
              {referralCodeValid !== null && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                  {referralCodeValid ? "✅" : "❌"}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f]"
            >
              Register
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="text-center mt-4 text-sm text-[#0e181f]">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="font-bold text-[#86dbdf] hover:text-[#0e181f]"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

