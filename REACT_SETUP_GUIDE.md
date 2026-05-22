# React App Installation & Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16.0.0 or higher
- **npm** v8.0.0 or higher (comes with Node.js)

## 🚀 Quick Start

### Step 1: Navigate to Project Directory

```bash
cd c:\xampp2.0\htdocs\webPro
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:

- React 18
- React Router v6
- Zustand (state management)
- Axios (HTTP client)
- React Hot Toast (notifications)
- React Icons

### Step 3: Create Environment File

```bash
cp .env.example .env
```

Edit `.env` if you need to change the API URL:

```env
REACT_APP_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### Step 4: Start Development Server

```bash
npm start
```

The app will automatically open at `http://localhost:3000`

## 🎯 Available Scripts

### `npm start`

- Runs the app in development mode
- Auto-reloads on file changes
- Opens http://localhost:3000 in the browser

### `npm build`

- Builds the app for production
- Creates optimized bundle in `build/` folder
- Ready for deployment

### `npm test`

- Launches test runner in interactive mode
- Run all or specific tests

### `npm eject`

- **Note**: This is a one-way operation. Once you eject, you can't go back!

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.jsx       # Navigation header
│   ├── Footer.jsx       # Footer component
│   ├── ProductCard.jsx  # Product display card
│   └── Hero.jsx         # Hero banner
│
├── pages/               # Full page components
│   ├── Home.jsx         # Main shop page
│   ├── Cart.jsx         # Shopping cart
│   ├── About.jsx        # About us page
│   ├── Login.jsx        # Admin login
│   ├── ProductDetail.jsx # Product details
│   └── admin/           # Admin section
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── Brands.jsx
│       └── Orders.jsx
│
├── store/               # State management
│   └── store.js        # Zustand store
│
├── api/                # API integration
│   └── client.js       # Axios client
│
├── hooks/              # Custom React hooks
│   ├── useCart.js      # Cart management hook
│   └── useForm.js      # Form handling hook
│
├── styles/             # CSS files
│   ├── index.css
│   ├── header.css
│   ├── hero.css
│   ├── home.css
│   ├── product-card.css
│   ├── cart.css
│   ├── about.css
│   ├── login.css
│   └── admin.css
│
├── App.jsx            # Main app component
├── App.css            # App styles
└── index.js           # Entry point

public/
└── index.html         # HTML template
```

## 🎨 Key Features

### Customer Features

- ✨ Browse & Filter Products
- 🔍 Sort by Price/Name
- 🛒 Shopping Cart Management
- 💳 Checkout Process
- 📱 Responsive Design

### Admin Features

- 📊 Dashboard with Analytics
- 📦 Product Management (CRUD)
- 🏷️ Brand Management
- 📋 Order Management
- 🔐 Secure Login

## 🔑 Admin Credentials

Default admin credentials (set up during backend initialization):

```
Email: admin@elyoo.com
Password: [Check your backend setup documentation]
```

## 🌐 API Endpoints

The app communicates with a backend API. Ensure your backend is running at the URL specified in `.env`.

### Example Endpoints:

- `GET /api/products` - Get all products
- `GET /api/brands` - Get all brands
- `POST /api/orders` - Create new order
- `POST /auth/login` - Admin login

## 🎨 Styling System

### Colors

- Primary: `#00d9ff` (Cyan)
- Secondary: `#1a1a2e` (Dark)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)

### Fonts

- Display: Poppins (700, 800)
- Body: Inter (300-700)

## 🚨 Troubleshooting

### Issue: Port 3000 Already in Use

```bash
# Use a different port
set PORT=3001 && npm start  # Windows
```

### Issue: API Connection Failed

1. Check backend server is running
2. Verify `REACT_APP_API_URL` in `.env`
3. Check CORS settings on backend
4. Look for errors in browser console (F12)

### Issue: Components Not Loading

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart dev server: `npm start`

### Issue: State Not Updating

1. Check React Developer Tools extension
2. Verify Zustand store actions
3. Check browser console for errors
4. Use Redux DevTools for debugging

## 📦 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag and drop build/ folder to Netlify
```

### Deploy to GitHub Pages

1. Add to `package.json`: `"homepage": "https://yourusername.github.io/webpro"`
2. Run: `npm run build`
3. Push to GitHub

## 🔒 Environment Variables

### Development

```env
REACT_APP_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### Production

```env
REACT_APP_API_URL=https://api.elyoo.com
NODE_ENV=production
```

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com)
- [MDN Web Docs](https://developer.mozilla.org)

## 🤝 Contributing

To contribute to this project:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is proprietary and confidential.

## 👨‍💻 Development Team

- **John Doe** - Full Stack Developer
- **Jane Smith** - Frontend Developer & Designer

## 💬 Support

For issues and support:

- Email: support@elyoo.com
- Documentation: See README_REACT.md

---

**Happy Coding! 🚀**
