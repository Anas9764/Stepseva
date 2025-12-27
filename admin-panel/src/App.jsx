import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';

// Create React Query client with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
    },
  },
});

// Layout (eagerly loaded - needed immediately)
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const Orders = lazy(() => import('./pages/Orders'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Questions = lazy(() => import('./pages/Questions'));
const Users = lazy(() => import('./pages/Users'));
const Banners = lazy(() => import('./pages/Banners'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Settings = lazy(() => import('./pages/Settings'));
// B2B Pages
const Leads = lazy(() => import('./pages/Leads'));
const BusinessAccounts = lazy(() => import('./pages/BusinessAccounts'));
const B2BDashboard = lazy(() => import('./pages/B2BDashboard'));
const B2BLeadAnalytics = lazy(() => import('./pages/B2BLeadAnalytics'));
const B2BQuoteManagement = lazy(() => import('./pages/B2BQuoteManagement'));
const B2BReportsExport = lazy(() => import('./pages/B2BReportsExport'));
const B2BCommunicationCenter = lazy(() => import('./pages/B2BCommunicationCenter'));
const B2BTeamManagement = lazy(() => import('./pages/B2BTeamManagement'));
const B2BCalendar = lazy(() => import('./pages/B2BCalendar'));
const B2BBuyerCRM = lazy(() => import('./pages/B2BBuyerCRM'));
const B2BProductInquiryAnalytics = lazy(() => import('./pages/B2BProductInquiryAnalytics'));

// B2C Pages
const B2CDashboard = lazy(() => import('./pages/B2CDashboard'));
const B2COrders = lazy(() => import('./pages/B2COrders'));
const B2CAnalytics = lazy(() => import('./pages/B2CAnalytics'));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport'));
const CustomerSegmentation = lazy(() => import('./pages/CustomerSegmentation'));
const WishlistManagement = lazy(() => import('./pages/WishlistManagement'));

// Common Pages
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#333',
                  padding: '16px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Suspense fallback={<Loader fullScreen />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  {/* Common/Shared Routes */}
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="users" element={<Users />} />
                  <Route path="activity-logs" element={<ActivityLogs />} />
                  <Route path="settings" element={<Settings />} />

                  {/* B2B Module Routes */}
                  <Route path="b2b">
                    <Route index element={<B2BDashboard />} />
                    <Route path="leads" element={<Leads />} />
                    <Route path="business-accounts" element={<BusinessAccounts />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="lead-analytics" element={<B2BLeadAnalytics />} />
                    <Route path="product-analytics" element={<B2BProductInquiryAnalytics />} />
                    <Route path="quotes" element={<B2BQuoteManagement />} />
                    <Route path="reports" element={<B2BReportsExport />} />
                    <Route path="communication" element={<B2BCommunicationCenter />} />
                    <Route path="team" element={<B2BTeamManagement />} />
                    <Route path="calendar" element={<B2BCalendar />} />
                    <Route path="crm" element={<B2BBuyerCRM />} />
                  </Route>

                  {/* B2C Module Routes */}
                  <Route path="b2c">
                    <Route index element={<B2CDashboard />} />
                    <Route path="orders" element={<B2COrders />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="questions" element={<Questions />} />
                    <Route path="analytics" element={<B2CAnalytics />} />
                    <Route path="support" element={<CustomerSupport />} />
                    <Route path="coupons" element={<Coupons />} />
                    <Route path="banners" element={<Banners />} />
                    <Route path="segmentation" element={<CustomerSegmentation />} />
                    <Route path="wishlists" element={<WishlistManagement />} />
                  </Route>

                  {/* Legacy routes (redirect to B2C module for backward compatibility) */}
                  <Route path="reviews" element={<Navigate to="/b2c/reviews" replace />} />
                  <Route path="questions" element={<Navigate to="/b2c/questions" replace />} />
                  <Route path="coupons" element={<Navigate to="/b2c/coupons" replace />} />
                  <Route path="banners" element={<Navigate to="/b2c/banners" replace />} />
                  <Route path="leads" element={<Navigate to="/b2b/leads" replace />} />
                  <Route path="business-accounts" element={<Navigate to="/b2b/business-accounts" replace />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
