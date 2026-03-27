import api from './axios';

// Auth
export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    socialLogin: (data) => api.post('/auth/social-login', data),
    verify2fa: (data) => api.post('/auth/verify-2fa', data),
};

// Settings (admin)
export const settingsService = {
    getAll: () => api.get('/settings'),
    update: (key, value) => api.put(`/settings/${key}`, { value }),
    updateBatch: (settings) => api.put('/settings/batch', settings),
};

// 2FA Management (user)
export const twoFactorService = {
    setup: () => api.post('/2fa/setup'),
    setupEmail: () => api.post('/2fa/setup-email'),
    enable: (data) => api.post('/2fa/enable', data),
    enableEmail: (data) => api.post('/2fa/enable-email', data),
    disable: (data) => api.post('/2fa/disable', data),
    changeMethod: (method) => api.patch('/2fa/method', { method }),
};

// Products
export const productService = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    search: (name, params) => api.get('/products', { params: { name, ...params } }),
    topSelling: () => api.get('/products/top-selling'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    toggleStatus: (id) => api.patch(`/products/${id}/toggle-status`),
};

// Categories
export const categoryService = {
    getAll: () => api.get('/categories'),
    getAllAdmin: () => api.get('/categories/all'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    toggleStatus: (id) => api.patch(`/categories/${id}/toggle-status`),
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
    add: (formData) => api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/reviews/${id}`),
    // Admin
    getAll: (params) => api.get('/reviews/admin/all', { params }),
    moderate: (id, data) => api.put(`/reviews/admin/${id}/moderate`, data),
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
    updateAvatar: (formData) => api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
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

// Coupons
export const couponService = {
    getAll: () => api.get('/coupons'),
    getById: (id) => api.get(`/coupons/${id}`),
    create: (data) => api.post('/coupons', data),
    update: (id, data) => api.put(`/coupons/${id}`, data),
    delete: (id) => api.delete(`/coupons/${id}`),
    validate: (code, amount) => api.get(`/coupons/validate/${code}`, { params: { amount } }),
};

export const wishlistService = {
    getAll: () => api.get('/wishlist'),
    add: (productId) => api.post(`/wishlist/${productId}`),
    remove: (productId) => api.delete(`/wishlist/${productId}`),
    check: (productId) => api.get(`/wishlist/check/${productId}`),
    count: () => api.get('/wishlist/count'),
};

export const newsletterService = {
    subscribe: (email) => api.post('/newsletters/subscribe', { email }),
    getAll: () => api.get('/newsletters/all'),
    send: (data) => api.post('/newsletters/send', data),
    delete: (id) => api.delete(`/newsletters/${id}`),
};

// Media (Cloudinary)
export const mediaService = {
    upload: (formData) => api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: () => api.get('/media/all'),
    delete: (id) => api.delete(`/media/${id}`),
};
