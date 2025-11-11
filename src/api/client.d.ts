// Type definitions for Wild Things API Client

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  error?: string;
}

export interface ReferralValidationResponse {
  success: boolean;
  valid: boolean;
  message: string;
  referrerName?: string;
}

export interface ReferralStatsResponse {
  success: boolean;
  referralCode: string;
  referralCount: number;
  totalEarned: number;
  transactions: Array<{
    amount: number;
    type: string;
    createdAt: string;
  }>;
}

export class WildThingsAPI {
  constructor();
  
  // Authentication methods
  registerUser(userData: RegisterData): Promise<AuthResponse>;
  loginUser(credentials: LoginCredentials): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<{ success: boolean; message: string }>;
  resetPassword(token: string, password: string): Promise<AuthResponse>;
  getProfile(): Promise<{ success: boolean; user: User }>;
  updateProfile(profileData: ProfileUpdateData): Promise<{ success: boolean; user: User; message: string }>;
  changePassword(passwordData: PasswordChangeData): Promise<{ success: boolean; message: string }>;
  logout(): void;
  isAuthenticated(): boolean;
  getUser(): User | null;
  
  // Investment methods
  createInvestment(investmentData: any): Promise<any>;
  listInvestments(): Promise<any>;
  getInvestment(investmentId: string): Promise<any>;
  
  // Account methods
  getAccountBalance(): Promise<any>;
  updateInvestmentAttitude(attitude: string): Promise<any>;
  
  // Email verification methods
  verifyEmail(email: string, verificationCode: string): Promise<any>;
  resendVerificationCode(email: string): Promise<any>;
  
  // Referral methods
  validateReferralCode(code: string): Promise<ReferralValidationResponse>;
  getReferralStats(): Promise<ReferralStatsResponse>;
  applyReferralCredits(userId: string, investmentId: string): Promise<{ success: boolean; message: string; creditsApplied: boolean }>;

  // Agreement methods
  getAllOwners(): Promise<{ success: boolean; count: number; owners: any[] }>;
  getAgreementsByOwner(ownerId: string): Promise<{ success: boolean; count: number; agreements: any[] }>;
  createAgreement(agreementData: any): Promise<{ success: boolean; message: string; agreement: any }>;
  updateAgreement(agreementId: string, updateData: any): Promise<{ success: boolean; message: string; agreement: any }>;
  uploadAgreementFile(file: File): Promise<{ success: boolean; message: string; url: string; fileName: string; fileSize: number; fileType: string }>;

  // Payment method management
  savePaymentMethod(paymentMethodId: string, setAsDefault?: boolean): Promise<{ success: boolean; paymentMethod: any }>;
  listPaymentMethods(): Promise<{ success: boolean; paymentMethods: any[] }>;
  setDefaultPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }>;
  removePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }>;

  // Xero integration
  getXeroStatus(): Promise<{ success: boolean; connected: boolean; tenantId?: string; tenantName?: string; connectedAt?: string }>;
  disconnectXero(): Promise<{ success: boolean; message: string }>;
  getXeroInvoices(contactId?: string): Promise<{ success: boolean; invoices: any[]; count: number }>;
  recordXeroPayment(invoiceId: string, amount: number, paymentDate?: string, reference?: string): Promise<{ success: boolean; payment: any }>;
  payXeroInvoice(paymentData: {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
    xeroContactId: string;
    description: string;
  }): Promise<{ success: boolean; paymentIntent: any; xeroPayment: any; xeroError: string | null }>;

  // Payment History
  getPaymentHistory(): Promise<{ success: boolean; payments: any[]; summary: any }>;
  getBoostPayments(boostId?: string): Promise<{ success: boolean; payments: any[] }>;

  // Marketing Boost integration
  activateMarketingBoost(boostData: {
    investmentId: string;
    cabinType: string;
    location: string;
    tier: string;
    tierName: string;
    monthlyPrice: number;
    paymentMethodId: string;
  }): Promise<{ success: boolean; boost: any; payment: any; xero: any; message: string }>;
  listMarketingBoosts(): Promise<{ success: boolean; boosts: any[] }>;
  cancelMarketingBoost(boostId: string): Promise<{ success: boolean; message: string }>;
  pauseMarketingBoost(boostId: string): Promise<{ success: boolean; message: string }>;
  resumeMarketingBoost(boostId: string): Promise<{ success: boolean; message: string }>;
}

declare const apiClient: WildThingsAPI;
export default apiClient;

