
-- Recipe Management System Database Schema
-- Generated from Excel data analysis

-- IMPORTANT UNIT CONVERSION RULES:
-- For 'Air' (Water) materials:
-- - In recipes: Can be specified in either 'Gram' or 'ml'
-- - In inventory/stock: Always managed in 'ml' or 'L'
-- - Conversion rule: 1 Gram of water = 1 ml of water
-- - System must automatically convert water quantities when calculating stock requirements

-- Raw Materials Master
CREATE TABLE raw_materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20) NOT NULL,
  current_price DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(255),
  description TEXT,
  minimum_stock DECIMAL(10,3) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Categories
CREATE TABLE product_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('PG', 'LM', 'MC', 'CO', 'SC', 'NC') NOT NULL,
  description TEXT
);

-- Products/Menu Items
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id INT,
  hpp DECIMAL(10,2) DEFAULT 0, -- Harga Pokok Produksi
  additional_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL,
  margin DECIMAL(10,2) DEFAULT 0,
  margin_percent DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

-- Recipes (BOM - Bill of Materials)
CREATE TABLE recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  version VARCHAR(10) DEFAULT '1.0',
  total_cost DECIMAL(10,2) DEFAULT 0,
  yield_quantity DECIMAL(10,3) DEFAULT 1, -- How many portions this recipe makes
  preparation_time INT DEFAULT 0, -- in minutes
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Recipe Ingredients (BOM Details)
CREATE TABLE recipe_ingredients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  material_id INT,
  sub_recipe_id INT, -- For nested recipes (e.g., PG in other recipes)
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  FOREIGN KEY (material_id) REFERENCES raw_materials(id),
  FOREIGN KEY (sub_recipe_id) REFERENCES recipes(id)
);

-- Current Stock Levels
CREATE TABLE current_stock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id),
  UNIQUE KEY unique_material (material_id)
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL,
  transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  reference_type ENUM('PURCHASE', 'SALE', 'PRODUCTION', 'ADJUSTMENT', 'WASTE') NOT NULL,
  reference_id INT, -- Links to sales, purchases, etc.
  notes TEXT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  order_date DATE NOT NULL,
  delivery_date DATE,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('PENDING', 'RECEIVED', 'CANCELLED') DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Details
CREATE TABLE purchase_order_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  po_id INT NOT NULL,
  material_id INT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  received_quantity DECIMAL(10,3) DEFAULT 0,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- Sales Transactions
CREATE TABLE sales_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  customer_id INT,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'TRANSFER', 'QRIS') NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
  cashier_id INT,
  notes TEXT
);

-- Sales Transaction Details
CREATE TABLE sales_transaction_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  cost_of_goods DECIMAL(10,2) DEFAULT 0, -- Calculated from recipe
  profit DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (transaction_id) REFERENCES sales_transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Stock Alerts
CREATE TABLE stock_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL,
  alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED') NOT NULL,
  current_quantity DECIMAL(10,3),
  minimum_quantity DECIMAL(10,3),
  alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- Unit Conversion Rules Table
CREATE TABLE unit_conversions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_name VARCHAR(255) NOT NULL,
  from_unit VARCHAR(20) NOT NULL,
  to_unit VARCHAR(20) NOT NULL,
  conversion_factor DECIMAL(10,6) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert water conversion rules and other common ingredient conversions
-- Recipe vs Inventory unit conversions for common ingredients
INSERT INTO unit_conversions (material_name, from_unit, to_unit, conversion_factor, notes) VALUES
-- Water conversions
('Air', 'Gram', 'ml', 1.000000, 'Water density: 1 gram = 1 milliliter'),
('Air', 'ml', 'Gram', 1.000000, 'Water density: 1 milliliter = 1 gram'),

-- Sosis conversions (Recipe: Pcs, Inventory: Pack)
-- Assuming 1 pack = 10 pcs (standard sausage pack)
('Sosis Sapi', 'Pcs', 'Pack', 0.1, 'Recipe uses pieces, inventory tracks packs (1 pack = 10 pcs)'),
('Sosis Sapi', 'Pack', 'Pcs', 10, 'Inventory to recipe conversion (1 pack = 10 pcs)'),

