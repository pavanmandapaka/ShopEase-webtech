import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  // Prevent multiple simultaneous logout redirects
  const loggingOut = useRef(false);

  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('activeRole') || 'user';
  });

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .getMe()
        .then(({ data }) => {
          setUser(data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for 401 events fired by the api interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      if (loggingOut.current) return;
      loggingOut.current = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.error('Your session has expired. Please log in again.');
      navigate('/login', { replace: true });
      setTimeout(() => { loggingOut.current = false; }, 2000);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    setActiveRole('user');
    localStorage.setItem('activeRole', 'user');
    return data;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const { data } = await authService.register({ name, email, password, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    setActiveRole('user');
    localStorage.setItem('activeRole', 'user');
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
    setUser(null);
    setIsAuthenticated(false);
    setActiveRole('user');
    toast.success('Logged out successfully');
  }, []);

  const switchRole = useCallback((role) => {
    setActiveRole(role);
    localStorage.setItem('activeRole', role);
    toast.success(`Switched to ${role === 'seller' ? 'Seller' : 'Buyer'} mode`);
    navigate(role === 'seller' ? '/seller/dashboard' : '/');
  }, [navigate]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const isSellerMode = activeRole === 'seller';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        isAuthenticated, 
        activeRole,
        switchRole,
        login, 
        register, 
        logout, 
        updateUser, 
        isSellerMode, 
        isAdmin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};