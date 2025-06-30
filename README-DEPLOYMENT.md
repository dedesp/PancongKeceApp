# 🥞 Pancong Kece - Cafe Management System

## 📋 Deskripsi
Sistem manajemen cafe lengkap dengan fitur Point of Sales (POS) dan Human Resource Management (HRM) untuk Pancong Kece.

## ✨ Fitur Utama
- 🛒 **Point of Sales (POS)** - Transaksi real-time dengan multi payment
- 👥 **Customer Management** - Sistem loyalty dan segmentasi pelanggan  
- 📦 **Inventory Management** - Tracking stok dan auto reorder
- 👨‍💼 **Employee Management** - Absensi, payroll, dan manajemen karyawan
- 📊 **Dashboard & Analytics** - Laporan penjualan dan performa bisnis
- 💬 **WhatsApp Integration** - Notifikasi dan komunikasi pelanggan
- 🎯 **Automation Rules** - Otomatisasi proses bisnis
- 💰 **Financial Management** - Pajak, diskon, dan pembulatan

## 🚀 Quick Start

### Persiapan Environment
```bash
# Clone atau download project
cd PancongKeceApp

# Install dependencies
npm run setup
```

### Menjalankan Aplikasi
```bash
# Development mode
npm start

# Production mode  
NODE_ENV=production npm start
```

Aplikasi akan berjalan di:
- **Frontend**: `index.html` (buka langsung di browser)
- **Backend API**: `http://localhost:3000`

### Default Login
```
Admin: admin / admin123
Manager: manager1 / admin123  
Kasir: kasir1 / admin123
```

## 📁 Struktur Project

```
PancongKeceApp/
├── index.html              # Frontend (Single Page App)
├── package.json            # Root package configuration
├── README.md              # Dokumentasi ini
└── backend/               # Backend API (Node.js + Express)
    ├── server-minimal.js  # Server untuk production
    ├── config/           # Database & config
    ├── models/           # Database models
    ├── controllers/      # Business logic
    ├── routes/          # API endpoints
    ├── middleware/      # Auth & logging
    ├── utils/          # Database seeder & utilities
    └── database/       # SQLite database file
```

## 🌐 Deployment ke Hosting

### Opsi 1: Shared Hosting (cPanel)
1. Upload semua file ke public_html
2. Setup Node.js app di cPanel
3. Install dependencies: `npm install`
4. Start point: `backend/server-minimal.js`

### Opsi 2: VPS/Dedicated Server
```bash
# Clone project
git clone <your-repo>
cd PancongKeceApp

# Install dependencies
npm run setup

# Install PM2 untuk production
npm install -g pm2

# Start dengan PM2
pm2 start backend/server-minimal.js --name "pancong-kece"
pm2 startup
pm2 save
```

### Opsi 3: Cloud Platform (Railway, Render, Heroku)
1. Push code ke Git repository
2. Connect repository ke platform
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
4. Deploy otomatis akan berjalan

## ⚙️ Environment Variables

Buat file `.env` di folder `backend/`:
```bash
NODE_ENV=production
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./database/pancong_kece.db
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=*
```

## 🗄️ Database

Aplikasi menggunakan **SQLite** untuk kemudahan deployment:
- File database: `backend/database/pancong_kece.db`
- Auto-created saat first run
- Include sample data untuk testing

Untuk production, bisa switch ke PostgreSQL/MySQL dengan mengubah config database.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Products & Categories  
- `GET /api/products` - Get all products
- `GET /api/categories` - Get all categories

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /health` - Server health check
- `GET /` - API info

## 🛠️ Development

### Prerequisites
- Node.js 14+
- NPM atau Yarn

### Development Setup
```bash
cd backend
npm install
npm run dev  # Starts with nodemon
```

### Testing
```bash
npm test  # Run test suite
```

## 📞 Support

Untuk bantuan teknis atau custom development:
- Email: support@pancongkece.com
- WhatsApp: +62 812-3456-7890

## 📄 License

MIT License - Open source untuk pembelajaran dan development.

---

**🎉 Aplikasi siap untuk di-deploy ke hosting manapun!**

Pastikan hosting support Node.js untuk backend API.
Frontend bisa di-host di static hosting (Netlify, Vercel) terpisah jika diinginkan.
