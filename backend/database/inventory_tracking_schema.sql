-- =====================================================
-- SKEMA RELASIONAL UNTUK SISTEM PELACAKAN INVENTARIS
-- Sajati Smart System - Inventory Tracking Schema
-- =====================================================

-- Tabel untuk menyimpan komposisi bahan baku produk
-- Menggabungkan bahan baku langsung dan dari PG (Produk Gabungan)
CREATE TABLE IF NOT EXISTS product_compositions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id VARCHAR(36) NOT NULL,
  raw_material_id INTEGER,
  pg_product_id VARCHAR(36), -- Referensi ke produk PG
  quantity_per_portion DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id),
  FOREIGN KEY (pg_product_id) REFERENCES products(id)
);

-- Tabel untuk menyimpan komposisi PG (Produk Gabungan)
-- Berisi bahan baku yang digunakan untuk membuat 1 batch PG
CREATE TABLE IF NOT EXISTS pg_compositions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pg_product_id VARCHAR(36) NOT NULL,
  raw_material_id INTEGER NOT NULL,
  quantity_per_batch DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  batch_yield DECIMAL(10,3) DEFAULT 1, -- Berapa porsi yang dihasilkan per batch
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pg_product_id) REFERENCES products(id),
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);

-- Tabel untuk menyimpan stok bahan baku saat ini
CREATE TABLE IF NOT EXISTS raw_material_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_material_id INTEGER NOT NULL UNIQUE,
  current_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  minimum_stock DECIMAL(10,3) DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);

-- Tabel untuk mencatat pergerakan stok (masuk/keluar)
CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_material_id INTEGER NOT NULL,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'PRODUCTION')),
  reference_id VARCHAR(36), -- ID transaksi atau referensi lainnya
  transaction_item_id VARCHAR(36), -- Referensi ke transaction_items
  product_sold_id VARCHAR(36), -- ID produk yang terjual (untuk tracking)
  quantity_sold INTEGER DEFAULT 0, -- Jumlah produk yang terjual
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);

-- Tabel untuk menyimpan ringkasan harian inventaris
CREATE TABLE IF NOT EXISTS daily_inventory_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  raw_material_id INTEGER NOT NULL,
  opening_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
  stock_in DECIMAL(10,3) NOT NULL DEFAULT 0,
  stock_out DECIMAL(10,3) NOT NULL DEFAULT 0,
  closing_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  total_cost_in DECIMAL(12,2) DEFAULT 0,
  total_cost_out DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id),
  UNIQUE(date, raw_material_id)
);

-- Tabel untuk menyimpan ringkasan harian penjualan dan profit
CREATE TABLE IF NOT EXISTS daily_sales_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  total_transactions INTEGER DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  gross_revenue DECIMAL(12,2) DEFAULT 0, -- Total penjualan sebelum pajak dan diskon
  total_tax DECIMAL(12,2) DEFAULT 0,
  total_discount DECIMAL(12,2) DEFAULT 0,
  net_revenue DECIMAL(12,2) DEFAULT 0, -- Setelah pajak dan diskon
  total_cogs DECIMAL(12,2) DEFAULT 0, -- Cost of Goods Sold
  gross_profit DECIMAL(12,2) DEFAULT 0, -- Net Revenue - COGS
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan detail penjualan per produk harian
CREATE TABLE IF NOT EXISTS daily_product_sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit_cogs DECIMAL(10,2) DEFAULT 0, -- Cost per unit
  total_cogs DECIMAL(12,2) DEFAULT 0, -- Total cost
  unit_profit DECIMAL(10,2) DEFAULT 0,
  total_profit DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(date, product_id)
);

-- =====================================================
-- VIEWS UNTUK ANALISIS DAN REPORTING
-- =====================================================

