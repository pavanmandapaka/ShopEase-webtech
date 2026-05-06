const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create Stripe checkout session
// @route   POST /api/payment/create-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product?.title}" is no longer available`,
        });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.title}"`,
        });
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shippingCost + tax;

    // Create order in pending state
    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        title: item.product.title,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images[0]?.url || '',
        seller: item.product.seller,
      })),
      shippingAddress,
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost: Math.round(shippingCost * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      statusHistory: [{ status: 'pending', note: 'Order created' }],
    });

    // Create Stripe line items
    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.title,
          images: item.product.images[0]?.url ? [item.product.images[0].url] : [],
          description: item.product.description?.substring(0, 200),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax (10%)' },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
      billing_address_collection: 'auto',
    });

    // Save session ID to order
    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe webhooks
// @route   POST /api/payment/webhook
// @access  Public (Stripe)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const order = await Order.findOne({ stripeSessionId: session.id });

        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'paid';
          order.stripePaymentIntentId = session.payment_intent;
          order.statusHistory.push({ status: 'paid', note: 'Payment received via Stripe' });
          await order.save();

          // Reduce product stock
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity },
            });
          }

          // Clear user cart
          await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

          console.log(`✅ Order ${order._id} payment successful`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (order) {
          order.paymentStatus = 'failed';
          order.status = 'cancelled';
          order.statusHistory.push({ status: 'cancelled', note: 'Payment failed' });
          await order.save();
          console.log(`❌ Order ${order._id} payment failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// @desc    Get payment session status
// @route   GET /api/payment/session/:sessionId
// @access  Private
exports.getSessionStatus = async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};
