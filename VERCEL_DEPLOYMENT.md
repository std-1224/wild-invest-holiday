# Vercel Deployment Guide for Wild Things InvestorPortal

## 🚨 Current Issue

The Stripe payment integration is not working in production because:
1. The API functions in `/api` folder are AWS Lambda format, not Vercel format
2. Environment variables may not be properly configured in Vercel

## ✅ Quick Fix - Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Open your project: https://vercel.com/dashboard
2. Click on your project: `wild-invest-holiday`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Environment Variables

Add the following environment variables (copy from your `.env` file):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51OROjoRq1r...` | Production, Preview, Development |
| `VITE_STRIPE_SECRET_KEY` | `sk_test_51OROjoRq1r...` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_test_51OROjoRq1r...` | Production, Preview, Development |
| `VITE_AWS_REGION` | `us-east-1` | Production, Preview, Development |
| `VITE_AWS_USER_POOL_ID` | Your pool ID | Production, Preview, Development |
| `VITE_AWS_USER_POOL_CLIENT_ID` | Your client ID | Production, Preview, Development |
| `VITE_RMS_API_URL` | `https://api.rmscloud.com` | Production, Preview, Development |
| `VITE_RMS_API_KEY` | Your RMS key | Production, Preview, Development |
| `VITE_RMS_TENANT_ID` | Your tenant ID | Production, Preview, Development |

**Important:** Make sure to add both `VITE_STRIPE_SECRET_KEY` and `STRIPE_SECRET_KEY` (the Lambda functions use `STRIPE_SECRET_KEY`)

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait for deployment to complete

## 🔧 Alternative Solution - Convert to Vercel Serverless Functions

The API functions need to be converted from AWS Lambda format to Vercel format.

### Current Format (AWS Lambda):
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // ...
  return {
    statusCode: 200,
    headers: {...},
    body: JSON.stringify({...})
  };
};
```

### Required Format (Vercel):
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ...
  return res.status(200).json({...});
}
```

### Files That Need Conversion:
- ✅ `api/stripe-list-payment-methods.ts` (Already converted)
- ⏳ `api/stripe-save-payment-method.ts`
- ⏳ `api/stripe-create-payment-intent.ts`
- ⏳ `api/stripe-set-default-payment-method.ts`
- ⏳ `api/stripe-remove-payment-method.ts`
- ⏳ `api/stripe-create-subscription.ts`
- ⏳ `api/stripe-webhook.ts`
- ⏳ `api/rms-availability.ts`
- ⏳ `api/rms-create-booking.ts`
- ⏳ `api/rms-cancel-booking.ts`
- ⏳ `api/rms-webhook.ts`

## 📝 Vercel Configuration

The `vercel.json` file has been created with URL rewrites to map the API endpoints correctly:

```json
{
  "rewrites": [
    {
      "source": "/api/stripe/list-payment-methods",
      "destination": "/api/stripe-list-payment-methods"
    },
    // ... other endpoints
  ]
}
```

## 🧪 Testing After Deployment

1. Open your Vercel URL: `https://wild-invest-holiday.vercel.app`
2. Navigate to InvestorPortal → Payments tab
3. Try adding a payment method with test card:
   - Card: `4242 4242 4242 4242`
   - CVC: `123`
   - Exp: `12/25`
4. Check browser console for errors

## 🐛 Debugging

If still not working:
1. Check Vercel Function Logs:
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on a function to see logs
2. Check browser console for API errors
3. Verify environment variables are set correctly

## 📞 Need Help?

If the issue persists, share:
1. Screenshot of Vercel environment variables
2. Screenshot of browser console errors
3. Screenshot of Vercel function logs

