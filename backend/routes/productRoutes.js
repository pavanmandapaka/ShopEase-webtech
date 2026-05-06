const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteProductImage,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/images/:imageId', protect, authorize('seller', 'admin'), deleteProductImage);

module.exports = router;
