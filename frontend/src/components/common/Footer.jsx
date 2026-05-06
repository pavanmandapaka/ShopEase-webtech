import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">S</div>
              <span>ShopEase</span>
            </div>
            <p>
              Your premium destination for quality products from trusted sellers worldwide.
              Shop with confidence, pay securely.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter" className="social-btn"><FiTwitter /></a>
              <a href="#" aria-label="Instagram" className="social-btn"><FiInstagram /></a>
              <a href="#" aria-label="GitHub" className="social-btn"><FiGithub /></a>
              <a href="mailto:hello@shopease.com" aria-label="Email" className="social-btn"><FiMail /></a>
            </div>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products?category=Electronics">Electronics</Link>
            <Link to="/products?category=Clothing">Clothing</Link>
            <Link to="/products?category=Books">Books</Link>
            <Link to="/products?category=Sports">Sports</Link>
            <Link to="/products?featured=true">Featured</Link>
          </div>

          {/* Account */}
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/register?role=seller">Become a Seller</Link>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Shipping Info</a>
            <a href="#">Returns</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
          <div className="payment-badges">
            <span className="payment-badge">Stripe</span>
            <span className="payment-badge">SSL Secured</span>
            <span className="payment-badge">PCI Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
