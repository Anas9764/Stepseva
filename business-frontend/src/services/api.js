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
  
  // Production mode (npm run build) - use Render backend
  const url = 'https://stepseva.onrender.com/api';
  console.log('🔗 Production mode: Using Render backend URL:', url);
  return url;
};

const API_URL = getApiUrl();
console.log('🌐 API Base URL:', API_URL);

// Request deduplication: Track pending requests to prevent duplicate calls
const pendingRequests = new Map();

// Generate a unique key for each request
const getRequestKey = (config) => {
  const { method, url, params } = config;
  // Sort params for consistent key generation
  const paramsStr = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
  return `${method?.toUpperCase() || 'GET'}_${url}_${paramsStr}`;
};

// Create base axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Frontend-Type': 'business', // Identify this as Business Frontend
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log token presence for debugging (remove in production)
      if (import.meta.env.DEV) {
        console.log('🔑 Adding token to request:', config.url, 'Token length:', token.length);
      }
    } else {
      // Log when token is missing for debugging
      if (import.meta.env.DEV) {
        console.warn('⚠️ No token found in localStorage for request:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create wrapped API with request deduplication
const api = {
  request: (config) => {
    const method = config.method?.toUpperCase() || 'GET';
    const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(method);
    
    if (!isIdempotent) {
      // For non-idempotent requests, just make the request
      return axiosInstance.request(config);
    }
    
    // For idempotent requests, check for duplicates
    const requestKey = getRequestKey(config);
    
    if (pendingRequests.has(requestKey)) {
      console.log('🔄 Deduplicating duplicate request:', config.url);
      // Return the existing pending promise
      return pendingRequests.get(requestKey);
    }
    
    // Create new request and track it
    const requestPromise = axiosInstance.request(config)
      .then((response) => {
        pendingRequests.delete(requestKey);
        return response;
      })
      .catch((error) => {
        pendingRequests.delete(requestKey);
        throw error;
      });
    
    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },
  
  get: (url, config = {}) => api.request({ ...config, method: 'GET', url }),
  post: (url, data, config = {}) => api.request({ ...config, method: 'POST', url, data }),
  put: (url, data, config = {}) => api.request({ ...config, method: 'PUT', url, data }),
  delete: (url, config = {}) => api.request({ ...config, method: 'DELETE', url }),
  patch: (url, data, config = {}) => api.request({ ...config, method: 'PATCH', url, data }),
  
  // Expose interceptors for compatibility
  interceptors: axiosInstance.interceptors,
  
  // Expose other axios instance properties if needed
  defaults: axiosInstance.defaults,
  create: (config) => axios.create(config),
};

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
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

    // Handle 401 errors - but only redirect for authenticated routes
    // Public routes like /bulk-rfqs should not trigger automatic login redirect
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const errorData = error.response?.data || {};
      
      // List of public endpoints that might return 401 but shouldn't auto-redirect
      const publicEndpoints = [
        '/bulk-rfqs',
        '/leads',
        '/auth/login',
        '/auth/register',
      ];
      
      // Check if this is a public endpoint
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
      
      // Check if the error explicitly requires auth (from backend)
      const explicitlyRequiresAuth = errorData.requiresAuth === true;
      
      // Only auto-redirect if:
      // 1. It's NOT a public endpoint (protected routes), OR
      // 2. User had a token but it's now invalid (session expired)
      const hadToken = !!localStorage.getItem('token');
      const isProtectedRoute = !isPublicEndpoint;
      
      if (isProtectedRoute || (hadToken && !explicitlyRequiresAuth)) {
        // This is a protected route or token expired - redirect to login
        console.warn('⚠️ Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect immediately - let the component handle it
        // This prevents redirect loops and allows error messages to be shown
      } else if (isPublicEndpoint && explicitlyRequiresAuth) {
        // Public endpoint that requires auth - let the component handle the redirect
        // Don't auto-redirect here to allow the component to show error message first
        console.warn('⚠️ Public endpoint requires authentication:', url);
      } else {
        // For other public endpoint 401s, just log but don't redirect
        console.warn('⚠️ 401 error on public endpoint, letting component handle:', url);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

