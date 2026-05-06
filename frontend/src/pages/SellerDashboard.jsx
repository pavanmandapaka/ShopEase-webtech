import { useState, useEffect } from 'react';
import {
  FiGrid, FiPackage, FiPlusCircle, FiEdit2, FiTrash2,
  FiBarChart2, FiDollarSign, FiShoppingBag, FiStar,
  FiEye, FiCheck, FiX, FiUpload, FiAlertCircle
} from 'react-icons/fi';
import { productService, orderService } from '../services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './SellerDashboard.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Automotive', 'Other'];
const STATUS_FLOW = ['processing', 'shipped', 'delivered'];
const STATUS_COLORS = { pending: 'warning', paid: 'info', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' };

const EMPTY_PRODUCT = {
  title: '', description: '', price: '', discountPrice: '',
  category: 'Electronics', stock: '', tags: '', featured: false,
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Product Form
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT);
  const [images, setImages] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Load stats on mount
  useEffect(() => {
    orderService
      .getSellerStats()
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  // Load products when tab selected
  useEffect(() => {
    if (activeTab === 'products' && products.length === 0) {
      setProductsLoading(true);
      productService
        .getProducts({ seller: user?._id, limit: 50 })
        .then(({ data }) => setProducts(data.products))
        .catch(console.error)
        .finally(() => setProductsLoading(false));
    }
  }, [activeTab, user, products.length]);

  // Load orders when tab selected
  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      setOrdersLoading(true);
      orderService
        .getSellerOrders({ limit: 50 })
        .then(({ data }) => setOrders(data.orders))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, orders.length]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(EMPTY_PRODUCT);
    setImages([]);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      stock: product.stock,
      tags: product.tags?.join(', ') || '',
      featured: product.featured || false,
    });
    setImages([]);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));

      if (editingProduct) {
        const { data } = await productService.updateProduct(editingProduct._id, fd);
        setProducts((prev) => prev.map((p) => p._id === editingProduct._id ? data.product : p));
        toast.success('Product updated!');
      } else {
        const { data } = await productService.createProduct(fd);
        setProducts((prev) => [data.product, ...prev]);
        toast.success('Product created!');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const { data } = await orderService.updateOrderStatus(orderId, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? data.order : o));
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 size={18} /> },
    { id: 'products', label: 'Products', icon: <FiGrid size={18} /> },
    { id: 'orders', label: 'Orders', icon: <FiPackage size={18} /> },
  ];

  return (
    <div className="seller-dashboard page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>Seller Dashboard</h1>
            <p>Welcome back, <strong>{user?.name}</strong></p>
          </div>
          {activeTab === 'products' && (
            <button className="btn btn-primary" onClick={openCreateForm} id="add-product-btn">
              <FiPlusCircle size={18} /> Add Product
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`dash-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="stats-grid">
              <StatCard
                icon={<FiDollarSign size={22} />}
                label="Total Revenue"
                value={statsLoading ? '...' : `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                color="primary"
                loading={statsLoading}
              />
              <StatCard
                icon={<FiShoppingBag size={22} />}
                label="Total Orders"
                value={statsLoading ? '...' : stats?.totalOrders || 0}
                color="success"
                loading={statsLoading}
              />
              <StatCard
                icon={<FiAlertCircle size={22} />}
                label="Pending Orders"
                value={statsLoading ? '...' : stats?.pendingOrders || 0}
                color="warning"
                loading={statsLoading}
              />
              <StatCard
                icon={<FiGrid size={22} />}
                label="Active Products"
                value={statsLoading ? '...' : stats?.totalProducts || 0}
                color="info"
                loading={statsLoading}
              />
            </div>

            {/* Recent Orders */}
            {stats?.recentOrders?.length > 0 && (
              <div className="dash-section">
                <h2>Recent Orders</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td><code>{order._id.slice(-8).toUpperCase()}</code></td>
                          <td>{order.user?.name}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${STATUS_COLORS[order.status] || 'info'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>${order.totalAmount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Products */}
            {stats?.topProducts?.length > 0 && (
              <div className="dash-section">
                <h2>Top Selling Products</h2>
                <div className="top-products-list">
                  {stats.topProducts.map((p, i) => (
                    <div key={p._id} className="top-product-row">
                      <span className="rank">#{i + 1}</span>
                      <div className="top-product-info">
                        <strong>{p.title}</strong>
                        <span>{p.totalSold} sold</span>
                      </div>
                      <span className="top-product-revenue">${p.revenue?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            {productsLoading ? (
              <div className="dash-loading"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <FiGrid size={48} style={{ opacity: 0.25 }} />
                <h3>No products yet</h3>
                <p>Create your first product to start selling</p>
                <button className="btn btn-primary" onClick={openCreateForm}>Add First Product</button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="product-table-cell">
                            <img
                              src={product.images?.[0]?.url || 'https://placehold.co/40x40/1c1c27/6c63ff?text=?'}
                              alt={product.title}
                              className="product-thumb"
                              onError={(e) => { e.target.src = 'https://placehold.co/40x40/1c1c27/6c63ff?text=?'; }}
                            />
                            <span>{product.title?.substring(0, 35)}{product.title?.length > 35 ? '...' : ''}</span>
                          </div>
                        </td>
                        <td><span className="badge badge-info">{product.category}</span></td>
                        <td>
                          <div>
                            <strong>${(product.discountPrice || product.price).toFixed(2)}</strong>
                            {product.discountPrice && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'line-through', marginLeft: 6 }}>
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={product.stock < 5 ? 'low-stock' : ''}>{product.stock}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiStar size={13} style={{ color: 'var(--warning)' }} />
                            {product.rating?.toFixed(1)} ({product.numReviews})
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <a href={`/products/${product._id}`} target="_blank" rel="noreferrer" className="action-icon-btn" title="View">
                              <FiEye size={16} />
                            </a>
                            <button className="action-icon-btn edit" onClick={() => openEditForm(product)} title="Edit" id={`edit-${product._id}`}>
                              <FiEdit2 size={16} />
                            </button>
                            <button className="action-icon-btn danger" onClick={() => handleDeleteProduct(product._id)} title="Delete" id={`delete-${product._id}`}>
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            {ordersLoading ? (
              <div className="dash-loading"><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <FiPackage size={48} style={{ opacity: 0.25 }} />
                <h3>No orders yet</h3>
                <p>Orders for your products will appear here</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td><code>{order._id.slice(-8).toUpperCase()}</code></td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '0.875rem' }}>{order.user?.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</span>
                          </div>
                        </td>
                        <td>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td><strong>${order.totalAmount?.toFixed(2)}</strong></td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${STATUS_COLORS[order.status] || 'info'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {!['delivered', 'cancelled'].includes(order.status) && (
                            <select
                              className="form-input form-select status-select"
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) handleStatusUpdate(order._id, e.target.value);
                                e.target.value = '';
                              }}
                              id={`status-select-${order._id}`}
                            >
                              <option value="" disabled>Update...</option>
                              {STATUS_FLOW.filter((s) => s !== order.status).map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                              <option value="cancelled">Cancel</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="product-modal glass-strong">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)} id="close-modal-btn">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="product-form">
              <div className="form-row-modal">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Product title"
                    required
                    id="product-title-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-input form-select" value={formData.category} onChange={handleFormChange} id="product-category-select">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows={4}
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe your product..."
                  required
                  style={{ resize: 'vertical' }}
                  id="product-desc-input"
                />
              </div>

              <div className="form-row-modal">
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-input"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    required
                    id="product-price-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price ($)</label>
                  <input
                    name="discountPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-input"
                    value={formData.discountPrice}
                    onChange={handleFormChange}
                    placeholder="Optional"
                    id="product-discount-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    className="form-input"
                    value={formData.stock}
                    onChange={handleFormChange}
                    placeholder="0"
                    required
                    id="product-stock-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  name="tags"
                  className="form-input"
                  value={formData.tags}
                  onChange={handleFormChange}
                  placeholder="wireless, bluetooth, audio"
                  id="product-tags-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Images</label>
                <label className="image-upload-area" htmlFor="product-images">
                  <FiUpload size={24} />
                  <span>{images.length > 0 ? `${images.length} file(s) selected` : 'Click to upload images'}</span>
                  <small>JPG, PNG, WebP up to 5MB each</small>
                  <input
                    id="product-images"
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setImages(Array.from(e.target.files))}
                  />
                </label>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleFormChange}
                  id="product-featured-check"
                />
                <span>Mark as Featured Product</span>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading} id="save-product-btn">
                  {formLoading ? <span className="spinner spinner-sm" /> : <><FiCheck size={16} /> {editingProduct ? 'Update Product' : 'Create Product'}</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, loading }) => (
  <div className={`stat-card stat-card-${color}`}>
    <div className="stat-card-icon">{icon}</div>
    <div>
      <div className="stat-card-value">{loading ? <span className="skeleton" style={{ width: 80, height: 28, display: 'inline-block' }} /> : value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  </div>
);

export default SellerDashboard;
