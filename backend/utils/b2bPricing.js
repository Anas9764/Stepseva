/**
 * B2B Pricing Utility
 * Calculates prices based on business account type, pricing tier, and quantity
 */

/**
 * Get price for a product based on business account and quantity
 * @param {Object} product - Product document
 * @param {Object} businessAccount - BusinessAccount document (optional)
 * @param {Number} quantity - Order quantity
 * @returns {Number} - Calculated price
 */
exports.calculateB2BPrice = (product, businessAccount = null, quantity = 1) => {
  let basePrice = product.price || 0;

  // If no business account, return standard price
  if (!businessAccount || !businessAccount.pricingTier) {
    return calculateQuantityPrice(product, basePrice, quantity);
  }

  // Check volume pricing tiers
  if (product.volumePricing && product.volumePricing.length > 0) {
    const tierPrice = product.volumePricing.find(
      (vp) => vp.tier === businessAccount.pricingTier
    );
    if (tierPrice && tierPrice.price) {
      basePrice = tierPrice.price;
    }
  }

  // Apply quantity-based pricing
  return calculateQuantityPrice(product, basePrice, quantity);
};

/**
 * Calculate price based on quantity tiers
 * @param {Object} product - Product document
 * @param {Number} basePrice - Base price
 * @param {Number} quantity - Order quantity
 * @returns {Number} - Calculated price
 */
function calculateQuantityPrice(product, basePrice, quantity) {
  if (!product.quantityPricing || product.quantityPricing.length === 0) {
    return basePrice;
  }

  // Sort quantity pricing by minQuantity descending
  const sortedPricing = [...product.quantityPricing].sort(
    (a, b) => b.minQuantity - a.minQuantity
  );

  // Find the appropriate tier
  for (const tier of sortedPricing) {
    if (quantity >= tier.minQuantity) {
      if (tier.maxQuantity && quantity > tier.maxQuantity) {
        continue;
      }
      // Use tier price if available, otherwise apply discount
      if (tier.price) {
        return tier.price;
      } else if (tier.discount) {
        return basePrice * (1 - tier.discount / 100);
      }
    }
  }

  return basePrice;
}

/**
 * Get pricing information for display
 * @param {Object} product - Product document
 * @param {Object} businessAccount - BusinessAccount document (optional)
 * @returns {Object} - Pricing information
 */
exports.getPricingInfo = (product, businessAccount = null) => {
  // Defensive checks
  if (!product) {
    throw new Error('Product is required for pricing calculation');
  }

  const standardPrice = product.price || 0;
  let tierPrice = standardPrice;
  let pricingTier = 'standard';

  if (businessAccount && businessAccount.pricingTier && product.volumePricing && Array.isArray(product.volumePricing)) {
    try {
      const tier = product.volumePricing.find(
        (vp) => vp && vp.tier === businessAccount.pricingTier
      );
      if (tier && tier.price) {
        tierPrice = tier.price;
        pricingTier = businessAccount.pricingTier;
      }
    } catch (error) {
      console.error('Error finding volume pricing tier:', error);
      // Continue with standard price
    }
  }

  return {
    standardPrice,
    tierPrice,
    pricingTier,
    quantityPricing: Array.isArray(product.quantityPricing) ? product.quantityPricing : [],
    moq: product.moq || 1,
    bulkPricingEnabled: product.bulkPricingEnabled || false,
  };
};

