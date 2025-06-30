const express = require('express');
const router = express.Router();
const sentimentController = require('../controllers/sentiment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Analyze specific feedback sentiment (manager/admin only)
router.post('/analyze/:feedback_id', authenticate, authorize('manager', 'admin'), logActivity('sentiment'), sentimentController.analyzeFeedbackSentiment);

// Get sentiment analytics dashboard (manager/admin only)
router.get('/dashboard', authenticate, authorize('manager', 'admin'), logActivity('sentiment'), sentimentController.getSentimentDashboard);

// Bulk analyze pending feedback (admin only)
router.post('/bulk-analyze', authenticate, authorize('admin'), logActivity('sentiment'), sentimentController.bulkAnalyzeFeedback);

// Review sentiment analysis (manager/admin only)
router.put('/review/:id', authenticate, authorize('manager', 'admin'), logActivity('sentiment'), sentimentController.reviewSentimentAnalysis);

module.exports = router;