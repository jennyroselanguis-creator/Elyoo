# Elyoo Mobile Store - API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "count": 10
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": []
}
```

---

## Endpoints

### Authentication

#### POST /auth/login
Login to admin panel

**Request:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@elyoo.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@elyoo.com",
    "role": "admin"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `400` - Validation failed

---

#### GET /auth/verify
Verify JWT token

**Request:**
```bash
GET /auth/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@elyoo.com",
    "role": "admin",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

---

### Products

#### GET /products
Get all products

**Query Parameters:**
- `brand_id` (optional) - Filter by brand
- `sort` (optional) - Sort by field
- `limit` (optional) - Limit results
- `offset` (optional) - Offset for pagination

**Request:**
```bash
GET /products
GET /products?brand_id=1&sort=price&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "brand_id": 1,
      "name": "iPhone 15 Pro",
      "model": "A2848",
      "price": 999.99,
      "specs": "6.1\" OLED, 120Hz, A17 Pro",
      "stock": 50,
      "image": "/images/iphone15.jpg",
      "brand_name": "Apple",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

#### GET /products/:id
Get single product

**Request:**
```bash
GET /products/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "brand_id": 1,
    "name": "iPhone 15 Pro",
    "model": "A2848",
    "price": 999.99,
    "specs": "6.1\" OLED, 120Hz, A17 Pro",
    "stock": 50,
    "image": "/images/iphone15.jpg",
    "brand_name": "Apple"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Product not found

---

#### POST /products
Create product (Admin only)

**Request:**
```bash
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "brand_id": 1,
  "name": "iPhone 16 Pro",
  "model": "A2950",
  "price": 1099.99,
  "specs": "6.3\" OLED, 120Hz, A18 Pro",
  "stock": 100,
  "image": "/images/iphone16.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 50,
    "brand_id": 1,
    "name": "iPhone 16 Pro",
    "model": "A2950",
    "price": 1099.99,
    "specs": "6.3\" OLED, 120Hz, A18 Pro",
    "stock": 100,
    "image": "/images/iphone16.jpg"
  }
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Validation failed
- `401` - Unauthorized
- `403` - Forbidden

---

#### PUT /products/:id
Update product (Admin only)

**Request:**
```bash
PUT /products/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro Max",
  "price": 1099.99,
  "stock": 40
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

**Status Codes:**
- `200` - Updated successfully
- `404` - Product not found
- `401` - Unauthorized
- `403` - Forbidden

---

#### DELETE /products/:id
Delete product (Admin only)

**Request:**
```bash
DELETE /products/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted successfully
- `404` - Product not found
- `401` - Unauthorized
- `403` - Forbidden

---

### Brands

#### GET /brands
Get all brands

**Request:**
```bash
GET /brands
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Apple",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Samsung",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 2
}
```

---

#### POST /brands
Create brand (Admin only)

**Request:**
```bash
POST /brands
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "OnePlus"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "id": 9,
    "name": "OnePlus"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation failed or duplicate
- `401` - Unauthorized
- `403` - Forbidden

---

#### PUT /brands/:id
Update brand (Admin only)

**Request:**
```bash
PUT /brands/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Apple Inc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Brand updated successfully"
}
```

---

#### DELETE /brands/:id
Delete brand (Admin only)

**Request:**
```bash
DELETE /brands/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted
- `400` - Brand has associated products
- `404` - Brand not found
- `401` - Unauthorized
- `403` - Forbidden

---

### Orders

#### POST /orders
Create order (Public)

**Request:**
```bash
POST /orders
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "1234567890",
  "items": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 999.99,
      "quantity": 1
    },
    {
      "id": 2,
      "name": "iPhone 15",
      "price": 799.99,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "order_number": "ORD-3Z5XYZ0-ABC123",
    "status": "pending",
    "total_amount": 1799.98
  }
}
```

**Status Codes:**
- `201` - Order created
- `400` - Validation failed
- `500` - Server error

---

#### GET /orders
Get all orders (Admin only)

**Request:**
```bash
GET /orders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-3Z5XYZ0-ABC123",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "1234567890",
      "status": "pending",
      "total_amount": 1799.98,
      "items": [
        {
          "id": 1,
          "name": "iPhone 15 Pro",
          "price": 999.99,
          "quantity": 1
        }
      ],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

#### GET /orders/:id
Get single order (Admin only)

**Request:**
```bash
GET /orders/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD-3Z5XYZ0-ABC123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "status": "pending",
    "total_amount": 1799.98,
    "items": [...]
  }
}
```

---

#### PUT /orders/:id
Update order status (Admin only)

**Request:**
```bash
PUT /orders/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

**Valid Status Values:**
- `pending` - Initial state
- `processing` - Order is being prepared
- `shipped` - Order is in transit
- `delivered` - Order received
- `cancelled` - Order cancelled

---

### Staff

#### GET /staff
Get all staff members (Admin only)

**Request:**
```bash
GET /staff
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@elyoo.com",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

#### POST /staff
Create staff member (Admin only)

**Request:**
```bash
POST /staff
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Manager",
  "email": "john@elyoo.com",
  "password": "securepassword123",
  "role": "staff"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Staff member created successfully",
  "data": {
    "id": 2,
    "name": "John Manager",
    "email": "john@elyoo.com",
    "role": "staff"
  }
}
```

---

#### PUT /staff/:id
Update staff member (Admin only)

**Request:**
```bash
PUT /staff/2
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Senior Manager",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Staff member updated successfully"
}
```

---

#### DELETE /staff/:id
Delete staff member (Admin only)

**Request:**
```bash
DELETE /staff/2
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Staff member deleted successfully"
}
```

---

## Error Codes

| Status | Code | Meaning |
|--------|------|---------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

---

## Rate Limiting

Currently, no rate limiting is implemented. Add in production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Testing with cURL

### Get all products
```bash
curl http://localhost:3001/api/products
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elyoo.com",
    "password": "admin123"
  }'
```

### Create order
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

---

## Postman Collection

Import the provided Postman collection for easy API testing:
- File: `postman_collection.json`
- Environment: `postman_environment.json`

---

**API Documentation v2.0 - Last Updated: 2024**
