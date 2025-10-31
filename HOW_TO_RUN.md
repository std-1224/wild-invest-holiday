# 🚀 How to Run Wild Things Website

## ⚡ Quick Start (Easiest Method)

### Option 1: Open Directly in Browser (No Setup Required!)
1. **Double-click** `index.html` in your file explorer
2. OR Right-click → "Open with" → Your web browser (Chrome, Firefox, Safari, etc.)
3. The website will load immediately - no installation needed!

**This is the recommended method - the file is completely self-contained.**

---

## 🌐 Option 2: Local Web Server (Recommended for Development)

### Using Python (Most Common)
```bash
# Python 3
python3 -m http.server 8000

# Then open: http://localhost:8000
```

### Using Node.js (if you have it installed)
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run server
http-server -p 8000

# Then open: http://localhost:8000
```

### Using PHP
```bash
php -S localhost:8000
```

---

## 📁 Project Structure

```
wild-things-site/
├── index.html              ⭐ MAIN FILE - Open this!
├── public/                 # Static assets (images, videos, fonts)
│   ├── logo-wildthings.svg
│   ├── 1BR.jpg, 2BR.jpg, 3BR.jpg
│   ├── *.mp4 (videos)
│   └── fonts/
├── src/                    # React component source (for reference)
│   ├── WildThingsWebsite.jsx
│   └── api/client.js
└── backend/                # AWS backend code (not needed to run frontend)
```

---

## ✅ What You Need

**Nothing!** The `index.html` file is completely self-contained:
- ✅ React loaded from CDN
- ✅ All CSS embedded
- ✅ All JavaScript embedded
- ✅ No build process required
- ✅ No `npm install` needed

---

## 🐛 Troubleshooting

### "Blank Page" or "Nothing Loads"
1. **Check browser console** (F12 → Console tab)
2. **Check file paths** - Make sure `index.html` is in the root directory
3. **Try a different browser** (Chrome, Firefox, Safari)
4. **Clear browser cache** (Ctrl+Shift+Delete / Cmd+Shift+Delete)

### "Images/Videos Not Loading"
- Make sure the `public/` folder is in the same directory as `index.html`
- If using a web server, the `public/` folder should be accessible

### "API Errors"
- The app will work in demo mode even without backend
- To connect to real backend, update API URL in `src/api/client.js`

---

## 🔧 Development Mode (Optional)

If you want to modify the code and use Vite:

```bash
# Install dependencies (one time)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**Note:** The standalone `index.html` works perfectly without this!

---

## 📝 Main Entry Point

**File:** `index.html`
- This is the complete, runnable application
- Contains all features and functionality
- Opens directly in any modern web browser
- No setup or installation required

---

## ✨ Features Available

- ✅ Full authentication system (Login, Register, Password Reset)
- ✅ Investment modal with ROI calculator
- ✅ Investor portal
- ✅ All pages (Home, Invest, Locations, Book a Stay)
- ✅ Responsive design (mobile & desktop)
- ✅ All brand styling and animations

---

**That's it! Just open `index.html` and you're ready to go! 🎉**

