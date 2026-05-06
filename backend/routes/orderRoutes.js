const express = require('express');
const router = express.Router();
const {
  getUserOrders,
  getOrder,
  getSellerOrders,
  updateOrderStatus,
  getSellerStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/user', getUserOrders);
router.get('/seller', authorize('seller', 'admin'), getSellerOrders);
router.get('/seller/stats', authorize('seller', 'admin'), getSellerStats);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
