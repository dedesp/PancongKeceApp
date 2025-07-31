const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// Initialize express app
const app = express();

// Basic middleware
app.use(cors({
  origin: ['https://sajati-smart-system.netlify.app', 'http://localhost:3000', '*'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sajati Smart System API is running on Netlify',
    timestamp: new Date().toISOString()
  });
});

// Basic API endpoints for demo
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    status: 'success',
    data: {
      totalRevenue: 5000000,
      totalTransactions: 150,
      totalCustomers: 89,
      avgOrderValue: 33333
    }
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'Sajati Original',
        price: 15000,
        category: 'Sajati',
        stock: 50
      },
      {
        id: 2,
        name: 'Sajati Keju',
        price: 18000,
        category: 'Sajati',
        stock: 30
      },
      {
        id: 3,
        name: 'Es Teh Manis',
        price: 8000,
        category: 'Minuman',
        stock: 100
      }
    ]
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@sajati.com' && password === 'admin123') {
    res.json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        token: 'demo-token-' + Date.now(),
        user: {
          id: 1,
          email: 'admin@sajati.com',
          name: 'Admin Sajati Smart System',
          role: 'admin'
        }
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Email atau password salah'
    });
  }
});

app.get('/api/customers', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '081234567890',
        loyaltyPoints: 150
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '081234567891',
        loyaltyPoints: 200
      }
    ]
  });
});

app.get('/api/transactions', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        customerName: 'John Doe',
        total: 45000,
        date: new Date().toISOString(),
        items: [
          { name: 'Sajati Original', qty: 2, price: 15000 },
          { name: 'Es Teh Manis', qty: 1, price: 8000 }
        ]
      }
    ]
  });
});

// Catch all handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message
  });
});

// Export handler for Netlify
exports.handler = serverless(app);
