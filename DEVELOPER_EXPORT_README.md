# Wild Things Website - Complete Codebase Export
## For Developer Review

**Export Date:** October 31, 2025  
**Version:** Complete Feature Set (Latest Build)

---

## 🎯 Main Application Files

### **Primary Entry Point**
- **`index-working-simple.html`** - This is the **MAIN WORKING FILE** containing the complete application with all features
  - Self-contained HTML file with React embedded
  - All features from the comprehensive list included
  - Tesla-style investment modal
  - Full authentication system
  - Investor portal with all features
  - ROI calculator with Wild Things methodology

### **Alternative/Backup Files**
- `index-complete.html` - Alternative complete version (similar features, different structure)
- `src/WildThingsWebsite.jsx` - React component source (if building with Vite)
- `src/api/client.js` - API client for AWS backend

---

## 📋 Complete Feature List

See **`ABILITY_TO.md`** for the comprehensive, page-organized list of ALL user-facing features and abilities.

---

## 🏗️ Project Structure

```
wild-things-site/
├── index-working-simple.html    # ⭐ MAIN FILE - Complete app
├── index-complete.html           # Alternative complete version
├── src/
│   ├── WildThingsWebsite.jsx     # React component source
│   ├── api/
│   │   └── client.js             # API client (AWS integration)
│   └── ...
├── backend/
│   ├── infrastructure.yaml      # AWS CloudFormation template
│   ├── lambdas/                  # Lambda function source code
│   └── ...
├── public/                       # Static assets (videos, images, fonts)
│   ├── logo-wildthings.svg
│   ├── 1BR.jpg, 2BR.jpg, 3BR.jpg
│   ├── *.mp4 (videos)
│   └── ...
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
└── ABILITY_TO.md                # Complete feature documentation
```

---

## 🚀 Quick Start Guide

### Option 1: Direct HTML (No Build Required)
1. Open `index-working-simple.html` in a browser
2. All React/CDN dependencies load from CDN
3. No build process needed - works immediately

### Option 2: Vite Development Server
```bash
npm install
npm run dev
```
- Runs on `http://localhost:5173`
- Edit `src/WildThingsWebsite.jsx` for changes
- Uses `index.html` as entry point

### Option 3: Production Build
```bash
npm run build
```
- Outputs to `dist/` directory
- Deploy `dist/` to S3 or any static host

---

## 🔧 Key Technologies

- **React 18** (via CDN or npm)
- **Vite** (build tool)
- **AWS Services:**
  - Cognito (authentication)
  - API Gateway (REST API)
  - Lambda (serverless functions)
  - DynamoDB (database)
  - S3 (static hosting)

---

## 🎨 Brand Guidelines

### Colors
- **Dark Blue:** `#0E181F`
- **Aqua:** `#86DBDF`
- **Yellow:** `#FFCF00` (Primary buttons)
- **Orange:** `#EC874C`

### Fonts
- **Headings:** `Eurostile Condensed` (Heavy Italic)
- **Body:** `Helvetica Neue`, Arial

### Logo
- File: `/logo-wildthings.svg`
- Height in nav: 90px

---

## 📦 Features Implemented

### ✅ Authentication System
- Login/Registration modals
- Password reset flow
- Email verification
- JWT token management

### ✅ Investment System
- Tesla-style investment modal
- Interactive ROI calculator
- Cabin selection (1BR/2BR/3BR)
- Premium extras selection
- Marketing boost (+10% occupancy)
- Financing options

### ✅ Investor Portal
- Account dashboard
- Cabin ownership management
- ROI tracking
- Payout requests
- Referral program
- Boost marketing tiers
- Document management

### ✅ Pages
- Home (Hero, Mission, Reviews, TikTok carousel)
- Invest (Cabin cards, ROI calculator)
- Locations (Mansfield, Byron Bay)
- Book a Stay
- Investor Portal

---

## 🔗 API Integration

