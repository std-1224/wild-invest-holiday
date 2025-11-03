import { useState } from "react";
import apiClient from "../../api/client";

// Global Authentication Modal
export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: any) => {
  // modalType: 'login' | 'register' | 'forgot' | 'reset' | 'verify' | 'exists'
  const [modalType, setModalType] = useState<
    "login" | "register" | "forgot" | "reset" | "verify" | "exists"
  >("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
    referralCode: "",
    verificationCode: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [referralStatus, setReferralStatus] = useState<
    "valid" | "invalid" | null
  >(null);

  // ...existing code for validateReferralCode...
  const validateReferralCode = async (code: string) => {
    if (!code) {
      setReferralStatus(null);
      return;
    }
    try {
      const result = await apiClient.validateReferralCode(code);
      setReferralStatus(result.valid ? "valid" : "invalid");
    } catch (error) {
      setReferralStatus("invalid");
    }
  };

  // ...existing code for handleSubmit, will be split by modalType...
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      if (modalType === "login") {
        // Login
        const result = await apiClient.loginUser({
          email: formData.email,
          password: formData.password,
        });
        if (result.authToken && result.user) {
          localStorage.setItem("authToken", result.authToken);
          localStorage.setItem("user", JSON.stringify(result.user));
          setMessage("");
          if (onLoginSuccess) onLoginSuccess(result.user);
          onClose();
        } else {
          setMessage(
            result.message || "Login failed. Please check your credentials."
          );
        }
      } else if (modalType === "register") {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setMessage("Passwords do not match.");
          return;
        }
        const result = await apiClient.registerUser({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          referralCode: formData.referralCode || undefined,
        });
        if (result.success || result.authToken) {
          setMessage(
            "Registration successful! Please check your email to verify your account."
          );
          setModalType("verify");
        } else if (
          result.message &&
          result.message.toLowerCase().includes("exists")
        ) {
          setModalType("exists");
        } else {
          setMessage(
            result.message || "Registration failed. Please try again."
          );
        }
      } else if (modalType === "forgot") {
        // Forgot Password
        const result = await apiClient.forgotPassword(formData.email);
        if (result.success) {
          setMessage("Reset link sent! Check your email.");
          setModalType("reset");
        } else {
          setMessage(result.message || "Failed to send reset link.");
        }
      } else if (modalType === "reset") {
        // Reset Password
        const result = await apiClient.resetPassword(
          formData.email,
          formData.verificationCode,
          formData.newPassword
        );
        if (result.success) {
          setMessage("Password reset successful! You can now log in.");
          setModalType("login");
        } else {
          setMessage(
            result.message ||
              "Failed to reset password. Check your code and try again."
          );
        }
      } else if (modalType === "verify") {
        // Email Verification
        const result = await apiClient.verifyEmail(
          formData.email,
          formData.verificationCode
        );
        if (result.success) {
          setMessage("Email verified! You can now log in.");
          setModalType("login");
        } else {
          setMessage(
            result.message ||
              "Verification failed. Check your code and try again."
          );
        }
      }
    } catch (error: any) {
      setMessage(error?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl p-8 max-w-[400px] w-[90%] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer"
        >
          ×
        </button>

        <h2 className="mb-4 text-[#0e181f]">
          {modalType === "login" && "Investor Login"}
          {modalType === "register" && "Create Account"}
          {modalType === "forgot" && "Reset Password"}
          {modalType === "reset" && "Set New Password"}
          {modalType === "verify" && "Verify Your Email"}
          {modalType === "exists" && "Account Exists"}
        </h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-[0.9rem] ${
              message.includes("successful")
                ? "bg-[#d4edda] text-[#155724]"
                : "bg-[#f8d7da] text-[#721c24]"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Login Modal */}
          {modalType === "login" && (
            <>
              {/* ...login UI... */}
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mb-4 text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setModalType("register")}
                  className="bg-transparent border-none text-[#86dbdf] underline cursor-pointer"
                >
                  Don't have an account? Sign up
                </button>
              </div>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setModalType("forgot")}
                  className="bg-transparent border-none text-[#86dbdf] underline cursor-pointer text-[0.9rem]"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
          {/* Registration Modal */}
          {modalType === "register" && (
            <>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setFormData({ ...formData, referralCode: code });
                      validateReferralCode(code);
                    }}
                    className="w-full p-3 border-2 border-[#86dbdf] rounded-lg pr-10"
                    placeholder="Enter referral code"
                  />
                  {formData.referralCode && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[1.2rem]">
                      {referralStatus === "valid"
                        ? "✅"
                        : referralStatus === "invalid"
                        ? "❌"
                        : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mb-4 text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              >
                {isLoading ? "Loading..." : "Create Account"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  className="bg-transparent border-none text-[#86dbdf] underline cursor-pointer"
                >
                  Already have an account? Login
                </button>
              </div>
            </>
          )}
          {/* Forgot Password Modal */}
          {modalType === "forgot" && (
            <>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mb-4 text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  className="bg-transparent border-none text-[#86dbdf] underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
          {/* Reset Password Modal */}
          {modalType === "reset" && (
            <>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Reset Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.verificationCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verificationCode: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mb-4 text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  className="bg-transparent border-none text-[#86dbdf] underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
          {/* Verification Modal */}
          {modalType === "verify" && (
            <>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.verificationCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verificationCode: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-[#86dbdf] rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mb-4 text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    await apiClient.resendVerificationCode(formData.email);
                    setIsLoading(false);
                    setMessage("Verification code resent!");
                  }}
                  className="bg-transparent border-none text-[#86dbdf] underline cursor-pointer"
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  className="bg-transparent border-none text-[#86dbdf] underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
          {/* Account Exists Modal */}
          {modalType === "exists" && (
            <>
              <div className="mb-4 text-[#721c24] bg-[#f8d7da] p-4 rounded-lg">
                An account with this email already exists.
              </div>
              <button
                type="button"
                onClick={() => setModalType("login")}
                className="w-full mb-4 text-[0.9rem] bg-[#86dbdf] text-white border-none rounded-lg p-3 cursor-pointer"
              >
                Login to Existing Account
              </button>
              <button
                type="button"
                onClick={() => setModalType("forgot")}
                className="w-full text-[0.9rem] bg-transparent text-[#86dbdf] border-none underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