-- Coffee/Kopi conversions (Recipe: Gram, Inventory: Kg)
('Beans Geisha V60', 'Gram', 'Kg', 0.001, 'Recipe uses grams, inventory tracks kilograms'),
('Beans Geisha V60', 'Kg', 'Gram', 1000, 'Inventory to recipe conversion'),
('Beans Reguler V60', 'Gram', 'Kg', 0.001, 'Recipe uses grams, inventory tracks kilograms'),
('Beans Reguler V60', 'Kg', 'Gram', 1000, 'Inventory to recipe conversion'),
('Beans Seasonal V60', 'Gram', 'Kg', 0.001, 'Recipe uses grams, inventory tracks kilograms'),
('Beans Seasonal V60', 'Kg', 'Gram', 1000, 'Inventory to recipe conversion'),

-- Rice/Beras conversions (Recipe: Gram, Inventory: Kg)
('Beras', 'Gram', 'Kg', 0.001, 'Recipe uses grams, inventory tracks kilograms (bulk purchase)'),
('Beras', 'Kg', 'Gram', 1000, 'Inventory to recipe conversion'),

-- Other common bulk ingredients (Recipe: Gram, Inventory: Kg)
('Ayam Suwir Besar', 'Gram', 'Kg', 0.001, 'Recipe uses grams, inventory tracks kilograms'),
('Ayam Suwir Besar', 'Kg', 'Gram', 1000, 'Inventory to recipe conversion'),
('Ayam Suwir Kecil', 'Gram', 'Kg', 0.001, 'Recipe uses grams, inventory tracks kilograms'),
('Ayam Suwir Kecil', 'Kg', 'Gram', 1000, 'Inventory to recipe conversion'),
('Beef Slice', 'Gram', 'Kg', 0.001, 'Recipe uses grams, inventory tracks kilograms'),
('Beef Slice', 'Kg', 'Gram', 1000, 'Inventory to recipe conversion'),

-- Cheese conversions (Recipe: Pcs, Inventory: Pack)
-- Assuming 1 pack = 8 slices for cheese
('Cheddar Cheese', 'Pcs', 'Pack', 0.125, 'Recipe uses pieces, inventory tracks packs (1 pack = 8 slices)'),
('Cheddar Cheese', 'Pack', 'Pcs', 8, 'Inventory to recipe conversion (1 pack = 8 slices)'),
('Slice Cheese', 'Pcs', 'Pack', 0.125, 'Recipe uses pieces, inventory tracks packs (1 pack = 8 slices)'),
('Slice Cheese', 'Pack', 'Pcs', 8, 'Inventory to recipe conversion (1 pack = 8 slices)'),

-- Egg conversions (Recipe: Pcs, Inventory: Tray)
-- Assuming 1 tray = 30 eggs
('Telur Ayam', 'Pcs', 'Tray', 0.033333, 'Recipe uses pieces, inventory tracks trays (1 tray = 30 eggs)'),
('Telur Ayam', 'Tray', 'Pcs', 30, 'Inventory to recipe conversion (1 tray = 30 eggs)'),

-- Bread conversions (Recipe: Pcs, Inventory: Loaf)
-- Assuming 1 loaf = 12 slices
('Roti Tawar Tebal', 'Pcs', 'Loaf', 0.083333, 'Recipe uses pieces, inventory tracks loaves (1 loaf = 12 slices)'),
('Roti Tawar Tebal', 'Loaf', 'Pcs', 12, 'Inventory to recipe conversion (1 loaf = 12 slices)'),
('Roti Tawar Tipis', 'Pcs', 'Loaf', 0.083333, 'Recipe uses pieces, inventory tracks loaves (1 loaf = 12 slices)'),
('Roti Tawar Tipis', 'Loaf', 'Pcs', 12, 'Inventory to recipe conversion (1 loaf = 12 slices)');

-- View for normalized stock calculations (converts units for inventory management)
-- This view shows both original inventory units and recipe-compatible units
CREATE VIEW normalized_stock AS
SELECT 
  cs.id,
  cs.material_id,
  rm.code,
  rm.name,
  cs.quantity as original_quantity,
  cs.unit as original_unit,
  CASE 
    WHEN rm.name = 'Air' AND cs.unit = 'Gram' THEN 
      cs.quantity * uc.conversion_factor
    ELSE cs.quantity
  END as normalized_quantity,
  CASE 
    WHEN rm.name = 'Air' AND cs.unit = 'Gram' THEN 'ml'
    ELSE cs.unit
  END as normalized_unit,
  cs.last_updated
