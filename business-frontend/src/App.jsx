import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { fetchSettings } from './store/slices/settingsSlice';
import { RfqProvider, useRfq } from './contexts/RfqContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import RfqDrawer from './components/RfqDrawer';
import FloatingActionButtons from './components/FloatingActionButtons';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessAccountSetup from './pages/BusinessAccountSetup';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import MyInquiries from './pages/MyInquiries';
import MyQuotes from './pages/MyQuotes';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';

function SettingsBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <RfqProvider>
        <Router>
          <ScrollToTop />
          <SettingsBootstrap />
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
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<BusinessDashboard />} />
                <Route path="/business-account/setup" element={<BusinessAccountSetup />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/order/:id" element={<OrderDetails />} />
                <Route path="/my-inquiries" element={<MyInquiries />} />
                <Route path="/my-quotes" element={<MyQuotes />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                {/* Redirect /orders to /my-orders for backward compatibility */}
                <Route path="/orders" element={<MyOrders />} />
              </Routes>
            </main>
            <Footer />
            {/* Global RFQ Drawer */}
            <RfqDrawerWrapper />
            {/* Global Floating Action Buttons (WhatsApp + Scroll to Top) */}
            <FloatingActionButtons />
          </div>
        </Router>
      </RfqProvider>
    </Provider>
  );
}

// Component to wrap RfqDrawer with context
function RfqDrawerWrapper() {
  const { isDrawerOpen, closeDrawer } = useRfq();
  return <RfqDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />;
}

export default App;
