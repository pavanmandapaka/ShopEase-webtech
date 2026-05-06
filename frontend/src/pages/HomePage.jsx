import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiStar,
  FiZap, FiShoppingBag, FiAward, FiMonitor, FiBook,
  FiHome, FiActivity, FiCpu, FiDroplet, FiTool, FiPackage
} from 'react-icons/fi';
import { productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import './HomePage.css';

const CATEGORIES = [
  { name: 'Electronics', icon: <FiMonitor />, color: '#6c63ff' },
  { name: 'Clothing', icon: <FiShoppingBag />, color: '#ff6b6b' },
  { name: 'Books', icon: <FiBook />, color: '#00d68f' },
  { name: 'Home & Garden', icon: <FiHome />, color: '#ffb347' },
  { name: 'Sports', icon: <FiActivity />, color: '#00b4d8' },
  { name: 'Beauty', icon: <FiDroplet />, color: '#f72585' },
  { name: 'Toys', icon: <FiPackage />, color: '#7209b7' },
  { name: 'Automotive', icon: <FiTool />, color: '#4cc9f0' },
];

const FEATURES = [
  { icon: <FiShield size={24} />, title: 'Secure Payments', desc: 'All transactions secured by Stripe with 256-bit encryption' },
  { icon: <FiTruck size={24} />, title: 'Fast Delivery', desc: 'Free shipping on orders over $50. Express delivery available' },
  { icon: <FiRefreshCw size={24} />, title: 'Easy Returns', desc: '30-day hassle-free returns for all products' },
  { icon: <FiAward size={24} />, title: 'Quality Assured', desc: 'All sellers verified for quality and authenticity' },
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, newest] = await Promise.all([
          productService.getProducts({ featured: 'true', limit: 4 }),
          productService.getProducts({ sort: '-createdAt', limit: 8 }),
        ]);
        setFeaturedProducts(featured.data.products);
        setNewArrivals(newest.data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid-pattern" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <FiZap size={14} /> New Season Sale — Up to 70% Off
          </div>
          <h1 className="hero-title">
            Shop <span className="gradient-text">Smarter.</span><br />
            Live <span className="gradient-text">Better.</span>
          </h1>
          <p className="hero-subtitle">
            Discover thousands of premium products from trusted sellers.
            Secure payments, fast delivery, and a seamless shopping experience.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg" id="hero-shop-btn">
              <FiShoppingBag /> Shop Now
            </Link>
            <Link to="/register?role=seller" className="btn btn-secondary btn-lg" id="hero-sell-btn">
              Start Selling <FiArrowRight />
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Sellers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">4.9</span>
              <span className="stat-label">
                <FiStar size={12} /> Rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Explore our wide range of product categories</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                key={cat.name}
                className="category-card"
                id={`category-${cat.name.toLowerCase().replace(' ', '-')}`}
              >
                <div className="cat-icon" style={{ '--cat-color': cat.color }}>
                  {cat.icon}
                </div>
                <span className="cat-name">{cat.name}</span>
                <FiArrowRight className="cat-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      {(loading || featuredProducts.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="section-header-row">
              <div>
                <h2>Featured Products</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                  Hand-picked by our team
                </p>
              </div>
              <Link to="/products?featured=true" className="btn btn-secondary" id="view-featured-btn">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="products-grid">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                : featuredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Banner ───────────────────────────────────────────── */}
      <section className="promo-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-text">
              <span className="banner-label">Limited Time Offer</span>
              <h2>Free Shipping on All Orders Over $50</h2>
              <p>Plus get 10% cashback on your first purchase with code <strong>WELCOME10</strong></p>
            </div>
            <Link to="/products" className="btn btn-primary btn-lg" id="banner-shop-btn">
              Shop Now <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2>New Arrivals</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                Fresh products added daily
              </p>
            </div>
            <Link to="/products?sort=-createdAt" className="btn btn-secondary" id="view-new-btn">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="products-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : newArrivals.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map((feat, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA for Sellers ──────────────────────────────────── */}
      <section className="seller-cta-section">
        <div className="container">
          <div className="seller-cta">
            <div className="seller-cta-content">
              <h2>Start Selling Today</h2>
              <p>
                Join 500+ sellers on ShopEase. List your products, manage inventory,
                and grow your business with our powerful seller dashboard.
              </p>
              <div className="seller-cta-features">
                <span>Easy product management</span>
                <span>Real-time analytics</span>
                <span>Secure payouts</span>
              </div>
              <Link to="/register?role=seller" className="btn btn-primary btn-lg" id="become-seller-btn">
                Become a Seller <FiArrowRight />
              </Link>
            </div>
            <div className="seller-cta-visual">
              <div className="dashboard-preview">
                <div className="preview-stat">
                  <div className="preview-stat-icon"><FiTruck size={20} /></div>
                  <div>
                    <strong>$12,450</strong>
                    <small>Monthly Revenue</small>
                  </div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-icon"><FiPackage size={20} /></div>
                  <div>
                    <strong>284</strong>
                    <small>Orders this month</small>
                  </div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-icon"><FiStar size={20} /></div>
                  <div>
                    <strong>4.9 / 5</strong>
                    <small>Average Rating</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="card product-card-skeleton">
    <div className="skeleton" style={{ aspectRatio: '1' }} />
    <div className="product-content" style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 18, width: '90%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 22, width: '50%', borderRadius: 4 }} />
    </div>
    <div style={{ padding: '12px 16px 16px' }}>
      <div className="skeleton" style={{ height: 40, borderRadius: 12 }} />
    </div>
  </div>
);

export default HomePage;
