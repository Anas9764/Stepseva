import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { setWishlistPopupVisible } from '../store/slices/wishlistSlice';

const WishlistPopup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showPopup, lastAddedItem } = useSelector((state) => state.wishlist);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showPopup && lastAddedItem) {
      setIsVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, lastAddedItem]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch(setWishlistPopupVisible({ show: false, item: null }));
    }, 300); // Wait for animation to complete
  };

  const handleViewWishlist = () => {
    handleClose();
    navigate('/wishlist');
  };

  if (!showPopup || !lastAddedItem) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/10 z-50"
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-4 top-20 w-full sm:w-96 bg-background shadow-2xl z-50 rounded-lg border border-primary/20 overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 6rem)' }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-4">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="text-lg font-heading font-semibold text-secondary">Added to wishlist</h3>
              </div>

              {/* Product Item */}
              {lastAddedItem && (
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-primary/30">
                  <div className="flex-shrink-0">
                    <img
                      src={lastAddedItem.image || lastAddedItem.images?.[0] || 'https://via.placeholder.com/150'}
                      alt={lastAddedItem.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text truncate">
                      {lastAddedItem.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {typeof lastAddedItem.category === 'object' 
                        ? lastAddedItem.category?.name 
                        : lastAddedItem.category || 'Product'}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      ₹{(lastAddedItem.price || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="space-y-2">
                <button
                  onClick={handleViewWishlist}
                  className="w-full px-6 py-2.5 bg-primary text-white font-semibold rounded-full hover:bg-secondary transition-all duration-300"
                >
                  VIEW WISHLIST
                </button>
              </div>

              {/* Continue Shopping Link */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-500 hover:text-primary underline transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistPopup;

