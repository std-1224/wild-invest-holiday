/**
 * Simple in-memory token store for Xero OAuth tokens
 * In production, this should be stored in a database or secure storage
 */
let tokenSet = null;
export function saveTokenSet(tokens) {
    tokenSet = tokens;
}
export function getTokenSet() {
    return tokenSet;
}
export function hasValidTokens() {
    if (!tokenSet) {
        return false;
    }
    // Check if access token is expired
    const expiresAt = tokenSet.expires_at || tokenSet.expires_in;
    if (expiresAt && typeof expiresAt === 'number') {
        const now = Date.now() / 1000; // Convert to seconds
        return now < expiresAt;
    }
    // If we have a token but can't determine expiry, assume it's valid
    return !!tokenSet.access_token;
}
export function clearTokens() {
    tokenSet = null;
    console.log('🗑️  Xero tokens cleared from memory');
}
