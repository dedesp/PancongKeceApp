-- Recipe Management System Data Import
-- Generated from Excel data

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE recipe_ingredients;
TRUNCATE TABLE recipes;
TRUNCATE TABLE current_stock;
TRUNCATE TABLE products;
TRUNCATE TABLE raw_materials;
TRUNCATE TABLE product_categories;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert product categories
INSERT INTO product_categories (name, type, description) VALUES ('Light Meal', 'LM', 'Light Meal products');
INSERT INTO product_categories (name, type, description) VALUES ('Main Course', 'MC', 'Main Course products');
INSERT INTO product_categories (name, type, description) VALUES ('Coffee', 'CO', 'Coffee products');
INSERT INTO product_categories (name, type, description) VALUES ('Non-Coffee', 'NC', 'Non-Coffee products');
INSERT INTO product_categories (name, type, description) VALUES ('Paste/Garnish', 'PG', 'Paste/Garnish products');

-- Insert raw materials
