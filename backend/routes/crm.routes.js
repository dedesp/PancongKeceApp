const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crm.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// CRM Dashboard and Analytics (manager/admin only)
router.get('/dashboard', authenticate, authorize('manager', 'admin'), logActivity('crm'), crmController.getCRMDashboard);
router.get('/analytics', authenticate, authorize('manager', 'admin'), logActivity('crm'), crmController.getCustomerAnalytics);

// Customer Segmentation (manager/admin only)
router.post('/segments', authenticate, authorize('manager', 'admin'), logActivity('crm'), crmController.createCustomerSegment);
router.get('/segments/:segmentId/customers', authenticate, authorize('manager', 'admin'), logActivity('crm'), crmController.getCustomersBySegment);

// Marketing Campaigns (manager/admin only)
router.post('/campaigns', authenticate, authorize('manager', 'admin'), logActivity('crm'), crmController.sendMarketingCampaign);

// Customer Communications (both roles can add, but manager can view all)
router.post('/communications', authenticate, logActivity('crm'), crmController.addCustomerCommunication);

// Customer Feedback (both roles can view, manager can respond)
router.get('/feedback', authenticate, logActivity('crm'), crmController.getCustomerFeedback);

// Lead Management (manager/admin only)
router.post('/leads', authenticate, authorize('manager', 'admin'), logActivity('crm'), crmController.createLead);

module.exports = router;