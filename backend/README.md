# Pancong Kece Backend API

Backend API untuk aplikasi manajemen cafe Pancong Kece dengan fitur Point of Sales (POS) dan Human Resource Management (HRM).

## Instalasi

### 1. Prasyarat
- Node.js (versi 16 atau lebih tinggi)
- PostgreSQL (versi 12 atau lebih tinggi)
- npm atau yarn

### 2. Setup Database
Pastikan PostgreSQL sudah terinstal dan berjalan di sistem Anda.

```bash
# Masuk ke PostgreSQL sebagai superuser
sudo -u postgres psql

# Buat database baru
CREATE DATABASE pancong_kece;

# Buat user dan berikan privileges
CREATE USER cafe_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE pancong_kece TO cafe_user;

# Keluar dari PostgreSQL
\q
```

### 3. Instalasi Dependencies
```bash
cd backend
npm install
```

### 4. Konfigurasi Environment
```bash
# Copy file environment example
cp .env.example .env

# Edit file .env sesuai dengan konfigurasi database Anda
```

Contoh konfigurasi `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pancong_kece
DB_USER=cafe_user
DB_PASSWORD=password

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=pancong_kece_secret_key
JWT_EXPIRATION=1d

# Cors Configuration
CORS_ORIGIN=http://localhost:5000
```

### 5. Inisialisasi Database
```bash
# Jalankan script untuk membuat tabel dan data awal
npm run db:create

# Jika database sudah ada sebelumnya dan ingin menambahkan field kembalian
npm run db:migrate
```

### 6. Menjalankan Server
```bash
# Development mode dengan nodemon
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/register` - Registrasi pengguna baru (manager/admin only)
- `GET /api/auth/profile` - Mendapatkan profil pengguna
- `POST /api/auth/change-password` - Ubah password
- `POST /api/auth/logout` - Logout pengguna

### Products
- `GET /api/products` - Mendapatkan semua produk
- `GET /api/products/:id` - Mendapatkan produk berdasarkan ID
- `POST /api/products` - Membuat produk baru (manager/admin only)
- `PUT /api/products/:id` - Update produk (manager/admin only)
- `DELETE /api/products/:id` - Hapus produk (manager/admin only)

### Transactions
- `GET /api/transactions` - Mendapatkan semua transaksi
- `GET /api/transactions/:id` - Mendapatkan transaksi berdasarkan ID
- `POST /api/transactions` - Membuat transaksi baru
- `PUT /api/transactions/:id` - Update status cetak struk
- `PUT /api/transactions/:id/cancel` - Batalkan transaksi (manager/admin only)

### Categories
- `GET /api/categories` - Mendapatkan semua kategori
- `POST /api/categories` - Membuat kategori baru (manager/admin only)
- `PUT /api/categories/:id` - Update kategori (manager/admin only)

### Inventory
- `GET /api/inventory` - Mendapatkan data inventaris
- `PUT /api/inventory/:id` - Update stok produk (manager/admin only)
- `GET /api/inventory/logs` - Mendapatkan log perubahan stok

### Employees
- `GET /api/employees` - Mendapatkan data karyawan (manager/admin only)
- `POST /api/employees` - Menambah karyawan baru (manager/admin only)
- `PUT /api/employees/:id` - Update data karyawan (manager/admin only)

### Attendance
- `GET /api/attendance` - Mendapatkan data absensi (manager/admin only)
- `POST /api/attendance` - Clock in/out karyawan
- `PUT /api/attendance/:id` - Update data absensi (manager/admin only)

### Reports
- `GET /api/reports/sales` - Laporan penjualan (manager/admin only)
- `GET /api/reports/inventory` - Laporan inventaris (manager/admin only)
- `GET /api/reports/employees` - Laporan karyawan (manager/admin only)

### Dashboard
- `GET /api/dashboard/stats` - Statistik dashboard
- `GET /api/dashboard/recent-transactions` - Transaksi terbaru
- `GET /api/dashboard/top-products` - Produk terlaris

## User Roles

### Admin
- Akses penuh ke semua fitur
- Dapat mengelola pengguna sistem
- Dapat mengubah pengaturan sistem

### Manager
- Akses ke semua fitur manajemen
- Dapat mengelola produk, karyawan, dan laporan
- Tidak dapat mengubah pengaturan sistem

### Kasir
- Akses terbatas ke fitur POS
- Dapat melakukan transaksi
- Dapat melihat produk dan stok
- Tidak dapat mengakses fitur manajemen

## Default Users

Setelah menjalankan `npm run db:create`, Anda dapat login dengan:

```
Username: admin
Password: admin123
Role: Admin

Username: manager  
Password: admin123
Role: Manager

Username: kasir
Password: admin123
Role: Kasir
```

## Struktur Database

### Tables
- `users` - Data pengguna sistem
- `roles` - Role dan permissions
- `products` - Data produk
- `categories` - Kategori produk
- `transactions` - Data transaksi
- `transaction_items` - Detail item transaksi
- `payment_methods` - Metode pembayaran
- `inventory` - Data stok produk
- `inventory_logs` - Log perubahan stok
- `employees` - Data karyawan
- `attendances` - Data absensi
- `payrolls` - Data payroll
- `petty_cash` - Data kas kecil
- `system_logs` - Log aktivitas sistem

## Development

### Testing
```bash
npm test
```

### Debugging
Set environment variable `NODE_ENV=development` untuk menampilkan log SQL.

### Code Style
Gunakan ESLint dan Prettier untuk konsistensi kode.

## Production Deployment

1. Set `NODE_ENV=production`
2. Gunakan process manager seperti PM2
3. Setup reverse proxy dengan Nginx
4. Gunakan SSL certificate untuk HTTPS
5. Setup database backup otomatis

## Security Features

- JWT Authentication
- Password hashing dengan bcrypt
- Role-based access control
- Input validation
- SQL injection protection
- CORS configuration
- Rate limiting (akan ditambahkan)

## Error Handling

API menggunakan format response yang konsisten:

```json
{
  "status": "success|error",
  "message": "Pesan response",
  "data": "Data response (optional)"
}
```

## Logging

Sistem logging otomatis mencatat:
- Semua API requests
- User activities
- Error logs
- Transaction logs
- Database changes

Log disimpan di tabel `system_logs` dan dapat diakses melalui API reports.