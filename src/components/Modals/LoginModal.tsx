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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "400px",
          width: "90%",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h2 style={{ marginBottom: "1rem", color: "#0E181F" }}>
          {modalType === "login" && "Investor Login"}
          {modalType === "register" && "Create Account"}
          {modalType === "forgot" && "Reset Password"}
          {modalType === "reset" && "Set New Password"}
          {modalType === "verify" && "Verify Your Email"}
          {modalType === "exists" && "Account Exists"}
        </h2>

        {message && (
          <div
            style={{
              background: message.includes("successful")
                ? "#d4edda"
                : "#f8d7da",
              color: message.includes("successful") ? "#155724" : "#721c24",
              padding: "0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Login Modal */}
          {modalType === "login" && (
            <>
              {/* ...login UI... */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setModalType("register")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#86DBDF",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Don't have an account? Sign up
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setModalType("forgot")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#86DBDF",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
          {/* Registration Modal */}
          {modalType === "register" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Referral Code (Optional)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setFormData({ ...formData, referralCode: code });
                      validateReferralCode(code);
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #86DBDF",
                      borderRadius: "8px",
                      paddingRight: "40px",
                    }}
                    placeholder="Enter referral code"
                  />
                  {formData.referralCode && (
                    <span
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "1.2rem",
                      }}
                    >
                      {referralStatus === "valid"
                        ? "✅"
                        : referralStatus === "invalid"
                        ? "❌"
                        : ""}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
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
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {isLoading ? "Loading..." : "Create Account"}
              </button>
              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#86DBDF",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Already have an account? Login
                </button>
              </div>
            </>
          )}
          {/* Forgot Password Modal */}
          {modalType === "forgot" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#86DBDF",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
          {/* Reset Password Modal */}
          {modalType === "reset" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
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
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#86DBDF",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
          {/* Verification Modal */}
          {modalType === "verify" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
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
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #86DBDF",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    await apiClient.resendVerificationCode(formData.email);
                    setIsLoading(false);
                    setMessage("Verification code resent!");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#86DBDF",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#86DBDF",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
          {/* Account Exists Modal */}
          {modalType === "exists" && (
            <>
              <div
                style={{
                  marginBottom: "1rem",
                  color: "#721c24",
                  background: "#f8d7da",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                An account with this email already exists.
              </div>
              <button
                type="button"
                onClick={() => setModalType("login")}
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  background: "#86DBDF",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  cursor: "pointer",
                }}
              >
                Login to Existing Account
              </button>
              <button
                type="button"
                onClick={() => setModalType("forgot")}
                style={{
                  width: "100%",
                  fontSize: "0.9rem",
                  background: "none",
                  color: "#86DBDF",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
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
