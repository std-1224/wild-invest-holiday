import { XeroClient } from 'xero-node';
import jwt from 'jsonwebtoken';
import XeroConnection from '../models/XeroConnection.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * GET /api/xero-auth
 * Initiates Xero OAuth flow
 * Requires authentication - user must be logged in
 */
export async function handleXeroAuth(req, res) {
  try {
    // Extract user ID from query parameter (passed from frontend)
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId parameter',
        message: 'Please provide userId in query string',
      });
    }
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
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
    
    console.log('🔐 Initiating Xero OAuth for user:', user.email);
    
    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access'.split(' '),
      // Store userId in state to retrieve after callback
      state: userId,
    });
    
    // Generate consent URL
    const consentUrl = await xero.buildConsentUrl();
    
    console.log('✅ Redirecting to Xero consent URL');
    
    // Redirect to Xero authorization page
    return res.redirect(consentUrl);
  } catch (error) {
    console.error('❌ Error generating Xero consent URL:', error);
    return res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message,
    });
  }
}

/**
 * GET /api/xero-callback
 * Handles OAuth callback from Xero
 * Exchanges authorization code for tokens and saves to database
 */
export async function handleXeroCallback(req, res) {
  try {
    const { code, error, error_description, state } = req.query;
    
    // Get frontend callback URL
    const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
    
    // Check for OAuth errors
    if (error) {
      console.error('❌ Xero OAuth error:', error, error_description);
      const errorUrl = `${frontendCallback}?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || 'Unknown error')}`;
      return res.redirect(errorUrl);
    }
    
    if (!code) {
      const errorUrl = `${frontendCallback}?error=no_code&error_description=${encodeURIComponent('No authorization code was provided by Xero')}`;
      return res.redirect(errorUrl);
    }
    
    if (!state) {
      const errorUrl = `${frontendCallback}?error=no_state&error_description=${encodeURIComponent('No user ID in state parameter')}`;
      return res.redirect(errorUrl);
    }
    
    // Get user ID from state
    const userId = state;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      const errorUrl = `${frontendCallback}?error=user_not_found&error_description=${encodeURIComponent('User not found')}`;
      return res.redirect(errorUrl);
    }
    
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        error: 'Xero OAuth not configured',
      });
    }
    
    console.log('🔄 Processing Xero OAuth callback for user:', user.email);
    
    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access'.split(' '),
      state: userId,
    });
    
    // Exchange authorization code for tokens
    const callbackUrl = `${redirectUri}?code=${code}&state=${state}`;
    await xero.apiCallback(callbackUrl);
    
    console.log('✅ Token exchange successful');
    
    // Get token set
    const tokenSet = xero.readTokenSet();

    console.log('Access Token expires at:', new Date((tokenSet.expires_at || 0) * 1000).toISOString());
    
    // Get tenant connections
    await xero.updateTenants();
    const tenants = xero.tenants;
    const tenant = tenants && tenants.length > 0 ? tenants[0] : null;
    
    if (!tenant) {
      const errorUrl = `${frontendCallback}?error=no_tenant&error_description=${encodeURIComponent('No Xero organization found')}`;
      return res.redirect(errorUrl);
    }
    
    console.log('📊 Xero organization:', tenant.tenantName);

    // Validate token set has required fields
    if (!tokenSet.access_token) {
      const errorUrl = `${frontendCallback}?error=invalid_token&error_description=${encodeURIComponent('No access token received from Xero')}`;
      return res.redirect(errorUrl);
    }

    if (!tokenSet.refresh_token) {
      const errorUrl = `${frontendCallback}?error=invalid_token&error_description=${encodeURIComponent('No refresh token received from Xero')}`;
      return res.redirect(errorUrl);
    }

    // Save connection to database
    await XeroConnection.createOrUpdate(
      userId,
      tokenSet,
      tenant.tenantId,
      tenant.tenantName
    );
    
    console.log('✅ Xero connection saved to database for user:', user.email);
    
    // Redirect to frontend with success
    const successUrl = `${frontendCallback}?success=true&tenantId=${tenant.tenantId}&tenantName=${encodeURIComponent(tenant.tenantName)}`;
    return res.redirect(successUrl);
    
  } catch (error) {
    console.error('❌ Error in Xero OAuth callback:', error);
    
    const frontendCallback = process.env.XERO_FRONTEND_CALLBACK || 'http://localhost:5173/xero/callback';
    const errorUrl = `${frontendCallback}?error=callback_failed&error_description=${encodeURIComponent(error.message)}`;
    return res.redirect(errorUrl);
  }
}

