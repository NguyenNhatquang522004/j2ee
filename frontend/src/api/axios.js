import axios from 'axios';

/**
 * Axios instance configuration for the FreshFood application.
 * Centralizes API base URL, request/response interceptors, and error handling.
 */
const api = axios.create({
    baseURL: '/api/v1',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Required for CSRF cookies (XSRF-TOKEN) and secure session management
});

/**
 * Request Interceptor: 
 * Injects the JWT Bearer token into the Authorization header for every outgoing request.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/**
 * Response Interceptor: 
 * Handles success/error responses from the server.
 * Includes global error handling for 401 Unauthorized (auto-logout) 
 * and 503 Service Unavailable (maintenance mode).
 */
api.interceptors.response.use(
    (res) => {
        // Log all successful API responses for easier real-time debugging
        console.log(`API Response [${res.config.method.toUpperCase()}] ${res.config.url}:`, res.data);
        return res.data;
    },
    (err) => {
        // Log all API errors with context
        console.error(`API Error [${err.config?.method?.toUpperCase()}] ${err.config?.url}:`, err.response?.data || err.message);
        
        // Auto sign-out if the token is expired or unauthorized
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        // Redirect to maintenance page if the server is under maintenance
        if (err.response?.status === 503 && !window.location.pathname.startsWith('/admin')) {
            window.location.href = '/maintenance';
        }
        
        return Promise.reject(err);
    }
);

export default api;
