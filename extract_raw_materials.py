#!/usr/bin/env python3
import csv
import sqlite3
import sys
from collections import defaultdict

def extract_raw_materials_from_csv(csv_files):
    """Extract unique raw materials from CSV files"""
    raw_materials = {}
    
    for csv_file in csv_files:
        print(f"Processing {csv_file}...")
        
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file, delimiter=';')
            
            # Skip header lines
            next(csv_reader)  # Skip title
            next(csv_reader)  # Skip column headers
            
            for row in csv_reader:
                if len(row) >= 4 and row[1].strip():  # Has ingredient name
                    ingredient_name = row[1].strip()
                    quantity = row[2].strip() if row[2].strip() else '0'
                    unit = row[3].strip() if row[3].strip() else 'Gram'
                    
                    # Skip empty rows or separator rows
                    if not ingredient_name or ingredient_name == ';;':
                        continue
                    
                    # Store unique materials with their units
                    if ingredient_name not in raw_materials:
                        raw_materials[ingredient_name] = unit
                    
    return raw_materials

def import_raw_materials_to_db(db_path, raw_materials):
    """Import raw materials to database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Clear existing raw materials
        cursor.execute("DELETE FROM raw_materials")
        
        counter = 1
        for material_name, unit in sorted(raw_materials.items()):
            # Generate code
            code = f"RM.{counter:04d}"
            
            # Insert raw material
            cursor.execute("""
                INSERT INTO raw_materials (code, name, unit, created_at, updated_at)
                VALUES (?, ?, ?, datetime('now'), datetime('now'))
            """, (code, material_name, unit))
            
            print(f"Inserted: {code} - {material_name} ({unit})")
            counter += 1
        
        conn.commit()
        print(f"\nTotal raw materials imported: {len(raw_materials)}")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    csv_files = [
        "/Users/dedepermana/Downloads/PancongKeceApp-Deploy/Data produk-resep-penjualan/PG-Tabel PG.csv",
        "/Users/dedepermana/Downloads/PancongKeceApp-Deploy/Data produk-resep-penjualan/Resep Kopi-Resep Coffee.csv",
        "/Users/dedepermana/Downloads/PancongKeceApp-Deploy/Data produk-resep-penjualan/Resep Non Kopi-Resep Non Coffee.csv",
        "/Users/dedepermana/Downloads/PancongKeceApp-Deploy/Data produk-resep-penjualan/Resep Makanan-Resep Makanan.csv"
    ]
    
    db_path = "/Users/dedepermana/Downloads/PancongKeceApp-Deploy/backend/database/sajati_smart_system.db"
    
    # Extract raw materials from CSV files
    raw_materials = extract_raw_materials_from_csv(csv_files)
    
    print(f"Found {len(raw_materials)} unique raw materials")
    
    # Import to database
    import_raw_materials_to_db(db_path, raw_materials)