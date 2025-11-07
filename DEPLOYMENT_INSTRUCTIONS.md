# 🚀 Wild Things InvestorPortal - Deployment Instructions

## ✅ What Was Fixed

The Stripe payment integration was not working in production on Vercel because:
1. API functions were in AWS Lambda format instead of Vercel serverless format
2. Environment variables needed to be configured in Vercel

### Converted Functions (AWS Lambda → Vercel):
- ✅ `api/stripe-list-payment-methods.ts`
- ✅ `api/stripe-save-payment-method.ts`
- ✅ `api/stripe-remove-payment-method.ts`
- ✅ `api/stripe-set-default-payment-method.ts`

---

## 📋 Step-by-Step Deployment to Vercel

### Step 1: Push Changes to GitHub

```bash
git add .
git commit -m "Convert API functions to Vercel serverless format"
git push origin main
```

### Step 2: Configure Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **wild-invest-holiday**
3. Click **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51OROjoRq1rHDtcBW...` | Production, Preview, Development |
| `VITE_STRIPE_SECRET_KEY` | `sk_test_51OROjoRq1rHDtcBW...` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_test_51OROjoRq1rHDtcBW...` | Production, Preview, Development |
| `VITE_AWS_REGION` | `us-east-1` | Production, Preview, Development |
| `VITE_AWS_USER_POOL_ID` | Your Cognito Pool ID | Production, Preview, Development |
| `VITE_AWS_USER_POOL_CLIENT_ID` | Your Cognito Client ID | Production, Preview, Development |
| `VITE_RMS_API_URL` | `https://api.rmscloud.com` | Production, Preview, Development |
| `VITE_RMS_API_KEY` | Your RMS API Key | Production, Preview, Development |
| `VITE_RMS_TENANT_ID` | Your RMS Tenant ID | Production, Preview, Development |

**Important Notes:**
- Add **both** `VITE_STRIPE_SECRET_KEY` and `STRIPE_SECRET_KEY` (some functions use one, some use the other)
- Select **all three environments** (Production, Preview, Development) for each variable
- Click **Save** after adding each variable

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button (three dots menu → Redeploy)
4. Wait for deployment to complete (~2-3 minutes)

---

## 🧪 Testing After Deployment

### 1. Open Your Vercel URL
```
https://wild-invest-holiday.vercel.app
```

### 2. Navigate to InvestorPortal
- Click **Investor Portal** or **Login**
- Use test credentials or create an account

### 3. Go to Payments Tab
- Click on **Payments** tab
- Scroll down to **Saved Payment Methods** section

### 4. Add a Test Card
Click **Add Card** and use Stripe test card:
- **Card Number:** `4242 4242 4242 4242`
- **CVC:** `123`
- **Exp Month:** `12`
- **Exp Year:** `25`
- **ZIP:** `12345`

### 5. Verify It Works
You should see:
- ✅ Card saved successfully
- ✅ Display shows: **"Visa •••• 4242 Expires 12/25"**
- ✅ Card marked as **DEFAULT**

---

## 🐛 Troubleshooting

### Issue: Still Getting 404 Errors

**Solution:** Check that environment variables are set correctly
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all variables are present
3. Make sure they're enabled for **Production** environment
4. Redeploy after making changes

### Issue: Payment Methods Show "Unknown •••• 0000"

**Solution:** Check Stripe API keys
1. Verify `VITE_STRIPE_SECRET_KEY` is set in Vercel
2. Verify `STRIPE_SECRET_KEY` is set in Vercel
3. Make sure the keys start with `sk_test_` (test mode) or `sk_live_` (live mode)
4. Redeploy

### Issue: CORS Errors

**Solution:** The functions now include proper CORS headers
- All converted functions have `Access-Control-Allow-Origin: *`
- If still seeing CORS errors, check Vercel function logs

### How to Check Vercel Function Logs:
1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click on a function (e.g., `stripe-list-payment-methods`)
4. View real-time logs and errors

---

## 📦 Local Development

### Run Locally with One Command:
```bash
npm start
```

This runs both:
- ✅ API Dev Server on `http://localhost:3001`
- ✅ Vite Dev Server on `http://localhost:5173`

### Individual Commands:
```bash
# Run only frontend
npm run dev

# Run only API server
npm run dev:api

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Security Notes

### For Production (Live Mode):
1. Replace test API keys with live keys:
   - `pk_live_...` for publishable key
   - `sk_live_...` for secret key
2. Update Stripe webhook secret
3. Enable Stripe webhook in production
4. Set up proper customer authentication
5. Review Stripe security best practices

### Environment Variables Security:
- ✅ Never commit `.env` file to Git
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate API keys regularly
- ✅ Use different keys for development/production

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Vercel function logs
3. Check browser console for errors
4. Verify all environment variables are set
5. Try redeploying

---

## ✨ What's Working Now

- ✅ Add payment methods (credit cards)
- ✅ List saved payment methods
- ✅ Set default payment method
- ✅ Remove payment methods
- ✅ Real card data display (Visa •••• 4242)
- ✅ Stripe Elements integration
- ✅ CORS properly configured
- ✅ Vercel serverless functions

---

## 🎉 You're All Set!

Your Wild Things InvestorPortal is now ready for production on Vercel with full Stripe payment integration!

