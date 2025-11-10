/**
 * Type definitions for xero-token-store.js
 */

export interface TokenSet {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  id_token?: string;
  scope?: string;
}

export function saveTokenSet(tokens: TokenSet): void;
export function getTokenSet(): TokenSet | null;
export function hasValidTokens(): boolean;
export function clearTokens(): void;

