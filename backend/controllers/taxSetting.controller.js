const { TaxSetting, User } = require('../models');

// Get all tax settings
exports.getAllTaxSettings = async (req, res) => {
  try {
    const taxSettings = await TaxSetting.findAll({
      include: [{
        model: User,
        attributes: ['username', 'full_name']
      }],
      order: [['setting_key', 'ASC']]
    });
    
    return res.status(200).json({
      status: 'success',
      data: taxSettings
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get active tax settings
exports.getActiveTaxSettings = async (req, res) => {
  try {
    const taxSettings = await TaxSetting.findAll({
      where: { is_active: true },
      order: [['setting_key', 'ASC']]
    });
    
    return res.status(200).json({
      status: 'success',
      data: taxSettings
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update tax setting
exports.updateTaxSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage, is_active } = req.body;
    
    // Find tax setting
    const taxSetting = await TaxSetting.findByPk(id);
    
    if (!taxSetting) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengaturan pajak tidak ditemukan'
      });
    }
    
    // Validate percentage
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return res.status(400).json({
        status: 'error',
        message: 'Persentase harus antara 0-100%'
      });
    }
    
    // Update tax setting
    await taxSetting.update({
      percentage: percentage !== undefined ? percentage : taxSetting.percentage,
      is_active: is_active !== undefined ? is_active : taxSetting.is_active,
      updated_by: req.user.id
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Pengaturan pajak berhasil diperbarui',
      data: taxSetting
    });
    
  } catch (error) {
    console.error(error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Calculate tax and service for transaction
exports.calculateTaxAndService = async (req, res) => {
  try {
    const { subtotal } = req.body;
    
    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Subtotal diperlukan dan harus lebih dari 0'
      });
    }
    
    // Get active tax settings
    const taxSettings = await TaxSetting.findAll({
      where: { is_active: true },
      order: [['apply_before_service', 'DESC'], ['setting_key', 'ASC']]
    });
    
    let calculation = {
      subtotal: subtotal,
      tax_details: [],
      service_details: [],
      tax_amount: 0,
      service_amount: 0,
      total_before_tax_service: subtotal,
      final_amount: subtotal
    };
    
    let currentAmount = subtotal;
    
    // Process settings that apply before service charge
    for (const setting of taxSettings.filter(s => s.apply_before_service)) {
      const amount = Math.round(currentAmount * (setting.percentage / 100));
      
      if (setting.setting_key === 'service_charge') {
        calculation.service_details.push({
          name: setting.setting_name,
          percentage: setting.percentage,
          amount: amount
        });
        calculation.service_amount += amount;
      } else {
        calculation.tax_details.push({
          name: setting.setting_name,
          percentage: setting.percentage,
          amount: amount
        });
        calculation.tax_amount += amount;
      }
      
      currentAmount += amount;
    }
    
    // Process settings that apply after service charge
    for (const setting of taxSettings.filter(s => !s.apply_before_service)) {
      const amount = Math.round(currentAmount * (setting.percentage / 100));
      
      if (setting.setting_key === 'service_charge') {
        calculation.service_details.push({
          name: setting.setting_name,
          percentage: setting.percentage,
          amount: amount
        });
        calculation.service_amount += amount;
      } else {
        calculation.tax_details.push({
          name: setting.setting_name,
          percentage: setting.percentage,
          amount: amount
        });
        calculation.tax_amount += amount;
      }
      
      currentAmount += amount;
    }
    
    calculation.final_amount = currentAmount;
    
    return res.status(200).json({
      status: 'success',
      data: calculation
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};