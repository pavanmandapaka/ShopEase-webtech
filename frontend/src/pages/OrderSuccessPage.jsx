import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { orderService } from '../services';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      orderService
        .getOrder(orderId)
        .then(({ data }) => setOrder(data.order))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="success-page page-wrapper">
      <div className="success-bg">
        <div className="success-orb" />
      </div>
      <div className="container success-container animate-fade-in">
        <div className="success-card glass">
          <div className="success-icon-wrap">
            <FiCheckCircle className="success-icon" />
          </div>
          <h1>Order Confirmed!</h1>
          <p className="success-sub">
            Thank you for your purchase. Your order has been placed and is being processed.
          </p>

          {orderId && (
            <div className="order-id-badge">
              <FiPackage size={15} />
              <span>Order ID: <strong>{orderId}</strong></span>
            </div>
          )}

          {!loading && order && (
            <div className="success-order-details">
              <div className="success-detail-row">
                <span>Items</span>
                <span>{order.items?.length}</span>
              </div>
              <div className="success-detail-row">
                <span>Total Paid</span>
                <span className="success-amount">${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="success-detail-row">
                <span>Payment Status</span>
                <span className={`badge badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="success-detail-row">
                <span>Shipping to</span>
                <span>{order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
              </div>
            </div>
          )}

          <div className="success-steps">
            <h3>What happens next?</h3>
            <div className="step-timeline">
              <div className="timeline-step done">
                <div className="timeline-dot" />
                <div>
                  <strong>Order Placed</strong>
                  <p>Your order has been received</p>
                </div>
              </div>
              <div className="timeline-connector done" />
              <div className="timeline-step current">
                <div className="timeline-dot" />
                <div>
                  <strong>Processing</strong>
                  <p>Seller is preparing your items</p>
                </div>
              </div>
              <div className="timeline-connector" />
              <div className="timeline-step">
                <div className="timeline-dot" />
                <div>
                  <strong>Shipped</strong>
                  <p>Your order is on the way</p>
                </div>
              </div>
              <div className="timeline-connector" />
              <div className="timeline-step">
                <div className="timeline-dot" />
                <div>
                  <strong>Delivered</strong>
                  <p>Enjoy your purchase!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="success-actions">
            {orderId && (
              <Link to={`/orders/${orderId}`} className="btn btn-primary" id="view-order-btn">
                <FiPackage /> View Order Details
              </Link>
            )}
            <Link to="/orders" className="btn btn-secondary" id="all-orders-btn">
              All Orders
            </Link>
            <Link to="/products" className="btn btn-ghost" id="continue-shopping-success-btn">
              <FiShoppingBag /> Continue Shopping <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
