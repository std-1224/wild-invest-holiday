// Stripe API Client for Frontend
// Handles communication with Stripe Lambda functions

import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  SavePaymentMethodRequest,
  SavePaymentMethodResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  ListPaymentMethodsRequest,
  ListPaymentMethodsResponse,
  SetDefaultPaymentMethodRequest,
  SetDefaultPaymentMethodResponse,
  RemovePaymentMethodRequest,
  RemovePaymentMethodResponse,
  RefundRequest,
  RefundResponse,
  StripeConfig,
} from "../types/stripe";

/**
 * Stripe API Client Class
 */
class StripeAPIClient {
  private config: StripeConfig;
  private baseURL: string;

  constructor(config?: Partial<StripeConfig>) {
    // @ts-ignore - import.meta.env is available in Vite
    const env = import.meta.env || {};

    this.config = {
      publishableKey:
        config?.publishableKey ||
        env.VITE_STRIPE_PUBLISHABLE_KEY ||
        "",
      secretKey:
        config?.secretKey ||
        env.VITE_STRIPE_SECRET_KEY ||
        "",
      apiVersion: config?.apiVersion || "2023-10-16",
    };

    // Base URL for Lambda functions (API Gateway)
    this.baseURL = env.VITE_API_URL || '/api';

    if (!this.config.publishableKey) {
      console.warn("⚠️ Stripe publishable key not configured.");
    }
  }

  /**
   * Get Stripe publishable key
   */
  getPublishableKey(): string {
    return this.config.publishableKey;
  }

  /**
   * Make HTTP request to Lambda function
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  }

  /**
   * Create a PaymentIntent for one-time payment
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    return this.request<CreatePaymentIntentResponse>(
      "/api/stripe/create-payment-intent",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Save a payment method to a customer
   */
  async savePaymentMethod(
    request: SavePaymentMethodRequest
  ): Promise<SavePaymentMethodResponse> {
    return this.request<SavePaymentMethodResponse>(
      "/api/stripe/save-payment-method",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * List all payment methods for a customer
   */
  async listPaymentMethods(
    request: ListPaymentMethodsRequest
  ): Promise<ListPaymentMethodsResponse> {
    return this.request<ListPaymentMethodsResponse>(
      "/api/stripe/list-payment-methods",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Set default payment method for a customer
   */
  async setDefaultPaymentMethod(
    request: SetDefaultPaymentMethodRequest
  ): Promise<SetDefaultPaymentMethodResponse> {
    return this.request<SetDefaultPaymentMethodResponse>(
      "/api/stripe/set-default-payment-method",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(
    request: RemovePaymentMethodRequest
  ): Promise<RemovePaymentMethodResponse> {
    return this.request<RemovePaymentMethodResponse>(
      "/api/stripe/remove-payment-method",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Create a subscription for recurring payments
   */
  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> {
    return this.request<CreateSubscriptionResponse>(
      "/api/stripe/create-subscription",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    request: CancelSubscriptionRequest
  ): Promise<CancelSubscriptionResponse> {
    return this.request<CancelSubscriptionResponse>(
      "/api/stripe/cancel-subscription",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Request a refund
   */
  async requestRefund(request: RefundRequest): Promise<RefundResponse> {
    return this.request<RefundResponse>("/api/stripe/refund", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return !!this.config.publishableKey;
  }
}

// Export singleton instance
export const stripeClient = new StripeAPIClient();

// Export class for custom instances
export { StripeAPIClient };
