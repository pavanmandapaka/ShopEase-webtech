import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only treat as a session expiry if the request was NOT a user-initiated
      // action (like checkout/payment). We signal via a custom event so that
      // AuthContext can react, instead of force-redirecting here and blowing
      // away React state mid-flow.
      const url = error.config?.url || '';
      const isPaymentRoute = url.includes('/payment');

      if (!isPaymentRoute) {
        // Dispatch a custom event; AuthContext listens and handles logout/redirect.
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;