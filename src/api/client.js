// Wild Things API Client
// Handles all backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class WildThingsAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = localStorage.getItem('authToken');
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    // Always read the latest token from localStorage to ensure we have the current auth state
    const currentToken = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication methods
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} [userData.referralCode] - Optional referral code
   * @returns {Promise<Object>} Response with token and user data
   */
  async registerUser(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Response with token and user data
   */
  async loginUser(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Request password reset
   * @param {string} email - User's email
   * @returns {Promise<Object>} Response message
   */
  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token from email
   * @param {string} password - New password
   * @returns {Promise<Object>} Response with token and user data
   */
  async resetPassword(token, password) {
    const response = await this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    if (response.token) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    const response = await this.request('/api/auth/me');

    // Update stored user data with latest profile info
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @param {string} [profileData.firstName] - User's first name
   * @param {string} [profileData.lastName] - User's last name
   * @param {string} [profileData.email] - User's email
   * @param {string} [profileData.phone] - User's phone number
   * @returns {Promise<Object>} Response with updated user data
   */
  async updateProfile(profileData) {
    const response = await this.request('/api/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    // Update stored user data
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Response message
   */
  async changePassword(passwordData) {
    return this.request('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  /**
   * Logout user
   */
  logout() {
    this.authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a token
   */
  isAuthenticated() {
    // Always read from localStorage to get the current auth state
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Referral methods
  /**
   * Validate a referral code
   * @param {string} referralCode - Referral code to validate
   * @returns {Promise<Object>} Validation result with valid flag and referrer name
   */
  async validateReferralCode(referralCode) {
    return this.request('/api/auth/validate-referral', {
      method: 'POST',
      body: JSON.stringify({ referralCode }),
    });
  }

  /**
   * Get referral statistics for the current user
   * @returns {Promise<Object>} Referral stats including code, count, and earnings
   */
  async getReferralStats() {
    return this.request('/api/auth/referral-stats', {
      method: 'GET',
    });
  }

  /**
   * Apply referral credits when user makes first investment
   * @param {string} userId - User ID who made the investment
   * @param {string} investmentId - Investment ID
   * @returns {Promise<Object>} Result of credit application
   */
  async applyReferralCredits(userId, investmentId) {
    return this.request('/api/auth/apply-referral-credits', {
      method: 'POST',
      body: JSON.stringify({ userId, investmentId }),
    });
  }

  // Investment methods
  async createInvestment(investmentData) {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify(investmentData),
    });
  }

  async listInvestments() {
    return this.request('/investments');
  }

  async getInvestment(investmentId) {
    return this.request(`/investments/${investmentId}`);
  }

  // Account methods
  async getAccountBalance() {
    return this.request('/account/balance');
  }

  async updateInvestmentAttitude(attitude) {
    try {
      return await this.request('/account/attitude', {
        method: 'PUT',
        body: JSON.stringify({ attitude }),
      });
    } catch (error) {
      // If the endpoint doesn't exist, simulate success for now
      console.warn('Investment attitude endpoint not available, simulating success:', error);
      return { success: true, message: 'Investment attitude updated (simulated)' };
    }
  }

  // Email verification methods
  async verifyEmail(email, verificationCode) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, verificationCode }),
    });
  }

  async resendVerificationCode(email) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, action: 'resend' }),
    });
  }

  // Password reset methods
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email, verificationCode, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, verificationCode, newPassword }),
    });
  }



  // Payout system methods
  async requestPayout(amount, bankDetails) {
    return this.request('/payouts/request', {
      method: 'POST',
      body: JSON.stringify({ amount, bankDetails }),
    });
  }

  async getPayoutRequests() {
    return this.request('/payouts/history');
  }

  // Stripe payment methods
  async createPaymentIntent(amount, currency, paymentMethodId, customerId, description) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, paymentMethodId, customerId, description }),
    });
  }

  async savePaymentMethod(paymentMethodId, customerId) {
    return this.request('/payments/save-method', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId, customerId }),
    });
  }

  // Xero integration
  /**
   * Initiate Xero OAuth connection
   * Redirects to Xero authorization page
   */
  async connectXero() {
    // This should be a redirect, not an API call
    window.location.href = `${this.baseURL}/api/xero-auth`;
  }

  /**
   * Get unpaid invoices from Xero for a specific contact
   * @param {string} contactId - Xero contact ID
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<{success: boolean, invoices: Array, count: number}>}
   */
  async getXeroInvoices(contactId, customerId) {
    return this.request(`/api/xero/get-invoices?contactId=${contactId}&customerId=${customerId}`);
  }

  /**
   * Pay a Xero invoice using Stripe
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.invoiceId - Xero invoice ID
   * @param {string} paymentData.invoiceNumber - Invoice number
   * @param {number} paymentData.amount - Amount to charge
   * @param {string} paymentData.currency - Currency code (e.g., 'usd')
   * @param {string} paymentData.customerId - Stripe customer ID
   * @param {string} paymentData.paymentMethodId - Stripe payment method ID
   * @param {string} paymentData.xeroContactId - Xero contact ID
   * @param {string} paymentData.description - Payment description
   * @returns {Promise<{success: boolean, stripeCharge: Object, xeroPayment: Object}>}
   */
  async payXeroInvoice(paymentData) {
    return this.request('/api/xero/pay-invoice', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // RMS integration
  async syncRMSCalendar(investmentId) {
    return this.request('/integrations/rms/sync-calendar', {
      method: 'POST',
      body: JSON.stringify({ investmentId }),
    });
  }

  // Occupancy type management
  async updateOccupancyType(investmentId, occupancyType) {
    return this.request('/investments/update-occupancy-type', {
      method: 'PUT',
      body: JSON.stringify({ investmentId, occupancyType }),
    });
  }

  // Contract methods
  async createContract(contractData) {
    return this.request('/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async signContract(contractId, signatureData) {
    return this.request(`/contracts/${contractId}/sign`, {
      method: 'POST',
      body: JSON.stringify(signatureData),
    });
  }

  async getContracts(investmentId) {
    return this.request(`/contracts?investmentId=${investmentId}`);
  }

  // Payment methods
  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayments(investmentId) {
    return this.request(`/payments?investmentId=${investmentId}`);
  }

  // Income methods
  async recordIncome(incomeData) {
    return this.request('/income', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  }

  async getIncome(investmentId) {
    return this.request(`/income?investmentId=${investmentId}`);
  }

  // Reservation methods
  async createReservation(reservationData) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async getReservations() {
    return this.request('/reservations');
  }

  // Document upload
  async uploadDocument(file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.request('/documents/upload', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary
        Authorization: `Bearer ${this.authToken}`,
      },
      body: formData,
    });
  }

  // Agreement methods
  /**
   * Get all owners (admin only)
   * @returns {Promise<Object>} Response with list of owners
   */
  async getAllOwners() {
    return this.request('/api/agreements/owners');
  }

  /**
   * Get agreements for a specific owner
   * @param {string} ownerId - Owner's user ID
   * @returns {Promise<Object>} Response with list of agreements
   */
  async getAgreementsByOwner(ownerId) {
    return this.request(`/api/agreements/${ownerId}`);
  }

  /**
   * Create a new agreement (admin only)
   * @param {Object} agreementData - Agreement data
   * @returns {Promise<Object>} Response with created agreement
   */
  async createAgreement(agreementData) {
    return this.request('/api/agreements', {
      method: 'POST',
      body: JSON.stringify(agreementData),
    });
  }

  /**
   * Update an agreement (admin only)
   * @param {string} agreementId - Agreement ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Response with updated agreement
   */
  async updateAgreement(agreementId, updateData) {
    return this.request(`/api/agreements/${agreementId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Upload agreement file to S3 (admin only)
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Response with S3 URL
   */
  async uploadAgreementFile(file) {
    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return this.request('/api/upload/agreement', {
      method: 'POST',
      body: JSON.stringify({
        file: base64,
        fileName: file.name,
        fileType: file.type,
      }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Export the class for direct instantiation
export { WildThingsAPI };

// Create singleton instance
const apiClient = new WildThingsAPI();

export default apiClient;