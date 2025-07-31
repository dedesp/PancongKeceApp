# Recipe Management System API Documentation

## Overview
Sistem Recipe Management untuk Sajati Cafe yang mengelola resep, inventori, dan kalkulasi biaya secara real-time.

## Features
- ✅ Manajemen resep dengan Bill of Materials (BOM)
- ✅ Auto stock deduction saat penjualan
- ✅ Real-time inventory tracking
- ✅ Cost calculation dan profit analysis
- ✅ Stock alerts dan notifications
- ✅ Comprehensive reporting

## Base URL
```
http://localhost:3000/api/recipe-management
```

## Authentication
Semua endpoint memerlukan authentication token di header:
```
Authorization: Bearer <token>
```

---

## Product Management

### Get All Products
```http
GET /products
```

**Query Parameters:**
- `category` (string): Filter by category (PG, LM, MC, CO, NC)
- `search` (string): Search by name or SKU
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sku": "LM.0001",
      "name": "Baso Goreng Sajati",
      "sellingPrice": 15000,
      "costPrice": 8500,
      "marginPercent": 43.33,
      "category": {
        "type": "LM",
        "name": "Light Meal"
      },
      "recipes": [
        {
          "id": 1,
          "name": "Baso Goreng Sajati",
          "totalCost": 8500,
          "ingredients": [...]
        }
      ]
    }
  ],
  "pagination": {
    "total": 54,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Get Product Detail
```http
GET /products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "LM.0001",
    "name": "Baso Goreng Sajati",
    "sellingPrice": 15000,
    "costPrice": 8500,
    "marginPercent": 43.33,
    "costBreakdown": {
      "totalCost": 8500,
      "breakdown": [
        {
          "type": "material",
          "name": "Baso Goreng",
          "quantity": 5,
          "unit": "pcs",
          "unitCost": 1000,
          "totalCost": 5000
        },
        {
          "type": "subRecipe",
          "name": "Bumbu Sajati",
          "quantity": 1,
          "unit": "porsi",
          "unitCost": 3500,
          "totalCost": 3500,
          "subBreakdown": [...]
        }
      ]
    }
  }
}
```

---

## Recipe Management

### Get All Recipes
```http
GET /recipes
```

**Query Parameters:**
- `category` (string): Filter by category
- `search` (string): Search by product name
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Baso Goreng Sajati",
      "category": "LM",
      "yield": 1,
      "totalCost": 8500,
      "product": {
        "id": 1,
        "name": "Baso Goreng Sajati",
        "sku": "LM.0001"
      },
      "ingredients": [
        {
          "id": 1,
          "quantity": 5,
          "unit": "pcs",
          "unitCost": 1000,
          "totalCost": 5000,
          "material": {
            "id": 1,
            "name": "Baso Goreng",
            "code": "BG001",
            "category": "MEAT"
          }
        }
      ]
    }
  ]
}
```

---

## Inventory Management

### Get Current Stock
```http
GET /inventory/stock
```

**Query Parameters:**
- `category` (string): Filter by material category
- `lowStock` (boolean): Show only low stock items
- `search` (string): Search by material name or code
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "materialId": 1,
      "quantity": 500,
      "unit": "gram",
      "lastUpdated": "2025-01-23T15:30:00.000Z",
      "material": {
        "id": 1,
        "name": "Tepung Tapioka",
        "code": "TP001",
        "category": "FLOUR",
        "minimumStock": 100,
        "alerts": [
          {
            "id": 1,
            "alertType": "LOW_STOCK",
            "currentQuantity": 500,
            "minimumQuantity": 1000,
            "alertDate": "2025-01-23T15:30:00.000Z",
            "isResolved": false
          }
        ]
      }
    }
  ]
}
```

### Get Stock Alerts
```http
GET /inventory/alerts
```

