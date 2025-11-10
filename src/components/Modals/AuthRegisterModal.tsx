import { useState, useEffect } from "react";
import { WildThingsAPI } from "../../api/client";
import apiClient from "../../api/client";

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
    firstName: "Anh",
    lastName: "Phuc",
    email: "adev.towork@gmail.com",
    password: "ghost1238",
    confirmPassword: "ghost1238",
    referralCode: "",
  });

  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(
    null
  );
  const [referralCodeValidating, setReferralCodeValidating] = useState<boolean>(false);
  const [referrerName, setReferrerName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const api = new WildThingsAPI();
      const response = await api.registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        referralCode: formData.referralCode,
      });

      if (response.success) {
        // Registration successful
        onRegister();
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReferralCodeChange = (value: string) => {
    setFormData({ ...formData, referralCode: value });
    setReferralCodeValid(null);
    setReferrerName("");
  };

  // Debounced referral code validation
  useEffect(() => {
    if (!formData.referralCode || formData.referralCode.length < 6) {
      setReferralCodeValid(null);
      setReferrerName("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setReferralCodeValidating(true);
      try {
        const response = await apiClient.validateReferralCode(formData.referralCode);
        setReferralCodeValid(response.valid);
        if (response.valid && response.referrerName) {
          setReferrerName(response.referrerName);
        }
      } catch (error) {
        console.error("Error validating referral code:", error);
        setReferralCodeValid(false);
      } finally {
        setReferralCodeValidating(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.referralCode]);

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

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

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
                onChange={(e) => handleReferralCodeChange(e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 uppercase ${
                  referralCodeValid === true
                    ? "border-green-500 focus:ring-green-500"
                    : referralCodeValid === false
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#86dbdf]"
                }`}
                placeholder="Enter referral code"
                maxLength={8}
              />
              {referralCodeValidating && (
                <span className="absolute right-3 top-0 -translate-y-1/2 text-xl">
                  ⏳
                </span>
              )}
              {!referralCodeValidating && referralCodeValid !== null && (
                <span className="absolute right-3 top-4/5 -translate-y-1/2 text-xl">
                  {referralCodeValid ? "✅" : "❌"}
                </span>
              )}
            </div>
            {referralCodeValid === true && referrerName && (
              <p className="mt-1 text-sm text-green-600">
                ✓ Valid code from {referrerName}. You'll both get $1,000 credit!
              </p>
            )}
            {referralCodeValid === false && formData.referralCode && (
              <p className="mt-1 text-sm text-red-600">
                ✗ Invalid referral code
              </p>
            )}
            {!formData.referralCode && (
              <p className="mt-1 text-xs text-gray-500">
                Have a referral code? Get $1,000 credit when you invest!
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white disabled:opacity-50"
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

