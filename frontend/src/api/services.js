import api from './axios';

/**
 * AUTHENTICATION SERVICE:
 * Handles login, registration, and password recovery.
 */
export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    socialLogin: (data) => api.post('/auth/social-login', data),
    verify2fa: (data) => api.post('/auth/verify-2fa', data),
};

/**
 * SYSTEM SETTINGS SERVICE (Admin/Public):
 * Manages global configurations like store info, currencies, and system metadata.
 */
export const settingsService = {
    getAll: () => api.get('/settings'),
    getPublic: () => api.get('/settings/public'),
    update: (key, value) => api.put(`/settings/${key}`, { value }),
    updateBatch: (settings) => api.put('/settings/batch', settings),
};

/**
 * TWO-FACTOR AUTHENTICATION (User):
 * Manages security enhancement for user accounts.
 */
export const twoFactorService = {
    setup: () => api.post('/2fa/setup'),
    setupEmail: () => api.post('/2fa/setup-email'),
    enable: (data) => api.post('/2fa/enable', data),
    enableEmail: (data) => api.post('/2fa/enable-email', data),
    disable: (data) => api.post('/2fa/disable', data),
    changeMethod: (method) => api.patch('/2fa/method', { method }),
};

/**
 * PRODUCT MANAGEMENT SERVICE:
 * Handles search, filters, CRUD operations, and status toggling for products.
 */
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

/**
 * CATEGORY SERVICE:
 * Manages logical grouping of food products.
 */
