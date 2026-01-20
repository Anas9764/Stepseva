import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiHome, FiCreditCard, FiMessageCircle, FiFileText, FiBarChart2, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../store/slices/authSlice';
import { useRfq } from '../contexts/RfqContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
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

  const accountLinks = account && account.status === 'active' ? [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Purchase Orders', path: '/my-orders', icon: FiPackage },
    { name: 'My Inquiries', path: '/my-inquiries', icon: FiMessageCircle },
    { name: 'My Quotes', path: '/my-quotes', icon: FiFileText },
    { name: 'Messages', path: '/messages', icon: FiMessageCircle },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
  ] : [];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-soft border-b border-gray-100/50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-heading font-bold">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] bg-clip-text text-transparent group-hover:animate-gradient transition-all">
                  StepSeva
                </span>
              </h1>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-500 rounded-full" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-5 py-2.5 text-text hover:text-primary transition-colors duration-300 font-medium rounded-xl hover:bg-sky/50 group"
              >
                {link.name}
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full group-hover:w-2/3 transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            {/* RFQ Button */}
            <button
              onClick={openDrawer}
              className="relative flex items-center justify-center w-10 h-10 text-secondary hover:text-primary transition-all duration-300 rounded-xl hover:bg-sky/50 group"
              title="RFQ List"
            >
              <FiShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
              {rfqCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse-ring">
                  {rfqCount > 9 ? '9+' : rfqCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                {/* Credit Display */}
                {account && account.status === 'active' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
                    <FiCreditCard className="text-primary" size={16} />
                    <span className="text-xs font-bold text-primary">
                      ₹{(account.creditLimit - account.creditUsed).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Account Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    onBlur={() => setTimeout(() => setIsAccountMenuOpen(false), 150)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-sky/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                      {(account?.companyName || user?.name || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-secondary max-w-[120px] truncate">
                      {account?.companyName || user?.name}
                    </span>
                    <FiChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 glass-card-premium rounded-2xl shadow-strong overflow-hidden"
                      >
                        <div className="p-2">
                          {accountLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sky/50 transition-colors group"
                            >
                              <link.icon size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                              <span className="text-sm text-secondary group-hover:text-primary transition-colors">{link.name}</span>
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 my-2" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors group"
                          >
                            <FiLogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            <span className="text-sm text-secondary group-hover:text-red-500 transition-colors">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-0.5"
              >
                <FiUser size={18} />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-secondary hover:text-primary rounded-xl hover:bg-sky/50 transition-all"
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
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-secondary hover:text-primary hover:bg-sky/50 rounded-xl transition-all font-medium"
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-gray-100 my-2" />

              {/* RFQ Button in Mobile Menu */}
              <button
                onClick={() => {
                  openDrawer();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-primary hover:bg-sky/50 rounded-xl transition-all"
              >
                <FiShoppingBag size={18} />
                <span className="font-medium">RFQ List</span>
                {rfqCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    {rfqCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  {accountLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-primary hover:bg-sky/50 rounded-xl transition-all"
                    >
                      <link.icon size={18} />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  ))}

                  {account && account.status === 'active' && (
                    <div className="px-4 py-3 bg-primary/10 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Credit Available</p>
                      <p className="text-lg font-bold text-primary">
                        ₹{(account.creditLimit - account.creditUsed).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FiLogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium"
                >
                  <FiUser size={18} />
                  <span>Login / Register</span>
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
