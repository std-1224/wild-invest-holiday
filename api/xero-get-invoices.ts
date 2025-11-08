// Lambda Function: Get Xero Invoices for Customer
// Fetches unpaid invoices from Xero for a specific customer

import { VercelRequest, VercelResponse } from '@vercel/node';
import { XeroClient } from 'xero-node';

/**
 * Xero Invoice Response
 */
interface XeroInvoice {
  invoiceID: string;
  invoiceNumber: string;
  type: string;
  contact: {
    contactID: string;
    name: string;
  };
  date: string;
  dueDate: string;
  status: string;
  lineAmountTypes: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    lineAmount: number;
    accountCode: string;
  }>;
  subTotal: number;
  totalTax: number;
  total: number;
  amountDue: number;
  amountPaid: number;
  currencyCode: string;
  reference?: string;
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    console.log('Fetching Xero invoices for contact:', contactId);

    // Initialize Xero client
    const xero = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID || '',
      clientSecret: process.env.XERO_CLIENT_SECRET || '',
      redirectUris: [process.env.XERO_REDIRECT_URI || ''],
      scopes: 'openid profile email accounting.transactions accounting.contacts'.split(' '),
    });

    // Get access token (in production, you'd retrieve this from storage)
    // For now, we'll use a mock response or require token to be passed
    const tenantId = process.env.XERO_TENANT_ID || '';

    if (!tenantId) {
      console.warn('XERO_TENANT_ID not configured, returning mock data');
      
      // Return mock invoices for development
      const mockInvoices = [
        {
          invoiceID: 'INV-001',
          invoiceNumber: 'INV-2024-001',
          type: 'ACCREC',
          contact: {
            contactID: contactId as string,
            name: 'John Smith',
          },
          date: '2024-11-01',
          dueDate: '2024-11-15',
          status: 'AUTHORISED',
          lineAmountTypes: 'Exclusive',
          lineItems: [
            {
              description: 'Property Management Fee - November 2024',
              quantity: 1,
              unitAmount: 250.00,
              lineAmount: 250.00,
              accountCode: '200',
            },
          ],
          subTotal: 250.00,
          totalTax: 25.00,
          total: 275.00,
          amountDue: 275.00,
          amountPaid: 0,
          currencyCode: 'AUD',
          reference: 'Cabin #1 - Mansfield',
        },
        {
          invoiceID: 'INV-002',
          invoiceNumber: 'INV-2024-002',
          type: 'ACCREC',
          contact: {
            contactID: contactId as string,
            name: 'John Smith',
          },
          date: '2024-11-05',
          dueDate: '2024-11-20',
          status: 'AUTHORISED',
          lineAmountTypes: 'Exclusive',
          lineItems: [
            {
              description: 'Cleaning Service - November 2024',
              quantity: 2,
              unitAmount: 150.00,
              lineAmount: 300.00,
              accountCode: '300',
            },
          ],
          subTotal: 300.00,
          totalTax: 30.00,
          total: 330.00,
          amountDue: 330.00,
          amountPaid: 0,
          currencyCode: 'AUD',
          reference: 'Cabin #1 - Mansfield',
        },
        {
          invoiceID: 'INV-003',
          invoiceNumber: 'INV-2024-003',
          type: 'ACCREC',
          contact: {
            contactID: contactId as string,
            name: 'John Smith',
          },
          date: '2024-11-08',
          dueDate: '2024-11-22',
          status: 'AUTHORISED',
          lineAmountTypes: 'Exclusive',
          lineItems: [
            {
              description: 'Utilities - Electricity & Water',
              quantity: 1,
              unitAmount: 180.00,
              lineAmount: 180.00,
              accountCode: '400',
            },
          ],
          subTotal: 180.00,
          totalTax: 18.00,
          total: 198.00,
          amountDue: 198.00,
          amountPaid: 0,
          currencyCode: 'AUD',
          reference: 'Cabin #1 - Mansfield',
        },
      ];

      return res.status(200).json({
        success: true,
        invoices: mockInvoices,
        count: mockInvoices.length,
      });
    }

    // Fetch invoices from Xero
    const response = await xero.accountingApi.getInvoices(
      tenantId,
      undefined, // ifModifiedSince
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
      undefined  // summaryOnly
    );

    const invoices = response.body.invoices || [];

    // Filter for unpaid invoices only
    const unpaidInvoices = invoices.filter(
      (inv) => inv.amountDue && inv.amountDue > 0
    );

    console.log(`Found ${unpaidInvoices.length} unpaid invoices`);

    return res.status(200).json({
      success: true,
      invoices: unpaidInvoices,
      count: unpaidInvoices.length,
    });
  } catch (error: any) {
    console.error('Error fetching Xero invoices:', error);
    return res.status(500).json({
      error: 'Failed to fetch invoices',
      message: error.message,
    });
  }
}

