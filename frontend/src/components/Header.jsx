import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiHeart, FiPackage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../store/slices/authSlice';
import { clearCartAsync } from '../store/slices/cartSlice';
import { clearWishlistAsync } from '../store/slices/wishlistSlice';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear cart and wishlist before logging out
    dispatch(clearCartAsync());
    dispatch(clearWishlistAsync());
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
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/my-orders"
                  className="flex items-center space-x-1 text-text hover:text-primary transition-colors"
                  title="My Orders"
                >
                  <FiPackage size={20} />
                  <span>My Orders</span>
                </Link>
                <span className="text-sm text-text">Hello, {user?.name}</span>
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

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-sky/50 transition-colors group">
              <FiHeart size={22} className="text-text group-hover:text-primary transition-colors" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-sky/50 transition-colors group">
              <FiShoppingCart size={22} className="text-text group-hover:text-primary transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

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
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-text hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <FiPackage size={18} />
                    My Orders
                  </Link>
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

