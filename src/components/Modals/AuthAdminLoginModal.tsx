import { useState } from "react";
import { WildThingsAPI } from "../../api/client";

interface AuthAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onForgotPassword: () => void;
}

export const AuthAdminLoginModal = ({
  isOpen,
  onClose,
  onLogin,
  onForgotPassword,
}: AuthAdminLoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const api = new WildThingsAPI();
      const response = await api.loginUser({ email, password });

      if (response.success) {
        // Check if user is admin
        const user = response.user;
        if (!user || user.role !== 'admin') {
          setError("Access denied. Admin credentials required.");
          // Logout the user
          api.logout();
          setLoading(false);
          return;
        }

        // Admin login successful
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
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0e181f] hover:text-[#86dbdf] text-2xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-2 text-center italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          Admin Portal Login
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Admin access only
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[#0e181f]">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
              required
              autoComplete="email"
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
              autoComplete="current-password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ec874c] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Not an admin?{" "}
            <button
              onClick={onClose}
              className="text-[#86dbdf] hover:underline font-semibold"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