### API Base URL
Currently configured in `src/api/client.js`:
```javascript
const API_BASE_URL = 'https://zfcs7ah00l.execute-api.ap-southeast-2.amazonaws.com/prod';
```

### Available Endpoints
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset confirmation
- `/auth/verify-email` - Email verification
- `/account/attitude` - Investment attitude (PUT)
- `/investments` - Investment data (GET)
- `/account/balance` - Account balance (GET)
- ... (see `src/api/client.js` for full list)

---

## 📝 ROI Calculation Methodology

The ROI calculator uses Wild Things-specific formulas:

### Key Components:
1. **Base Cabin Prices:** 1BR ($110k), 2BR ($135k), 3BR ($160k)
2. **Wild Things Commission:** 20% + GST = 22%
3. **Site Fees:** $5,000 + GST
4. **Annual Maintenance:** $2,000
5. **Marketing Boost:** +10% occupancy (caps at 95%)
6. **Energy Savings:** $2,400/year for Off-Grid Pack

### Extras Available:
- Off Grid Pack: $30,000 (energy savings)
- Premium Furniture: $15,000 (+$30/night)
- Linen Pack: $1,000 (+$5/night)
- Artwork Package: $2,000 (+$8/night)
- Decking: $5,000 (+$12/night)
- Marketing Boost: $5,000 (+10% occupancy)

See `index-working-simple.html` for the full `calculateROI()` function.

---

## 🐛 Known Issues & Pending Features

### Not Yet Delivered (Require Backend Integration)
- Live availability calendar for owned cabins (RMS API)
- Owner booking creation from portal (RMS API)
- Booking history/revenue data (RMS API)
- Electronic document signing (DocuSign/Adobe Sign)
- Marketing Boost subscription management (Stripe recurring)
- Invoice generation (Xero integration)
- Occupancy type switching workflow (backend approval)

### Areas for Improvement
- Error boundaries for crash-safe architecture
- React Router for explicit routing
- Feature flags system for gradual rollout
- Enhanced error handling and user feedback
- Loading states optimization
- Mobile responsiveness refinements

---

## 🧪 Testing Checklist

See `FEATURE_TEST_CHECKLIST.md` for detailed testing procedures.

### Key Test Areas:
1. ✅ Authentication flows (login, register, password reset)
2. ✅ Investment modal and ROI calculator
3. ✅ Investor portal dashboard
4. ✅ Navigation and routing
5. ✅ Responsive design (mobile/desktop)
6. ✅ API integration (with real backend)
7. ✅ Brand consistency

---

## 📚 Additional Documentation

- `ABILITY_TO.md` - Complete feature list by page
- `BACKEND_STATUS.md` - AWS backend deployment status
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `README.md` - Project overview

---

## 🤝 Development Notes

### Current Architecture
- Self-contained HTML file for easy deployment
- React via CDN (no bundling required for `index-working-simple.html`)
- Modular component structure (can be refactored to separate files)

### Recommended Refactoring
1. Extract components to separate files
2. Implement feature flags system
3. Add error boundaries for fault isolation
4. Enable React Router for explicit routing
5. Set up TypeScript for type safety
6. Implement proper state management (Context API or Redux)

---

## 🚨 Important Notes for Developers

1. **Main File:** Use `index-working-simple.html` as the reference - it contains ALL features
2. **API Client:** All backend calls go through `src/api/client.js` - never import AWS SDK in client
3. **Branding:** Yellow buttons (`#FFCF00`), Aqua nav (`#86DBDF`), Eurostile Condensed for headings
4. **Responsive:** Site works on mobile and desktop - test both
5. **AWS Backend:** Backend is deployed and functional - use real API endpoints in development

---

## 📞 Contact & Support

For questions about this codebase, refer to:
- Feature documentation: `ABILITY_TO.md`
- Backend setup: `BACKEND_STATUS.md`
- Deployment: `DEPLOYMENT_GUIDE.md`

---

**End of Developer Export README**

