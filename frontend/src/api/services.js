import api from './axios';

// Auth
export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

// Products
export const productService = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    search: (keyword, params) => api.get('/products/search', { params: { keyword, ...params } }),
    topSelling: () => api.get('/products/top-selling'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Categories
export const categoryService = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Cart
export const cartService = {
    get: () => api.get('/cart'),
    addItem: (data) => api.post('/cart/items', data),
    updateItem: (cartItemId, data) => api.put(`/cart/items/${cartItemId}`, data),
    removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
    clear: () => api.delete('/cart'),
};

// Orders
export const orderService = {
    create: (data) => api.post('/orders', data),
    myOrders: (params) => api.get('/orders/my-orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id) => api.delete(`/orders/${id}/cancel`),
    // Admin
    getAll: (params) => api.get('/orders', { params }),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status?status=${status}`),
};

// Reviews
export const reviewService = {
    byProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
    add: (data) => api.post('/reviews', data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// Farms
export const farmService = {
    getAll: (params) => api.get('/farms', { params }),
    getById: (id) => api.get(`/farms/${id}`),
    search: (name, params) => api.get('/farms/search', { params: { name, ...params } }),
    create: (data) => api.post('/farms', data),
    update: (id, data) => api.put(`/farms/${id}`, data),
    delete: (id) => api.delete(`/farms/${id}`),
};

// Batches
export const batchService = {
    getAll: (params) => api.get('/batches', { params }),
    getById: (id) => api.get(`/batches/${id}`),
    nearExpiry: (days) => api.get('/batches/near-expiry', { params: { days } }),
    create: (data) => api.post('/batches', data),
    update: (id, data) => api.put(`/batches/${id}`, data),
    delete: (id) => api.delete(`/batches/${id}`),
};

// Dashboard (admin)
export const dashboardService = {
    get: () => api.get('/dashboard'),
};

// Users (admin)
export const userService = {
    me: () => api.get('/users/me'),
    updateMe: (data) => api.put('/users/me', data),
    getAll: (params) => api.get('/users', { params }),
    toggleActive: (id) => api.patch(`/users/${id}/toggle-status`),
};

// Addresses
export const addressService = {
    getAll: () => api.get('/addresses'),
    create: (data) => api.post('/addresses', data),
    update: (id, data) => api.put(`/addresses/${id}`, data),
    setDefault: (id) => api.patch(`/addresses/${id}/default`),
    delete: (id) => api.delete(`/addresses/${id}`),
};

// AI
export const aiService = {
    analyze: (formData) => api.post('/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const wishlistService = {
    getAll: () => api.get('/wishlist'),
    add: (productId) => api.post(`/wishlist/${productId}`),
    remove: (productId) => api.delete(`/wishlist/${productId}`),
    check: (productId) => api.get(`/wishlist/check/${productId}`),
    count: () => api.get('/wishlist/count'),
};
