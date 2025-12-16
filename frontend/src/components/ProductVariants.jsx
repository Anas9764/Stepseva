import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductVariants = ({ variants, currentProductId }) => {
  const navigate = useNavigate();

  if (!variants || variants.length <= 1) return null;

  const handleVariantClick = (variantId) => {
    if (variantId !== currentProductId) {
      navigate(`/product/${variantId}`);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-text mb-3 uppercase tracking-wide">
        More Colors
      </label>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isActive = variant._id === currentProductId;
          const variantImage = variant.image || variant.images?.[0] || '';
          
          return (
            <motion.button
              key={variant._id}
              onClick={() => handleVariantClick(variant._id)}
              className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                isActive
                  ? 'border-primary ring-2 ring-primary ring-offset-2 scale-105'
                  : 'border-gray-300 hover:border-primary hover:scale-105'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {variantImage ? (
                <img
                  src={variantImage}
                  alt={variant.variantName || variant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
              {isActive && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariants;

