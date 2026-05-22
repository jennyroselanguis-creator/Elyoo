# 🏪 Elyoo Mobile Devices - Modern E-Commerce Platform

A complete, professional-grade e-commerce platform for selling premium mobile devices. Built with **React 18** on the frontend and **Node.js Express** on the backend for maximum performance and scalability.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Educational-green.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)

## ✨ Features

### 👥 Customer Features
✅ Browse premium mobile devices with advanced filtering  
✅ Filter products by brand and price range  
✅ View detailed product specifications and pricing  
✅ Add items to shopping cart with quantity management  
✅ Secure checkout and order placement  
✅ Responsive design (desktop, tablet, mobile)  
✅ Learn about company and development team  

### 👨‍💼 Admin Features
✅ Secure JWT-based authentication  
✅ Dashboard with sales statistics & analytics  
✅ Complete product management (Create, Read, Update, Delete)  
✅ Brand management system  
✅ Order tracking and status management  
✅ Staff member management with role-based access  
✅ Real-time notifications  

## 🛠 Tech Stack

### Frontend
```
✨ React 18.2.0 - Modern UI library
🎯 React Router 6 - Client-side routing
📦 Zustand - Lightweight state management
🌐 Axios - HTTP client for API calls
🎨 CSS3 - Modern styling with animations
📱 React Icons - Icon library
🔔 React Hot Toast - Notifications
```

### Backend
```
🚀 Node.js 16+ - Server runtime
⚡ Express 4.18 - Web framework
🗄️ MySQL 5.7+ - Relational database
🔐 JWT - Token-based authentication
🔒 Bcryptjs - Password hashing
✅ Express Validator - Input validation
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ installed
- MySQL Server running
- npm or yarn package manager

### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
# Backend runs on http://localhost:3001
```

### 2️⃣ Database Setup

```bash
# Import database schema
mysql -u root < backend/database.sql

# Or use MySQL Workbench/PhpMyAdmin to import database.sql
```

### 3️⃣ Frontend Setup

```bash
# Go back to root directory
cd ..

# Install dependencies
npm install

# Start React development server
npm start
# Frontend opens on http://localhost:3000
```

### 4️⃣ Login to Admin

```
Email: admin@elyoo.com
Password: admin123
```

---

## 📁 Project Structure

```
webPro/
├── src/                      # React Frontend
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── store/              # State management
│   ├── api/                # API client
│   ├── hooks/              # Custom hooks
│   └── styles/             # CSS files
├── backend/                 # Node.js Express API
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication
│   ├── config/             # Database config
│   └── database.sql        # Schema & sample data
├── public/                  # Static files
└── package.json            # Dependencies
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **SYSTEM_SETUP_GUIDE.md** | Complete setup instructions |
| **API_DOCUMENTATION.md** | All API endpoints with examples |
| **IMPLEMENTATION_GUIDE.md** | Features & architecture overview |
| **backend/README.md** | Backend-specific documentation |
| **README_REACT.md** | Frontend-specific documentation |

---

## 🔐 Default Login Credentials

### Admin Account
```
Email:    admin@elyoo.com
Password: admin123
Role:     Admin (full access)
```

### Staff Account
```
Email:    staff@elyoo.com
Password: admin123
Role:     Staff (limited access)
```

## 🔌 API Endpoints

### Products
```
GET    /api/products              # Get all products
GET    /api/products/:id          # Get single product
POST   /api/products              # Create product (Admin)
PUT    /api/products/:id          # Update product (Admin)
DELETE /api/products/:id          # Delete product (Admin)
```

### Brands
```
GET    /api/brands                # Get all brands
POST   /api/brands                # Create brand (Admin)
PUT    /api/brands/:id            # Update brand (Admin)
DELETE /api/brands/:id            # Delete brand (Admin)
```

### Orders
```
POST   /api/orders                # Create order (Public)
GET    /api/orders                # Get all orders (Admin)
PUT    /api/orders/:id            # Update order status (Admin)
```

### Authentication
```
POST   /api/auth/login            # Admin login
GET    /api/auth/verify           # Verify token
```

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🧪 Testing with cURL

```bash
# Get all products
curl http://localhost:3001/api/products

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elyoo.com","password":"admin123"}'