export const categoryService = {
    getAll: () => api.get('/categories'),
    getAllAdmin: () => api.get('/categories/all'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    toggleStatus: (id) => api.patch(`/categories/${id}/toggle-status`),
};

/**
 * SHOPPING CART SERVICE:
 * Manages temporary storage of products for checkout.
 */
export const cartService = {
    get: () => api.get('/cart'),
    addItem: (data) => api.post('/cart/items', data),
    updateItem: (cartItemId, data) => api.put(`/cart/items/${cartItemId}`, data),
    removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
    clear: () => api.delete('/cart'),
};

/**
 * ORDER MANAGEMENT SERVICE (User/Admin):
 * Handles order creation, tracking, cancellation (By code or ID), and administrative status updates.
 */
export const orderService = {
    create: (data) => api.post('/orders', data),
    myOrders: (params) => api.get('/orders/my-orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    getByCode: (code) => api.get(`/orders/code/${code}`),
    // Supports Code-based cancel call for detail pages
    cancel: (code) => api.delete(`/orders/code/${code}/cancel`),
    
    // Administrative Endpoints
    getAll: (params) => api.get('/orders', { params }),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status?status=${status}`),
    refund: (id) => api.post(`/orders/${id}/refund`),
    requestReturn: (code, reason, returnMedia) => {
        const params = new URLSearchParams();
        if (reason) params.append('reason', reason);
        if (returnMedia) params.append('returnMedia', returnMedia);
        return api.post(`/orders/code/${code}/return?${params.toString()}`);
    },
    confirmReturn: (id) => api.post(`/orders/${id}/confirm-return`),
    rejectReturn: (id, reason) => api.post(`/orders/${id}/reject-return?reason=${encodeURIComponent(reason)}`),
    confirmPayment: (code, note, proof) => api.post(`/orders/code/${code}/confirm-payment`, null, { params: { note, proof } }),
    getRefundRequests: (params) => api.get('/orders/refund-requests', { params }),
};

/**
 * CUSTOMER REVIEW SERVICE:
 * Manages product feedback and administrative moderation.
 */
export const reviewService = {
    byProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
    add: (formData) => api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    myReviews: (params) => api.get('/reviews/my-reviews', { params }),
    update: (id, formData) => api.put(`/reviews/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteMy: (id) => api.delete(`/reviews/my/${id}`),
    // Admin
    getAll: (params) => api.get('/reviews/admin/all', { params }),
    moderate: (id, data) => api.put(`/reviews/admin/${id}/moderate`, data),
    canReview: (productId) => api.get(`/reviews/can-review/${productId}`),
    adminDelete: (id) => api.delete(`/reviews/${id}`),
};

/**
 * FARM MANAGEMENT SERVICE:
 * Manages source locations for organic products.
 */
export const farmService = {
    getAll: (params) => api.get('/farms', { params }),
    getById: (id) => api.get(`/farms/${id}`),
    search: (name, params) => api.get('/farms/search', { params: { name, ...params } }),
    create: (data) => api.post('/farms', data),
    update: (id, data) => api.put(`/farms/${id}`, data),
    delete: (id) => api.delete(`/farms/${id}`),
};

/**
 * BATCH MANAGEMENT SERVICE:
 * Maintains accurate inventory and expiry mapping.
 */
export const batchService = {
    getAll: (params) => api.get('/batches', { params }),
    getById: (id) => api.get(`/batches/${id}`),
    nearExpiry: (days) => api.get('/batches/near-expiry', { params: { days } }),
    create: (data) => api.post('/batches', data),
    update: (id, data) => api.put(`/batches/${id}`, data),
    delete: (id) => api.delete(`/batches/${id}`),
};

/**
 * ADMIN DASHBOARD SERVICE:
 * Provides summarized statistics for the store owner.
 */
export const dashboardService = {
    get: () => api.get('/dashboard'),
};

/**
 * USER MANAGEMENT SERVICE (Admin/Profile):
 * Manages user profile, avatars, and administrative status.
 */
export const userService = {
    me: () => api.get('/users/me'),
    updateMe: (data) => api.put('/users/me', data),
    updateAvatar: (formData) => api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    removeAvatar: () => api.delete('/users/me/avatar'),
    getAll: (params) => api.get('/users', { params }),
    adminUpdate: (id, data) => api.put(`/users/${id}/admin`, data),
    toggleActive: (id) => api.patch(`/users/${id}/toggle-status`),
    delete: (id) => api.delete(`/users/${id}`),
};

/**
 * SHIPMENT ADDRESSES SERVICE:
 * Manages multiple delivery locations for shoppers.
 */
export const addressService = {
    getAll: () => api.get('/addresses'),
    create: (data) => api.post('/addresses', data),
    update: (id, data) => api.put(`/addresses/${id}`, data),
    setDefault: (id) => api.patch(`/addresses/${id}/default`),
    delete: (id) => api.delete(`/addresses/${id}`),
};

/**
 * AI ANALYTICS SERVICE:
 * Integration with AI for smart visual analysis or predictions.
 */
export const aiService = {
    analyze: (formData) => api.post('/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

/**
 * COUPONS & VOUCHERS SERVICE:
 * Promotion management and checkout validation.
 */
export const couponService = {
    getAll: () => api.get('/coupons'),
    getById: (id) => api.get(`/coupons/${id}`),
    create: (data) => api.post('/coupons', data),
    update: (id, data) => api.put(`/coupons/${id}`, data),
    delete: (id) => api.delete(`/coupons/${id}`),
    validate: (code, amount) => api.get(`/coupons/validate/${code}`, { params: { amount } }),
    gift: (data) => api.post('/coupons/send-personal-gift', data),
    getMyCoupons: () => api.get('/coupons/my-vouchers'),
};

/**
 * NOTIFICATION SERVICE:
 * Real-time or batch notifications for users.
 */
export const notificationService = {
    getAll: (params) => api.get('/notifications', { params }),
    getUnread: () => api.get('/notifications/unread'),
    getUnreadCount: () => api.get('/notifications/unread/count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    deleteAll: () => api.delete('/notifications/delete-all'),
};

/**
 * WISHLIST SERVICE:
 * Manages user-favorite products.
 */
export const wishlistService = {
    getAll: () => api.get('/wishlist'),
    add: (productId) => api.post(`/wishlist/${productId}`),
    remove: (productId) => api.delete(`/wishlist/${productId}`),
    check: (productId) => api.get(`/wishlist/check/${productId}`),
    count: () => api.get('/wishlist/count'),
};

/**
 * NEWSLETTER SUBSCRIPTION SERVICE:
 * Handles mailing list management.
 */
export const newsletterService = {
    subscribe: (email) => api.post('/newsletters/subscribe', { email }),
    getAll: () => api.get('/newsletters/all'),
    send: (data) => api.post('/newsletters/send', data),
    delete: (id) => api.delete(`/newsletters/${id}`),
};

/**
 * CLOUDINARY MEDIA SERVICE:
 * Handles administrative image/video storage and deletion.
 */
export const mediaService = {
    upload: (formData) => api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: () => api.get('/media/all'),
    delete: (id) => api.delete(`/media/${id}`),
};

/**
 * CONTACT ENQUIRY SERVICE:
 * Manages support messages from shoppers.
 */
export const contactService = {
    send: (data) => api.post('/contacts', data),
    getAll: (params) => api.get('/contacts', { params }),
    markAsRead: (id) => api.put(`/contacts/${id}/read`),
    delete: (id) => api.delete(`/contacts/${id}`),
    getUnreadCount: () => api.get('/contacts/unread/count'),
};

/**
 * FLASH SALE SERVICE:
 * Manages time-limited product promotions.
 */
export const flashSaleService = {
    getActive: () => api.get('/flash-sales/active'),
    getUpcoming: () => api.get('/flash-sales/upcoming'),
    getAll: () => api.get('/flash-sales'),
    create: (data) => api.post('/flash-sales', data),
    delete: (id) => api.delete(`/flash-sales/${id}`),
    toggle: (id) => api.patch(`/flash-sales/${id}/toggle`),
};

/**
 * PAYMENT GATEWAY SERVICE (VnPay, SePay):
 * Handles secure link creation for online transactions.
 */
export const paymentService = {
    createVnPayUrl: (orderCode) => api.post(`/payment/vnpay/create`, null, { params: { orderCode } }),
};

/**
 * AUDIT LOGGING SERVICE:
 * Accesses system-wide administrative activity history.
 */
export const auditService = {
    getAll: (params) => api.get('/audit/logs', { params }),
    getById: (id) => api.get(`/audit/logs/${id}`),
};

/**
 * SECURITY AUDIT SERVICE:
 * Accesses critical security event logs.
 */
export const securityLogService = {
    getAll: (params) => api.get('/admin/security/logs', { params }),
    getByIp: (ip, params) => api.get(`/admin/security/logs/ip/${ip}`, { params }),
};