FROM current_stock cs
JOIN raw_materials rm ON cs.material_id = rm.id
LEFT JOIN unit_conversions uc ON rm.name = uc.material_name 
  AND cs.unit = uc.from_unit 
  AND uc.to_unit = 'ml';

-- View for inventory stock with recipe unit conversions
-- This view converts inventory units to recipe units for calculation purposes
CREATE VIEW inventory_to_recipe_view AS
SELECT 
  cs.id,
  cs.material_id,
  rm.code,
  rm.name,
  cs.quantity as inventory_quantity,
  cs.unit as inventory_unit,
  COALESCE(
    cs.quantity * uc.conversion_factor,
    cs.quantity
  ) as recipe_equivalent_quantity,
  COALESCE(
    uc.to_unit,
    cs.unit
  ) as recipe_equivalent_unit,
  cs.last_updated
FROM current_stock cs
JOIN raw_materials rm ON cs.material_id = rm.id
LEFT JOIN unit_conversions uc ON rm.name = uc.material_name 
  AND cs.unit = uc.from_unit 
  AND uc.to_unit IN ('Pcs', 'Gram', 'ml');

-- View for recipe ingredient requirements with unit conversion
-- This view normalizes recipe units to match inventory units for stock calculations
CREATE VIEW recipe_requirements_normalized AS
SELECT 
  ri.id,
  ri.recipe_id,
  ri.material_id,
  rm.code,
  rm.name,
  ri.quantity as original_quantity,
  ri.unit as original_unit,
  COALESCE(
    ri.quantity * uc.conversion_factor,
    ri.quantity
  ) as normalized_quantity,
  COALESCE(
    uc.to_unit,
    ri.unit
  ) as normalized_unit,
  ri.unit_cost,
  ri.total_cost
FROM recipe_ingredients ri
JOIN raw_materials rm ON ri.material_id = rm.id
LEFT JOIN unit_conversions uc ON rm.name = uc.material_name 
  AND ri.unit = uc.from_unit 
  AND uc.to_unit IN ('Pack', 'Kg', 'Tray', 'Loaf', 'ml');

-- Table for tracking inventory movements with proper unit handling
CREATE TABLE inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reference_type VARCHAR(20) NOT NULL, -- 'PURCHASE', 'SALE', 'ADJUSTMENT', 'PRODUCTION'
    reference_id INTEGER, -- ID of purchase order, sale transaction, etc.
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- Table for daily inventory calculations
CREATE TABLE daily_inventory_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    date DATE NOT NULL,
    opening_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    stock_in DECIMAL(10,3) NOT NULL DEFAULT 0,
    stock_out DECIMAL(10,3) NOT NULL DEFAULT 0,
    closing_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    UNIQUE(material_id, date)
);

-- View for daily stock movements with unit conversions
CREATE VIEW daily_stock_movements AS
SELECT 
    rm.code,
    rm.name as material_name,
    im.movement_type,
    im.quantity as original_quantity,
    im.unit as original_unit,
    CASE 
        WHEN im.movement_type = 'IN' THEN
            COALESCE(im.quantity * uc_in.conversion_factor, im.quantity)
        ELSE im.quantity
    END as normalized_quantity,
    CASE 
        WHEN im.movement_type = 'IN' THEN
            COALESCE(uc_in.to_unit, im.unit)
        ELSE im.unit
    END as normalized_unit,
    im.reference_type,
    im.reference_id,
    DATE(im.created_at) as movement_date,
    im.created_at
FROM inventory_movements im
JOIN raw_materials rm ON im.material_id = rm.id
LEFT JOIN unit_conversions uc_in ON rm.name = uc_in.material_name 
    AND im.unit = uc_in.from_unit 
    AND im.movement_type = 'IN'
    AND uc_in.to_unit IN ('Pcs', 'Gram', 'ml')
ORDER BY im.created_at DESC;

-- Indexes for better performance
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_sales_transactions_date ON sales_transactions(transaction_date);
CREATE INDEX idx_stock_alerts_unresolved ON stock_alerts(is_resolved, alert_date);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_current_stock_material ON current_stock(material_id);
CREATE INDEX idx_unit_conversions_material ON unit_conversions(material_name, from_unit, to_unit);
CREATE INDEX idx_inventory_movements_material_date ON inventory_movements(material_id, created_at);
CREATE INDEX idx_daily_inventory_material_date ON daily_inventory_summary(material_id, date);
