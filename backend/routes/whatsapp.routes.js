const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get WhatsApp settings (manager/admin only)
router.get('/settings', authenticate, authorize('manager', 'admin'), logActivity('whatsapp'), whatsappController.getWhatsAppSettings);

// Setup WhatsApp integration (admin only)
router.post('/setup', authenticate, authorize('admin'), logActivity('whatsapp'), whatsappController.setupWhatsAppIntegration);

// Send single WhatsApp message (both roles can send)
router.post('/send', authenticate, logActivity('whatsapp'), whatsappController.sendWhatsAppMessage);

// Send broadcast message (manager/admin only)
router.post('/broadcast', authenticate, authorize('manager', 'admin'), logActivity('whatsapp'), whatsappController.sendBroadcastMessage);

// Get message history (manager/admin only)
router.get('/messages', authenticate, authorize('manager', 'admin'), logActivity('whatsapp'), whatsappController.getMessageHistory);

module.exports = router;