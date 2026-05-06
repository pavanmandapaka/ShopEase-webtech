const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get user orders
// @route   GET /api/orders/user
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('items.product', 'title images'),
      Order.countDocuments({ user: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title images price')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user can only access their own orders (unless seller/admin)
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'seller'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller orders
// @route   GET /api/orders/seller
// @access  Private (Seller only)
exports.getSellerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { 'items.seller': req.user.id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email')
        .populate('items.product', 'title images'),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (seller/admin)
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify seller owns items in this order
    if (req.user.role === 'seller') {
      const sellerItems = order.items.filter(
        (item) => item.seller && item.seller.toString() === req.user.id
      );
      if (sellerItems.length === 0) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    if (status === 'shipped') {
      order.trackingNumber = `TRK${Date.now()}`;
    }

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller dashboard stats
// @route   GET /api/orders/seller/stats
// @access  Private (Seller only)
exports.getSellerStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments({ 'items.seller': sellerId, paymentStatus: 'paid' }),
      Order.aggregate([
        { $match: { 'items.seller': require('mongoose').Types.ObjectId(sellerId), paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': require('mongoose').Types.ObjectId(sellerId) } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      ]),
      Order.countDocuments({ 'items.seller': sellerId, status: { $in: ['pending', 'paid', 'processing'] } }),
      Product.countDocuments({ seller: sellerId, isActive: true }),
      Order.find({ 'items.seller': sellerId })
        .sort('-createdAt')
        .limit(5)
        .populate('user', 'name email'),
      Order.aggregate([
        { $match: { 'items.seller': require('mongoose').Types.ObjectId(sellerId), paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': require('mongoose').Types.ObjectId(sellerId) } },
        {
          $group: {
            _id: '$items.product',
            title: { $first: '$items.title' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        totalProducts,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
