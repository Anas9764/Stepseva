import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { addToCartAsync } from '../store/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync, isInWishlist } from '../store/slices/wishlistSlice';
import LazyImage from './LazyImage';

const ProductCard = memo(({ product, showBuyNow = false, showActions = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const inWishlist = useSelector((state) => isInWishlist(state, product._id));
  
  // Get all product images - memoized
  const productImages = useMemo(() => {
    return product.images && product.images.length > 0 
      ? product.images 
      : product.image 
      ? [product.image]
      : ['https://via.placeholder.com/300'];
  }, [product.images, product.image]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  
  // Auto-slide images on hover - only for this specific product card
  useEffect(() => {
    if (isHovered && productImages.length > 1) {
      // Start auto-sliding when hovered
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productImages.length);
      }, 2000); // Change image every 2 seconds
    } else {
      // Stop sliding and reset when not hovered
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset to first image when hover ends
      setCurrentImageIndex(0);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, productImages.length]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For footwear products with sizes, navigate to product page to select size
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/product/${product._id}`);
      return;
    }
    
    // Otherwise, add directly to cart
    const productToAdd = {
      ...product,
      quantity: 1,
      size: product.size || '',
    };
    
    dispatch(addToCartAsync(productToAdd));
  }, [product, navigate, dispatch]);

  const handleBuyNow = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store product data in sessionStorage for after login
      const buyNowProduct = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0],
        quantity: 1,
        description: product.description,
      };
      sessionStorage.setItem('buyNowProduct', JSON.stringify(buyNowProduct));
      // Redirect to login with return URL
      navigate('/login', { state: { from: '/checkout', requireAuth: true } });
      return;
    }
    
    // Navigate to checkout with product data (direct purchase, not adding to cart)
    navigate('/checkout', {
      state: {
        buyNowProduct: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          quantity: 1,
          description: product.description,
        },
      },
    });
  }, [product, isAuthenticated, navigate]);

  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      dispatch(removeFromWishlistAsync(product._id));
    } else {
      dispatch(addToWishlistAsync(product));
    }
  }, [inWishlist, product, dispatch]);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group border border-gray-100 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden h-72 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Image Slider */}
          <div className="relative w-full h-full">
            {productImages.map((image, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  opacity: index === currentImageIndex ? 1 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{
                  opacity: { duration: 0.5, ease: "easeInOut" },
                  scale: { duration: 0.7, ease: "easeOut" },
                }}
                className={`absolute inset-0 w-full h-full ${
                  index === currentImageIndex ? 'z-10' : 'z-0'
                }`}
              >
                <LazyImage
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
          
          {/* Image Indicators (Dots) - Only show on hover */}
          {productImages.length > 1 && isHovered && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full transition-opacity duration-300">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  onMouseEnter={() => setCurrentImageIndex(index)}
                  className={`transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'w-2.5 h-2.5 bg-white rounded-full shadow-lg'
                      : 'w-1.5 h-1.5 bg-white/70 rounded-full hover:bg-white'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          {/* Badges - Always visible */}
          <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Featured
              </span>
            )}
            {product.gender && (
              <span className="bg-white/90 backdrop-blur-sm text-secondary text-xs font-semibold px-3 py-1 rounded-full capitalize shadow-md">
                {product.gender}
              </span>
            )}
          </div>
          
          {/* Wishlist Button - Always visible at top-right */}
          <div className="absolute top-3 right-3 z-30">
            <button
              onClick={handleWishlistToggle}
              className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-xl hover:scale-110 transition-transform"
            >
              <FiHeart
                className={inWishlist ? 'text-red-500 fill-current' : 'text-gray-700'}
                size={20}
              />
            </button>
          </div>

          {/* Stock Badge - Positioned below wishlist button */}
          <div className="absolute top-14 right-3 z-30">
          {product.stock < 5 && product.stock > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          )}
          </div>
        </div>

        <div className="p-5">
          {/* Category & Type */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {typeof product.category === 'object' ? product.category?.name : product.category}
            </span>
            {product.footwearType && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-primary font-semibold capitalize">
                  {product.footwearType}
                </span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-heading font-bold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Sizes Preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Sizes:</span>
                {product.sizes.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium"
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 5 && (
                  <span className="text-xs text-gray-500">+{product.sizes.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-secondary">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            </div>
            {product.brand && (
              <span className="text-xs text-gray-500 font-medium">{product.brand}</span>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {showBuyNow ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                    } px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                  >
                    <FiShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg'
                    } px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-xl`}
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full ${
                    product.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg'
                  } px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl`}
                >
                  <FiShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

