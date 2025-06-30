# 🚀 Panduan Deploy Pancong Kece App ke Netlify

## Perubahan yang Telah Dilakukan:

### ✅ Konfigurasi Netlify
- **netlify.toml**: Updated dengan Node.js 18.17.0 dan npm 9.6.7
- **package.json**: Fixed Node.js version dan build scripts
- **.nvmrc**: Node.js version specification

### ✅ Netlify Functions
- **server.js**: Simplified function dengan mock data
- **package.json**: Minimal dependencies untuk functions

### ✅ API Configuration
- **js/api-config.js**: Updated untuk Netlify functions path

## 📋 Langkah Deploy:

### 1. Push ke GitHub
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Deploy di Netlify
1. Login ke [Netlify](https://netlify.app)
2. Click "New site from Git"
3. Connect GitHub repository
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.` (root)
   - Functions directory: `netlify/functions`

### 3. Environment Variables (Optional)
Jika diperlukan, tambahkan di Netlify dashboard:
- NODE_ENV: `production`
- CORS_ORIGINS: `https://your-app-name.netlify.app`

## 🧪 Test Endpoints Setelah Deploy:

- Health check: `https://your-app.netlify.app/.netlify/functions/server/api/health`
- Products: `https://your-app.netlify.app/.netlify/functions/server/api/products`
- Login: `https://your-app.netlify.app/.netlify/functions/server/api/auth/login`

### Login Credentials untuk Testing:
- Email: `admin@pancongkece.com`
- Password: `admin123`

## 🔧 Troubleshooting:

### Jika build gagal:
1. Check Node.js version di netlify.toml
2. Pastikan dependencies di netlify/functions/package.json minimal
3. Check build logs untuk error spesifik

### Jika functions error:
1. Test endpoint health check terlebih dahulu
2. Check function logs di Netlify dashboard
3. Pastikan API path di frontend sudah benar

## 📱 Demo Features:
- Dashboard dengan mock stats
- Product management dengan data sample
- Customer list dengan data demo
- Login authentication
- Transaction history

Ready untuk deploy! 🎉
