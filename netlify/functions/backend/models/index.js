const { sequelize } = require('../config/database');
const User = require('./user.model');
const Role = require('./role.model');
const Product = require('./product.model');
const Category = require('./category.model');
const Transaction = require('./transaction.model');
const TransactionItem = require('./transactionItem.model');
const PaymentMethod = require('./paymentMethod.model');
const Inventory = require('./inventory.model');
const InventoryLog = require('./inventoryLog.model');
const Employee = require('./employee.model');
const Attendance = require('./attendance.model');
const Payroll = require('./payroll.model');
const PettyCash = require('./pettyCash.model');
const SystemLog = require('./systemLog.model');
const TaxSetting = require('./taxSetting.model');
const Discount = require('./discount.model');
const RoundingSetting = require('./roundingSetting.model');
const Customer = require('./customer.model');
const LoyaltyProgram = require('./loyaltyProgram.model');
const PointTransaction = require('./pointTransaction.model');
const Promotion = require('./promotion.model');
const CafeOperationLog = require('./cafeOperationLog.model');
const CustomerSegment = require('./customerSegment.model');
const MarketingCampaign = require('./marketingCampaign.model');
const CustomerCommunication = require('./customerCommunication.model');
const CustomerFeedback = require('./customerFeedback.model');
const Lead = require('./leadManagement.model');
const AutomationRule = require('./automationRule.model');
const WhatsAppIntegration = require('./whatsappIntegration.model');
const WhatsAppMessage = require('./whatsappMessage.model');
const SentimentAnalysis = require('./sentimentAnalysis.model');

// Define relationships
// User - Role relationship
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

// Product - Category relationship
Product.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Product, { foreignKey: 'category_id' });

// Transaction - User relationship
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'Cashier' });
User.hasMany(Transaction, { foreignKey: 'user_id' });

// Transaction - PaymentMethod relationship
Transaction.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id' });
PaymentMethod.hasMany(Transaction, { foreignKey: 'payment_method_id' });

// Transaction - TransactionItem relationship
Transaction.hasMany(TransactionItem, { foreignKey: 'transaction_id' });
TransactionItem.belongsTo(Transaction, { foreignKey: 'transaction_id' });

// TransactionItem - Product relationship
TransactionItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(TransactionItem, { foreignKey: 'product_id' });

// Inventory - Product relationship
Inventory.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasOne(Inventory, { foreignKey: 'product_id' });

// InventoryLog - Product relationship
InventoryLog.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(InventoryLog, { foreignKey: 'product_id' });

// InventoryLog - User relationship
InventoryLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(InventoryLog, { foreignKey: 'user_id' });

// Employee - User relationship
Employee.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Employee, { foreignKey: 'user_id' });

// Attendance - Employee relationship
Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });
Employee.hasMany(Attendance, { foreignKey: 'employee_id' });

// Payroll - Employee relationship
Payroll.belongsTo(Employee, { foreignKey: 'employee_id' });
Employee.hasMany(Payroll, { foreignKey: 'employee_id' });

// PettyCash - User relationship
PettyCash.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PettyCash, { foreignKey: 'user_id' });

// SystemLog - User relationship
SystemLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(SystemLog, { foreignKey: 'user_id' });

// TaxSetting - User relationship
TaxSetting.belongsTo(User, { foreignKey: 'updated_by' });
User.hasMany(TaxSetting, { foreignKey: 'updated_by' });

// Discount - User relationship
Discount.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Discount.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
User.hasMany(Discount, { foreignKey: 'created_by' });

// RoundingSetting - User relationship
RoundingSetting.belongsTo(User, { foreignKey: 'updated_by' });
User.hasMany(RoundingSetting, { foreignKey: 'updated_by' });

// Customer - User relationship
Customer.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Customer.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
User.hasMany(Customer, { foreignKey: 'created_by' });

// LoyaltyProgram - User relationship
LoyaltyProgram.belongsTo(User, { foreignKey: 'updated_by' });
User.hasMany(LoyaltyProgram, { foreignKey: 'updated_by' });

// PointTransaction relationships
PointTransaction.belongsTo(Customer, { foreignKey: 'customer_id' });
PointTransaction.belongsTo(Transaction, { foreignKey: 'transaction_id' });
PointTransaction.belongsTo(User, { foreignKey: 'processed_by', as: 'ProcessedBy' });
Customer.hasMany(PointTransaction, { foreignKey: 'customer_id' });
Transaction.hasOne(PointTransaction, { foreignKey: 'transaction_id' });
User.hasMany(PointTransaction, { foreignKey: 'processed_by' });

// Promotion - User relationship
Promotion.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Promotion.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
User.hasMany(Promotion, { foreignKey: 'created_by' });

// CafeOperationLog - User relationship
CafeOperationLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(CafeOperationLog, { foreignKey: 'user_id' });

