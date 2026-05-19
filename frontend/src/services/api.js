import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle 401s
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        console.warn(`[Session] Unauthorized access to ${error.config.url}. Clearing session and redirecting to login.`);
        
        // Clear storage and state if unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        
        // Only redirect if we're not already on the landing or login page
        // Use a flag to prevent multiple rapid redirects
        if (!window.location.pathname.includes('/login') && window.location.pathname !== '/' && !window.__is_redirecting) {
            window.__is_redirecting = true;
            window.location.href = '/login?expired=true';
        }
    }
    return Promise.reject(error);
});

export default api;
