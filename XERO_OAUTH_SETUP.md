# Xero OAuth Setup Guide

This guide will help you connect your Xero account to the Wild Things Investor Portal.

## 🎯 Overview

The Xero integration allows investors to:
- View unpaid invoices from Xero
- Pay invoices using saved credit cards (via Stripe)
- Automatically record payments in Xero

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ A Xero account with admin access
- ✅ Access to the Xero Developer Portal
- ✅ Your Xero Client ID and Client Secret (from the Configuration tab)
- ✅ The Wild Things development server running

## 🔧 Step 1: Configure Xero App in Developer Portal

### 1.1 Add Redirect URIs

In your Xero app's **Configuration** tab, add these redirect URIs:

**For Development:**
```
http://localhost:3001/api/xero-callback
```

**For Production:**
```
https://wild-invest-holiday.vercel.app/api/xero-callback
https://yourdomain.com/api/xero-callback
```

### 1.2 Get Your Credentials

From the **Configuration** tab:

1. **Client ID** - Copy the value shown (e.g., `B129EA6642EA41A4ADCF76AB8E23DBA5`)
2. **Client Secret** - Click "Generate another secret" and copy it immediately

### 1.3 Configure OAuth Scopes

Your app needs these scopes (should already be set):
```
openid
profile
email
accounting.transactions
accounting.contacts
```

## 🔐 Step 2: Update Environment Variables

Open your `.env` file and update these values:

```bash
# Xero Accounting
XERO_CLIENT_ID=B129EA6642EA41A4ADCF76AB8E23DBA5
XERO_CLIENT_SECRET=<your-client-secret-here>
XERO_REDIRECT_URI=http://localhost:3001/api/xero-callback
XERO_TENANT_ID=
XERO_BANK_ACCOUNT_CODE=090
```

**Important:**
- Replace `<your-client-secret-here>` with the secret you generated
- Leave `XERO_TENANT_ID` empty for now (we'll get it in the next step)
- `XERO_BANK_ACCOUNT_CODE` is the account code in Xero where payments are recorded (default: 090)

## 🚀 Step 3: Connect to Xero

### Method 1: Using the Investor Portal (Recommended)

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Open the Investor Portal:**
   - Go to http://localhost:5174 (or 5173)
   - Navigate to the **Payments** tab
   - You'll see a "Connect to Xero" button

3. **Click "Connect to Xero":**
   - You'll be redirected to Xero's authorization page
   - Log in with your Xero credentials
   - Select the organization you want to connect
   - Click "Allow access"

4. **Copy the Tenant ID:**
   - After authorization, you'll see a success page
   - Copy the **Tenant ID** shown on the page
   - It looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

5. **Update your `.env` file:**
   ```bash
   XERO_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

6. **Restart the server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm start
   ```

### Method 2: Using Direct URL

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Visit the authorization URL:**
   ```
   http://localhost:3001/api/xero-auth
   ```

3. **Follow steps 3-6 from Method 1**

## ✅ Step 4: Verify the Connection

After restarting the server with the Tenant ID configured:

1. Go to the **Investor Portal → Payments** tab
2. Scroll down to the **"Xero Invoices"** section
3. You should see your real invoices from Xero (if any exist)

If you see an error, check:
- ✅ All environment variables are set correctly
- ✅ The Tenant ID is correct
- ✅ The redirect URI matches exactly (including port number)
- ✅ You restarted the server after updating `.env`

## 🔄 Token Management

**Good news:** You don't need to manually manage tokens!

The `xero-node` SDK automatically:
- ✅ Refreshes access tokens (they expire after 30 minutes)
- ✅ Handles token storage
- ✅ Manages authentication

**However:**
- Refresh tokens expire after **60 days**
- After 60 days, you'll need to reconnect by visiting `/api/xero-auth` again

## 🏭 Production Deployment

### Update Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add these variables:

```bash
XERO_CLIENT_ID=B129EA6642EA41A4ADCF76AB8E23DBA5
XERO_CLIENT_SECRET=<your-client-secret>
XERO_REDIRECT_URI=https://wild-invest-holiday.vercel.app/api/xero-callback
XERO_TENANT_ID=<your-tenant-id>
XERO_BANK_ACCOUNT_CODE=090
```

### Update Xero App Redirect URIs

In the Xero Developer Portal, make sure you've added:
```
https://wild-invest-holiday.vercel.app/api/xero-callback
```

### Redeploy

After updating environment variables, redeploy your app:
```bash
git push
```

Or trigger a manual deployment in Vercel.

## 🧪 Testing

### Test Invoice Fetching

1. Create a test invoice in Xero
2. Go to Investor Portal → Payments
3. You should see the invoice listed

### Test Payment Processing

1. Add a test credit card (use Stripe test card: `4242 4242 4242 4242`)
2. Click "Pay Now" on an invoice
3. Verify:
   - ✅ Payment is charged via Stripe
   - ✅ Payment is recorded in Xero
   - ✅ Invoice is marked as paid in Xero

## 📝 API Endpoints

The following endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/xero-auth` | GET | Redirects to Xero authorization page |
| `/api/xero-callback` | GET | Handles OAuth callback from Xero |
| `/api/xero/get-invoices` | GET | Fetches unpaid invoices for a contact |
| `/api/xero/pay-invoice` | POST | Charges card via Stripe and records payment in Xero |

## 🐛 Troubleshooting

### "Xero API not configured" Error

**Problem:** Missing environment variables

**Solution:**
1. Check that all `XERO_*` variables are set in `.env`
2. Make sure there are no extra spaces or quotes
3. Restart the development server

### "No authorization code provided" Error

**Problem:** OAuth callback failed

**Solution:**
1. Check that `XERO_REDIRECT_URI` matches exactly in both:
   - Your `.env` file
   - Xero Developer Portal (Configuration → Redirect URIs)
2. Make sure the port number is correct (3001 for dev server)

### "No Organizations Found" Error

**Problem:** Your Xero account has no organizations

**Solution:**
1. Make sure you're logged into the correct Xero account
2. Verify you have access to at least one Xero organization
3. Try disconnecting and reconnecting

### Invoices Not Showing

**Problem:** No invoices returned from Xero

**Solution:**
1. Check that you have unpaid invoices in Xero
2. Verify the `xeroContactId` matches a contact in your Xero organization
3. Check the browser console for error messages

## 📚 Additional Resources

- [Xero Developer Portal](https://developer.xero.com/)
- [Xero API Documentation](https://developer.xero.com/documentation/api/accounting/overview)
- [xero-node SDK Documentation](https://github.com/XeroAPI/xero-node)
- [OAuth 2.0 Flow](https://developer.xero.com/documentation/guides/oauth2/overview/)

## 🎉 Success!

Once everything is configured, you should be able to:
- ✅ View Xero invoices in the Investor Portal
- ✅ Pay invoices with saved credit cards
- ✅ See payments automatically recorded in Xero

If you encounter any issues, check the troubleshooting section or contact support.

