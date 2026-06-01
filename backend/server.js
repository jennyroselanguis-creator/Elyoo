const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load root .env and force override process.env to avoid stale OS environment variables
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
} catch (err) {
  console.warn('Error force-loading root .env:', err.message);
}
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();

// Middleware
// Allow cross-origin requests from development hosts (adjust in production)
// In development allow any origin to simplify local testing. In production, use CORS_ORIGIN.
const isDev = (process.env.NODE_ENV || 'development') !== 'production';
app.use(cors({
  origin: isDev ? true : function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = process.env.CORS_ORIGIN || 'http://localhost:3000';
    if (origin === allowed) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/supabase', require('./routes/supabase_staff'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: err.errors 
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized' 
    });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Start server
// Use BACKEND_PORT if set; fall back to 3001 (never use PORT which is reserved for React dev server)
const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Elyoo Mobile API Server            ║
║   Running on port ${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'} ║
╚═══════════════════════════════════════╝
  `);
});
