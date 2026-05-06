import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiShoppingCart, FiUser, FiMenu, FiX, FiSearch,
  FiPackage, FiLogOut, FiSettings, FiBarChart2,
  FiHeart, FiChevronDown
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, isSeller } = useAuth();
  const { cartCount, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">ShopEase</span>
        </Link>

        {/* Search (Desktop) */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="navbar-search-input"
          />
        </form>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
            Products
          </Link>
          {isSeller && (
            <Link
              to="/seller/dashboard"
              className={`nav-link ${location.pathname.startsWith('/seller') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <button
            className="nav-icon-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open cart"
            id="cart-btn"
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </button>

          {/* Profile */}
          {isAuthenticated ? (
            <div className="profile-menu-wrapper">
              <button
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                id="profile-btn"
              >
                <div className="avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="profile-name">{user?.name?.split(' ')[0]}</span>
                <FiChevronDown
                  size={14}
                  style={{ transform: profileOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}
                />
              </button>

              {profileOpen && (
                <div className="profile-dropdown glass">
                  <div className="dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                    <span className={`badge badge-${user?.role === 'seller' ? 'primary' : 'info'}`}>
                      {user?.role}
                    </span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/orders" className="dropdown-item" id="orders-menu-link">
                    <FiPackage size={15} /> My Orders
                  </Link>
                  <Link to="/wishlist" className="dropdown-item" id="wishlist-menu-link">
                    <FiHeart size={15} /> Wishlist
                  </Link>
                  <Link to="/profile" className="dropdown-item" id="profile-menu-link">
                    <FiSettings size={15} /> Profile Settings
                  </Link>
                  {isSeller && (
                    <Link to="/seller/dashboard" className="dropdown-item" id="seller-dash-link">
                      <FiBarChart2 size={15} /> Seller Dashboard
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout} id="logout-btn">
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm" id="login-nav-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-nav-btn">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu glass">
          <form className="mobile-search" onSubmit={handleSearch}>
            <FiSearch />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="mobile-search-input"
            />
          </form>
          <Link to="/products" className="mobile-link">Products</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="mobile-link">My Orders</Link>
              <Link to="/wishlist" className="mobile-link">Wishlist</Link>
              <Link to="/profile" className="mobile-link">Profile</Link>
              {isSeller && <Link to="/seller/dashboard" className="mobile-link">Seller Dashboard</Link>}
              <button className="mobile-link danger" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Login</Link>
              <Link to="/register" className="mobile-link">Sign Up</Link>
            </>
          )}
        </div>
      )}

      {/* Close profile dropdown on outside click */}
      {profileOpen && (
        <div
          className="dropdown-backdrop"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
