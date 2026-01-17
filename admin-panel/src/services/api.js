import axios from 'axios';
import toast from 'react-hot-toast';

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

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log token presence for debugging (remove in production)
      if (import.meta.env.DEV) {
        console.log('🔑 Adding token to request:', config.url, token ? 'Token present' : 'No token');
      }
    } else {
      console.warn('⚠️ No adminToken found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        console.error('❌ 401 Unauthorized - Token may be missing, invalid, or expired');
        console.error('Request URL:', error.config?.url);
        console.error('Token present:', !!localStorage.getItem('adminToken'));
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (data?.message) {
        toast.error(data.message);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } else if (error.request) {
      // Network error - backend might be down or CORS issue
      console.error('Network Error:', error);
      console.error('Request URL:', error.config?.url);
      console.error('Base URL:', API_URL);
      toast.error(`Network error. Cannot connect to ${API_URL}. Please check if backend is running.`);
    } else {
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

