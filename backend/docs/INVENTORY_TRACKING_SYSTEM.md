# Sistem Pelacakan Inventaris Otomatis - Sajati Smart System

## Overview

Sistem ini dirancang untuk melakukan pelacakan inventaris secara real-time berdasarkan transaksi penjualan di POS. Sistem akan otomatis menghitung pengurangan stok bahan baku ketika ada produk yang terjual, baik untuk produk yang menggunakan bahan baku langsung maupun produk yang menggunakan Produk Gabungan (PG).

## Struktur Database

### 1. Tabel Utama

#### `product_compositions`
Menyimpan komposisi bahan baku untuk setiap produk akhir.
- **Fungsi**: Menentukan bahan baku apa saja yang dibutuhkan untuk 1 porsi produk
- **Relasi**: 
  - `product_id` → `products.id` (produk akhir)
  - `raw_material_id` → `raw_materials.id` (bahan baku langsung)
  - `pg_product_id` → `products.id` (produk gabungan/PG)

#### `pg_compositions`
Menyimpan komposisi bahan baku untuk setiap PG (Produk Gabungan).
- **Fungsi**: Menentukan bahan baku yang dibutuhkan untuk membuat 1 batch PG
- **Key Field**: `batch_yield` - menentukan berapa porsi yang dihasilkan per batch

#### `raw_material_stock`
Menyimpan stok bahan baku saat ini.
- **Fungsi**: Real-time tracking stok setiap bahan baku
- **Auto-update**: Diupdate otomatis via trigger ketika ada penjualan

#### `stock_movements`
Mencatat semua pergerakan stok (masuk/keluar).
- **Fungsi**: Audit trail untuk semua perubahan stok
- **Relasi**: Terhubung ke `transaction_items` untuk tracking penjualan

### 2. Tabel Ringkasan

#### `daily_inventory_summary`
- Opening stock, stock in, stock out, closing stock per hari per bahan baku
- Total cost in dan cost out

#### `daily_sales_summary`
- Total transaksi, items terjual, revenue, tax, discount, COGS, profit per hari

#### `daily_product_sales`
- Detail penjualan per produk per hari
- Quantity sold, revenue, COGS, profit per produk

## Alur Kerja Sistem

### 1. Setup Awal
```sql
-- 1. Input data bahan baku
INSERT INTO raw_materials (code, name, unit, current_price, minimum_stock) VALUES
('RM001', 'Air', 'ml', 0.01, 5000);

-- 2. Setup stok awal
INSERT INTO raw_material_stock (raw_material_id, current_quantity, unit) VALUES
(1, 10000, 'ml');

-- 3. Setup komposisi PG
INSERT INTO pg_compositions (pg_product_id, raw_material_id, quantity_per_batch, unit, batch_yield) VALUES
('pg-kailan-crispy', 3, 100, 'Gram', 10); -- 100g kailan untuk 10 porsi

-- 4. Setup komposisi produk
INSERT INTO product_compositions (product_id, raw_material_id, quantity_per_portion, unit) VALUES
('nasi-oseng-sapi', 2, 150, 'Gram'); -- 150g beras per porsi

-- 5. Setup PG dalam produk
INSERT INTO product_compositions (product_id, pg_product_id, quantity_per_portion, unit) VALUES
('nasi-oseng-sapi', 'pg-kailan-crispy', 1, 'Porsi'); -- 1 porsi kailan crispy
```

### 2. Proses Penjualan

Ketika ada transaksi penjualan:

1. **Input Transaksi**
```sql
INSERT INTO transactions (transaction_number, total_amount, tax_amount, discount_amount, final_amount) VALUES
('TRX001', 25000, 2500, 1000, 26500);

INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
('trx-id', 'nasi-oseng-sapi', 2, 12500, 25000);
```

2. **Trigger Otomatis Berjalan**
   - `auto_reduce_stock_on_sale`: Mengurangi stok bahan baku
   - `update_daily_sales_summary`: Update ringkasan penjualan harian
   - `update_daily_product_sales`: Update penjualan per produk

