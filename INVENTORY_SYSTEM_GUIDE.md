# 📦 Sistem Pelacakan Inventaris Sajati Smart System

## 🎯 Overview

Sistem pelacakan inventaris otomatis yang menghitung pengurangan stok berdasarkan transaksi penjualan POS secara real-time. Sistem ini mendukung:

- ✅ **75 Produk** dengan komposisi bahan baku yang berbeda
- ✅ **140+ Bahan Baku** dengan unit dan harga yang akurat
- ✅ **Produk Gabungan (PG)** dengan batch production
- ✅ **Pelacakan Stok Real-time** berdasarkan penjualan
- ✅ **Laporan Keuangan Harian** (omset, profit, pajak, diskon)
- ✅ **Stock Alerts** untuk bahan baku yang hampir habis

## 🚀 Quick Start

### 1. Setup Database & Import Data

```bash
# Jalankan setup lengkap sistem inventaris
cd /Users/dedepermana/Downloads/PancongKeceApp-Deploy
node backend/scripts/setupInventorySystem.js
```

Script ini akan:
- 📊 Membuat tabel-tabel inventaris baru
- 📦 Import data bahan baku dan komposisi produk
- 🔧 Setup PG (Produk Gabungan) compositions
- 📈 Setup stok awal untuk semua bahan baku
- ✅ Test sistem dengan transaksi simulasi

### 2. Integrasi dengan Aplikasi

```javascript
// Tambahkan routes inventaris ke app.js
const inventoryRoutes = require('./routes/inventoryTracking.routes');
app.use('/api/inventory', inventoryRoutes);
```

### 3. Test API Endpoints

```bash
# Cek status stok saat ini
curl http://localhost:3000/api/inventory/stock-status

# Lihat dashboard inventaris
curl http://localhost:3000/api/inventory/dashboard

# Lihat ringkasan penjualan harian
curl http://localhost:3000/api/inventory/daily-summary
```

## 📊 Struktur Database

### Tabel Utama

#### 1. `product_compositions`
Menyimpan komposisi setiap produk (bahan baku langsung + PG)
```sql
- product_id: ID produk
- raw_material_id: ID bahan baku (untuk bahan langsung)
- pg_product_id: ID produk gabungan (untuk PG)
- quantity_per_portion: Jumlah per porsi
- unit: Satuan (gram, ml, pcs)
- cost_per_unit: Harga per unit
```

#### 2. `pg_compositions`
Menyimpan komposisi PG per batch produksi
```sql
- pg_product_id: ID produk gabungan
- raw_material_id: ID bahan baku
- quantity_per_batch: Jumlah per batch
- batch_yield: Hasil per batch (berapa porsi)
- unit: Satuan
- cost_per_unit: Harga per unit
```

#### 3. `raw_material_stock`
Menyimpan stok saat ini untuk setiap bahan baku
```sql
- raw_material_id: ID bahan baku
- current_quantity: Jumlah stok saat ini
- unit: Satuan
- minimum_stock: Batas minimum stok
- last_updated: Waktu update terakhir
```

#### 4. `stock_movements`
Mencatat setiap pergerakan stok (masuk/keluar)
```sql
- raw_material_id: ID bahan baku
- movement_type: 'IN' atau 'OUT'
- quantity: Jumlah pergerakan
- reference_type: 'SALE', 'PURCHASE', 'ADJUSTMENT'
- reference_id: ID transaksi/referensi
- movement_date: Tanggal pergerakan
```

### Views untuk Analisis

#### 1. `product_full_composition`
Menampilkan komposisi lengkap setiap produk

#### 2. `current_stock_status`
Menampilkan status stok (ADEQUATE, LOW_STOCK, OUT_OF_STOCK)

#### 3. `daily_sales_summary`
Ringkasan penjualan harian dengan profit dan biaya

## 🔄 Alur Kerja Sistem

### 1. Saat Produk Terjual (Trigger Otomatis)

```sql
-- Trigger: after_transaction_item_insert
-- Dipicu saat: INSERT ke transaction_items
-- Aksi:
1. Hitung bahan baku yang dibutuhkan
2. Kurangi stok bahan baku
3. Catat pergerakan stok
4. Update ringkasan harian
```

### 2. Perhitungan Bahan Baku

**Untuk Produk dengan Bahan Baku Langsung:**
```
Stok Keluar = Quantity Terjual × Quantity per Portion
```

**Untuk Produk dengan PG:**
```
Stok Keluar PG = Quantity Terjual × (Quantity per Batch ÷ Batch Yield)
```

### 3. Update Stok Real-time

```sql
-- Update stok bahan baku
UPDATE raw_material_stock 
SET current_quantity = current_quantity - calculated_usage
WHERE raw_material_id = ?

-- Catat pergerakan
INSERT INTO stock_movements (...)
```

## 📈 API Endpoints

### Stock Management

```javascript
// GET /api/inventory/stock-status
// Response: Current stock levels with status
{
  "success": true,
  "data": [
    {
      "raw_material_name": "Beras",
      "current_quantity": 15000,
      "unit": "Gram",
      "minimum_stock": 5000,
      "stock_status": "ADEQUATE",
      "stock_value": 225000
    }
  ]
}

// GET /api/inventory/stock-movements
// Response: Stock movement history
{
  "success": true,
  "data": [
    {
      "movement_date": "2024-01-15",
      "raw_material_name": "Beef Slice",
      "movement_type": "OUT",
      "quantity": 160,
      "reference_type": "SALE",
      "reference_id": "TXN-001"
    }
  ]
}

// POST /api/inventory/update-stock
// Body: Manual stock adjustment
{
  "raw_material_id": 1,
  "quantity": 1000,
  "movement_type": "IN",
  "reference_type": "PURCHASE",
  "notes": "Stock replenishment"
}
```