-- View untuk melihat komposisi lengkap produk (termasuk dari PG)
CREATE VIEW IF NOT EXISTS product_full_composition AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.sku,
  rm.id as raw_material_id,
  rm.name as raw_material_name,
  rm.unit as rm_unit,
  CASE 
    WHEN pc.raw_material_id IS NOT NULL THEN pc.quantity_per_portion
    WHEN pc.pg_product_id IS NOT NULL THEN 
      (pgc.quantity_per_batch / pgc.batch_yield) * pc.quantity_per_portion
  END as quantity_needed_per_portion,
  CASE 
    WHEN pc.raw_material_id IS NOT NULL THEN pc.unit
    WHEN pc.pg_product_id IS NOT NULL THEN pgc.unit
  END as unit,
  CASE 
    WHEN pc.raw_material_id IS NOT NULL THEN 'DIRECT'
    WHEN pc.pg_product_id IS NOT NULL THEN 'FROM_PG'
  END as source_type,
  CASE 
    WHEN pc.pg_product_id IS NOT NULL THEN pg.name
    ELSE NULL
  END as pg_name
FROM products p
JOIN product_compositions pc ON p.id = pc.product_id
LEFT JOIN raw_materials rm ON pc.raw_material_id = rm.id
LEFT JOIN products pg ON pc.pg_product_id = pg.id
LEFT JOIN pg_compositions pgc ON pc.pg_product_id = pgc.pg_product_id AND pc.raw_material_id = pgc.raw_material_id
LEFT JOIN raw_materials rm2 ON pgc.raw_material_id = rm2.id
WHERE rm.id IS NOT NULL OR rm2.id IS NOT NULL;

-- View untuk melihat stok saat ini dengan status
CREATE VIEW IF NOT EXISTS current_stock_status AS
SELECT 
  rms.raw_material_id,
  rm.code,
  rm.name,
  rms.current_quantity,
  rms.unit,
  rms.minimum_stock,
  CASE 
    WHEN rms.current_quantity <= 0 THEN 'OUT_OF_STOCK'
    WHEN rms.current_quantity <= rms.minimum_stock THEN 'LOW_STOCK'
    ELSE 'NORMAL'
  END as stock_status,
  rms.last_updated
FROM raw_material_stock rms
JOIN raw_materials rm ON rms.raw_material_id = rm.id;

-- View untuk analisis penjualan harian
CREATE VIEW IF NOT EXISTS daily_sales_analysis AS
SELECT 
  dss.date,
  dss.total_transactions,
  dss.total_items_sold,
  dss.gross_revenue,
  dss.total_tax,
  dss.total_discount,
  dss.net_revenue,
  dss.total_cogs,
  dss.gross_profit,
  CASE 
    WHEN dss.net_revenue > 0 THEN (dss.gross_profit / dss.net_revenue) * 100
    ELSE 0
  END as profit_margin_percent,
  CASE 
    WHEN dss.total_items_sold > 0 THEN dss.net_revenue / dss.total_items_sold
    ELSE 0
  END as average_transaction_value
FROM daily_sales_summary dss;

-- =====================================================
-- FUNCTIONS UNTUK PERHITUNGAN OTOMATIS
-- =====================================================

-- Function untuk menghitung COGS produk
CREATE VIEW IF NOT EXISTS product_cogs_calculation AS
SELECT 
  pfc.product_id,
  pfc.product_name,
  SUM(pfc.quantity_needed_per_portion * rm.current_price) as total_cogs_per_portion
FROM product_full_composition pfc
JOIN raw_materials rm ON pfc.raw_material_id = rm.id
GROUP BY pfc.product_id, pfc.product_name;

-- =====================================================
-- TRIGGERS UNTUK AUTOMASI STOK
-- =====================================================

