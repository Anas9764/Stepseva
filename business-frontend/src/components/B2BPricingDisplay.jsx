import { useSelector } from 'react-redux';
import { FiTrendingUp, FiInfo } from 'react-icons/fi';

const B2BPricingDisplay = ({ product }) => {
  const { account } = useSelector((state) => state.businessAccount);
  
  // Get standard price
  const standardPrice = product.price || 0;
  
  // Get tier price if business account exists
  let tierPrice = standardPrice;
  let pricingTier = 'standard';
  
  if (account && account.status === 'active' && product.volumePricing) {
    const tier = product.volumePricing.find(
      (vp) => vp.tier === account.pricingTier
    );
    if (tier && tier.price) {
      tierPrice = tier.price;
      pricingTier = account.pricingTier;
    }
  }
  
  // Get MOQ
  const moq = product.moq || 1;
  
  // Get quantity pricing tiers
  const quantityPricing = product.quantityPricing || [];
  
  // Calculate discount percentage
  const discountPercent = tierPrice < standardPrice 
    ? Math.round(((standardPrice - tierPrice) / standardPrice) * 100)
    : 0;
  
  // Show B2B pricing if account exists and is active
  const showB2BPricing = account && account.status === 'active' && (tierPrice < standardPrice || quantityPricing.length > 0);
  
  // For IndiaMART lead-generation model, show "Price on Request" instead of exact price
  // Only show exact price if user is authenticated B2B customer
  const isB2BUser = account && account.status === 'active';
  
  if (!isB2BUser) {
    // Show "Price on Request" for non-authenticated users (IndiaMART style)
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gray-700">
            Price on Request
          </span>
        </div>
        {moq > 1 && (
          <p className="text-sm text-gray-600 font-medium">
            MOQ: {moq} units
          </p>
        )}
        <p className="text-xs text-gray-500">
          Get best price based on quantity
        </p>
      </div>
    );
  }

  if (!showB2BPricing) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-secondary">
            ₹{standardPrice.toLocaleString('en-IN')}
          </span>
        </div>
        {moq > 1 && (
          <p className="text-xs text-gray-500">
            MOQ: {moq} units
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Main Price Display */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            ₹{tierPrice.toLocaleString('en-IN')}
          </span>
          {discountPercent > 0 && (
            <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        {tierPrice < standardPrice && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              ₹{standardPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              ({pricingTier} pricing)
            </span>
          </div>
        )}
      </div>
      
      {/* MOQ Display */}
      {moq > 1 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          <FiInfo size={12} />
          <span>Minimum Order: {moq} units</span>
        </div>
      )}
      
      {/* Quantity Pricing Tiers */}
      {quantityPricing.length > 0 && (
        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-primary" size={14} />
            <span className="text-xs font-semibold text-gray-700">Volume Discounts:</span>
          </div>
          <div className="space-y-1">
            {quantityPricing
              .sort((a, b) => a.minQuantity - b.minQuantity)
              .slice(0, 3)
              .map((tier, index) => {
                const tierPriceValue = tier.price || (tierPrice * (1 - (tier.discount || 0) / 100));
                const tierDiscount = tier.discount || Math.round(((tierPrice - tierPriceValue) / tierPrice) * 100);
                return (
                  <div key={index} className="flex justify-between text-xs text-gray-600">
                    <span>
                      {tier.minQuantity}
                      {tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} units:
                    </span>
                    <span className="font-semibold text-primary">
                      ₹{Math.round(tierPriceValue).toLocaleString('en-IN')}
                      {tierDiscount > 0 && (
                        <span className="text-green-600 ml-1">({tierDiscount}% off)</span>
                      )}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BPricingDisplay;

