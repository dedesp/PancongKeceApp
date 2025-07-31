const {
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
} = require('../models/RecipeManagement');
const { Op } = require('sequelize');

// Recipe Management Controller
class RecipeManagementController {

  // ==================== PRODUCT MANAGEMENT ====================

  // Get all products with recipes and costs
  static async getAllProducts(req, res) {
    try {
      const { category, search, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { isActive: true };
      if (category) {
        whereClause['$category.type$'] = category;
      }
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } }
        ];
      }

      const products = await RecipeProduct.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ProductCategory,
            as: 'category'
          },
          {
            model: Recipe,
            as: 'recipes',
            where: { isActive: true },
            required: false,
            include: [
              {
                model: RecipeIngredient,
                as: 'ingredients',
                include: [
                  {
                    model: RawMaterial,
                    as: 'material'
                  }
                ]
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: products.rows,
        pagination: {
          total: products.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(products.count / limit)
        }
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving products',
        error: error.message
      });
    }
  }

  // Get product with detailed recipe and cost breakdown
  static async getProductDetail(req, res) {
    try {
      const { id } = req.params;

      const product = await RecipeProduct.findByPk(id, {
        include: [
          {
            model: ProductCategory,
            as: 'category'
          },
          {
            model: Recipe,
            as: 'recipes',
            where: { isActive: true },
            include: [
              {
                model: RecipeIngredient,
                as: 'ingredients',
                include: [
                  {
                    model: RawMaterial,
                    as: 'material',
                    include: [
                      {
                        model: CurrentStock,
                        as: 'currentStock'
                      }
                    ]
                  },
                  {
                    model: Recipe,
                    as: 'subRecipe',
                    include: [
                      {
                        model: RecipeIngredient,
                        as: 'ingredients',
                        include: [
                          {
                            model: RawMaterial,
                            as: 'material'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Calculate detailed cost breakdown
      const costBreakdown = await RecipeManagementController.calculateProductCost(id);

      res.json({
        success: true,
        data: {
          ...product.toJSON(),
          costBreakdown
        }
      });
    } catch (error) {
      console.error('Error getting product detail:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving product detail',
        error: error.message
      });
    }
  }

  // ==================== RECIPE MANAGEMENT ====================

  // Get all recipes
  static async getAllRecipes(req, res) {
    try {
      const { category, search, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { isActive: true };
      if (search) {
        whereClause['$recipeProduct.name$'] = { [Op.like]: `%${search}%` };
      }

      const recipes = await Recipe.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: ProductCategory,
                as: 'category',
                where: category ? { type: category } : {}
              }
            ]
          },
          {
            model: RecipeIngredient,
            as: 'ingredients',
            include: [
              {
                model: RawMaterial,
                as: 'material'
              },
              {
                model: Recipe,
                as: 'subRecipe'
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: recipes.rows,
        pagination: {
          total: recipes.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(recipes.count / limit)
        }
      });
    } catch (error) {
      console.error('Error getting recipes:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving recipes',
        error: error.message
      });
    }
  }

  // ==================== INVENTORY MANAGEMENT ====================

  // Get current stock levels
  static async getCurrentStock(req, res) {
    try {
      const { category, lowStock, search, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (category) {
        whereClause['$material.category$'] = category;
      }
      if (search) {
        whereClause[Op.or] = [
          { '$material.name$': { [Op.like]: `%${search}%` } },
          { '$material.code$': { [Op.like]: `%${search}%` } }
        ];
      }
      if (lowStock === 'true') {
        whereClause[Op.and] = sequelize.where(
          sequelize.col('CurrentStock.quantity'),
          Op.lte,
          sequelize.col('material.minimumStock')
        );
      }

      const stock = await CurrentStock.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: RawMaterial,
            as: 'material',
            include: [
              {
                model: StockAlert,
                as: 'alerts',
                where: { isResolved: false },
                required: false
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['lastUpdated', 'DESC']]
      });

      res.json({
        success: true,
        data: stock.rows,
        pagination: {
          total: stock.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(stock.count / limit)
        }
      });
    } catch (error) {
      console.error('Error getting current stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving current stock',
        error: error.message
      });
    }
  }

  // ==================== SALES PROCESSING ====================

  // Process sale and auto-deduct inventory
  static async processSale(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        items, // [{ productId, quantity, unitPrice }]
        customerId,
        paymentMethod,
        cashierId,
        notes
      } = req.body;

      // Generate transaction number
      const transactionNumber = await RecipeManagementController.generateTransactionNumber();

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);

      // Create sales transaction
      const salesTransaction = await SalesTransaction.create({
        transactionNumber,
        customerId,
        totalAmount,
        paymentMethod,
        cashierId,
        notes
      }, { transaction });

      const saleDetails = [];
      const inventoryUpdates = [];

      // Process each item
      for (const item of items) {
        // Get product with recipe
        const product = await RecipeProduct.findByPk(item.productId, {
          include: [
            {
              model: Recipe,
              as: 'recipes',
              where: { isActive: true },
              include: [
                {
                  model: RecipeIngredient,
                  as: 'ingredients',
                  include: [
                    {
                      model: RawMaterial,
                      as: 'material'
                    }
                  ]
                }
              ]
            }
          ]
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        // Calculate cost of goods from recipe
        const costOfGoods = await RecipeManagementController.calculateProductCost(item.productId);
        const totalPrice = item.quantity * item.unitPrice;
        const profit = totalPrice - (costOfGoods.totalCost * item.quantity);

        // Create sale detail
        const saleDetail = await SalesTransactionDetail.create({
          transactionId: salesTransaction.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          costOfGoods: costOfGoods.totalCost * item.quantity,
          profit
        }, { transaction });

        saleDetails.push(saleDetail);

        // Calculate inventory deductions
        if (product.recipes && product.recipes.length > 0) {
          const recipe = product.recipes[0]; // Use first active recipe
          
          for (const ingredient of recipe.ingredients) {
            const deductionQuantity = ingredient.quantity * item.quantity;
            
            // Check if enough stock available
            const currentStock = await CurrentStock.findOne({
              where: { materialId: ingredient.materialId }
            });

            if (!currentStock || currentStock.quantity < deductionQuantity) {
              throw new Error(
                `Insufficient stock for ${ingredient.material.name}. ` +
                `Required: ${deductionQuantity}, Available: ${currentStock ? currentStock.quantity : 0}`
              );
            }

            inventoryUpdates.push({
              materialId: ingredient.materialId,
              quantity: deductionQuantity,
              unitCost: ingredient.unitCost,
              totalCost: ingredient.totalCost * item.quantity
            });
          }
        }
      }

      // Update inventory
      for (const update of inventoryUpdates) {
        // Deduct from current stock
        await CurrentStock.decrement('quantity', {
          by: update.quantity,
          where: { materialId: update.materialId },
          transaction
        });

        // Record inventory transaction
        await InventoryTransaction.create({
          materialId: update.materialId,
          transactionType: 'OUT',
          quantity: update.quantity,
          unit: 'gram', // Default unit, should be from material
          unitCost: update.unitCost,
          totalCost: update.totalCost,
          referenceType: 'SALE',
          referenceId: salesTransaction.id,
          notes: `Sale deduction for transaction ${transactionNumber}`,
          createdBy: cashierId
        }, { transaction });
      }

      // Check for low stock alerts
      await RecipeManagementController.checkStockAlerts(transaction);

      await transaction.commit();

      res.json({
        success: true,
        message: 'Sale processed successfully',
        data: {
          transaction: salesTransaction,
          details: saleDetails,
          inventoryUpdates: inventoryUpdates.length
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error processing sale:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing sale',
        error: error.message
      });
    }
  }

  // ==================== REPORTING ====================

  // Daily stock usage report
  static async getDailyStockUsage(req, res) {
    try {
      const { date = new Date().toISOString().split('T')[0] } = req.query;
      
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const stockUsage = await InventoryTransaction.findAll({
        where: {
          transactionType: 'OUT',
          referenceType: 'SALE',
          transactionDate: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }
        },
        include: [
          {
            model: RawMaterial,
            as: 'material'
          }
        ],
        order: [['transactionDate', 'DESC']]
      });

      // Group by material
      const usageByMaterial = stockUsage.reduce((acc, transaction) => {
        const materialId = transaction.materialId;
        if (!acc[materialId]) {
          acc[materialId] = {
            material: transaction.material,
            totalQuantity: 0,
            totalCost: 0,
            transactions: []
          };
        }
        acc[materialId].totalQuantity += parseFloat(transaction.quantity);
        acc[materialId].totalCost += parseFloat(transaction.totalCost);
        acc[materialId].transactions.push(transaction);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          date,
          summary: {
            totalMaterials: Object.keys(usageByMaterial).length,
            totalTransactions: stockUsage.length,
            totalCost: stockUsage.reduce((sum, t) => sum + parseFloat(t.totalCost), 0)
          },
          usageByMaterial: Object.values(usageByMaterial)
        }
      });
    } catch (error) {
      console.error('Error getting daily stock usage:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving daily stock usage',
        error: error.message
      });
    }
  }

  // Cost vs Revenue analysis
  static async getCostRevenueAnalysis(req, res) {
    try {
      const { 
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate = new Date().toISOString().split('T')[0]
      } = req.query;

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);

      const salesData = await SalesTransactionDetail.findAll({
        include: [
          {
            model: SalesTransaction,
            as: 'transaction',
            where: {
              transactionDate: {
                [Op.gte]: start,
                [Op.lt]: end
              },
              status: 'COMPLETED'
            }
          },
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: ProductCategory,
                as: 'category'
              }
            ]
          }
        ]
      });

      const analysis = {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        byCategory: {},
        byProduct: {}
      };

      salesData.forEach(detail => {
        const revenue = parseFloat(detail.totalPrice);
        const cost = parseFloat(detail.costOfGoods);
        const profit = parseFloat(detail.profit);
        const category = detail.product.category.name;
        const productName = detail.product.name;

        analysis.totalRevenue += revenue;
        analysis.totalCost += cost;
        analysis.totalProfit += profit;

        // By category
        if (!analysis.byCategory[category]) {
          analysis.byCategory[category] = {
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0
          };
        }
        analysis.byCategory[category].revenue += revenue;
        analysis.byCategory[category].cost += cost;
        analysis.byCategory[category].profit += profit;

        // By product
        if (!analysis.byProduct[productName]) {
          analysis.byProduct[productName] = {
            revenue: 0,
            cost: 0,
            profit: 0,
            quantity: 0,
            margin: 0
          };
        }
        analysis.byProduct[productName].revenue += revenue;
        analysis.byProduct[productName].cost += cost;
        analysis.byProduct[productName].profit += profit;
        analysis.byProduct[productName].quantity += detail.quantity;
      });

      // Calculate margins
      analysis.profitMargin = analysis.totalRevenue > 0 ? 
        (analysis.totalProfit / analysis.totalRevenue) * 100 : 0;

      Object.keys(analysis.byCategory).forEach(category => {
        const cat = analysis.byCategory[category];
        cat.margin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
      });

      Object.keys(analysis.byProduct).forEach(product => {
        const prod = analysis.byProduct[product];
        prod.margin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
      });

      res.json({
        success: true,
        data: {
          period: { startDate, endDate },
          analysis
        }
      });
    } catch (error) {
      console.error('Error getting cost revenue analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving cost revenue analysis',
        error: error.message
      });
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  // Calculate product cost from recipe
  static async calculateProductCost(productId) {
    try {
      const product = await RecipeProduct.findByPk(productId, {
        include: [
          {
            model: Recipe,
            as: 'recipes',
            where: { isActive: true },
            include: [
              {
                model: RecipeIngredient,
                as: 'ingredients',
                include: [
                  {
                    model: RawMaterial,
                    as: 'material'
                  },
                  {
                    model: Recipe,
                    as: 'subRecipe',
                    include: [
                      {
                        model: RecipeIngredient,
                        as: 'ingredients',
                        include: [
                          {
                            model: RawMaterial,
                            as: 'material'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!product || !product.recipes || product.recipes.length === 0) {
        return { totalCost: 0, breakdown: [] };
      }

      const recipe = product.recipes[0]; // Use first active recipe
      let totalCost = 0;
      const breakdown = [];

      for (const ingredient of recipe.ingredients) {
        let ingredientCost = 0;
        
        if (ingredient.material) {
          // Direct material cost
          ingredientCost = parseFloat(ingredient.totalCost) || 0;
          breakdown.push({
            type: 'material',
            name: ingredient.material.name,
            code: ingredient.material.code,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            unitCost: ingredient.unitCost,
            totalCost: ingredientCost
          });
        } else if (ingredient.subRecipe) {
          // Sub-recipe cost (recursive calculation)
          const subRecipeCost = await RecipeManagementController.calculateProductCost(ingredient.subRecipe.productId);
          ingredientCost = subRecipeCost.totalCost * ingredient.quantity;
          breakdown.push({
            type: 'subRecipe',
            name: ingredient.subRecipe.product?.name || 'Sub Recipe',
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            unitCost: subRecipeCost.totalCost,
            totalCost: ingredientCost,
            subBreakdown: subRecipeCost.breakdown
          });
        }
        
        totalCost += ingredientCost;
      }

      return {
        totalCost: Math.round(totalCost * 100) / 100,
        breakdown
      };
    } catch (error) {
      console.error('Error calculating product cost:', error);
      return { totalCost: 0, breakdown: [] };
    }
  }

  // Generate transaction number
  static async generateTransactionNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastTransaction = await SalesTransaction.findOne({
      where: {
        transactionNumber: {
          [Op.like]: `TRX${dateStr}%`
        }
      },
      order: [['id', 'DESC']]
    });

    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.transactionNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `TRX${dateStr}${sequence.toString().padStart(4, '0')}`;
  }

  // Check and create stock alerts
  static async checkStockAlerts(transaction = null) {
    try {
      const lowStockItems = await CurrentStock.findAll({
        include: [
          {
            model: RawMaterial,
            as: 'material'
          }
        ],
        where: sequelize.where(
          sequelize.col('CurrentStock.quantity'),
          Op.lte,
          sequelize.col('material.minimumStock')
        )
      });

      for (const stockItem of lowStockItems) {
        // Check if alert already exists
        const existingAlert = await StockAlert.findOne({
          where: {
            materialId: stockItem.materialId,
            alertType: stockItem.quantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            isResolved: false
          }
        });

        if (!existingAlert) {
          await StockAlert.create({
            materialId: stockItem.materialId,
            alertType: stockItem.quantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            currentQuantity: stockItem.quantity,
            minimumQuantity: stockItem.material.minimumStock
          }, { transaction });
        }
      }
    } catch (error) {
      console.error('Error checking stock alerts:', error);
    }
  }

  // Get stock alerts
  static async getStockAlerts(req, res) {
    try {
      const { type, resolved = false } = req.query;

      const whereClause = { isResolved: resolved === 'true' };
      if (type) {
        whereClause.alertType = type;
      }

      const alerts = await StockAlert.findAll({
        where: whereClause,
        include: [
          {
            model: RawMaterial,
            as: 'material',
            include: [
              {
                model: CurrentStock,
                as: 'currentStock'
              }
            ]
          }
        ],
        order: [['alertDate', 'DESC']]
      });

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Error getting stock alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving stock alerts',
        error: error.message
      });
    }
  }
}

module.exports = RecipeManagementController;