-- Trigger untuk otomatis mengurangi stok ketika ada penjualan
CREATE TRIGGER IF NOT EXISTS auto_reduce_stock_on_sale
AFTER INSERT ON transaction_items
FOR EACH ROW
BEGIN
  -- Insert stock movements untuk setiap bahan baku yang digunakan
  INSERT INTO stock_movements (
    raw_material_id,
    movement_type,
    quantity,
    unit,
    reference_type,
    reference_id,
    transaction_item_id,
    product_sold_id,
    quantity_sold,
    cost_per_unit,
    total_cost,
    notes
  )
  SELECT 
    pfc.raw_material_id,
    'OUT',
    pfc.quantity_needed_per_portion * NEW.quantity,
    pfc.unit,
    'SALE',
    NEW.transaction_id,
    NEW.id,
    NEW.product_id,
    NEW.quantity,
    rm.current_price,
    (pfc.quantity_needed_per_portion * NEW.quantity) * rm.current_price,
    'Auto deduction from sale: ' || pfc.product_name || ' x' || NEW.quantity
  FROM product_full_composition pfc
  JOIN raw_materials rm ON pfc.raw_material_id = rm.id
  WHERE pfc.product_id = NEW.product_id;
  
  -- Update current stock
  UPDATE raw_material_stock 
  SET 
    current_quantity = current_quantity - (
      SELECT COALESCE(SUM(pfc.quantity_needed_per_portion * NEW.quantity), 0)
      FROM product_full_composition pfc
      WHERE pfc.raw_material_id = raw_material_stock.raw_material_id
        AND pfc.product_id = NEW.product_id
    ),
    last_updated = CURRENT_TIMESTAMP
  WHERE raw_material_id IN (
    SELECT pfc.raw_material_id
    FROM product_full_composition pfc
    WHERE pfc.product_id = NEW.product_id
  );
END;

-- Trigger untuk update daily sales summary
CREATE TRIGGER IF NOT EXISTS update_daily_sales_summary
AFTER INSERT ON transaction_items
FOR EACH ROW
BEGIN
  INSERT OR REPLACE INTO daily_sales_summary (
    date,
    total_transactions,
    total_items_sold,
    gross_revenue,
    total_tax,
    total_discount,
    net_revenue,
    total_cogs,
    gross_profit
  )
  SELECT 
    DATE(t.transaction_date),
    COUNT(DISTINCT t.id),
    COALESCE(SUM(ti.quantity), 0),
    COALESCE(SUM(t.total_amount), 0),
    COALESCE(SUM(t.tax_amount), 0),
    COALESCE(SUM(t.discount_amount), 0),
    COALESCE(SUM(t.final_amount), 0),
    COALESCE(SUM(ti.quantity * pcc.total_cogs_per_portion), 0),
    COALESCE(SUM(t.final_amount), 0) - COALESCE(SUM(ti.quantity * pcc.total_cogs_per_portion), 0)
  FROM transactions t
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN product_cogs_calculation pcc ON ti.product_id = pcc.product_id
  WHERE DATE(t.transaction_date) = DATE((SELECT transaction_date FROM transactions WHERE id = NEW.transaction_id));
END;

-- Trigger untuk update daily product sales
CREATE TRIGGER IF NOT EXISTS update_daily_product_sales
AFTER INSERT ON transaction_items
FOR EACH ROW
BEGIN
  INSERT OR REPLACE INTO daily_product_sales (
    date,
    product_id,
    product_name,
    quantity_sold,
    unit_price,
    total_revenue,
    unit_cogs,
    total_cogs,
    unit_profit,
    total_profit
  )
  SELECT 
    DATE(t.transaction_date),
    NEW.product_id,
    NEW.product_name,
    COALESCE(SUM(ti.quantity), 0),
    NEW.unit_price,
    COALESCE(SUM(ti.subtotal), 0),
    COALESCE(pcc.total_cogs_per_portion, 0),
    COALESCE(SUM(ti.quantity), 0) * COALESCE(pcc.total_cogs_per_portion, 0),
    NEW.unit_price - COALESCE(pcc.total_cogs_per_portion, 0),
    COALESCE(SUM(ti.subtotal), 0) - (COALESCE(SUM(ti.quantity), 0) * COALESCE(pcc.total_cogs_per_portion, 0))
  FROM transactions t
  JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN product_cogs_calculation pcc ON ti.product_id = pcc.product_id
  WHERE ti.product_id = NEW.product_id
    AND DATE(t.transaction_date) = DATE((SELECT transaction_date FROM transactions WHERE id = NEW.transaction_id));
END;

