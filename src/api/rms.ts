// RMS (Rental Management System) API Client
// Handles communication with the RMS for booking and availability management

import {
  RMSConfig,
  RMSAvailability,
  RMSBooking,
  CreateOwnerBookingRequest,
  CreateOwnerBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  OwnerBookingAllowance,
  RMSSyncStatus,
  RMSErrorResponse,
} from '../types/rms';

/**
 * RMS API Client Class
 */
class RMSAPIClient {
  private config: RMSConfig;
  private baseURL: string;

  constructor(config?: Partial<RMSConfig>) {
    // Load from environment variables or use provided config
    // Support both Vite (import.meta.env) and Node.js (process.env) environments
    const getEnvVar = (viteKey: string, nodeKey: string): string | undefined => {
      // Try Vite environment variables first (browser)
      try {
        // @ts-ignore - import.meta.env is available in Vite
        const viteEnv = import.meta?.env;
        if (viteEnv && viteEnv[viteKey]) {
          return viteEnv[viteKey];
        }
      } catch (e) {
        // Not in Vite environment or variable not found
      }

      // Try Node.js environment variables (Lambda/Server)
      try {
        // Use globalThis to safely access process without ReferenceError
        const nodeProcess = (globalThis as any).process;
        if (nodeProcess?.env && nodeProcess.env[nodeKey]) {
          return nodeProcess.env[nodeKey];
        }
      } catch (e) {
        // Not in Node.js environment
      }

      return undefined;
    };

    this.config = {
      apiUrl: config?.apiUrl || getEnvVar('VITE_RMS_API_URL', 'RMS_API_URL') || '',
      apiKey: config?.apiKey || getEnvVar('VITE_RMS_API_KEY', 'RMS_API_KEY') || '',
      tenantId: config?.tenantId || getEnvVar('VITE_RMS_TENANT_ID', 'RMS_TENANT_ID'),
      timeout: config?.timeout || 30000, // 30 seconds default
      retryAttempts: config?.retryAttempts || 3,
    };
    this.baseURL = this.config.apiUrl;

    if (!this.baseURL || !this.config.apiKey) {
      console.warn('RMS API credentials not configured. Using mock mode.');
    }
  }

  /**
   * Make HTTP request to RMS API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If RMS is not configured, throw error
    if (!this.baseURL || !this.config.apiKey) {
      throw new Error('RMS API is not configured. Please set RMS_API_URL and RMS_API_KEY environment variables.');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      ...(this.config.tenantId && { 'X-Tenant-ID': this.config.tenantId }),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: RMSErrorResponse = await response.json().catch(() => ({
          error: 'Unknown Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        }));
        throw new Error(errorData.message || `RMS API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`RMS API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Fetch availability for a cabin
   */
  async getAvailability(cabinId: number, startDate?: string, endDate?: string): Promise<RMSAvailability> {
    const params = new URLSearchParams({
      cabinId: cabinId.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    return this.request<RMSAvailability>(`/availability?${params.toString()}`);
  }

  /**
   * Fetch owner booking allowance
   */
  async getOwnerAllowance(ownerId: string, cabinId: number): Promise<OwnerBookingAllowance> {
    return this.request<OwnerBookingAllowance>(`/owner/${ownerId}/allowance?cabinId=${cabinId}`);
  }

  /**
   * Create owner booking
   */
  async createOwnerBooking(request: CreateOwnerBookingRequest): Promise<CreateOwnerBookingResponse> {
    return this.request<CreateOwnerBookingResponse>('/bookings/owner', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Cancel owner booking
   */
  async cancelOwnerBooking(request: CancelBookingRequest): Promise<CancelBookingResponse> {
    return this.request<CancelBookingResponse>(`/bookings/${request.bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<RMSBooking> {
    return this.request<RMSBooking>(`/bookings/${bookingId}`);
  }

  /**
   * Get all bookings for a cabin
   */
  async getCabinBookings(cabinId: number, startDate?: string, endDate?: string): Promise<RMSBooking[]> {
    const params = new URLSearchParams({
      cabinId: cabinId.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    return this.request<RMSBooking[]>(`/bookings?${params.toString()}`);
  }

  /**
   * Get all owner bookings
   */
  async getOwnerBookings(ownerId: string, cabinId?: number): Promise<RMSBooking[]> {
    const params = new URLSearchParams({
      ownerId,
      ...(cabinId && { cabinId: cabinId.toString() }),
    });

    return this.request<RMSBooking[]>(`/bookings/owner?${params.toString()}`);
  }

  /**
   * Sync calendar with RMS
   */
  async syncCalendar(cabinId: number): Promise<RMSSyncStatus> {
    return this.request<RMSSyncStatus>('/sync/calendar', {
      method: 'POST',
      body: JSON.stringify({ cabinId }),
    });
  }

  /**
   * Check if RMS is configured and available
   */
  isConfigured(): boolean {
    return !!(this.baseURL && this.config.apiKey);
  }

  /**
   * Health check for RMS API
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Create singleton instance
const rmsClient = new RMSAPIClient();

export default rmsClient;
export { RMSAPIClient };

