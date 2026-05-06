import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiMapPin, FiClock } from 'react-icons/fi';
import { orderService } from '../services';
import './OrdersPage.css';

const STATUS_COLORS = {
  pending: 'warning',
  paid: 'info',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'error',
};

const OrdersPage = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    orderService
      .getUserOrders({ limit: 20 })
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (id) {
      setDetailLoading(true);
      orderService
        .getOrder(id)
        .then(({ data }) => setSelectedOrder(data.order))
        .catch(console.error)
        .finally(() => setDetailLoading(false));
    }
  }, [id]);

  const handleSelectOrder = async (orderId) => {
    if (selectedOrder?._id === orderId) { setSelectedOrder(null); return; }
    setDetailLoading(true);
    try {
      const { data } = await orderService.getOrder(orderId);
      setSelectedOrder(data.order);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="orders-page page-wrapper">
      <div className="container">
        <div className="page-header-row">
          <h1>My Orders</h1>
          <Link to="/products" className="btn btn-secondary btn-sm">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div className="orders-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="order-card-skeleton card">
                <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '30%' }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={48} style={{ opacity: 0.25 }} />
            <h3>No orders yet</h3>
            <p>Your orders will appear here once you make a purchase</p>
            <Link to="/products" className="btn btn-primary" id="shop-now-orders-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-layout">
            {/* Orders List */}
            <div className="orders-list">
              {orders.map((order) => (
                <button
                  key={order._id}
                  className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                  onClick={() => handleSelectOrder(order._id)}
                  id={`order-${order._id}`}
                >
                  <div className="order-card-header">
                    <div>
                      <span className="order-number">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">
                        <FiClock size={12} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className={`badge badge-${STATUS_COLORS[order.status] || 'info'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-card-meta">
                    <span><FiPackage size={13} /> {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                    <span className="order-total">${order.totalAmount?.toFixed(2)}</span>
                  </div>
                  {order.items?.slice(0, 2).map((item) => (
                    <div key={item.product?._id || item._id} className="order-item-preview">
                      <img
                        src={item.image || 'https://placehold.co/40x40/1c1c27/6c63ff?text=?'}
                        alt={item.title}
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40/1c1c27/6c63ff?text=?'; }}
                      />
                      <span>{item.title}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </button>
              ))}
            </div>

            {/* Order Detail */}
            <div className="order-detail-panel glass">
              {detailLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                  <div className="spinner" />
                </div>
              ) : !selectedOrder ? (
                <div className="select-order-hint">
                  <FiPackage size={40} style={{ opacity: 0.25 }} />
                  <p>Select an order to view details</p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="detail-panel-header">
                    <div>
                      <h2>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                      <span className="order-date">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className={`badge badge-${STATUS_COLORS[selectedOrder.status] || 'info'}`}
                      style={{ fontSize: '0.875rem', padding: '6px 14px' }}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  <div className="order-timeline">
                    {selectedOrder.statusHistory?.map((h, i) => (
                      <div key={i} className="timeline-entry">
                        <div className="timeline-dot-sm" />
                        <div>
                          <strong>{h.status}</strong>
                          <span>{h.note}</span>
                          <time>{new Date(h.timestamp).toLocaleString()}</time>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.trackingNumber && (
                    <div className="tracking-row">
                      <FiTruck size={16} />
                      <span>Tracking: <strong>{selectedOrder.trackingNumber}</strong></span>
                    </div>
                  )}

                  {/* Items */}
                  <h3 className="detail-section-title">Items Ordered</h3>
                  <div className="detail-items-list">
                    {selectedOrder.items.map((item) => (
                      <div key={item._id} className="detail-order-item">
                        <img
                          src={item.image || 'https://placehold.co/56x56/1c1c27/6c63ff?text=?'}
                          alt={item.title}
                          onError={(e) => { e.target.src = 'https://placehold.co/56x56/1c1c27/6c63ff?text=?'; }}
                        />
                        <div className="detail-item-info">
                          <strong>{item.title}</strong>
                          <span>Qty: {item.quantity} · ${item.price.toFixed(2)} each</span>
                        </div>
                        <span className="detail-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping */}
                  <div className="detail-section-block">
                    <h3 className="detail-section-title"><FiMapPin size={15} /> Shipping Address</h3>
                    <div className="address-block">
                      <p>{selectedOrder.shippingAddress?.fullName}</p>
                      <p>{selectedOrder.shippingAddress?.street}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="detail-totals">
                    <div className="summary-row"><span>Subtotal</span><span>${selectedOrder.subtotal?.toFixed(2)}</span></div>
                    <div className="summary-row"><span>Shipping</span><span>${selectedOrder.shippingCost?.toFixed(2)}</span></div>
                    <div className="summary-row"><span>Tax</span><span>${selectedOrder.tax?.toFixed(2)}</span></div>
                    <div className="summary-divider" />
                    <div className="summary-total"><span>Total</span><span>${selectedOrder.totalAmount?.toFixed(2)}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
