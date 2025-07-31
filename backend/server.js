require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const transactionRoutes = require('./routes/transaction.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const payrollRoutes = require('./routes/payroll.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const taxSettingRoutes = require('./routes/taxSetting.routes');
// const discountRoutes = require('./routes/discount.routes');  // Comment sementara
const roundingSettingRoutes = require('./routes/roundingSetting.routes');
const customerRoutes = require('./routes/customer.routes');
const cafeOperationRoutes = require('./routes/cafeOperation.routes');
const crmRoutes = require('./routes/crm.routes');
const automationRoutes = require('./routes/automation.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const sentimentRoutes = require('./routes/sentiment.routes');
const recipeManagementRoutes = require('./routes/recipeManagement.routes');
const testRoutes = require('./routes/test.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tax-settings', taxSettingRoutes);
// app.use('/api/discounts', discountRoutes);  // Comment dulu yang bermasalah
app.use('/api/rounding-settings', roundingSettingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cafe-operations', cafeOperationRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/recipe-management', recipeManagementRoutes);
app.use('/api/test', testRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Sajati Smart System' });
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
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});

module.exports = app;