**Query Parameters:**
- `type` (string): Alert type (LOW_STOCK, OUT_OF_STOCK)
- `resolved` (boolean): Show resolved alerts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "materialId": 1,
      "alertType": "LOW_STOCK",
      "currentQuantity": 50,
      "minimumQuantity": 100,
      "alertDate": "2025-01-23T15:30:00.000Z",
      "isResolved": false,
      "material": {
        "id": 1,
        "name": "Tepung Tapioka",
        "code": "TP001",
        "currentStock": {
          "quantity": 50,
          "unit": "gram"
        }
      }
    }
  ]
}
```

---

## Sales Processing

### Process Sale
```http
POST /sales/process
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 15000
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 25000
    }
  ],
  "customerId": "cus123",
  "paymentMethod": "CASH",
  "cashierId": "user123",
  "notes": "Pesanan meja 5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sale processed successfully",
  "data": {
    "transaction": {
      "id": 1,
      "transactionNumber": "TRX202501230001",
      "totalAmount": 55000,
      "paymentMethod": "CASH",
      "transactionDate": "2025-01-23T15:30:00.000Z"
    },
    "details": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "unitPrice": 15000,
        "totalPrice": 30000,
        "costOfGoods": 17000,
        "profit": 13000
      }
    ],
    "inventoryUpdates": 15
  }
}
```

---

## Reporting

### Daily Stock Usage Report
```http
GET /reports/daily-stock-usage
```

**Query Parameters:**
- `date` (string): Date in YYYY-MM-DD format (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-01-23",
    "summary": {
      "totalMaterials": 25,
      "totalTransactions": 150,
      "totalCost": 850000
    },
    "usageByMaterial": [
      {
        "material": {
          "id": 1,
          "name": "Tepung Tapioka",
          "code": "TP001"
        },
        "totalQuantity": 2500,
        "totalCost": 125000,
        "transactions": [...]
      }
    ]
  }
}
```

### Cost vs Revenue Analysis
```http
GET /reports/cost-revenue-analysis
```

**Query Parameters:**
- `startDate` (string): Start date (default: 30 days ago)
- `endDate` (string): End date (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-12-24",
      "endDate": "2025-01-23"
    },
    "analysis": {
      "totalRevenue": 15000000,
      "totalCost": 8500000,
      "totalProfit": 6500000,
      "profitMargin": 43.33,
      "byCategory": {
        "Light Meal": {
          "revenue": 5000000,
          "cost": 2800000,
          "profit": 2200000,
          "margin": 44.0
        }
      },
      "byProduct": {
        "Baso Goreng Sajati": {
          "revenue": 450000,
          "cost": 255000,
          "profit": 195000,
          "quantity": 30,
          "margin": 43.33
        }
      }
    }
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Business Logic Features

### Auto Stock Deduction
Ketika penjualan diproses:
1. Sistem menghitung bahan baku yang dibutuhkan berdasarkan resep
2. Mengecek ketersediaan stock
3. Mengurangi stock secara otomatis
4. Mencatat transaksi inventory
5. Membuat alert jika stock menipis

### Cost Calculation
- Menghitung cost per produk berdasarkan resep
- Mendukung sub-recipe (resep dalam resep)
- Real-time cost update saat harga bahan berubah
- Profit margin calculation

### Stock Alerts
- Low stock notification
- Out of stock notification
- Automatic alert creation
- Alert resolution tracking

### Reporting
- Daily stock usage tracking
- Cost vs revenue analysis
- Profit margin per product
- Inventory turnover analysis

---

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   node scripts/setupRecipeManagement.js
   ```

3. **Import Excel Data**
   ```bash
   node utils/importExcelData.js
   ```

4. **Start Server**
   ```bash
   npm start
   ```

5. **Test API**
   ```bash
   curl http://localhost:3000/api/recipe-management/products
   ```

---

## Database Schema

Sistem menggunakan 10 tabel utama:
- `RawMaterials` - Master bahan baku
- `ProductCategories` - Kategori produk
- `Products` - Master produk
- `Recipes` - Resep produk
- `RecipeIngredients` - Detail bahan dalam resep
- `CurrentStock` - Stock saat ini
- `InventoryTransactions` - Transaksi inventory
- `SalesTransactions` - Transaksi penjualan
- `SalesTransactionDetails` - Detail penjualan
- `StockAlerts` - Alert stock

---

## Support

Untuk pertanyaan atau bantuan, silakan hubungi tim development.