### Sales & Financial Reports

```javascript
// GET /api/inventory/daily-summary?date=2024-01-15
// Response: Daily sales and financial summary
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "total_sales": 50,
    "total_revenue": 750000,
    "total_cost": 450000,
    "gross_profit": 300000,
    "profit_margin": 40.0,
    "total_tax": 75000,
    "total_discount": 25000
  }
}

// GET /api/inventory/daily-product-sales?date=2024-01-15
// Response: Product-wise sales for the day
{
  "success": true,
  "data": [
    {
      "product_name": "Nasi Oseng Sapi",
      "quantity_sold": 15,
      "total_revenue": 225000,
      "total_cost": 135000,
      "profit": 90000
    }
  ]
}
```

### Dashboard & Analytics

```javascript
// GET /api/inventory/dashboard
// Response: Complete dashboard data
{
  "success": true,
  "data": {
    "stock_summary": {
      "total_items": 140,
      "adequate_stock": 120,
      "low_stock": 15,
      "out_of_stock": 5
    },
    "today_sales": {
      "total_transactions": 25,
      "total_revenue": 500000,
      "total_profit": 200000
    },
    "alerts": [
      {
        "type": "LOW_STOCK",
        "message": "Beef Slice stock is running low",
        "current_quantity": 200,
        "minimum_stock": 500
      }
    ]
  }
}
```

## 🔧 Konfigurasi & Maintenance

### 1. Update Harga Bahan Baku

```sql
UPDATE raw_materials 
SET current_price = new_price 
WHERE id = raw_material_id;

-- Update di komposisi produk
UPDATE product_compositions 
SET cost_per_unit = new_price 
WHERE raw_material_id = raw_material_id;
```

### 2. Tambah Produk Baru

```sql
-- 1. Tambah produk di tabel products
INSERT INTO products (name, price, category_id, is_active) 
VALUES ('Produk Baru', 25000, 1, 1);

-- 2. Tambah komposisi produk
INSERT INTO product_compositions (
  product_id, raw_material_id, quantity_per_portion, unit, cost_per_unit
) VALUES (product_id, raw_material_id, quantity, unit, price);
```

### 3. Setup PG Baru

```sql
-- 1. Tambah PG sebagai produk
INSERT INTO products (name, sku, is_active) 
VALUES ('PG Baru', 'PG-NEW', 1);

-- 2. Tambah komposisi PG
INSERT INTO pg_compositions (
  pg_product_id, raw_material_id, quantity_per_batch, 
  batch_yield, unit, cost_per_unit
) VALUES (pg_id, raw_material_id, quantity, yield, unit, price);
```

### 4. Backup & Restore

```bash
# Backup database
sqlite3 sajati_smart_system.db ".backup backup_$(date +%Y%m%d).db"

# Export data
sqlite3 sajati_smart_system.db ".dump" > backup_$(date +%Y%m%d).sql
```

## 📊 Laporan yang Tersedia

### 1. Laporan Harian
- 💰 Total penjualan dan omset
- 📦 Stok keluar per bahan baku
- 💵 Biaya produksi dan profit
- 🧾 Pajak dan diskon

### 2. Laporan Stok
- 📈 Status stok saat ini
- ⚠️ Alert stok menipis
- 📊 Pergerakan stok
- 💎 Valuasi inventaris

### 3. Laporan Produk
- 🍽️ Penjualan per produk
- 📈 Tren penjualan
- 💰 Profitabilitas produk
- 🔄 Potensi penjualan berdasarkan stok

## 🚨 Troubleshooting

### Error: "Table already exists"
```bash
# Normal saat menjalankan setup ulang
# Script akan skip tabel yang sudah ada
```

### Error: "Raw material not found"
```sql
-- Cek bahan baku yang tersedia
SELECT * FROM raw_materials WHERE name LIKE '%nama_bahan%';

-- Tambah bahan baku baru jika perlu
INSERT INTO raw_materials (code, name, category, unit, current_price)
VALUES ('RM999', 'Nama Bahan', 'Category', 'Unit', price);
```

### Stok Negatif
```sql
-- Cek stok negatif
SELECT rm.name, rms.current_quantity 
FROM raw_material_stock rms
JOIN raw_materials rm ON rms.raw_material_id = rm.id
WHERE rms.current_quantity < 0;

-- Perbaiki stok negatif
UPDATE raw_material_stock 
SET current_quantity = 0 
WHERE current_quantity < 0;
```

## 🎯 Best Practices

1. **Backup Rutin**: Backup database setiap hari
2. **Monitor Stok**: Cek alert stok setiap pagi
3. **Update Harga**: Review harga bahan baku setiap bulan
4. **Audit Stok**: Lakukan stock opname berkala
5. **Performance**: Monitor performa query untuk data besar

## 📞 Support

Untuk pertanyaan atau masalah:
1. Cek log error di console
2. Verifikasi data di database
3. Test dengan transaksi kecil dulu
4. Backup sebelum melakukan perubahan besar

---

**🎉 Sistem Pelacakan Inventaris Sajati Smart System siap digunakan!**

Sistem ini akan secara otomatis:
- ✅ Mengurangi stok saat ada penjualan
- ✅ Menghitung biaya produksi real-time
- ✅ Memberikan alert stok menipis
- ✅ Menghasilkan laporan keuangan harian
- ✅ Melacak profitabilitas per produk