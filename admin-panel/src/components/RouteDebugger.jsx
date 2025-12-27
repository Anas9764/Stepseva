import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * RouteDebugger - Development tool for debugging routing issues
 * Enable in App.jsx during development to log route changes
 */
const RouteDebugger = ({ enabled = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    console.group('🔍 Route Debug Info');
    console.log('Current pathname:', location.pathname);
    console.log('Search params:', location.search);
    console.log('Hash:', location.hash);
    console.log('State:', location.state);
    console.log('Full location:', location);
    console.groupEnd();

    // Check if we're on a valid route
    const validRoutes = [
      '/',
      '/login',
      '/products',
      '/categories',
      '/users',
      '/activity-logs',
      '/settings',
      '/b2b',
      '/b2b/leads',
      '/b2b/business-accounts',
      '/b2b/orders',
      '/b2b/lead-analytics',
      '/b2b/product-analytics',
      '/b2b/quotes',
      '/b2b/reports',
      '/b2b/communication',
      '/b2b/team',
      '/b2b/calendar',
      '/b2b/crm',
      '/b2c',
      '/b2c/orders',
      '/b2c/reviews',
      '/b2c/questions',
      '/b2c/analytics',
      '/b2c/support',
      '/b2c/coupons',
      '/b2c/banners',
      '/b2c/segmentation',
      '/b2c/wishlists',
    ];

    const isValidRoute = validRoutes.includes(location.pathname);
    if (!isValidRoute) {
      console.warn('⚠️ Potentially invalid route:', location.pathname);
      console.log('Valid routes:', validRoutes);
    }
  }, [location, enabled]);

  return null;
};

export default RouteDebugger;
