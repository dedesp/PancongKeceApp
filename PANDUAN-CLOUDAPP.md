# 🚀 Panduan Deploy ke CloudApp Web ID

## Persiapan Sebelum Upload

### 1. Login ke Control Panel
- Buka: https://hosting.cloudapp.web.id/index.php/login
- Login dengan akses hosting kamu

### 2. Cek Spesifikasi Hosting
Pastikan hosting support:
- ✅ Node.js (minimal v16+)
- ✅ PostgreSQL atau MySQL
- ✅ SSL Certificate
- ✅ Custom Domain (opsional)

## 📋 Langkah-langkah Deployment

### Step 1: Upload File
1. **Masuk ke File Manager** di control panel
2. **Upload** file `PancongKeceApp-ReadyDeploy.zip`
3. **Extract/Unzip** file tersebut
4. **Pindahkan** semua isi folder ke `public_html` atau root directory

### Step 2: Setup Database
1. **Buat Database Baru**:
   - Masuk ke menu Database/MySQL
   - Buat database dengan nama: `pancong_kece_db`
   - Catat username, password, dan host database

2. **Update File .env**:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pancong_kece_db
DB_USER=your_db_username
DB_PASS=your_db_password

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Secret
JWT_SECRET=your_super_secret_key_here_2025

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### Step 3: Install Dependencies (jika diperlukan)
Jika hosting mengharuskan install ulang:
```bash
cd backend
npm install --production
```

### Step 4: Setup Database Tables
```bash
cd backend
npm run setup
```

### Step 5: Start Application
```bash
npm start
```

## 🔧 Konfigurasi Khusus CloudApp

### Node.js Application Setup
1. **Buat file `.htaccess`** di root directory:
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ backend/server.js [QSA,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]
```

2. **Setup Node.js App** di control panel:
   - Entry Point: `backend/server.js`
   - Node.js Version: 16+ atau terbaru
   - Environment: Production

### SSL Certificate
1. Aktifkan **SSL/TLS Certificate** di control panel
2. Force HTTPS redirect
3. Update FRONTEND_URL di `.env` dengan `https://`

## 🌐 Domain Setup (Opsional)

### Jika Pakai Domain Sendiri:
1. **Point Domain** ke server CloudApp
2. **Setup DNS Records**:
   - A Record: `@` → IP Server
   - CNAME Record: `www` → domain utama
3. **Update .env** dengan domain baru

### Jika Pakai Subdomain CloudApp:
- Biasanya dapat subdomain gratis: `username.cloudapp.web.id`
- Update FRONTEND_URL di .env sesuai subdomain

## 📱 Testing Aplikasi

### Frontend Test:
- Buka: `https://your-domain.com`
- Cek semua halaman berjalan normal
- Test login/register

### Backend API Test:
- Test: `https://your-domain.com/api/health`
- Cek response: `{"status": "OK", "message": "Server is running"}`

### Database Test:
- Login ke aplikasi
- Coba buat transaksi
- Cek data tersimpan

## 🔍 Troubleshooting

### Error Node.js:
1. Cek log di control panel
2. Pastikan Node.js version sesuai
3. Restart aplikasi

### Error Database:
1. Cek kredensial di .env
2. Pastikan database aktif
3. Test koneksi manual

### Error 500:
1. Cek file permissions (755 untuk folder, 644 untuk file)
2. Cek syntax error di code
3. Lihat error log

### File Not Found:
1. Pastikan semua file ter-upload
2. Cek struktur folder
3. Verify .htaccess setup

## 📞 Support

### CloudApp Support:
- Ticket support di control panel
- Live chat (jika tersedia)
- Email support

### Emergency Backup:
- Selalu backup database regular
- Backup file aplikasi
- Monitor uptime

## ✅ Checklist Deploy

- [ ] File ter-upload semua
- [ ] Database setup selesai  
- [ ] .env configured
- [ ] Node.js app running
- [ ] SSL active
- [ ] Domain pointing
- [ ] Testing completed
- [ ] Backup setup

## 🎯 Post-Deploy

1. **Monitor Performance**
2. **Setup Regular Backup**
3. **Configure Monitoring/Alerts**
4. **Document credentials** (simpan aman)

---

**🔐 PENTING**: Simpan semua kredensial (database, hosting login, dll) di tempat yang aman!

Good luck! 🚀✨
