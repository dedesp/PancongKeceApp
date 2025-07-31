# Unit Conversion System Guide

## Overview
Sistem konversi unit telah diimplementasikan dalam database Sajati Smart System untuk menangani konversi otomatis, khususnya untuk air (Air) dari gram ke mililiter.

## Database Schema

### Tabel `unit_conversions`
Tabel ini menyimpan aturan konversi unit:
```sql
CREATE TABLE unit_conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_name TEXT NOT NULL,
    from_unit TEXT NOT NULL,
    to_unit TEXT NOT NULL,
    conversion_factor REAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### View `normalized_stock`
View ini secara otomatis mengkonversi unit air dari Gram ke ml:
```sql
CREATE VIEW normalized_stock AS
SELECT 
    cs.id,
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
```

### View `recipe_requirements_normalized`
View ini mengkonversi unit air dalam resep:
```sql
CREATE VIEW recipe_requirements_normalized AS
SELECT 
    ri.id,
    ri.recipe_id,
    rm.code,
    rm.name as material_name,
    ri.quantity as original_quantity,
    ri.unit as original_unit,
    CASE 
        WHEN rm.name = 'Air' AND ri.unit = 'Gram' THEN 
            ri.quantity * uc.conversion_factor
        ELSE ri.quantity
    END as normalized_quantity,
    CASE 
        WHEN rm.name = 'Air' AND ri.unit = 'Gram' THEN 'ml'
        ELSE ri.unit
    END as normalized_unit
FROM recipe_ingredients ri
JOIN raw_materials rm ON ri.material_id = rm.id
LEFT JOIN unit_conversions uc ON rm.name = uc.material_name 
    AND ri.unit = uc.from_unit 
    AND uc.to_unit = 'ml';
```

## Aturan Konversi Air

### Prinsip Dasar
- **1 Gram Air = 1 Mililiter (ml)**
- Dalam resep: Air bisa menggunakan satuan Gram atau ml
- Dalam inventaris: Air selalu dikelola dalam ml atau Liter
- Konversi dilakukan secara otomatis oleh sistem

### Data Konversi
```sql
INSERT INTO unit_conversions (material_name, from_unit, to_unit, conversion_factor, notes) VALUES
('Air', 'Gram', 'ml', 1, 'Water density: 1 gram = 1 milliliter'),
('Air', 'ml', 'Gram', 1, 'Water density: 1 milliliter = 1 gram');
```

## Penggunaan dalam Aplikasi

### 1. Menggunakan UnitConverter Class
```javascript
const UnitConverter = require('./utils/unitConverter');
const converter = new UnitConverter(db);

// Konversi manual
const convertedQuantity = converter.convert('Air', 500, 'Gram', 'ml');
console.log(convertedQuantity); // Output: 500

// Normalisasi unit air
const normalized = converter.normalizeWaterUnit('Air', 1000, 'Gram');
console.log(normalized); // Output: {quantity: 1000, unit: 'ml'}
```

### 2. Query Stok Ternormalisasi
```sql
-- Melihat stok dengan unit yang sudah dinormalisasi
SELECT code, name, original_quantity, original_unit, 
       normalized_quantity, normalized_unit 
FROM normalized_stock 
WHERE name = 'Air';
```

### 3. Query Kebutuhan Resep Ternormalisasi
```sql
-- Melihat kebutuhan bahan dalam resep dengan unit ternormalisasi
SELECT material_name, original_quantity, original_unit,
       normalized_quantity, normalized_unit
FROM recipe_requirements_normalized
WHERE recipe_id = 1 AND material_name = 'Air';
```

## Contoh Implementasi

### Menghitung Kebutuhan Air Total
```javascript
async function calculateTotalWaterRequirement(recipeId) {
    const query = `
        SELECT normalized_quantity 
        FROM recipe_requirements_normalized 
        WHERE recipe_id = ? AND material_name = 'Air'
    `;
    
    const result = await db.get(query, [recipeId]);
    return result ? result.normalized_quantity : 0;
}
```

### Cek Ketersediaan Stok Air
```javascript
async function checkWaterStock() {
    const query = `
        SELECT normalized_quantity, normalized_unit 
        FROM normalized_stock 
        WHERE name = 'Air'
    `;
    
    const stock = await db.get(query);
    return stock;
}
```

## Best Practices

1. **Selalu gunakan view ternormalisasi** untuk perhitungan inventaris
2. **Jangan hardcode konversi** dalam kode aplikasi, gunakan tabel `unit_conversions`
3. **Validasi unit** sebelum melakukan operasi inventaris
4. **Log konversi** untuk audit trail
5. **Update conversion rules** melalui database, bukan kode

## Troubleshooting

### Masalah Umum
1. **Unit tidak terkonversi**: Pastikan data ada di tabel `unit_conversions`
2. **Hasil konversi salah**: Periksa `conversion_factor` di database
3. **View tidak menampilkan data**: Pastikan JOIN dengan tabel terkait benar

### Debug Query
```sql
-- Cek aturan konversi
SELECT * FROM unit_conversions WHERE material_name = 'Air';

-- Test konversi manual
SELECT 
    1000 as original_gram,
    1000 * uc.conversion_factor as converted_ml
FROM unit_conversions uc 
WHERE material_name = 'Air' AND from_unit = 'Gram' AND to_unit = 'ml';
```

## Kesimpulan

Sistem konversi unit telah terintegrasi penuh dalam database dan menyediakan:
- Konversi otomatis air dari Gram ke ml
- View ternormalisasi untuk stok dan resep
- Utility class untuk penggunaan dalam aplikasi
- Fleksibilitas untuk menambah aturan konversi baru

Sistem ini memastikan konsistensi data inventaris dan mencegah error akibat perbedaan unit antara resep dan stok.