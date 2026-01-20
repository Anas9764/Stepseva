import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import LazyImage from './LazyImage';
import B2BPricingDisplay from './B2BPricingDisplay';
import InquiryForm from './InquiryForm';

const ProductCard = memo(({ product, showBuyNow = false, showActions = true }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const { data: settings } = useSelector((state) => state.settings);

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
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const intervalRef = useRef(null);

  // Auto-slide images on hover - only for this specific product card
  useEffect(() => {
    if (isHovered && productImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productImages.length);
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentImageIndex(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, productImages.length]);

  const handleGetBestPrice = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      navigate('/login', { state: { from: `/product/${product?._id}` } });
      return;
    }

    setShowInquiryForm(true);
  }, [settings, isAuthenticated, navigate, product?._id]);


  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        boxShadow: isHovered
          ? '0 20px 40px -12px rgba(30, 115, 217, 0.2), 0 8px 16px -8px rgba(0, 0, 0, 0.1)'
          : '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Border Effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
      </div>

      <div className="relative">
        <Link to={`/product/${product._id}`} className="block">
          {/* Image Section */}
          <div className="relative overflow-hidden">
            <div className="relative w-full aspect-[4/3]">
              {productImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    opacity: index === currentImageIndex ? 1 : 0,
                    scale: isHovered ? 1.08 : 1,
                  }}
                  transition={{
                    opacity: { duration: 0.6, ease: "easeInOut" },
                    scale: { duration: 0.8, ease: "easeOut" },
                  }}
                  className={`absolute inset-0 w-full h-full ${index === currentImageIndex ? 'z-10' : 'z-0'}`}
                >
                  <LazyImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
            </div>

            {/* Image Indicators */}
            {productImages.length > 1 && isHovered && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`transition-all duration-300 rounded-full ${index === currentImageIndex
                      ? 'w-6 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                      }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Top Badges */}
            <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
              {product.featured && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-gold to-gold-light text-secondary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                  Featured
                </span>
              )}
              {product.gender && (
                <span className="bg-white text-secondary text-xs font-semibold px-3 py-1.5 rounded-full capitalize shadow-md">
                  {product.gender}
                </span>
              )}
            </div>

            {/* Right Badges */}
            <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
              {isAuthenticated && account && account.status === 'active' && (
                <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  B2B
                </span>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  Only {product.stock} left
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            {/* Category & Type Row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                {typeof product.category === 'object' ? product.category?.name : product.category}
              </span>
              {product.footwearType && (
                <>
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  <span className="text-xs text-primary font-semibold capitalize">
                    {product.footwearType}
                  </span>
                </>
              )}
            </div>

            {/* Product Name */}
            <h3 className="text-lg font-heading font-bold text-secondary mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
              {product.name}
            </h3>

            {/* Sizes - Pills Style */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.slice(0, 4).map((size) => (
                    <span
                      key={size}
                      className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold border border-gray-200"
                    >
                      {size}
                    </span>
                  ))}
                  {product.sizes.length > 4 && (
                    <span className="text-xs text-primary font-semibold">
                      +{product.sizes.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

            {/* Pricing Section */}
            <div className="mb-4">
              <B2BPricingDisplay product={product} />
              <div className="flex items-center justify-between mt-2">
                {product.moq > 1 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <FiShoppingBag size={12} />
                    MOQ: {product.moq} units
                  </span>
                )}
                {product.brand && (
                  <span className="text-xs text-gray-400 font-medium">{product.brand}</span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* CTA Button - Outside Link for proper click handling */}
        {showActions && (
          <div className="px-5 pb-5">
            <button
              onClick={handleGetBestPrice}
              disabled={product.stock === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              <FiDollarSign size={18} />
              <span>Get Best Price</span>
            </button>
          </div>
        )}
      </div>

      {/* Inquiry Form Modal */}
      <InquiryForm
        isOpen={showInquiryForm}
        onClose={() => setShowInquiryForm(false)}
        product={product}
        defaultQuantity={product?.moq || 1}
      />
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
