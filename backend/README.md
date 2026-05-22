# Backend Setup Guide - Node.js Express API

## Overview

This is a modern Express.js API backend for the Elyoo Mobile Store React application. It provides RESTful endpoints for managing products, brands, orders, and staff authentication.

## Prerequisites

- Node.js 16+
- MySQL 5.7+
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Create MySQL database and tables:

```sql
-- Create Database
CREATE DATABASE elyoo_mobile_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE elyoo_mobile_store;

-- Brands Table
CREATE TABLE brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  specs TEXT,
  stock INT DEFAULT 0,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  items JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table
CREATE TABLE staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_brand_id ON products(brand_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_staff_email ON staff(email);
```

### 3. Environment Configuration

Create `.env` file in backend directory:

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

### 4. Start Development Server

```bash
npm run dev
```

Server will run at `http://localhost:3001`

## API Endpoints

### Products

```
GET    /api/products              - Get all products
GET    /api/products/:id          - Get single product
POST   /api/products              - Create product (Admin)
PUT    /api/products/:id          - Update product (Admin)
DELETE /api/products/:id          - Delete product (Admin)
```

### Brands

```
GET    /api/brands                - Get all brands
POST   /api/brands                - Create brand (Admin)
PUT    /api/brands/:id            - Update brand (Admin)
DELETE /api/brands/:id            - Delete brand (Admin)
```

### Orders

```
POST   /api/orders                - Create order (Public)
GET    /api/orders                - Get all orders (Admin)
GET    /api/orders/:id            - Get single order (Admin)
PUT    /api/orders/:id            - Update order status (Admin)
```

### Authentication

```
POST   /api/auth/login            - Admin login
GET    /api/auth/verify           - Verify token
```

### Staff

```
GET    /api/staff                 - Get all staff (Admin)
POST   /api/staff                 - Create staff (Admin)
PUT    /api/staff/:id             - Update staff (Admin)
DELETE /api/staff/:id             - Delete staff (Admin)
```

## Request Examples

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elyoo.com",
    "password": "password123"
  }'
```

### Get All Products

```bash
curl http://localhost:3001/api/products
```

### Create Product (Admin)

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "brand_id": 1,
    "name": "iPhone 15 Pro",
    "model": "A2848",
    "price": 999.99,
    "specs": "6.1\" OLED, 48MP Camera",
    "stock": 50,
    "image": "/images/iphone15.jpg"
  }'
```

### Create Order (Public)

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "1234567890",
    "items": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "quantity": 1
      }
    ]
  }'
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── products.js          # Product endpoints
│   ├── brands.js            # Brand endpoints
│   ├── orders.js            # Order endpoints
│   ├── auth.js              # Authentication endpoints
│   └── staff.js             # Staff endpoints
├── utils/
│   └── helpers.js           # Utility functions
├── .env.example             # Environment variables example
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Input validation with express-validator
- ✅ CORS protection
- ✅ SQL injection protection with parameterized queries

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:

```json
{
  "error": "Error message",
  "details": []
}
```

or

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Development Tips

1. **Enable Request Logging**
   - Middleware logs all requests to console

2. **Database Queries**
   - Use parameterized queries to prevent SQL injection

3. **Authentication**
   - All admin endpoints require valid JWT token
   - Token in header: `Authorization: Bearer <token>`

4. **CORS**
   - Configured for localhost:3000
   - Update for production

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify DB credentials in .env
- Ensure database exists

### Port Already in Use
```bash
# Change port in .env or use:
PORT=3002 npm run dev
```

### Token Expired
- Tokens expire after 7 days
- User needs to login again

## Deployment

### Production Build

```bash
npm run build
```

### Production Environment Variables

```env
NODE_ENV=production
JWT_SECRET=<secure-random-key>
CORS_ORIGIN=https://yourdomain.com
```

### Deploy to Heroku

```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DB_HOST=your-db-host

# Deploy
git push heroku main
```

## Monitoring & Logs

- Server logs to console
- All requests logged with timestamp
- Error stack traces in development

## Support

For issues or questions:
1. Check error messages
2. Verify database schema
3. Check environment variables
4. Review API documentation

---

**Built with ❤️ by Elyoo Development Team**
