// Lambda Function: Xero OAuth Callback
// Handles the OAuth callback from Xero and exchanges code for tokens
import { XeroClient } from 'xero-node';
import { saveTokenSet } from './xero-token-store.js';
/**
 * GET /api/xero-callback
 * Handles OAuth callback from Xero
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { code, error, error_description } = req.query;
        // Get frontend callback URL
        const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
        // Check for OAuth errors
        if (error) {
            console.error('Xero OAuth error:', error, error_description);
            const errorUrl = `${frontendCallback}?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || 'Unknown error')}`;
            res.setHeader('Location', errorUrl);
            return res.status(302).end();
        }
        if (!code) {
            const errorUrl = `${frontendCallback}?error=no_code&error_description=${encodeURIComponent('No authorization code was provided by Xero')}`;
            res.setHeader('Location', errorUrl);
            return res.status(302).end();
        }
        const clientId = process.env.XERO_CLIENT_ID;
        const clientSecret = process.env.XERO_CLIENT_SECRET;
        const redirectUri = process.env.XERO_REDIRECT_URI;
        if (!clientId || !clientSecret || !redirectUri) {
            return res.status(500).json({
                error: 'Xero OAuth not configured',
                message: 'Please configure XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI',
            });
        }
        console.log('Processing Xero OAuth callback...');
        console.log('Authorization code received:', code);
        // Initialize Xero client
        const xero = new XeroClient({
            clientId,
            clientSecret,
            redirectUris: [redirectUri],
            scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
            state: '', // Match the empty state from the callback
        });
        // Exchange authorization code for tokens
        // Build the full callback URL with query parameters
        const callbackUrl = `${redirectUri}?code=${code}&state=`;
        await xero.apiCallback(callbackUrl);
        console.log('✅ Token exchange successful');
        // Get token set
        const tokenSet = xero.readTokenSet();
        // Save tokens to memory for use by other endpoints
        saveTokenSet(tokenSet);
        console.log('Access Token:', tokenSet.access_token?.substring(0, 20) + '...');
        console.log('Refresh Token:', tokenSet.refresh_token?.substring(0, 20) + '...');
        console.log('Expires At:', new Date((tokenSet.expires_at || 0) * 1000).toISOString());
        // Get tenant connections
        await xero.updateTenants();
        const tenants = xero.tenants;
        if (!tenants || tenants.length === 0) {
            return res.status(500).json({
                error: 'No organizations found',
                message: 'No Xero organizations are connected to your account'
            });
        }
        const tenant = tenants[0];
        console.log('✅ Tenant ID:', tenant.tenantId);
        console.log('✅ Tenant Name:', tenant.tenantName);
        console.log('✅ Tenant Type:', tenant.tenantType);
        console.log("tokenSet", tokenSet);
        // Redirect to frontend with success parameters
        const redirectUrl = `${frontendCallback}?success=true&tenantId=${tenant.tenantId}&tenantName=${encodeURIComponent(tenant.tenantName || '')}&tenantType=${tenant.tenantType}`;
        console.log('Redirecting to frontend:', redirectUrl);
        res.setHeader('Location', redirectUrl);
        return res.status(302).end();
    }
    catch (error) {
        console.error('Error processing Xero callback:', error);
        // Redirect to frontend with error
        const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
        const errorUrl = `${frontendCallback}?error=connection_error&error_description=${encodeURIComponent(error.message || 'Failed to connect to Xero')}`;
        res.setHeader('Location', errorUrl);
        return res.status(302).end();
    }
}
