import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiMapPin, FiArrowRight, FiArrowLeft, FiLock } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { paymentService } from '../services';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const STEPS = ['Shipping', 'Review', 'Payment'];

const CheckoutPage = () => {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [errors, setErrors] = useState({});

  const shippingCost = cartTotal > 50 ? 0 : 9.99;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shippingCost + tax;

  const validateShipping = () => {
    const errs = {};
    const required = ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
    required.forEach((field) => {
      if (!shipping[field]?.trim()) {
        errs[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} is required`;
      }
    });
    if (shipping.email && !/\S+@\S+\.\S+/.test(shipping.email)) {
      errs.email = 'Invalid email';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNextStep = () => {
    if (step === 0 && !validateShipping()) return;
    setStep((s) => s + 1);
  };

  const handleCheckout = async () => {
    if (!cart.items?.length) {
      toast.error('Your cart is empty');
      return;
    }
    setLoading(true);
    try {
      const { data } = await paymentService.createCheckoutSession({
        shippingAddress: shipping,
      });
      // Redirect to Stripe hosted checkout
      window.location.href = data.sessionUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items?.length) {
    return (
      <div className="checkout-page page-wrapper">
        <div className="container">
          <div className="empty-state">
            <FiCreditCard size={48} style={{ opacity: 0.3 }} />
            <h3>Your cart is empty</h3>
            <p>Add some products before checking out</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page page-wrapper">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        {/* Stepper */}
        <div className="checkout-stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-item ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-circle">{i < step ? <span className="step-check">&#10003;</span> : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        <div className="checkout-grid">
          {/* Left: Steps */}
          <div className="checkout-main">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="checkout-section animate-fade-in">
                <h2 className="section-title"><FiMapPin size={20} /> Shipping Address</h2>
                <div className="shipping-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="fullName">Full Name *</label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                        value={shipping.fullName}
                        onChange={handleShippingChange}
                        placeholder="John Smith"
                      />
                      {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`form-input ${errors.email ? 'input-error' : ''}`}
                        value={shipping.email}
                        onChange={handleShippingChange}
                        placeholder="john@example.com"
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Phone *</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        placeholder="+1 555 000 0000"
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="country">Country *</label>
                      <select
                        id="country"
                        name="country"
                        className="form-input form-select"
                        value={shipping.country}
                        onChange={handleShippingChange}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="street">Street Address *</label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      className={`form-input ${errors.street ? 'input-error' : ''}`}
                      value={shipping.street}
                      onChange={handleShippingChange}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.street && <span className="form-error">{errors.street}</span>}
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label" htmlFor="city">City *</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        className={`form-input ${errors.city ? 'input-error' : ''}`}
                        value={shipping.city}
                        onChange={handleShippingChange}
                        placeholder="New York"
                      />
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="state">State *</label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        className={`form-input ${errors.state ? 'input-error' : ''}`}
                        value={shipping.state}
                        onChange={handleShippingChange}
                        placeholder="NY"
                      />
                      {errors.state && <span className="form-error">{errors.state}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="zipCode">ZIP Code *</label>
                      <input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        className={`form-input ${errors.zipCode ? 'input-error' : ''}`}
                        value={shipping.zipCode}
                        onChange={handleShippingChange}
                        placeholder="10001"
                      />
                      {errors.zipCode && <span className="form-error">{errors.zipCode}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Review */}
            {step === 1 && (
              <div className="checkout-section animate-fade-in">
                <h2 className="section-title">Review Your Order</h2>
                <div className="order-review-items">
                  {cart.items.map((item) => (
                    <div key={item.product?._id} className="review-item">
                      <img
                        src={item.product?.images?.[0]?.url || 'https://placehold.co/64x64/1c1c27/6c63ff?text=?'}
                        alt={item.product?.title}
                        onError={(e) => { e.target.src = 'https://placehold.co/64x64/1c1c27/6c63ff?text=?'; }}
                      />
                      <div className="review-item-info">
                        <strong>{item.product?.title}</strong>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span className="review-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="review-shipping-addr">
                  <h3>Shipping to</h3>
                  <p>{shipping.fullName}</p>
                  <p>{shipping.street}</p>
                  <p>{shipping.city}, {shipping.state} {shipping.zipCode}, {shipping.country}</p>
                  <p>{shipping.email} · {shipping.phone}</p>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="checkout-section animate-fade-in">
                <h2 className="section-title"><FiCreditCard size={20} /> Payment</h2>
                <div className="payment-section">
                  <div className="stripe-badge">
                    <FiLock size={16} />
                    <span>Secure checkout powered by <strong>Stripe</strong></span>
                  </div>
                  <p className="payment-info">
                    You will be redirected to Stripe's secure checkout page to complete your payment.
                    Your card details are never stored on our servers.
                  </p>
                  <div className="card-icons">
                    <span className="card-icon">VISA</span>
                    <span className="card-icon">MC</span>
                    <span className="card-icon">AMEX</span>
                    <span className="card-icon">Discover</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="checkout-nav">
              {step > 0 && (
                <button className="btn btn-secondary" onClick={() => setStep((s) => s - 1)} id="back-btn">
                  <FiArrowLeft /> Back
                </button>
              )}
              {step < 2 ? (
                <button className="btn btn-primary" onClick={handleNextStep} id="next-step-btn" style={{ marginLeft: 'auto' }}>
                  Continue <FiArrowRight />
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleCheckout}
                  disabled={loading}
                  id="pay-now-btn"
                  style={{ marginLeft: 'auto' }}
                >
                  {loading ? (
                    <><span className="spinner spinner-sm" /> Redirecting...</>
                  ) : (
                    <><FiLock size={16} /> Pay ${total.toFixed(2)}</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary glass">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item.product?._id} className="summary-item">
                  <span className="summary-item-name">
                    {item.product?.title?.substring(0, 28)}
                    {item.product?.title?.length > 28 ? '…' : ''} x{item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider" style={{ margin: '16px 0' }} />
            <div className="summary-row">
              <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'inherit' }}>
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-divider" style={{ margin: '16px 0' }} />
            <div className="summary-total">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <div className="secure-note">
              <FiLock size={13} /> 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
