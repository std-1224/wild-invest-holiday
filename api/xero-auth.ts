// Lambda Function: Xero OAuth Authorization
// Generates the Xero consent URL for OAuth flow

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { XeroClient } from 'xero-node';

/**
 * GET /api/xero-auth
 * Redirects user to Xero authorization page
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const clientId = process.env.XERO_CLIENT_ID;
    const clientSecret = process.env.XERO_CLIENT_SECRET;
    const redirectUri = process.env.XERO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        error: 'Xero OAuth not configured',
        message: 'Please configure XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI',
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret,
          redirectUri: !redirectUri,
        },
      });
    }

    console.log('Generating Xero consent URL...');
    console.log('Redirect URI:', redirectUri);

    // Initialize Xero client
    const xero = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
    });

    // Generate consent URL
    const consentUrl = await xero.buildConsentUrl();

    console.log('Consent URL generated:', consentUrl);

    // Redirect to Xero authorization page
    return res.redirect(consentUrl);

  } catch (error: any) {
    console.error('Error generating Xero consent URL:', error);
    return res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message,
    });
  }
}

