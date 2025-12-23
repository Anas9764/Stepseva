import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiInfo, FiDollarSign, FiMessageCircle, FiPhone, FiCheckCircle, FiMapPin, FiBriefcase, FiShield, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ProductVariants from '../components/ProductVariants';
import ProductReviews from '../components/ProductReviews';
import ProductQnA from '../components/ProductQnA';
import LazyImage from '../components/LazyImage';
import B2BPricingDisplay from '../components/B2BPricingDisplay';
import InquiryForm from '../components/InquiryForm';
import QuickInquiryForm from '../components/QuickInquiryForm';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Size and quantity selection removed - handled in inquiry form (B2B style)
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showQuickInquiry, setShowQuickInquiry] = useState(false);
  const [inquiryType, setInquiryType] = useState('get_best_price');
  const [showMobileNumber, setShowMobileNumber] = useState(false);
  
  // Supplier contact info (should come from settings/product)
  const supplierPhone = '+91-8261029700';
  const supplierWhatsApp = '918261029700';
  const [similarProducts, setSimilarProducts] = useState([]);
  const [relatedCategories, setRelatedCategories] = useState([]);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      const productData = response.data;
      setProduct(productData);
      
      // Size and quantity handled in inquiry form (IndiaMART style)
      
      // Fetch related products
      if (productData?.category) {
        const categoryId = typeof productData.category === 'object' 
          ? productData.category._id 
          : productData.category;
          
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

  // Get available stock - simplified for IndiaMART style (no size selection on main page)
  const availableStock = useMemo(() => {
    if (!product) return 0;
    return product.stock || 0;
  }, [product]);

  const handleGetBestPrice = useCallback(() => {
    if (!product) return;
    // Show quick inquiry form (mobile-first, IndiaMART style)
    setShowQuickInquiry(true);
  }, [product]);

  const handleGetLatestPrice = useCallback(() => {
    if (!product) return;
    // Show quick inquiry form (mobile-first, IndiaMART style)
    setShowQuickInquiry(true);
  }, [product]);

  const handleContactSupplier = useCallback(() => {
    if (!product) return;
    // Open inquiry form - size and quantity will be handled in the form (IndiaMART style)
    setInquiryType('contact_supplier');
    setShowInquiryForm(true);
  }, [product]);

  // WhatsApp Integration - IndiaMart Style
  const handleWhatsApp = useCallback(() => {
    if (!product) return;
    
    const productName = product.name;
    const productUrl = window.location.href;
    const moq = product.moq || 1;
    const sizes = product.sizes && product.sizes.length > 0 
      ? `Sizes: ${product.sizes.join(', ')}` 
      : '';
    const color = product.variantColor || product.color || '';
    
    // Create WhatsApp message with product details (IndiaMart style)
    const message = encodeURIComponent(
      `Hello StepSeva!\n\n` +
      `I'm interested in purchasing:\n\n` +
      `📦 *Product:* ${productName}\n` +
      (color ? `🎨 *Color:* ${color}\n` : '') +
      (sizes ? `📏 ${sizes}\n` : '') +
      `📊 *MOQ:* ${moq} units\n` +
      `🔗 *Product Link:* ${productUrl}\n\n` +
      `Please share:\n` +
      `• Best price quote\n` +
      `• Availability\n` +
      `• Delivery time\n\n` +
      `Thank you!`
    );
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${supplierWhatsApp}?text=${message}`, '_blank');
  }, [product, supplierWhatsApp]);

  // Request Call Back
  const handleRequestCallBack = useCallback(() => {
    if (!product) return;
    setInquiryType('request_callback');
    setShowInquiryForm(true);
  }, [product]);

  // Get Best Quote
  const handleGetBestQuote = useCallback(() => {
    if (!product) return;
    setInquiryType('get_best_price');
    setShowInquiryForm(true);
  }, [product]);

  // Yes! I am Interested
  const handleYesInterested = useCallback(() => {
    if (!product) return;
    setInquiryType('interested');
    setShowInquiryForm(true);
  }, [product]);

  // Quantity and size selection removed from main page - handled in inquiry form (IndiaMART style)

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

        {/* Product Details - IndiaMART Style Layout */}
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

          {/* Price & Stock - IndiaMART Style */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <B2BPricingDisplay product={product} />
                {/* Get Latest Price Link - IndiaMART Style */}
                {(!isAuthenticated || account?.status !== 'active') ? (
                  <button
                    onClick={handleGetLatestPrice}
                    className="mt-3 text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1 underline"
                  >
                    Get Latest Price
                  </button>
                ) : null}
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
                    <>Low Stock ({availableStock} available)</>
                  ) : (
                    <>In Stock ({availableStock} available)</>
                  )}
                </span>
              ) : (
                <span className="text-sm text-red-700 bg-red-100 px-4 py-2 rounded-full font-semibold border border-red-200">
                  Out of Stock
                </span>
              )}
            </div>
            {/* Location Badge - IndiaMART Style */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiMapPin size={16} />
              <span>Nagpur, Maharashtra</span>
            </div>
          </div>

          {/* Product Specifications Table (IndiaMART Style) */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <h3 className="bg-gray-50 px-6 py-4 font-bold text-secondary border-b border-gray-200">
              Product Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 w-1/3 bg-gray-50">Footwear Type</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 capitalize">{product.footwearType || 'N/A'}</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Material</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Premium Quality</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Occasion/Usage</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 capitalize">{product.footwearType === 'formal' ? 'Formal Wear' : product.footwearType === 'sports' ? 'Sports' : 'Casual Wear'}</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Pattern</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Printed/Solid</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Size (UK / India)</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'All Sizes'}
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Color</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {product.variantColor || 'Multi Color'}
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Sole Material</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rubber</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Heel Height</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">No Heel</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Packaging Type</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Box</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Country of Origin</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Made in India</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 bg-gray-50">Availability</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {availableStock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Description - Enhanced */}
          <div className="border-2 border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
            <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded"></span>
              Product Description
            </h3>
            <p className="text-gray-700 leading-relaxed mb-5 text-base">{product.description}</p>
            
            {/* Product Features - Enhanced */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h4 className="font-bold text-text mb-3 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" size={18} />
                Key Features:
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Premium Quality Materials for durability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Comfortable Fit for all-day wear</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Durable Construction for long-lasting use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Stylish Design for modern appeal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Available in Multiple Sizes</span>
                </li>
              </ul>
            </div>
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

          {/* Size and Quantity Info - IndiaMART Style (Info only, no selectors) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">Available Sizes:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {product.sizes.join(', ')}
                </span>
              </div>
              {product.moq && product.moq > 1 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-gray-700">Minimum Order Quantity (MOQ):</span>
                  <span className="text-sm text-primary font-bold">{product.moq} units</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Size and quantity can be specified in the inquiry form
              </p>
            </div>
          )}

          {/* Action Buttons - Brand Colors */}
          <div className="mb-6 space-y-3">
            {/* Get Best Quote Button - Primary Brand Color */}
            <button
              onClick={handleGetBestQuote}
              disabled={availableStock === 0}
              className={`w-full flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                availableStock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:from-secondary hover:to-primary transform hover:-translate-y-0.5'
              }`}
            >
              <FiMail size={22} />
              <span>Get Best Quote</span>
            </button>
            
            {/* WhatsApp Button - Keep WhatsApp Green */}
            <button
              onClick={handleWhatsApp}
              disabled={availableStock === 0}
              className={`w-full flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                availableStock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#25D366] text-white hover:bg-[#20BA5A] transform hover:-translate-y-0.5'
              }`}
            >
              <FaWhatsapp size={22} />
              <span>Chat on WhatsApp</span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRequestCallBack}
                disabled={availableStock === 0}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 border-2 ${
                  availableStock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-primary border-primary text-white hover:bg-secondary hover:border-secondary transform hover:-translate-y-0.5'
                }`}
              >
                <FiPhone size={18} />
                <span>Request Call Back</span>
              </button>
              <button
                onClick={handleContactSupplier}
                disabled={availableStock === 0}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 border-2 ${
                  availableStock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                    : 'bg-white border-primary text-primary hover:bg-primary hover:text-white transform hover:-translate-y-0.5'
                }`}
              >
                <FiMessageCircle size={18} />
                <span>Contact Supplier</span>
              </button>
            </div>
            
            {/* Yes! I am Interested Button - Secondary Brand Color */}
            <button
              onClick={handleYesInterested}
              disabled={availableStock === 0}
              className={`w-full flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-bold text-base transition-all duration-300 border-2 ${
                availableStock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                  : 'bg-white border-secondary text-secondary hover:bg-secondary hover:text-white transform hover:-translate-y-0.5'
              }`}
            >
              <FiCheckCircle size={20} />
              <span>Yes! I am Interested</span>
            </button>
          </div>
          
          {/* Trust Badges - Enhanced Design */}
          <div className="mb-6 p-5 bg-gradient-to-br from-green-50 via-blue-50 to-green-50 rounded-xl border-2 border-green-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <FiCheckCircle className="text-white" size={14} />
                </div>
                <span className="text-gray-800 font-semibold">Verified Manufacturer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <FiShield className="text-white" size={14} />
                </div>
                <span className="text-gray-800 font-semibold">Trusted Supplier</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <FiCheckCircle className="text-white" size={14} />
                </div>
                <span className="text-gray-800 font-semibold">Quality Assured</span>
              </div>
            </div>
          </div>
          
        </motion.div>
        </div>

        {/* Inquiry Form Modals */}
        <InquiryForm
          isOpen={showInquiryForm}
          onClose={() => setShowInquiryForm(false)}
          product={product}
          defaultQuantity={product?.moq || 1}
          defaultSize={''}
        />
        
        <QuickInquiryForm
          isOpen={showQuickInquiry}
          onClose={() => setShowQuickInquiry(false)}
          product={product}
          onSuccess={() => {
            setShowQuickInquiry(false);
          }}
        />

        {/* Similar Products Section (IndiaMART Style) */}
        {similarProducts.length > 0 && (
          <section className="mt-16 mb-16">
            <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
              Find products similar to {product.name} near you
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct._id} product={similarProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Related Categories Section (IndiaMART Style) */}
        {relatedCategories.length > 0 && (
          <section className="mt-16 mb-16">
            <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
              Find related categories near you
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedCategories.map((category) => {
                const categoryName = typeof category === 'object' ? category.name : category;
                const categoryImage = typeof category === 'object' ? category.image : null;
                return (
                  <Link
                    key={typeof category === 'object' ? category._id : category}
                    to={`/shop?category=${encodeURIComponent(categoryName)}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow group"
                  >
                    {categoryImage && (
                      <img
                        src={categoryImage}
                        alt={categoryName}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                      {categoryName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">in your area</p>
                    <span className="text-primary text-sm font-semibold mt-2 inline-block">
                      Get Quote →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

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

