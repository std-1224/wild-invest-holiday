import { useState } from "react";
import { WildThingsAPI } from "../../api/client";

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const AuthLoginModal = ({
  isOpen,
  onClose,
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
}: AuthLoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const api = new WildThingsAPI();
      const response = await api.loginUser({ email, password });

      if (response.success) {
        // Login successful
        onLogin();
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0e181f] hover:text-[#86dbdf] text-2xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          Login to Your Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[#0e181f]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-[#86dbdf] hover:text-[#0e181f] font-semibold"
            >
              Forgot password?
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
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
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="font-bold text-[#86dbdf] hover:text-[#0e181f]"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

