const { Product, Category, Inventory, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      category_id, 
      search, 
      is_active, 
      sort_by = 'name', 
      sort_order = 'asc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    if (category_id) {
      whereClause.category_id = category_id;
    }
    
    if (search) {
      whereClause.name = { [sequelize.Op.iLike]: `%${search}%` };
    }
    
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get products with category and inventory
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Inventory,
          attributes: ['quantity', 'min_quantity', 'unit']
        }
      ],
      order: [[sort_by, sort_order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      message: 'Produk berhasil dimuat',
      data: products,
      pagination: {
        total_items: count,
        total_pages: totalPages,
        current_page: parseInt(page),
        items_per_page: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Inventory,
          attributes: ['quantity', 'min_quantity', 'unit']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Produk berhasil dimuat',
      data: product
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      name, 
      description, 
      price, 
      category_id, 
      image_url, 
      sku,
      quantity = 0,
      min_quantity = 10,
      unit = 'pcs'
    } = req.body;
    
    // Validate input
    if (!name || !price || !category_id) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Nama, harga, dan kategori produk diperlukan'
      });
    }
    
    // Check if category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan'
      });
    }
    
    // Generate product ID
    const productId = uuidv4();
    
    // Create product
    const product = await Product.create({
      id: productId,
      name,
      description,
      price,
      category_id,
      image_url,
      sku: sku || `P${Date.now()}`,
      is_active: true
    }, { transaction });
    
    // Create inventory record
    await Inventory.create({
      product_id: productId,
      quantity,
      min_quantity,
      unit,
      last_updated_by: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    // Get created product with category and inventory
    const createdProduct = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Inventory,
          attributes: ['quantity', 'min_quantity', 'unit']
        }
      ]
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Produk berhasil dibuat',
      data: createdProduct
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'SKU produk sudah digunakan'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      category_id, 
      image_url, 
      sku,
      is_active
    } = req.body;
    
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }
    
    // Check if category exists if it's being updated
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Kategori tidak ditemukan'
        });
      }
    }
    
    // Update product
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price || product.price,
      category_id: category_id || product.category_id,
      image_url: image_url !== undefined ? image_url : product.image_url,
      sku: sku || product.sku,
      is_active: is_active !== undefined ? is_active : product.is_active
    }, { transaction });
    
    await transaction.commit();
    
    // Get updated product with category and inventory
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Inventory,
          attributes: ['quantity', 'min_quantity', 'unit']
        }
      ]
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Produk berhasil diperbarui',
      data: updatedProduct
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'SKU produk sudah digunakan'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
      });
    }
    
    // Soft delete product
    await product.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      status: 'success',
      message: 'Produk berhasil dihapus'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};