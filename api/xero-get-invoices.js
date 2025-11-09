// Lambda Function: Get Xero Invoices for Customer
// Fetches unpaid invoices from Xero for a specific customer
import { XeroClient } from 'xero-node';
import { getTokenSet, hasValidTokens } from './xero-token-store.js';
/**
 * Main handler
 */
export default async function handler(req, res) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { customerId, contactId } = req.query;
        if (!contactId) {
            return res.status(400).json({ error: 'Contact ID is required' });
        }
        // Validate Xero configuration
        const tenantId = process.env.XERO_TENANT_ID;
        const clientId = process.env.XERO_CLIENT_ID;
        const clientSecret = process.env.XERO_CLIENT_SECRET;
        const redirectUri = process.env.XERO_REDIRECT_URI;
        if (!tenantId || !clientId || !clientSecret || !redirectUri) {
            console.error('Xero API not configured properly');
            return res.status(500).json({
                error: 'Xero API not configured',
                message: 'Please configure XERO_TENANT_ID, XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI in environment variables',
                missing: {
                    tenantId: !tenantId,
                    clientId: !clientId,
                    clientSecret: !clientSecret,
                    redirectUri: !redirectUri,
                }
            });
        }
        // Check if we have valid OAuth tokens
        if (!hasValidTokens()) {
            console.error('No valid Xero OAuth tokens found');
            return res.status(401).json({
                error: 'Not authenticated with Xero',
                message: 'Please connect to Xero first by visiting /api/xero-auth',
                authUrl: `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/xero-auth`,
            });
        }
        // Initialize Xero client
        const xero = new XeroClient({
            clientId,
            clientSecret,
            redirectUris: [redirectUri],
            scopes: 'openid profile email accounting.transactions accounting.contacts accounting.settings'.split(' '),
        });
        // Set the stored tokens
        const tokenSet = getTokenSet();
        xero.setTokenSet(tokenSet);
        // Fetch invoices from Xero
        const response = await xero.accountingApi.getInvoices(tenantId, undefined, // ifModifiedSince
        `Contact.ContactID=GUID("${contactId}")`, // where filter
        'Date DESC', // order
        undefined, // IDs
        undefined, // invoiceNumbers
        undefined, // contactIDs
        ['AUTHORISED', 'SUBMITTED'], // statuses - only unpaid invoices
        undefined, // page
        undefined, // includeArchived
        undefined, // createdByMyApp
        undefined, // unitdp
        undefined // summaryOnly
        );
        const invoices = response.body.invoices || [];
        // Filter for unpaid invoices only
        const unpaidInvoices = invoices.filter((inv) => inv.amountDue && inv.amountDue > 0);
        console.log(`Found ${unpaidInvoices.length} unpaid invoices`);
        return res.status(200).json({
            success: true,
            invoices: unpaidInvoices,
            count: unpaidInvoices.length,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch invoices',
            message: error.message,
        });
    }
}
