import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { fetchWishlist, removeFromWishlistAsync, clearWishlistAsync } from '../store/slices/wishlistSlice';
import { addToCartAsync } from '../store/slices/cartSlice';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch wishlist from backend if user is authenticated
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlistAsync(productId));
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlistAsync());
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCartAsync(product));
  };

  const handleMoveAllToCart = () => {
    items.forEach((product) => {
      dispatch(addToCartAsync(product));
    });
    dispatch(clearWishlistAsync());
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <FiHeart className="mx-auto text-gray-300 mb-6" size={100} />
        <h2 className="text-3xl font-heading font-bold text-secondary mb-4">
          Your Wishlist is Empty
        </h2>
        <p className="text-gray-600 mb-8">
          Start adding items you love to your wishlist.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-accent text-white px-8 py-3 rounded-full hover:bg-primary hover:text-secondary transition-all font-semibold"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold text-secondary mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          {items.length > 0 && (
            <>
              <button
                onClick={handleMoveAllToCart}
                className="bg-accent text-white px-6 py-2 rounded-full hover:bg-primary hover:text-secondary transition-all font-semibold flex items-center space-x-2"
              >
                <FiShoppingCart size={18} />
                <span>Add All to Cart</span>
              </button>
              <button
                onClick={handleClearWishlist}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-all font-semibold flex items-center space-x-2"
              >
                <FiTrash2 size={18} />
                <span>Clear Wishlist</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <ProductCard product={product} />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => handleRemoveFromWishlist(product._id)}
                className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                title="Remove from wishlist"
              >
                <FiTrash2 className="text-red-500" size={18} />
              </button>
              {product.stock > 0 && (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-green-50 transition-colors"
                  title="Add to cart"
                >
                  <FiShoppingCart className="text-green-500" size={18} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

