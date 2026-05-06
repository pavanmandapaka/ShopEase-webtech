import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  toggleWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (formData) =>
    api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCartItem: (data) => api.put('/cart/update', data),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export const orderService = {
  getUserOrders: (params) => api.get('/orders/user', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getSellerOrders: (params) => api.get('/orders/seller', { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getSellerStats: () => api.get('/orders/seller/stats'),
};

export const paymentService = {
  createCheckoutSession: (data) => api.post('/payment/create-session', data),
  getSessionStatus: (sessionId) => api.get(`/payment/session/${sessionId}`),
};
