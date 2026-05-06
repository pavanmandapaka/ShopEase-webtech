import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-container animate-fade-in">
        <div className="auth-card glass">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <div className="logo-icon">S</div>
              <span>ShopEase</span>
            </Link>
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue shopping</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" size={17} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  style={{ paddingLeft: 44 }}
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" size={17} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min. 6 characters"
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span className="spinner spinner-sm" />
              ) : (
                <>
                  <FiLogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="demo-creds">
            <span className="demo-label">One-tap login (use these to test)</span>
            <div className="demo-row">
              <button 
                type="button"
                className="demo-item-btn"
                onClick={async () => {
                  setFormData({ email: 'user@demo.com', password: 'demo123' });
                  try {
                    setLoading(true);
                    await login('user@demo.com', 'demo123');
                    toast.success('Logged in as Shopper');
                    navigate(redirect);
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <strong>Shopper</strong>
                <code>user@demo.com</code>
              </button>
              <button 
                type="button"
                className="demo-item-btn"
                onClick={async () => {
                  setFormData({ email: 'seller@demo.com', password: 'demo123' });
                  try {
                    setLoading(true);
                    await login('seller@demo.com', 'demo123');
                    toast.success('Logged in as Seller');
                    navigate(redirect);
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <strong>Seller</strong>
                <code>seller@demo.com</code>
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <Link to="/register" id="register-link">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
