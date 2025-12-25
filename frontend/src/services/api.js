import axios from 'axios';

// Get API URL based on environment
// Priority: 1. VITE_API_URL from .env, 2. Development: localhost, 3. Production: Render
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set in .env, use it (highest priority)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    console.log('🔗 Using API URL from environment variable:', url);
    return url;
  }
  
  // Auto-detect based on environment
  if (import.meta.env.DEV) {
    // Development mode (npm run dev) - use localhost
    const url = 'http://localhost:5000/api';
    console.log('🔗 Development mode: Using localhost API URL:', url);
    return url;
  }
  
  // Production mode - use Render backend
  const url = 'https://stepseva.onrender.com/api';
  console.log('🔗 Production mode: Using Render backend URL:', url);
  return url;
};

const API_URL = getApiUrl();
console.log('🌐 API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful API calls in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log error details for debugging
    if (error.request && !error.response) {
      // Network error - backend not reachable
      console.error('❌ Network Error:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
      });
      console.error('💡 Make sure backend is running on http://localhost:5000');
    } else if (error.response) {
      // Server responded with error
      console.error('❌ API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

