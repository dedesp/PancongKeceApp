const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Raw Materials Model
const RawMaterial = sequelize.define('RawMaterial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100)
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pcs'
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  supplier: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  minimumStock: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  }
}, {
  tableName: 'raw_materials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Product Categories Model
const ProductCategory = sequelize.define('ProductCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('PG', 'LM', 'MC', 'CO', 'SC', 'NC'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'product_categories',
  timestamps: false
});

// Products Model
const RecipeProduct = sequelize.define('RecipeProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id'
  },
  hpp: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Harga Pokok Produksi'
  },
  additionalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'additional_cost'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_cost'
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'selling_price'
  },
  margin: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  marginPercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'margin_percent'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Recipes Model
const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id'
  },
  version: {
    type: DataTypes.STRING(10),
    defaultValue: '1.0'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_cost'
  },
  yieldQuantity: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 1,
    field: 'yield_quantity',
    comment: 'How many portions this recipe makes'
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'preparation_time',
    comment: 'in minutes'
  },
  notes: {
    type: DataTypes.TEXT
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'recipes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Recipe Ingredients Model
const RecipeIngredient = sequelize.define('RecipeIngredient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'recipe_id'
  },
  materialId: {
    type: DataTypes.INTEGER,
    field: 'material_id'
  },
  subRecipeId: {
    type: DataTypes.INTEGER,
    field: 'sub_recipe_id',
    comment: 'For nested recipes (e.g., PG in other recipes)'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'unit_cost'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_cost'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'recipe_ingredients',
  timestamps: false
});

// Current Stock Model
const CurrentStock = sequelize.define('CurrentStock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'material_id'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'last_updated'
  }
}, {
  tableName: 'current_stock',
  timestamps: false
});

// Inventory Transactions Model
const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'material_id'
  },
  transactionType: {
    type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
    allowNull: false,
    field: 'transaction_type'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'unit_cost'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_cost'
  },
  referenceType: {
    type: DataTypes.ENUM('PURCHASE', 'SALE', 'PRODUCTION', 'ADJUSTMENT', 'WASTE'),
    allowNull: false,
    field: 'reference_type'
  },
  referenceId: {
    type: DataTypes.INTEGER,
    field: 'reference_id',
    comment: 'Links to sales, purchases, etc.'
  },
  notes: {
    type: DataTypes.TEXT
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'transaction_date'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by'
  }
}, {
  tableName: 'inventory_transactions',
  timestamps: false
});

// Sales Transactions Model
const SalesTransaction = sequelize.define('SalesTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionNumber: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    field: 'transaction_number'
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'transaction_date'
  },
  customerId: {
    type: DataTypes.INTEGER,
    field: 'customer_id'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_amount'
  },
  paymentMethod: {
    type: DataTypes.ENUM('CASH', 'CARD', 'TRANSFER', 'QRIS'),
    allowNull: false,
    field: 'payment_method'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'COMPLETED'
  },
  cashierId: {
    type: DataTypes.INTEGER,
    field: 'cashier_id'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'sales_transactions',
  timestamps: false
});

// Sales Transaction Details Model
const SalesTransactionDetail = sequelize.define('SalesTransactionDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'transaction_id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price'
  },
  costOfGoods: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'cost_of_goods',
    comment: 'Calculated from recipe'
  },
  profit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'sales_transaction_details',
  timestamps: false
});

// Stock Alerts Model
const StockAlert = sequelize.define('StockAlert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'material_id'
  },
  alertType: {
    type: DataTypes.ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED'),
    allowNull: false,
    field: 'alert_type'
  },
  currentQuantity: {
    type: DataTypes.DECIMAL(10, 3),
    field: 'current_quantity'
  },
  minimumQuantity: {
    type: DataTypes.DECIMAL(10, 3),
    field: 'minimum_quantity'
  },
  alertDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'alert_date'
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_resolved'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    field: 'resolved_at'
  }
}, {
  tableName: 'stock_alerts',
  timestamps: false
});

// Define Associations

// Product associations
RecipeProduct.belongsTo(ProductCategory, { foreignKey: 'categoryId', as: 'category' });
ProductCategory.hasMany(RecipeProduct, { foreignKey: 'categoryId', as: 'products' });

// Recipe associations
Recipe.belongsTo(RecipeProduct, { foreignKey: 'productId', as: 'product' });
RecipeProduct.hasMany(Recipe, { foreignKey: 'productId', as: 'recipes' });

// Recipe Ingredient associations
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });
Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipeId', as: 'ingredients' });

RecipeIngredient.belongsTo(RawMaterial, { foreignKey: 'materialId', as: 'material' });
RawMaterial.hasMany(RecipeIngredient, { foreignKey: 'materialId', as: 'recipeIngredients' });

// Sub-recipe association (for nested recipes like PG in other recipes)
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'subRecipeId', as: 'subRecipe' });

// Current Stock associations
CurrentStock.belongsTo(RawMaterial, { foreignKey: 'materialId', as: 'material' });
RawMaterial.hasOne(CurrentStock, { foreignKey: 'materialId', as: 'currentStock' });

// Inventory Transaction associations
InventoryTransaction.belongsTo(RawMaterial, { foreignKey: 'materialId', as: 'material' });
RawMaterial.hasMany(InventoryTransaction, { foreignKey: 'materialId', as: 'transactions' });

// Sales Transaction associations
SalesTransactionDetail.belongsTo(SalesTransaction, { foreignKey: 'transactionId', as: 'transaction' });
SalesTransaction.hasMany(SalesTransactionDetail, { foreignKey: 'transactionId', as: 'details' });

SalesTransactionDetail.belongsTo(RecipeProduct, { foreignKey: 'productId', as: 'product' });
RecipeProduct.hasMany(SalesTransactionDetail, { foreignKey: 'productId', as: 'salesDetails' });

// Stock Alert associations
StockAlert.belongsTo(RawMaterial, { foreignKey: 'materialId', as: 'material' });
RawMaterial.hasMany(StockAlert, { foreignKey: 'materialId', as: 'alerts' });

module.exports = {
  RawMaterial,
  ProductCategory,
  RecipeProduct,
  Recipe,
  RecipeIngredient,
  CurrentStock,
  InventoryTransaction,
  SalesTransaction,
  SalesTransactionDetail,
  StockAlert,
  sequelize
};