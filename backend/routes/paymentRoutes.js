const express = require('express');
const router = express.Router();
const { createCheckoutSession, getSessionStatus } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

// Webhook is handled at root level (needs raw body)
router.post('/create-session', protect, createCheckoutSession);
router.get('/session/:sessionId', protect, getSessionStatus);

module.exports = router;
