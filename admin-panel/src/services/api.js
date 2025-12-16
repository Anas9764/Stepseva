import axios from 'axios';
import toast from 'react-hot-toast';

// Get API URL based on environment
// Priority: 1. VITE_API_URL from .env, 2. Development: localhost, 3. Production: Render
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set in .env, use it
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    console.log('🔗 Using API URL from .env:', url);
    return url;
  }
  
  // Auto-detect based on environment
  if (import.meta.env.DEV) {
    // Development mode - use localhost
    const url = 'http://localhost:5000/api';
    console.log('🔗 Using default development API URL:', url);
    return url;
  }
  
  // Production mode - use Render backend
  const url = 'https://eclora-sj6w.onrender.com/api';
  console.log('🔗 Using production API URL:', url);
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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
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

