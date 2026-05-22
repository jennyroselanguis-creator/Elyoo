# Elyoo Mobile Devices - React App

A modern, full-featured e-commerce platform for premium mobile devices built with React.

## 🚀 Features

### Customer Features

- ✨ **Browse Products** - Explore premium smartphones with advanced filtering
- 🔍 **Smart Filtering** - Filter by brand and sort by name or price
- 🛒 **Shopping Cart** - Add products with quantity adjustment
- 💳 **Checkout** - Secure order placement
- ℹ️ **About Us** - Learn about our team and mission

### Admin Features

- 📊 **Dashboard** - Sales overview and key metrics
- 📦 **Product Management** - Add, edit, delete products
- 🏷️ **Brand Management** - Manage mobile device brands
- 📋 **Order Management** - Track and process customer orders
- 🔐 **Secure Authentication** - Role-based admin access

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

### Styling

- **CSS3** - Modern styling with animations
- **Responsive Design** - Mobile-first approach
- **CSS Variables** - Theme management

## 📦 Installation

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Create Environment File**

```bash
cp .env.example .env
```

3. **Update API URL** (if needed)
   Edit `.env` file:

```
REACT_APP_API_URL=http://localhost:3001/api
```

## 🎯 Running the Application

### Development Mode

```bash
npm start
```

- Opens at `http://localhost:3000`
- Hot reload enabled

### Production Build

```bash
npm build
```

### Testing

```bash
npm test
```

## 📁 Project Structure

```
src/
├── components/        # Reusable components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   └── Hero.jsx
├── pages/            # Page components
│   ├── Home.jsx
│   ├── Cart.jsx
│   ├── About.jsx
│   ├── Login.jsx
│   ├── ProductDetail.jsx
│   └── admin/        # Admin pages
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── Brands.jsx
│       └── Orders.jsx
├── store/            # State management (Zustand)
│   └── store.js
├── api/              # API client
│   └── client.js
├── styles/           # CSS files
│   ├── index.css
│   ├── header.css
│   ├── footer.css
│   ├── hero.css
│   ├── home.css
│   ├── product-card.css
│   ├── cart.css
│   ├── login.css
│   ├── about.css
│   └── admin.css
├── App.jsx           # Main app component
└── index.js          # Entry point
```

## 🎨 Design System

### Color Palette

- **Primary**: `#00d9ff` (Cyan)
- **Primary Dark**: `#0099cc` (Dark Blue)
- **Secondary**: `#1a1a2e` (Dark)
- **Accent**: `#ff0080` (Pink)
- **Success**: `#10b981` (Green)
- **Danger**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Orange)

### Typography

- **Display**: Poppins (700, 800)
- **Body**: Inter (300, 400, 500, 600, 700)

### Component Library

All components follow modern React best practices with:

- Functional components
- React Hooks
- State management with Zustand
- CSS modules and global styles

## 🔐 Authentication

Admin login credentials are managed through the backend API. Default credentials are provided in the setup documentation.

## 📝 About Page

The About page features:

- Company mission and values
- Team information with developer profiles
- Company statistics
- Skills and expertise showcase

### Our Development Team

- **John Doe** - Full Stack Developer
- **Jane Smith** - Frontend Developer & Designer

## 🚀 Deployment

### Build for Production

```bash
npm build
```

The `build` folder is ready to be deployed to any static hosting service.

### Deployment Options

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🐛 Troubleshooting

### API Connection Issues

- Verify `REACT_APP_API_URL` in `.env`
- Ensure backend server is running
- Check CORS settings on backend

### State Issues

- Clear browser cache and localStorage
- Check browser console for errors
- Verify store actions are properly dispatched

## 📚 Documentation

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com)

## 📄 License

This project is private and confidential.

## 👥 Support

For issues and support, contact: support@elyoo.com

---

**Built with ❤️ by the Elyoo Development Team**
