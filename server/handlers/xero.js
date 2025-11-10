import { XeroClient } from 'xero-node';
import jwt from 'jsonwebtoken';
import XeroConnection from '../models/XeroConnection.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper: Extract and verify authenticated user from JWT token
 */
async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Not authenticated');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Token payload uses 'id' not 'userId'
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Helper: Get or refresh Xero access token
 * Automatically refreshes if token is expired or expires soon
 */
async function getValidXeroClient(userId) {
  const connection = await XeroConnection.findByUserId(userId);
  
  if (!connection) {
    throw new Error('Xero not connected. Please connect your Xero account first.');
  }
  
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Xero OAuth not configured');
  }
  
  // Initialize Xero client
  const xero = new XeroClient({
    clientId,
    clientSecret,
    redirectUris: [redirectUri],
    scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access'.split(' '),
  });
  
  // Check if token needs refresh (expired or expires in < 5 minutes)
  if (connection.needsRefresh()) {
    console.log('🔄 Xero access token expired or expiring soon, refreshing...');
    
    try {
      // Set the current token set for refresh
      xero.setTokenSet({
        access_token: connection.getAccessToken(),
        refresh_token: connection.getRefreshToken(),
        expires_at: Math.floor(connection.tokenExpiresAt.getTime() / 1000),
        token_type: connection.tokenType,
      });
      
      // Refresh the token
      const newTokenSet = await xero.refreshToken();
      
      console.log('✅ Xero token refreshed successfully');
      console.log('New expires at:', new Date((newTokenSet.expires_at || 0) * 1000).toISOString());
      
      // Update connection with new tokens
      connection.setAccessToken(newTokenSet.access_token);
      connection.setRefreshToken(newTokenSet.refresh_token);
      connection.tokenExpiresAt = new Date((newTokenSet.expires_at || 0) * 1000);
      connection.tokenType = newTokenSet.token_type || 'Bearer';
      
      await connection.save();
      
      // Set the new token set in the client
      xero.setTokenSet(newTokenSet);
    } catch (error) {
      console.error('❌ Error refreshing Xero token:', error.message);
      throw new Error('Failed to refresh Xero token. Please reconnect your Xero account.');
    }
  } else {
    // Token is still valid, use it
    xero.setTokenSet({
      access_token: connection.getAccessToken(),
      refresh_token: connection.getRefreshToken(),
      expires_at: Math.floor(connection.tokenExpiresAt.getTime() / 1000),
      token_type: connection.tokenType,
    });
  }
  
  return { xero, connection };
}

/**
 * GET /api/xero/status
 * Check if user has connected Xero account
 */
export async function handleXeroStatus(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    const connection = await XeroConnection.findByUserId(user._id);
    
    if (!connection) {
      return res.json({
        success: true,
        connected: false,
      });
    }
    
    return res.json({
      success: true,
      connected: true,
      tenantId: connection.tenantId,
      tenantName: connection.tenantName,
      connectedAt: connection.createdAt,
      tokenExpiresAt: connection.tokenExpiresAt,
      needsRefresh: connection.needsRefresh(),
    });
  } catch (error) {
    console.error('Error checking Xero status:', error);
    
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/xero/disconnect
 * Disconnect Xero account for authenticated user
 */
export async function handleXeroDisconnect(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    
    await XeroConnection.deleteByUserId(user._id);
    
    console.log(`✅ Xero disconnected for user ${user.email}`);
    
    return res.json({
      success: true,
      message: 'Xero account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Xero:', error);
    
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/xero/invoices
 * Get invoices from Xero for authenticated user
 */
export async function handleGetXeroInvoices(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    const { xero, connection } = await getValidXeroClient(user._id);
    
    // Update tenants to ensure we have the latest
    await xero.updateTenants();
    
    // Get invoices
    const response = await xero.accountingApi.getInvoices(connection.tenantId);
    
    return res.json({
      success: true,
      invoices: response.body.invoices || [],
    });
  } catch (error) {
    console.error('Error fetching Xero invoices:', error);
    
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }
    
    if (error.message.includes('Xero not connected')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        needsConnection: true,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/xero/record-payment
 * Record a payment in Xero
 */
export async function handleRecordXeroPayment(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    const { xero, connection } = await getValidXeroClient(user._id);
    const { invoiceId, amount, paymentDate, reference } = req.body;
    
    if (!invoiceId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: invoiceId, amount',
      });
    }
    
    // Create payment object
    const payment = {
      invoice: {
        invoiceID: invoiceId,
      },
      account: {
        code: '200', // Default bank account code - should be configurable
      },
      date: paymentDate || new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      reference: reference || 'Payment via Wild Things Portal',
    };
    
    // Record payment in Xero
    const response = await xero.accountingApi.createPayment(
      connection.tenantId,
      { payments: [payment] }
    );
    
    return res.json({
      success: true,
      payment: response.body.payments?.[0] || {},
    });
  } catch (error) {
    console.error('Error recording Xero payment:', error);
    
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }
    
    if (error.message.includes('Xero not connected')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        needsConnection: true,
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export { getValidXeroClient };