3. **Perhitungan Stok Keluar**
   Untuk 2 porsi Nasi Oseng Sapi:
   - Beras: 150g × 2 = 300g
   - Beef Slice: 80g × 2 = 160g
   - Kailan (dari PG): (100g ÷ 10 porsi) × 1 porsi × 2 = 20g
   - Air (dari PG): (40ml ÷ 10 porsi) × 1 porsi × 2 = 8ml
   - Bawang Merah (dari PG): (20g ÷ 10 porsi) × 1 porsi × 2 = 4g

### 3. Monitoring dan Reporting

#### Real-time Stock Status
```sql
SELECT * FROM current_stock_status WHERE stock_status = 'LOW_STOCK';
```

#### Daily Sales Analysis
```sql
SELECT * FROM daily_sales_analysis WHERE date = CURRENT_DATE;
```

#### Product Performance
```sql
SELECT 
  product_name,
  quantity_sold,
  total_revenue,
  total_profit,
  (total_profit / total_revenue) * 100 as profit_margin
FROM daily_product_sales 
WHERE date = CURRENT_DATE
ORDER BY total_profit DESC;
```

## Views untuk Analisis

### 1. `product_full_composition`
Menampilkan komposisi lengkap produk termasuk bahan baku dari PG.

### 2. `current_stock_status`
Menampilkan status stok saat ini (Normal/Low Stock/Out of Stock).

### 3. `daily_sales_analysis`
Analisis penjualan harian dengan profit margin dan average transaction value.

### 4. `product_cogs_calculation`
Perhitungan Cost of Goods Sold (COGS) per produk.

## Fitur Otomatis

### 1. Auto Stock Reduction
- Ketika ada penjualan, stok bahan baku otomatis berkurang
- Mendukung produk dengan bahan baku langsung dan PG
- Mencatat audit trail di `stock_movements`

### 2. Daily Summary Updates
- Otomatis update ringkasan penjualan harian
- Perhitungan COGS dan profit otomatis
- Update per produk dan total harian

### 3. Stock Alert System
- Monitoring stok minimum
- Alert untuk low stock dan out of stock

## Laporan yang Dapat Dihasilkan

### 1. Laporan Harian
- Jumlah produk terjual per hari
- Stok keluar per bahan baku per hari
- Stok tersedia vs habis per hari
- Omset harian (gross dan net revenue)
- Biaya produksi harian (COGS)
- Profit harian
- Pajak harian
- Diskon harian

### 2. Laporan Produk
- Performance per produk
- Profit margin per produk
- Konsumsi bahan baku per produk

### 3. Laporan Inventaris
- Stock movement history
- Current stock levels
- Stock alerts
- Inventory valuation

## Implementasi

### 1. Jalankan Schema
```bash
sqlite3 sajati_smart_system.db < inventory_tracking_schema.sql
```

### 2. Import Data Existing
- Import data produk dari CSV
- Setup komposisi produk dan PG
- Setup stok awal bahan baku

### 3. Integrasi dengan POS
- Pastikan setiap transaksi penjualan tersimpan di `transactions` dan `transaction_items`
- Trigger akan otomatis menangani pengurangan stok

### 4. Setup Monitoring
- Dashboard untuk real-time stock status
- Alert system untuk low stock
- Daily/weekly/monthly reports

## Keuntungan Sistem

1. **Real-time Inventory Tracking**: Stok selalu update otomatis
2. **Accurate COGS Calculation**: Perhitungan biaya produksi akurat
3. **Comprehensive Reporting**: Laporan lengkap untuk analisis bisnis
4. **Automated Processes**: Minimal manual intervention
5. **Audit Trail**: Complete tracking untuk semua perubahan stok
6. **Scalable**: Mendukung 75 produk dan 140+ bahan baku
7. **Flexible**: Mendukung produk dengan komposisi kompleks (PG)

## Maintenance

1. **Regular Stock Take**: Verifikasi stok fisik vs sistem
2. **Price Updates**: Update harga bahan baku secara berkala
3. **Recipe Updates**: Update komposisi produk jika ada perubahan resep
4. **Performance Monitoring**: Monitor performa query dan optimasi jika diperlukan

Sistem ini memberikan visibilitas penuh terhadap operasional cafe dari sisi inventaris, keuangan, dan profitabilitas secara real-time.