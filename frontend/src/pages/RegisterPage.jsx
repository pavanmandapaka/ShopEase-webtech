import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiShoppingBag, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'user';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Account created! Welcome to ShopEase.');
      navigate(formData.role === 'seller' ? '/seller/dashboard' : '/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <h1>Create your account</h1>
            <p>Join thousands of shoppers on ShopEase</p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${formData.role === 'user' ? 'active' : ''}`}
              onClick={() => setFormData((p) => ({ ...p, role: 'user' }))}
              id="role-user-btn"
            >
              <FiShoppingBag size={16} /> Shopper
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'seller' ? 'active' : ''}`}
              onClick={() => setFormData((p) => ({ ...p, role: 'seller' }))}
              id="role-seller-btn"
            >
              <FiBarChart2 size={16} /> Seller
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full name</label>
              <div className="input-icon-wrapper">
                <FiUser className="input-icon" size={17} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="John Smith"
                  style={{ paddingLeft: 44 }}
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" size={17} />
                <input
                  id="reg-email"
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

            <div className="auth-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" size={17} />
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
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
                    aria-label="Toggle password"
                  >
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" size={17} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Repeat password"
                    style={{ paddingLeft: 44 }}
                  />
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                <span className="spinner spinner-sm" />
              ) : (
                <>
                  <FiUserPlus size={18} /> Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" id="login-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