# Create order
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name":"John Doe",
    "customer_email":"john@example.com",
    "customer_phone":"1234567890",
    "items":[{"id":1,"name":"iPhone 15","price":999.99,"quantity":1}]
  }'
```

---

## 🐛 Troubleshooting

### Backend server won't start
```bash
# Check if port is in use
# Windows: netstat -ano | findstr :3001
# Mac/Linux: lsof -i :3001

# Kill process and try again
# Or change PORT in backend/.env
```

### Database connection error
```
1. Verify MySQL is running
2. Check credentials in backend/.env
3. Run: mysql -u root < backend/database.sql
```

### API not responding
```
1. Check if backend server is running on port 3001
2. Verify CORS_ORIGIN in backend/.env
3. Check browser console for specific errors
```

### Login fails
```
1. Verify database has staff table
2. Check credentials: admin@elyoo.com / admin123
3. Check JWT_SECRET is consistent in backend/.env
```

### Port already in use
```bash
# Find and kill process
lsof -i :3000    # Frontend
lsof -i :3001    # Backend
kill -9 <PID>
```

---

## 📦 Environment Configuration

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=elyoo_mobile_store
JWT_SECRET=change-in-production
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Deployment

### Production Build

```bash
# Build React frontend
npm run build
# Creates optimized build in 'build' folder

# Backend is ready to deploy as-is
# Just change NODE_ENV to 'production'
```

### Deploy to Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

### Deploy to Heroku (Backend)
```bash
heroku login
heroku create your-api-name
git push heroku main
```

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to secure random key
- [ ] Enable HTTPS for production
- [ ] Set strong MySQL password
- [ ] Update CORS_ORIGIN for production domain
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Monitor error logs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting

---

## 📊 Database Schema

### Products Table
```
id (PK) | brand_id (FK) | name | model | price | specs | stock | image | created_at
```

### Brands Table
```
id (PK) | name | created_at
```

### Orders Table
```
id (PK) | order_number | customer_name | customer_email | status | total_amount | items | created_at
```

### Staff Table
```
id (PK) | name | email | password (hashed) | role | created_at
```

---

## 🎯 Development Workflow

### Both servers running (Recommended)

**Terminal 1:**
```bash
cd backend
npm run dev
# Backend on http://localhost:3001
```

**Terminal 2:**
```bash
npm start
# Frontend on http://localhost:3000
```

### Commands

```bash
# Frontend
npm start          # Start dev server
npm run build      # Production build
npm test           # Run tests

# Backend
npm run dev        # Start with auto-reload
npm start          # Start production
npm test           # Run tests
```

---

## 🌟 Key Improvements in v2.0

✅ Complete React 18 rewrite  
✅ Modern Express.js backend  
✅ JWT authentication  
✅ Component-based architecture  
✅ State management with Zustand  
✅ Responsive design  
✅ API-first architecture  
✅ Comprehensive documentation  
✅ Sample data included  
✅ Production-ready setup  

---

## 👥 About Developers

### Featured Development Team

👨‍💻 **Full Stack Developer**
- React, Node.js, MySQL expert
- 5+ years web development experience
- Specializes in scalable e-commerce solutions

👩‍💻 **Frontend Developer & Designer**
- Creative UI/UX specialist
- Modern CSS and React patterns
- Expert in responsive design

See the full team on the [About](http://localhost:3000/about) page!

---

## 📖 Additional Resources

- [React Docs](https://react.dev)
- [Express Guide](https://expressjs.com)
- [MySQL Reference](https://dev.mysql.com/doc/)
- [JWT Guide](https://jwt.io)
- [REST API Best Practices](https://restfulapi.net)

---

## 📝 Version History

**v2.0.0** - Modern React & Node.js rewrite
- Complete frontend redesign with React 18
- Backend migration to Express.js
- JWT authentication system
- Improved performance and scalability

**v1.0.0** - Original PHP implementation
- Basic PHP/MySQL structure
- Admin panel functionality
- Customer store interface

---

## 📄 License & Terms

This project is provided for educational purposes. 

---

## 🎉 Thank You!

Built with ❤️ by the Elyoo Mobile Devices Development Team

**Ready to launch?** Start with [SYSTEM_SETUP_GUIDE.md](SYSTEM_SETUP_GUIDE.md)
