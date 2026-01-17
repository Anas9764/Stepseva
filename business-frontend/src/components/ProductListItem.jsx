import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { memo, useCallback, useMemo, useState } from 'react';
import LazyImage from './LazyImage';
import B2BPricingDisplay from './B2BPricingDisplay';
import InquiryForm from './InquiryForm';

const ProductListItem = memo(({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const { data: settings } = useSelector((state) => state.settings);

  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const image = useMemo(() => {
    const images = product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : [];
    return images[0] || 'https://via.placeholder.com/600x400';
  }, [product?.images, product?.image]);

  const handleGetBestPrice = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
      if (requireLoginForInquiry && !isAuthenticated) {
        navigate('/login', { state: { from: `/product/${product?._id}` } });
        return;
      }

      setShowInquiryForm(true);
    },
    [settings, isAuthenticated, navigate, product?._id]
  );

  const categoryName = typeof product?.category === 'object' ? product?.category?.name : product?.category;

  const sizesPreview = Array.isArray(product?.sizes) ? product.sizes : [];
  const sizeText = sizesPreview.length
    ? `${sizesPreview.slice(0, 7).join(', ')}${sizesPreview.length > 7 ? ` +${sizesPreview.length - 7}` : ''}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <Link to={`/product/${product?._id}`} className="block">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
          {/* Image */}
          <div className="relative w-full sm:w-56 md:w-60 flex-shrink-0">
            <div className="aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
              <LazyImage src={image} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
            </div>

            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product?.featured && (
                <span className="bg-gradient-to-r from-primary to-secondary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                  Featured
                </span>
              )}
              {!!product?.gender && (
                <span className="bg-white/90 backdrop-blur-sm text-secondary text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize shadow-sm border border-white/60">
                  {product.gender}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {categoryName && (
                    <span className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">{categoryName}</span>
                  )}
                  {product?.footwearType && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-primary font-semibold capitalize">{product.footwearType}</span>
                    </>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-heading font-bold text-secondary line-clamp-2">
                  {product?.name}
                </h3>
              </div>

              {product?.brand && (
                <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">{product.brand}</span>
              )}
            </div>

            {product?.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
            )}

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <B2BPricingDisplay product={product} />
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-sm text-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-500">MOQ</span>
                  <span className="font-semibold text-secondary">{product?.moq || 1}</span>
                </div>

                {sizeText && (
                  <div className="mt-2">
                    <div className="text-xs font-semibold text-gray-500 mb-1">Sizes</div>
                    <div className="text-xs text-gray-700">{sizeText}</div>
                  </div>
                )}

                {product?.variantColor && (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500">Color</span>
                    <span className="text-xs font-semibold text-gray-700 capitalize">{product.variantColor}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleGetBestPrice}
                disabled={product?.stock === 0}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm w-full sm:w-auto ${
                  product?.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-md'
                }`}
              >
                <FiDollarSign />
                Get Best Price
              </button>

              <div className="text-xs text-gray-500 flex-1">
                {product?.stock === 0 ? (
                  <span className="font-semibold text-red-600">Out of stock</span>
                ) : product?.stock < 5 ? (
                  <span className="font-semibold text-amber-600">Only {product.stock} left</span>
                ) : (
                  <span className="font-medium">Fast dispatch available</span>
                )}

                {isAuthenticated && account && account.status === 'active' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">B2B</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      <InquiryForm
        isOpen={showInquiryForm}
        onClose={() => setShowInquiryForm(false)}
        product={product}
        defaultQuantity={product?.moq || 1}
      />
    </motion.div>
  );
});

ProductListItem.displayName = 'ProductListItem';

export default ProductListItem;
