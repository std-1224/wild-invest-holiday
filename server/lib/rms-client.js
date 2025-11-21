/**
 * RMS Cloud API Client
 * Handles authentication and API calls to RMS Cloud
 */

class RMSClient {
  constructor() {
    this.baseUrl = process.env.RMS_API_URL || 'https://restapi12.rmscloud.com';
    this.agentId = process.env.RMS_AGENT_ID;
    this.agentPassword = process.env.RMS_AGENT_PASSWORD;
    this.environment = process.env.RMS_ENVIRONMENT || 'production';
    
    // Client credentials based on environment
    this.clientId = this.environment === 'production' 
      ? process.env.RMS_PRODUCTION_CLIENT_ID 
      : process.env.RMS_SANDBOX_CLIENT_ID;
    this.clientPassword = this.environment === 'production'
      ? process.env.RMS_PRODUCTION_CLIENT_PASSWORD
      : process.env.RMS_SANDBOX_CLIENT_PASSWORD;
    
    this.moduleType = process.env.RMS_MODULE_TYPE || 'Distribution';
    
    // Token management
    this.authToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate with RMS API and get auth token
   */
  async authenticate() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: parseInt(this.agentId),
          agentPassword: this.agentPassword,
          clientId: parseInt(this.clientId),
          useTrainingData: false,
          clientPassword: this.clientPassword,
          moduleType: this.moduleType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`RMS Authentication failed: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.authToken || data.token || data.access_token;
      this.tokenExpiry = Date.now() + ((data.expiresIn || data.expires_in || 3600) * 1000);
      
      console.log('✅ RMS Authentication successful');
      return this.authToken;
    } catch (error) {
      console.error('❌ RMS Authentication error:', error.message);
      throw error;
    }
  }

  /**
   * Check if token is expired and refresh if needed
   */
  async ensureAuthenticated() {
    if (!this.authToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry - 60000) {
      // Token expired or expiring in less than 1 minute
      await this.authenticate();
    }
  }

  /**
   * Make authenticated request to RMS API
   */
  async request(endpoint, options = {}) {
    await this.ensureAuthenticated();

    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`RMS API Error: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ RMS API request failed [${endpoint}]:`, error.message);
      throw error;
    }
  }

  /**
   * Get all properties
   */
  async getProperties() {
    return this.request('/properties');
  }

  /**
   * Get property by ID
   */
  async getProperty(propertyId) {
    return this.request(`/properties/${propertyId}`);
  }

  /**
   * Get reservations with optional filters
   */
  async getReservations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reservations${query ? `?${query}` : ''}`);
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId) {
    return this.request(`/reservations/${reservationId}`);
  }

  /**
   * Create a new reservation
   */
  async createReservation(reservationData) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  /**
   * Update a reservation
   */
  async updateReservation(reservationId, updateData) {
    return this.request(`/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId, reason = '') {
    return this.request(`/reservations/${reservationId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

// Export singleton instance
const rmsClient = new RMSClient();
export default rmsClient;

