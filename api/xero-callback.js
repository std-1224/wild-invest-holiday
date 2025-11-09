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
        // Check for OAuth errors
        if (error) {
            console.error('Xero OAuth error:', error, error_description);
            return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Xero Authorization Failed</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
            h1 { color: #c00; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Authorization Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>Description:</strong> ${error_description || 'Unknown error'}</p>
            <p><a href="/investor-portal">← Back to Investor Portal</a></p>
          </div>
        </body>
        </html>
      `);
        }
        if (!code) {
            return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Xero Authorization Failed</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
            h1 { color: #c00; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ No Authorization Code</h1>
            <p>No authorization code was provided by Xero.</p>
            <p><a href="/investor-portal">← Back to Investor Portal</a></p>
          </div>
        </body>
        </html>
      `);
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
        });
        // Exchange authorization code for tokens
        await xero.apiCallback(req.url || '');
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
            return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>No Xero Organizations Found</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #ffc; border: 1px solid #cc9; padding: 20px; border-radius: 8px; }
            h1 { color: #c90; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>⚠️ No Organizations Found</h1>
            <p>No Xero organizations are connected to your account.</p>
            <p>Please make sure you have access to at least one Xero organization.</p>
            <p><a href="/investor-portal">← Back to Investor Portal</a></p>
          </div>
        </body>
        </html>
      `);
        }
        const tenant = tenants[0];
        console.log('✅ Tenant ID:', tenant.tenantId);
        console.log('✅ Tenant Name:', tenant.tenantName);
        console.log('✅ Tenant Type:', tenant.tenantType);
        // Return success page with tenant information
        return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Xero Connected Successfully</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            background: #f5f5f5;
          }
          .success { 
            background: #efe; 
            border: 2px solid #8c8; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #080; margin-top: 0; }
          .info { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #080;
          }
          .code { 
            background: #f8f8f8; 
            padding: 15px; 
            border-radius: 6px; 
            font-family: monospace; 
            font-size: 14px;
            margin: 10px 0;
            border: 1px solid #ddd;
          }
          .highlight { 
            background: #ffc; 
            padding: 2px 6px; 
            border-radius: 3px;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            background: #080;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
          }
          .button:hover {
            background: #060;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Xero Connected Successfully!</h1>
          
          <div class="info">
            <h2>📋 Your Xero Organization Details</h2>
            <p><strong>Organization Name:</strong> ${tenant.tenantName}</p>
            <p><strong>Organization Type:</strong> ${tenant.tenantType}</p>
            <p><strong>Tenant ID:</strong> <span class="highlight">${tenant.tenantId}</span></p>
          </div>

          <div class="warning">
            <h3>⚠️ Important: Add Tenant ID to Environment Variables</h3>
            <p>Copy the following line and add it to your <code>.env</code> file:</p>
            <div class="code">XERO_TENANT_ID=${tenant.tenantId}</div>
            <p><strong>Steps:</strong></p>
            <ol>
              <li>Open your <code>.env</code> file</li>
              <li>Find the line <code>XERO_TENANT_ID=</code></li>
              <li>Paste the Tenant ID: <code>XERO_TENANT_ID=${tenant.tenantId}</code></li>
              <li>Save the file</li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div class="info">
            <h3>🔐 Token Information</h3>
            <p><strong>Access Token:</strong> ${tokenSet.access_token?.substring(0, 30)}... (expires in 30 minutes)</p>
            <p><strong>Refresh Token:</strong> ${tokenSet.refresh_token?.substring(0, 30)}... (expires in 60 days)</p>
            <p><strong>Expires At:</strong> ${new Date((tokenSet.expires_at || 0) * 1000).toLocaleString()}</p>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              ℹ️ Tokens are automatically refreshed by the Xero SDK. You don't need to manually manage them.
            </p>
          </div>

          <a href="/investor-portal" class="button">← Back to Investor Portal</a>
        </div>
      </body>
      </html>
    `);
    }
    catch (error) {
        console.error('Error processing Xero callback:', error);
        return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Xero Connection Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
          h1 { color: #c00; }
          .code { background: #f8f8f8; padding: 10px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Connection Error</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <div class="code">${error.stack || 'No stack trace available'}</div>
          <p><a href="/investor-portal">← Back to Investor Portal</a></p>
        </div>
      </body>
      </html>
    `);
    }
}