-- =====================================================
-- TABEL TRANSAKSI YANG HILANG
-- =====================================================

-- Tabel untuk menyimpan transaksi penjualan
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  transaction_number VARCHAR(255) UNIQUE NOT NULL,
  transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,
  payment_method_id INTEGER,
  total_amount INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  service_amount INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  discount_details TEXT,
  rounding_amount INTEGER DEFAULT 0,
  final_amount INTEGER NOT NULL DEFAULT 0,
  paid_amount INTEGER DEFAULT 0,
  change_amount INTEGER DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  customer_name VARCHAR(255),
  receipt_printed BOOLEAN DEFAULT FALSE,
  customer_id TEXT,
  loyalty_points_earned INTEGER DEFAULT 0,
  loyalty_points_redeemed INTEGER DEFAULT 0,
  promotion_applied TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan item dalam transaksi
CREATE TABLE IF NOT EXISTS transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  notes TEXT,
  product_name VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- =====================================================
-- INDEXES UNTUK PERFORMA
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_product_compositions_product ON product_compositions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_compositions_material ON product_compositions(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_pg_compositions_pg ON pg_compositions(pg_product_id);
CREATE INDEX IF NOT EXISTS idx_pg_compositions_material ON pg_compositions(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_material_date ON stock_movements(raw_material_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_daily_inventory_date_material ON daily_inventory_summary(date, raw_material_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales_summary(date);
CREATE INDEX IF NOT EXISTS idx_daily_product_sales_date_product ON daily_product_sales(date, product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);

-- =====================================================
-- SAMPLE DATA UNTUK TESTING
-- =====================================================

-- Contoh data raw materials (sesuai dengan data CSV)
INSERT OR IGNORE INTO raw_materials (id, code, name, category, unit, current_price, minimum_stock) VALUES
(1, 'RM001', 'Air', 'Liquid', 'ml', 0.01, 5000),
(2, 'RM002', 'Beras', 'Grain', 'Gram', 0.015, 2000),
(3, 'RM003', 'Kailan', 'Vegetable', 'Gram', 0.05, 500),
(4, 'RM004', 'Beef Slice', 'Meat', 'Gram', 0.15, 1000),
(5, 'RM005', 'Bawang Merah', 'Spice', 'Gram', 0.03, 200);

-- Contoh initial stock
INSERT OR IGNORE INTO raw_material_stock (raw_material_id, current_quantity, unit, minimum_stock) VALUES
(1, 10000, 'ml', 5000),
(2, 5000, 'Gram', 2000),
(3, 2000, 'Gram', 500),
(4, 3000, 'Gram', 1000),
(5, 1000, 'Gram', 200);

-- Contoh komposisi PG Kailan Crispy (sesuai data CSV)
-- Asumsi PG Kailan Crispy memiliki product_id tertentu
INSERT OR IGNORE INTO pg_compositions (pg_product_id, raw_material_id, quantity_per_batch, unit, batch_yield) VALUES
('pg-kailan-crispy-id', 3, 100, 'Gram', 10), -- 100g kailan untuk 10 porsi
('pg-kailan-crispy-id', 1, 40, 'ml', 10),     -- 40ml air untuk 10 porsi
('pg-kailan-crispy-id', 5, 20, 'Gram', 10);   -- 20g bawang merah untuk 10 porsi

-- Contoh komposisi produk Nasi Oseng Sapi (sesuai data CSV)
INSERT OR IGNORE INTO product_compositions (product_id, raw_material_id, quantity_per_portion, unit) VALUES
('nasi-oseng-sapi-id', 2, 150, 'Gram'),  -- 150g beras per porsi
('nasi-oseng-sapi-id', 4, 80, 'Gram');   -- 80g beef slice per porsi

-- Komposisi PG dalam produk
INSERT OR IGNORE INTO product_compositions (product_id, pg_product_id, quantity_per_portion, unit) VALUES
('nasi-oseng-sapi-id', 'pg-kailan-crispy-id', 1, 'Porsi'); -- 1 porsi kailan crispy

COMMIT;