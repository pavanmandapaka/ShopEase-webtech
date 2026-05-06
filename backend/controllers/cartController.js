const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'title price images stock isActive'
    );

    if (!cart) {
      return res.status(200).json({ success: true, cart: { items: [], total: 0 } });
    }

    // Filter out inactive products
    cart.items = cart.items.filter((item) => item.product && item.product.isActive);
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (!product.isActive) {
      return res.status(400).json({ success: false, message: 'Product is no longer available' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }
      existingItem.quantity = newQty;
      existingItem.price = product.discountPrice || product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.discountPrice || product.price,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'title price images stock isActive');

    res.status(200).json({ success: true, cart, message: 'Item added to cart' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'title price images stock isActive');

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.product', 'title price images stock isActive');

    res.status(200).json({ success: true, cart, message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
