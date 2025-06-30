require('dotenv').config();
const { sequelize } = require('../config/database');

const addTaxServiceFields = async () => {
  try {
    // Add paid_amount and change_amount columns to transactions table
    await sequelize.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS change_amount INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS service_amount INTEGER DEFAULT 0;
    `);
    
    console.log('Successfully added payment and service fields to transactions table.');
    
    // Add comments to the columns
    await sequelize.query(`
      COMMENT ON COLUMN transactions.paid_amount IS 'Jumlah uang yang dibayarkan customer';
      COMMENT ON COLUMN transactions.change_amount IS 'Jumlah kembalian yang diberikan';
      COMMENT ON COLUMN transactions.service_amount IS 'Jumlah service charge';
    `);
    
    console.log('Added comments to new columns.');
    
    // Update existing tax_amount column comment
    await sequelize.query(`
      COMMENT ON COLUMN transactions.tax_amount IS 'Jumlah pajak (PPN)';
    `);
    
    console.log('Updated tax_amount column comment.');
    
  } catch (error) {
    console.error('Error adding tax and service fields:', error);
  } finally {
    process.exit();
  }
};

addTaxServiceFields();