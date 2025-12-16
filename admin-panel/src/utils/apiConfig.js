/**
 * Get API URL based on environment
 * Priority: 
 * 1. VITE_API_URL from .env (if explicitly set)
 * 2. Development mode: localhost:5000/api
 * 3. Production mode: Render backend URL
 * 
 * @returns {string} API base URL
 */
export const getApiUrl = () => {
  // If VITE_API_URL is explicitly set in .env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on environment
  if (import.meta.env.DEV) {
    // Development mode - use localhost
    return 'http://localhost:5000/api';
  }
  
  // Production mode - use Render backend
  return 'https://eclora-sj6w.onrender.com/api';
};

