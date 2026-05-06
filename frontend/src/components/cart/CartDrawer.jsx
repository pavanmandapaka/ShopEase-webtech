import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiShoppingBag, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Close on escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [setIsOpen]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    setIsOpen(false);
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const shippingCost = cartTotal > 50 ? 0 : 9.99;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shippingCost + tax;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="overlay" onClick={() => setIsOpen(false)} />

      {/* Drawer */}
      <div className="cart-drawer glass-strong" ref={drawerRef} id="cart-drawer">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <FiShoppingBag size={20} />
            <span>Shopping Cart</span>
            {cart.items?.length > 0 && (
              <span className="badge badge-primary">{cart.items.length} items</span>
            )}
          </div>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
            id="close-cart-btn"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Cart Content */}
        {loading ? (
          <div className="drawer-loading">
            <div className="spinner" />
            <p>Loading cart...</p>
          </div>
        ) : !cart.items || cart.items.length === 0 ? (
          <div className="drawer-empty">
            <div className="empty-cart-icon"><FiShoppingBag size={48} /></div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started</p>
            <Link
              to="/products"
              className="btn btn-primary"
              onClick={() => setIsOpen(false)}
              id="shop-now-btn"
            >
              Shop Now <FiArrowRight />
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="drawer-items">
              {cart.items.map((item) => (
                <div key={item.product?._id || item._id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://placehold.co/80x80/1c1c27/6c63ff?text=?'}
                      alt={item.product?.title || 'Product'}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/80x80/1c1c27/6c63ff?text=?';
                      }}
                    />
                  </div>
                  <div className="cart-item-info">
                    <Link
                      to={`/products/${item.product?._id}`}
                      className="cart-item-title"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.product?.title || 'Product'}
                    </Link>
                    <span className="cart-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="cart-item-controls">
                      <div className="qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          id={`qty-dec-${item.product?._id}`}
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 99)}
                          id={`qty-inc-${item.product?._id}`}
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.product?._id)}
                        id={`remove-${item.product?._id}`}
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="drawer-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                  {shippingCost === 0 ? 'Free 🎉' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="free-shipping-hint">
                  Add ${(50 - cartTotal).toFixed(2)} more for free shipping!
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-primary btn-full checkout-btn"
                onClick={handleCheckout}
                id="checkout-btn"
              >
                Proceed to Checkout <FiArrowRight />
              </button>
              <button
                className="btn btn-ghost btn-full continue-btn"
                onClick={() => setIsOpen(false)}
                id="continue-shopping-btn"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