// Transaction - Customer relationship
Transaction.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Transaction, { foreignKey: 'customer_id' });

// CRM Model Relationships
// CustomerSegment - User relationship
CustomerSegment.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
CustomerSegment.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
User.hasMany(CustomerSegment, { foreignKey: 'created_by' });

// MarketingCampaign - User relationship
MarketingCampaign.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
MarketingCampaign.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
User.hasMany(MarketingCampaign, { foreignKey: 'created_by' });

// CustomerCommunication relationships
CustomerCommunication.belongsTo(Customer, { foreignKey: 'customer_id' });
CustomerCommunication.belongsTo(MarketingCampaign, { foreignKey: 'campaign_id' });
CustomerCommunication.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
Customer.hasMany(CustomerCommunication, { foreignKey: 'customer_id' });
MarketingCampaign.hasMany(CustomerCommunication, { foreignKey: 'campaign_id' });
User.hasMany(CustomerCommunication, { foreignKey: 'created_by' });

// CustomerFeedback relationships
CustomerFeedback.belongsTo(Customer, { foreignKey: 'customer_id' });
CustomerFeedback.belongsTo(Transaction, { foreignKey: 'transaction_id' });
CustomerFeedback.belongsTo(User, { foreignKey: 'response_by', as: 'Responder' });
Customer.hasMany(CustomerFeedback, { foreignKey: 'customer_id' });
Transaction.hasOne(CustomerFeedback, { foreignKey: 'transaction_id' });
User.hasMany(CustomerFeedback, { foreignKey: 'response_by' });

// Lead relationships
Lead.belongsTo(User, { foreignKey: 'assigned_to', as: 'AssignedTo' });
Lead.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Lead.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
Lead.belongsTo(Customer, { foreignKey: 'customer_id', as: 'ConvertedCustomer' });
Lead.belongsTo(Customer, { foreignKey: 'referrer_customer_id', as: 'ReferrerCustomer' });
User.hasMany(Lead, { foreignKey: 'assigned_to' });
User.hasMany(Lead, { foreignKey: 'created_by' });
Customer.hasOne(Lead, { foreignKey: 'customer_id' });
Customer.hasMany(Lead, { foreignKey: 'referrer_customer_id' });

// Automation & AI Relationships
// AutomationRule - User relationship
AutomationRule.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
AutomationRule.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
User.hasMany(AutomationRule, { foreignKey: 'created_by' });

// WhatsApp Integration relationships
WhatsAppIntegration.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
WhatsAppIntegration.belongsTo(User, { foreignKey: 'updated_by', as: 'Updater' });
User.hasMany(WhatsAppIntegration, { foreignKey: 'created_by' });

// WhatsApp Message relationships
WhatsAppMessage.belongsTo(WhatsAppIntegration, { foreignKey: 'integration_id' });
WhatsAppMessage.belongsTo(Customer, { foreignKey: 'customer_id' });
WhatsAppMessage.belongsTo(MarketingCampaign, { foreignKey: 'campaign_id' });
WhatsAppMessage.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
WhatsAppMessage.belongsTo(WhatsAppMessage, { foreignKey: 'reply_to', as: 'ReplyTo' });
WhatsAppIntegration.hasMany(WhatsAppMessage, { foreignKey: 'integration_id' });
Customer.hasMany(WhatsAppMessage, { foreignKey: 'customer_id' });
MarketingCampaign.hasMany(WhatsAppMessage, { foreignKey: 'campaign_id' });
User.hasMany(WhatsAppMessage, { foreignKey: 'created_by' });

// Sentiment Analysis relationships
SentimentAnalysis.belongsTo(CustomerFeedback, { foreignKey: 'feedback_id' });
SentimentAnalysis.belongsTo(CustomerCommunication, { foreignKey: 'communication_id' });
SentimentAnalysis.belongsTo(User, { foreignKey: 'reviewed_by', as: 'ReviewedBy' });
CustomerFeedback.hasOne(SentimentAnalysis, { foreignKey: 'feedback_id' });
CustomerCommunication.hasOne(SentimentAnalysis, { foreignKey: 'communication_id' });
User.hasMany(SentimentAnalysis, { foreignKey: 'reviewed_by' });

module.exports = {
  sequelize,
  User,
  Role,
  Product,
  Category,
  Transaction,
  TransactionItem,
  PaymentMethod,
  Inventory,
  InventoryLog,
  Employee,
  Attendance,
  Payroll,
  PettyCash,
  SystemLog,
  TaxSetting,
  Discount,
  RoundingSetting,
  Customer,
  LoyaltyProgram,
  PointTransaction,
  Promotion,
  CafeOperationLog,
  CustomerSegment,
  MarketingCampaign,
  CustomerCommunication,
  CustomerFeedback,
  Lead,
  AutomationRule,
  WhatsAppIntegration,
  WhatsAppMessage,
  SentimentAnalysis
};