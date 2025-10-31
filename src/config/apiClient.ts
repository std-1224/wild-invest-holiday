// API Client for Authentication
export const apiClient = {
  baseURL: "https://zfcs7ah00l.execute-api.ap-southeast-2.amazonaws.com/prod",

  async request(endpoint:any, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`API call failed: ${endpoint}`, error);
      // Return mock data for development
      return this.getMockResponse(endpoint, options);
    }
  },

  getMockResponse(endpoint:any, options:any) {
    if (endpoint === "/auth/login" && options.method === "POST") {
      return {
        success: true,
        token: "mock-jwt-token-" + Date.now(),
        user: { email: "investor@wildthings.com", name: "Test Investor" },
      };
    }
    if (endpoint === "/auth/register" && options.method === "POST") {
      return { success: true, message: "Registration successful" };
    }
    if (endpoint === "/auth/forgot-password" && options.method === "POST") {
      return { success: true, message: "Password reset email sent" };
    }
    if (endpoint === "/auth/verify" && options.method === "POST") {
      return { success: true, message: "Email verified successfully" };
    }
    return { success: true, message: "Mock response" };
  },

  async login(email:any, password:any) {
    return await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(userData:any) {
    return await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async forgotPassword(email:any) {
    return await this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async verifyEmail(token:any) {
    return await this.request("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
};
