# Elyoo Mobile Devices - Complete System Setup Guide

## 🎯 System Overview

A modern, full-stack e-commerce platform for premium mobile devices built with:
- **Frontend**: React 18 + React Router + Zustand
- **Backend**: Node.js Express + MySQL
- **Database**: MySQL 5.7+
- **Authentication**: JWT-based

## 📋 Prerequisites

### System Requirements
- Node.js 16 or higher
- npm or yarn
- MySQL Server 5.7+
- Git (optional)

### Estimated Setup Time
- 15-20 minutes for full setup
- 5 minutes if you skip sample data

## 🚀 Quick Start

### 1. Clone/Download Project

```bash
cd c:\xampp2.0\htdocs\webPro
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=elyoo_mobile_store

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:3001`

### 3. Setup Frontend

```bash
# Navigate to root project directory
cd ..

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend runs on: `http://localhost:3000`

### 4. Setup Database

Create database and tables using the SQL script provided in `backend/database.sql`:

```bash
# Via Command Line
mysql -u root < backend/database.sql

# OR via MySQL Workbench/PhpMyAdmin
# Copy and paste contents of database.sql into SQL editor
```

### 5. Create Admin Account

After database setup, create admin credentials:

```sql
USE elyoo_mobile_store;

INSERT INTO staff (name, email, password, role) VALUES (
  'Admin User',
  'admin@elyoo.com',
  '$2a$10$...',  -- bcrypt hash of 'password123'
  'admin'
);
```

Or use the provided setup script:

```bash
# From backend directory
node setup.js
```

## 📁 Project Structure

```
webPro/
├── public/                 # Static files
├── src/
│   ├── api/               # API client configuration
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── store/            # Zustand state management
│   ├── styles/           # CSS files
│   ├── hooks/            # Custom hooks
│   ├── App.jsx           # Main app component
│   └── index.js          # React entry point
├── backend/              # Express API server
│   ├── config/          # Database configuration
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Helper functions
│   ├── server.js        # Express server
│   └── package.json     # Dependencies
├── package.json         # Frontend dependencies
└── README.md           # Documentation
```

## 🔧 Configuration

### Frontend (.env)

Create `.env` in project root:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

### Backend (.env)

Create `.env` in backend directory:

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=elyoo_mobile_store
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

## 📊 Database Schema

### Products Table
- id (Primary Key)
- brand_id (Foreign Key)
- name
- model
- price
- specs
- stock
- image
- created_at

### Brands Table
- id (Primary Key)
- name
- created_at

### Orders Table
- id (Primary Key)
- order_number
- customer_name
- customer_email
- customer_phone
- status
- total_amount
- items (JSON)
- created_at

### Staff Table
- id (Primary Key)
- name
- email
- password (bcrypt hashed)
- role (admin/staff)
- created_at

## 🔐 Authentication

### User Login Flow

1. User enters email/password on login page
2. Backend verifies credentials against staff table
3. JWT token generated (valid for 7 days)
4. Token stored in localStorage
5. Token included in all admin API requests

### Protected Routes

```
GET/POST/PUT/DELETE /api/products   - Requires admin role
GET/POST/PUT/DELETE /api/brands     - Requires admin role
GET/PUT             /api/orders     - Requires admin role
GET                 /api/staff      - Requires admin role
```

## 📝 Sample Data Setup

### Insert Sample Brands

```sql
INSERT INTO brands (name) VALUES 
('Apple'),
('Samsung'),
('OnePlus'),
('Xiaomi'),
('OPPO'),
('Realme');
```

### Insert Sample Products

```sql
INSERT INTO products (brand_id, name, model, price, specs, stock, image) VALUES
(1, 'iPhone 15 Pro', 'A2848', 999.99, '6.1" OLED, 48MP Camera', 50, '/images/iphone15.jpg'),
(2, 'Galaxy S24 Ultra', 'SM-S928B', 1299.99, '6.8" AMOLED, 200MP Camera', 40, '/images/galaxy.jpg');
```

