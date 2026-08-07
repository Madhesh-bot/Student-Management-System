import axios from 'axios';

// Create base axios instance
const api = axios.create({
  baseURL: '/api', // Proxied by Vite dev server to Express (http://localhost:5000)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into headers dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch global error states (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    // Only auto-redirect on 401 if NOT on an auth route (prevents login redirect loop)
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
