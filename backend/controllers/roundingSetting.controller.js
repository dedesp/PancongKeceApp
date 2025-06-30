const { RoundingSetting, User } = require('../models');

// Get rounding settings
exports.getRoundingSettings = async (req, res) => {
  try {
    const settings = await RoundingSetting.findAll({
      include: [{
        model: User,
        attributes: ['username', 'full_name']
      }],
      limit: 1,
      order: [['updated_at', 'DESC']]
    });
    
    // Return the first (most recent) setting or default values
    const setting = settings.length > 0 ? settings[0] : {
      is_active: false,
      rounding_method: 'nearest',
      rounding_increment: 100,
      apply_to: 'final_total'
    };
    
    return res.status(200).json({
      status: 'success',
      data: setting
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update rounding settings
exports.updateRoundingSettings = async (req, res) => {
  try {
    const { 
      is_active, 
      rounding_method, 
      rounding_increment, 
      apply_to, 
      description 
    } = req.body;
    
    // Validate rounding_increment
    const validIncrements = [1, 5, 10, 25, 50, 100, 500, 1000];
    if (rounding_increment && !validIncrements.includes(parseInt(rounding_increment))) {
      return res.status(400).json({
        status: 'error',
        message: 'Kelipatan pembulatan tidak valid. Pilihan: 1, 5, 10, 25, 50, 100, 500, 1000'
      });
    }
    
    // Get current setting or create new one
    let setting = await RoundingSetting.findOne({
      order: [['updated_at', 'DESC']]
    });
    
    const settingData = {
      is_active: is_active !== undefined ? is_active : (setting?.is_active || false),
      rounding_method: rounding_method || (setting?.rounding_method || 'nearest'),
      rounding_increment: rounding_increment || (setting?.rounding_increment || 100),
      apply_to: apply_to || (setting?.apply_to || 'final_total'),
      description: description !== undefined ? description : (setting?.description || null),
      updated_by: req.user.id
    };
    
    if (setting) {
      await setting.update(settingData);
    } else {
      setting = await RoundingSetting.create(settingData);
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Pengaturan pembulatan berhasil diperbarui',
      data: setting
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

// Apply rounding to amount
exports.applyRounding = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Jumlah harus lebih dari 0'
      });
    }
    
    // Get current rounding settings
    const setting = await RoundingSetting.findOne({
      order: [['updated_at', 'DESC']]
    });
    
    if (!setting || !setting.is_active) {
      return res.status(200).json({
        status: 'success',
        data: {
          original_amount: amount,
          rounded_amount: amount,
          rounding_amount: 0,
          rounding_applied: false
        }
      });
    }
    
    const roundedAmount = applyRoundingToAmount(amount, setting);
    const roundingAmount = roundedAmount - amount;
    
    return res.status(200).json({
      status: 'success',
      data: {
        original_amount: amount,
        rounded_amount: roundedAmount,
        rounding_amount: roundingAmount,
        rounding_applied: true,
        rounding_method: setting.rounding_method,
        rounding_increment: setting.rounding_increment
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

// Helper function to apply rounding
function applyRoundingToAmount(amount, roundingSetting) {
  if (!roundingSetting || !roundingSetting.is_active) {
    return amount;
  }
  
  const increment = roundingSetting.rounding_increment;
  const remainder = amount % increment;
  
  if (remainder === 0) {
    return amount; // Already rounded
  }
  
  switch (roundingSetting.rounding_method) {
    case 'up':
      return amount + (increment - remainder);
      
    case 'down':
      return amount - remainder;
      
    case 'nearest':
    default:
      if (remainder >= increment / 2) {
        return amount + (increment - remainder); // Round up
      } else {
        return amount - remainder; // Round down
      }
  }
}

module.exports = { applyRoundingToAmount };