## 🏃 Development Workflow

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm start
# Runs on http://localhost:3000
```

Both servers should be running for full functionality.

## 🧪 Testing

### Frontend

```bash
npm test
```

### Backend

```bash
cd backend
npm test
```

## 🌐 Deployment

### Production Build

```bash
# Frontend build
npm run build
# Creates optimized build in 'build' folder

# Backend ready (no build needed)
```

### Deploy to Vercel (Frontend)

```bash
npm install -g vercel

# In project root
vercel
```

### Deploy to Heroku (Backend)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create your-api-name
heroku config:set JWT_SECRET=production-secret
git push heroku main
```

### Environment Variables for Production

**Frontend:**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENV=production
```

**Backend:**
```env
NODE_ENV=production
JWT_SECRET=<secure-random-key>
CORS_ORIGIN=https://your-frontend-domain.com
DB_HOST=production-db-host
DB_USER=prod-user
DB_PASSWORD=secure-password
DB_NAME=elyoo_mobile_store
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or change port
PORT=3002 npm start
```

### Database Connection Failed

1. Verify MySQL is running
2. Check credentials in .env
3. Ensure database exists: `mysql -u root -e "SHOW DATABASES;"`

### CORS Error

- Check `CORS_ORIGIN` in backend .env
- Ensure frontend and backend URLs match settings

### Token Expiration

- Tokens expire after 7 days
- User needs to login again
- Change `expiresIn` in `/backend/routes/auth.js` if needed

## 📚 API Documentation

### Example API Calls

**Get All Products**
```bash
curl http://localhost:3001/api/products
```

**Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elyoo.com","password":"password123"}'
```

**Create Order**
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name":"John Doe",
    "customer_email":"john@example.com",
    "customer_phone":"1234567890",
    "items":[{"id":1,"name":"iPhone 15","price":999.99,"quantity":1}]
  }'
```

## 📖 Features

### User Features
- ✅ Browse products by brand
- ✅ Filter and sort products
- ✅ View product details
- ✅ Add items to cart
- ✅ Checkout
- ✅ View company information
- ✅ See development team

### Admin Features
- ✅ Secure login system
- ✅ Dashboard with statistics
- ✅ Product management (CRUD)
- ✅ Brand management
- ✅ Order management and tracking
- ✅ Staff member management
- ✅ Role-based access control

## 🎨 Customization

### Change Company Name

**Frontend:**
```javascript
// src/components/Header.jsx
<h1>Your Company Name</h1>
```

### Change Colors

**CSS Variables:**
```css
/* src/App.css */
:root {
  --primary-color: #00d9ff;
  --secondary-color: #1a1a2e;
  /* ... */
}
```

### Add New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Header.jsx`

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to secure random key
- [ ] Use strong admin password
- [ ] Enable HTTPS in production
- [ ] Set proper CORS origin
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor error logs
- [ ] Use environment variables for sensitive data

## 📞 Support

For issues or questions:
1. Check error messages in browser console/terminal
2. Review API documentation in backend/README.md
3. Verify all services are running
4. Check database connection
5. Review .env configuration

## 🚀 Performance Tips

- Use React DevTools for profiling
- Enable compression in production
- Implement caching strategies
- Optimize images
- Use lazy loading for components
- Monitor API response times

## 📝 Maintenance

### Regular Tasks
- Check logs for errors
- Monitor database size
- Review user feedback
- Update dependencies monthly
- Backup database weekly

### Commands

```bash
# Update dependencies
npm update

# Check security vulnerabilities
npm audit

# Clean cache
npm cache clean --force
```

## 📄 License

This project is proprietary and for educational purposes.

---

**Built with ❤️ by Elyoo Development Team**

### Quick Links
- [Frontend README](./README_REACT.md)
- [Backend README](./backend/README.md)
- [API Documentation](./API_DOCS.md)
- [Database Schema](./DATABASE_SCHEMA.md)
