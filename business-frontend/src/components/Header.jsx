import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiHome, FiCreditCard, FiMessageCircle, FiFileText, FiBarChart2, FiBriefcase, FiShoppingBag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../store/slices/authSlice';
import { useRfq } from '../contexts/RfqContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openDrawer, rfqCount } = useRfq();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              StepSeva
            </h1>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                className="relative px-4 py-2 text-text hover:text-primary transition-colors duration-300 font-medium rounded-lg hover:bg-sky/50 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-300"></span>
                </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* RFQ Button - Always visible */}
            <button
              onClick={openDrawer}
              className="relative flex items-center space-x-1 text-text hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50"
              title="RFQ List"
            >
              <FiShoppingBag size={20} />
              {rfqCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {rfqCount > 9 ? '9+' : rfqCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                {/* Dashboard Link - Only show if has business account */}
                {account && account.status === 'active' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 text-text hover:text-primary transition-colors"
                    title="Dashboard"
                  >
                    <FiHome size={20} />
                    <span>Dashboard</span>
                  </Link>
                )}
                {/* Purchase Orders Link - B2B Focused */}
                {account && account.status === 'active' && (
                  <Link
                    to="/my-orders"
                    className="flex items-center space-x-1 text-text hover:text-primary transition-colors"
                    title="Purchase Orders"
                  >
                    <FiPackage size={20} />
                    <span>Purchase Orders</span>
                  </Link>
                )}
                {/* My Inquiries Link */}
                {account && account.status === 'active' && (
                  <Link
                    to="/my-inquiries"
                    className="flex items-center space-x-1 text-text hover:text-primary transition-colors"
                    title="My Inquiries"
                  >
                    <FiMessageCircle size={20} />
                    <span>My Inquiries</span>
                  </Link>
                )}
                {/* My Quotes Link */}
                {account && account.status === 'active' && (
                  <Link
                    to="/my-quotes"
                    className="flex items-center space-x-1 text-text hover:text-primary transition-colors"
                    title="My Quotes"
                  >
                    <FiFileText size={20} />
                    <span>My Quotes</span>
                  </Link>
                )}
                {/* Messages Link */}
                {account && account.status === 'active' && (
                  <Link
                    to="/messages"
                    className="relative flex items-center space-x-1 text-text hover:text-primary transition-colors"
                    title="Messages"
                  >
                    <FiMessageCircle size={20} />
                    <span>Messages</span>
                  </Link>
                )}
                {/* Analytics Link */}
                {account && account.status === 'active' && (
                  <Link
                    to="/analytics"
                    className="flex items-center space-x-1 text-text hover:text-primary transition-colors"
                    title="Analytics"
                  >
                    <FiBarChart2 size={20} />
                    <span>Analytics</span>
                  </Link>
                )}
                {/* Credit Display - Only for active business accounts */}
                {account && account.status === 'active' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <FiCreditCard className="text-primary" size={16} />
                    <span className="text-xs font-semibold text-primary">
                      ₹{(account.creditLimit - account.creditUsed).toLocaleString('en-IN')} Credit
                    </span>
                  </div>
                )}
                <span className="text-sm text-text">Hello, {account?.companyName || user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-text hover:text-primary transition-colors"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center space-x-1 text-text hover:text-accent transition-colors"
              >
                <FiUser size={20} />
                <span>Login</span>
              </Link>
            )}


            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-text"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-text hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {/* RFQ Button in Mobile Menu */}
              <button
                onClick={() => {
                  openDrawer();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-text hover:text-primary transition-colors flex items-center gap-2"
              >
                <FiShoppingBag size={18} />
                RFQ List {rfqCount > 0 && `(${rfqCount})`}
              </button>
              {isAuthenticated ? (
                <>
                  {account && account.status === 'active' && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-text hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <FiHome size={18} />
                        Dashboard
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-text hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <FiPackage size={18} />
                        Purchase Orders
                      </Link>
                    </>
                  )}
                  {account && account.status === 'active' && (
                    <>
                      <Link
                        to="/my-inquiries"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-text hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <FiMessageCircle size={18} />
                        My Inquiries
                      </Link>
                      <Link
                        to="/my-quotes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-text hover:text-primary transition-colors flex items-center gap-2"
                      >
                      <FiFileText size={18} />
                      My Quotes
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-text hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <FiMessageCircle size={18} />
                      Messages
                    </Link>
                    <Link
                      to="/analytics"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-text hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <FiBarChart2 size={18} />
                      Analytics
                    </Link>
                    </>
                  )}
                  {account && account.status === 'active' && (
                    <div className="px-3 py-2 bg-primary/10 rounded-lg">
                      <p className="text-xs text-gray-600">Credit Available</p>
                      <p className="text-sm font-semibold text-primary">
                        ₹{(account.creditLimit - account.creditUsed).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-text hover:text-accent transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-text hover:text-primary transition-colors"
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

