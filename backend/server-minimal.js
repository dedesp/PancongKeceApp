require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// Basic routes that work
try {
  const authRoutes = require('./routes/auth.routes');
  app.use('/api/auth', authRoutes);
} catch (e) {
  console.log('Auth routes not loaded:', e.message);
}

try {
  const productRoutes = require('./routes/product.routes');
  app.use('/api/products', productRoutes);
} catch (e) {
  console.log('Product routes not loaded:', e.message);
}

try {
  const customerRoutes = require('./routes/customer.routes');
  app.use('/api/customers', customerRoutes);
} catch (e) {
  console.log('Customer routes not loaded:', e.message);
}

// Mock routes for testing
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    status: 'success',
    data: {
      todaySales: 2500000,
      totalTransactions: 45,
      totalCustomers: 123,
      totalProducts: 25,
      lowStockItems: 3
    }
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'Pancong Cokelat',
        price: 15000,
        category: 'Pancong',
        stock: 50
      },
      {
        id: 2,
        name: 'Pancong Keju',
        price: 18000,
        category: 'Pancong',
        stock: 45
      },
      {
        id: 3,
        name: 'Es Teh Manis',
        price: 8000,
        category: 'Minuman',
        stock: 30
      }
    ]
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Selamat datang di API Pancong Kece Cafe Management System',
    status: 'Server running successfully!',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Terjadi kesalahan pada server', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan pada http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
