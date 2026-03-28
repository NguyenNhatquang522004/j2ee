import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Required for CSRF cookies (XSRF-TOKEN)
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => {
        console.log(`API Response [${res.config.method.toUpperCase()}] ${res.config.url}:`, res.data);
        return res.data;
    },
    (err) => {
        console.error(`API Error [${err.config?.method?.toUpperCase()}] ${err.config?.url}:`, err.response?.data || err.message);
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        if (err.response?.status === 503 && !window.location.pathname.startsWith('/admin')) {
            window.location.href = '/maintenance';
        }
        return Promise.reject(err);
    }
);

export default api;
