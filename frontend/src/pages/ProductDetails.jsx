import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../store/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync, isInWishlist } from '../store/slices/wishlistSlice';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ProductVariants from '../components/ProductVariants';
import ProductReviews from '../components/ProductReviews';
import ProductQnA from '../components/ProductQnA';
import LazyImage from '../components/LazyImage';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  
  const inWishlist = useSelector((state) => 
    product ? isInWishlist(state, product._id) : false
  );

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      setProduct(response.data);
      
      // Fetch related products
      if (response.data?.category) {
        const categoryId = typeof response.data.category === 'object' 
          ? response.data.category._id 
          : response.data.category;
          
        const relatedResponse = await productService.getAllProducts({
          category: categoryId,
          limit: 4,
        });
        setRelatedProducts(
          relatedResponse.data.filter((p) => p._id !== id).slice(0, 4)
        );
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get available stock for selected size or general stock - using useMemo to prevent errors
  const availableStock = useMemo(() => {
    if (!product) return 0;
    
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      // Check size-specific stock
      if (product.sizeStock) {
        // Handle both Map and object formats
        let sizeStockValue;
        if (product.sizeStock instanceof Map) {
          sizeStockValue = product.sizeStock.get(selectedSize);
        } else if (typeof product.sizeStock === 'object') {
          sizeStockValue = product.sizeStock[selectedSize];
        }
        
        if (sizeStockValue !== undefined && sizeStockValue !== null) {
          return sizeStockValue;
        }
      }
      // If no size-specific stock, return 0 for safety
      return 0;
    }
    // For products without sizes, use general stock
    return product.stock || 0;
  }, [product, selectedSize]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    
    // Check stock availability
    if (quantity > availableStock) {
      alert(`Only ${availableStock} items available${selectedSize ? ` in size ${selectedSize}` : ''}. Please reduce quantity.`);
      setQuantity(availableStock);
      return;
    }
    
    if (availableStock === 0) {
      alert('This product is out of stock');
      return;
    }
    
    // Use empty string for size if product doesn't have sizes or size is not selected
    const size = (product.sizes && product.sizes.length > 0) ? selectedSize : '';
    dispatch(addToCartAsync({ ...product, quantity, size }));
  }, [product, selectedSize, quantity, availableStock, dispatch]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    
    // Check stock availability
    if (quantity > availableStock) {
      alert(`Only ${availableStock} items available${selectedSize ? ` in size ${selectedSize}` : ''}. Please reduce quantity.`);
      setQuantity(availableStock);
      return;
    }
    
    if (availableStock === 0) {
      alert('This product is out of stock');
      return;
    }
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store product data in sessionStorage for after login
      const buyNowProduct = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0],
        quantity: quantity,
        size: selectedSize,
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
          quantity: quantity,
          size: selectedSize,
          description: product.description,
        },
      },
    });
  }, [product, selectedSize, quantity, availableStock, isAuthenticated, navigate]);

  const handleWishlistToggle = useCallback(() => {
    if (!product) return;
    if (inWishlist) {
      dispatch(removeFromWishlistAsync(product._id));
    } else {
      dispatch(addToWishlistAsync(product));
    }
  }, [product, inWishlist, dispatch]);

  const incrementQuantity = useCallback(() => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    } else {
      alert(`Only ${availableStock} items available${selectedSize ? ` in size ${selectedSize}` : ''}`);
    }
  }, [quantity, availableStock, selectedSize]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }, [quantity]);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
          Product Not Found
        </h2>
        <Link to="/shop" className="text-primary hover:text-secondary transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image]
    : ['https://via.placeholder.com/600'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/20">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-sm text-gray-600 flex items-center gap-2"
        >
          <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary transition-colors font-medium">Shop</Link>
          <span>/</span>
          <span className="text-text font-semibold truncate max-w-xs">{product.name}</span>
        </motion.div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 rounded-2xl overflow-hidden shadow-2xl bg-white"
            >
              <LazyImage
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
            </motion.div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary shadow-lg ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl"
        >
          {/* Category & Badges */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs text-primary uppercase tracking-wider font-bold bg-primary/10 px-3 py-1 rounded-full">
              {typeof product.category === 'object' ? product.category?.name : product.category}
            </span>
            {product.featured && (
              <span className="text-xs bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full font-bold">
                Featured
              </span>
            )}
            {product.gender && (
              <span className="text-xs bg-sky text-secondary px-3 py-1 rounded-full font-semibold capitalize">
                {product.gender}
              </span>
            )}
            {product.footwearType && (
              <span className="text-xs bg-accent text-secondary px-3 py-1 rounded-full font-semibold capitalize">
                {product.footwearType}
              </span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-secondary mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price & Stock */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
            </div>
            {availableStock > 0 ? (
              <span className={`text-sm px-4 py-2 rounded-full font-semibold flex items-center gap-2 border ${
                availableStock < 8 
                  ? 'text-amber-700 bg-amber-100 border-amber-200' 
                  : 'text-green-700 bg-green-100 border-green-200'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  availableStock < 8 ? 'bg-amber-500' : 'bg-green-500'
                }`}></span>
                {availableStock < 8 ? (
                  <>Low Stock ({availableStock} available{selectedSize ? ` in size ${selectedSize}` : ''})</>
                ) : (
                  <>In Stock ({availableStock} available{selectedSize ? ` in size ${selectedSize}` : ''})</>
                )}
              </span>
            ) : (
              <span className="text-sm text-red-700 bg-red-100 px-4 py-2 rounded-full font-semibold border border-red-200">
                Out of Stock{selectedSize ? ` in size ${selectedSize}` : ''}
              </span>
            )}
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Product Variants (Color Options) */}
          {product.variants && product.variants.length > 1 && (
            <ProductVariants variants={product.variants} currentProductId={product._id} />
          )}

          {product.brand && (
            <div className="mb-6">
              <span className="text-sm text-gray-600">Brand: </span>
              <span className="text-sm font-semibold text-text">{product.brand}</span>
            </div>
          )}

          {/* Gender and Type Display */}
          {(product.gender || product.footwearType) && (
            <div className="mb-6 flex gap-4">
              {product.gender && (
                <div>
                  <span className="text-sm text-gray-600">Gender: </span>
                  <span className="text-sm font-semibold text-text capitalize">{product.gender}</span>
                </div>
              )}
              {product.footwearType && (
                <div>
                  <span className="text-sm text-gray-600">Type: </span>
                  <span className="text-sm font-semibold text-text capitalize">{product.footwearType}</span>
                </div>
              )}
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-text mb-3 uppercase tracking-wide">
                Size - UK/India <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  // Handle both Map and object formats for sizeStock
                  let sizeStockValue;
                  if (product.sizeStock) {
                    if (product.sizeStock instanceof Map) {
                      sizeStockValue = product.sizeStock.get(size);
                    } else if (typeof product.sizeStock === 'object') {
                      sizeStockValue = product.sizeStock[size];
                    }
                  }
                  const sizeStock = (sizeStockValue !== undefined && sizeStockValue !== null) ? sizeStockValue : (product.stock || 0);
                  const isOutOfStock = sizeStock === 0;
                  const isLowStock = sizeStock > 0 && sizeStock < 8;
                  const isSelected = selectedSize === size;
                  
                  return (
                    <div key={size} className="relative">
                      <button
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`relative px-6 py-3 rounded-lg border-2 font-semibold transition-all min-w-[60px] ${
                          isSelected
                            ? 'border-primary bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105 z-10'
                            : isOutOfStock
                            ? 'border-gray-300 border-dashed bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-800 hover:border-primary hover:bg-primary/5 hover:scale-105'
                        }`}
                      >
                        {size}
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          </span>
                        )}
                      </button>
                      {/* Low Stock Indicator */}
                      {isLowStock && !isOutOfStock && (
                        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Only {sizeStock} left
                          </span>
                        </div>
                      )}
                      {/* Out of Stock Indicator */}
                      {isOutOfStock && (
                        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!selectedSize && (
                <p className="text-sm text-amber-600 mt-6 font-medium flex items-center gap-2">
                  <span>⚠️</span> Please select a size to continue
                </p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          {availableStock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-text mb-3">
                Quantity
                {selectedSize && (
                  <span className="ml-2 text-xs font-normal text-gray-600">
                    (Available: {availableStock} {availableStock === 1 ? 'item' : 'items'})
                  </span>
                )}
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="bg-gray-200 p-2.5 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FiMinus size={18} />
                </button>
                <span className="text-xl font-bold w-16 text-center bg-gray-50 py-2 rounded-lg border border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= availableStock}
                  className="bg-gray-200 p-2.5 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FiPlus size={18} />
                </button>
              </div>
              {availableStock < 8 && availableStock > 0 && (
                <p className="text-sm text-amber-600 mt-2 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  Low stock - Only {availableStock} {availableStock === 1 ? 'item' : 'items'} available{selectedSize ? ` in size ${selectedSize}` : ''}
                </p>
              )}
              {quantity > availableStock && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  ⚠️ Only {availableStock} items available{selectedSize ? ` in size ${selectedSize}` : ''}. Please reduce quantity.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={availableStock === 0 || (product.sizes?.length > 0 && !selectedSize)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 ${
                availableStock === 0 || (product.sizes?.length > 0 && !selectedSize)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                  : 'bg-white border-primary text-primary hover:bg-primary hover:text-white hover:border-primary'
              }`}
            >
              <FiShoppingCart size={20} />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={availableStock === 0 || (product.sizes?.length > 0 && !selectedSize)}
              className={`flex-1 px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                availableStock === 0 || (product.sizes?.length > 0 && !selectedSize)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-2xl'
              }`}
            >
              Buy Now
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`border-2 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-md hover:shadow-lg ${
                inWishlist
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 border-red-500 text-white'
                  : 'bg-white border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              <FiHeart size={20} className={inWishlist ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-text mb-3">Product Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Premium Quality Materials</li>
              <li>✓ Comfortable Fit</li>
              <li>✓ Durable Construction</li>
              <li>✓ Stylish Design</li>
              <li>✓ Available in Multiple Sizes</li>
            </ul>
          </div>
        </motion.div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product._id} />

        {/* Q&A Section */}
        <ProductQnA productId={product._id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-heading font-bold text-secondary mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

