# 🚀 Panduan Deploy Pancong Kece App ke Netlify

## 📋 Persiapan Sebelum Deploy

### 1. Persyaratan
- Akun GitHub
- Akun Netlify (gratis)
- Node.js 18+ (untuk development)

### 2. Repository Setup
```bash
# Clone atau download project ini
git clone <repository-url>
cd PancongKeceApp-Deploy

# Install dependencies (opsional untuk testing)
npm install
cd backend && npm install
cd ../netlify/functions && npm install
```

## 🌐 Deploy ke Netlify

### Metode 1: Deploy via GitHub (Recommended)

1. **Upload ke GitHub**
   - Buat repository baru di GitHub
   - Upload semua file project ke repository

2. **Connect ke Netlify**
   - Login ke [Netlify](https://netlify.com)
   - Klik "New site from Git"
   - Pilih repository GitHub Anda

3. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .
   Functions directory: netlify/functions
   ```

4. **Environment Variables**
   Di Netlify Dashboard > Site Settings > Environment Variables, tambahkan:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   DATABASE_URL=sqlite:///tmp/pancong_kece.db
   ```

### Metode 2: Deploy Manual

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Upload ke Netlify**
   - Drag & drop folder project ke Netlify Deploy area
   - Atau gunakan Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## ⚙️ Konfigurasi

### File Penting
- `netlify.toml` - Konfigurasi Netlify
- `netlify/functions/server.js` - Backend API
- `js/api-config.js` - Frontend API configuration
- `.env.example` - Template environment variables

### API Endpoints
Setelah deploy, API akan tersedia di:
```
https://your-app.netlify.app/api/health
https://your-app.netlify.app/api/auth/login
https://your-app.netlify.app/api/products
https://your-app.netlify.app/api/customers
https://your-app.netlify.app/api/transactions
https://your-app.netlify.app/api/dashboard/stats
```

## 🧪 Testing

### Test Login Credentials
```
Email: admin@pancongkece.com
Password: admin123
```

### API Health Check
```bash
curl https://your-app.netlify.app/api/health
```

## 🔧 Troubleshooting

### Common Issues

1. **Function Build Errors**
   ```bash
   # Pastikan dependencies terinstall
   cd netlify/functions
   npm install
   ```

2. **Database Errors**
   - App menggunakan SQLite in-memory untuk demo
   - Untuk production, setup database eksternal

3. **CORS Errors**
   - Pastikan domain sudah benar di environment variables
   - Check `ALLOWED_ORIGINS` setting

4. **API Not Working**
   - Check function logs di Netlify dashboard
   - Verify environment variables

### Debug Steps
1. Check build logs di Netlify
2. Test functions di Netlify Functions tab
3. Check browser console untuk frontend errors
4. Verify API endpoints dengan Postman/curl

## 📱 Fitur App

### Frontend Features
- ✅ Login/Authentication
- ✅ Dashboard dengan statistik
- ✅ Manajemen Produk
- ✅ Manajemen Customer
- ✅ Sistem Transaksi/POS
- ✅ Responsive Design

### Backend Features
- ✅ RESTful API
- ✅ JWT Authentication
- ✅ SQLite Database
- ✅ CORS Configuration
- ✅ Error Handling
- ✅ Mock Data untuk Demo

## 🔗 Links Berguna

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Environment Variables](https://docs.netlify.com/environment-variables/)

## 📞 Support

Jika mengalami masalah saat deployment:
1. Check logs di Netlify dashboard
2. Pastikan semua file sudah ter-upload
3. Verify environment variables
4. Test API endpoints setelah deploy

---

**Happy Deploying! 🎉**

App Anda akan berjalan di: `https://your-app-name.netlify.app`
