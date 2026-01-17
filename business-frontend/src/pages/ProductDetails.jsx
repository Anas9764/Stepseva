import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiInfo,
  FiDollarSign,
  FiMessageCircle,
  FiPhone,
  FiCheckCircle,
  FiMapPin,
  FiBriefcase,
  FiShield,
  FiMail,
  FiCopy,
  FiPlus,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ProductVariants from '../components/ProductVariants';
import ProductReviews from '../components/ProductReviews';
import ProductQnA from '../components/ProductQnA';
import LazyImage from '../components/LazyImage';
import B2BPricingDisplay from '../components/B2BPricingDisplay';
import InquiryForm from '../components/InquiryForm';
import QuickInquiryForm from '../components/QuickInquiryForm';
import { useRfq } from '../contexts/RfqContext';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const { data: settings } = useSelector((state) => state.settings);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Size and quantity selection removed - handled in inquiry form (B2B style)
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showQuickInquiry, setShowQuickInquiry] = useState(false);
  const [inquiryType, setInquiryType] = useState('get_best_price');
  const [isSavedToRfq, setIsSavedToRfq] = useState(false);
  const { openDrawer: openRfqDrawer } = useRfq();
  
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

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to send an inquiry');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    // Show quick inquiry form (mobile-first, IndiaMART style)
    setShowQuickInquiry(true);
  }, [product, settings, isAuthenticated, navigate, id]);

  const handleAddToBulkRFQ = useCallback(() => {
    if (!product) return;

    try {
      const raw = localStorage.getItem('rfqDraftItems');
      const existing = raw ? JSON.parse(raw) : [];
      const items = Array.isArray(existing) ? existing : [];

      const next = items.some((it) => String(it.productId) === String(product._id))
        ? items
        : [
            ...items,
            {
              productId: product._id,
              productName: product.name,
              quantityRequired: product.moq || 1,
            },
          ];

      localStorage.setItem('rfqDraftItems', JSON.stringify(next));
      setIsSavedToRfq(true);
      toast.success('Added to RFQ list');
      // Dispatch event to update count in header
      window.dispatchEvent(new Event('rfqUpdated'));
      openRfqDrawer();
    } catch (e) {
      console.error('Failed to add to RFQ list', e);
      toast.error('Could not add to RFQ list');
    }
  }, [product]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  }, []);

  const handleGetLatestPrice = useCallback(() => {
    if (!product) return;

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to send an inquiry');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    // Show quick inquiry form (mobile-first, IndiaMART style)
    setShowQuickInquiry(true);
  }, [product, settings, isAuthenticated, navigate, id]);

  // Contact supplier is redundant for our B2B model (use Inquiry/WhatsApp/Callback)

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

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to request a callback');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setInquiryType('request_callback');
    setShowInquiryForm(true);
  }, [product, settings, isAuthenticated, navigate, id]);

  // Get Best Quote
  const handleGetBestQuote = useCallback(() => {
    if (!product) return;

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to send an inquiry');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setInquiryType('get_best_price');
    setShowInquiryForm(true);
  }, [product, settings, isAuthenticated, navigate, id]);

  // Custom Quote (for "Need a custom quote?" section)
  const handleCustomQuote = useCallback(() => {
    if (!product) return;

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to request a custom quote');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setInquiryType('customization');
    setShowInquiryForm(true);
  }, [product, settings, isAuthenticated, navigate, id]);

  // "Yes! I am Interested" CTA removed (duplicate of Inquiry)

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
      <div className="container mx-auto px-4 py-6 lg:py-10">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14">
          {/* Left: Images */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 rounded-2xl overflow-hidden shadow-2xl bg-white"
            >
              <LazyImage
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-[360px] sm:h-[440px] lg:h-[560px] object-cover"
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

          {/* Right: Sticky Purchase/Inquiry Card */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl p-6 lg:p-7 shadow-xl border border-gray-100 overflow-hidden">
              <div className="-mx-6 -mt-6 mb-5 px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-white to-secondary/10 border-b border-gray-100">
                <div className="text-xs text-gray-600">StepSeva Verified Listing</div>
                <div className="text-sm font-semibold text-secondary">Fast quotes • WhatsApp support</div>
              </div>
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

          <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-3 py-1">
              <FiBriefcase size={14} /> MOQ: <span className="font-semibold text-gray-900">{product.moq || 1}</span>
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 hover:bg-gray-100"
              title="Copy product link"
            >
              <FiCopy size={14} /> Copy Link
            </button>
          </div>

          {/* Price & Stock */}
          <div className="mb-5 pb-5 border-b border-gray-200">
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

          {/* Primary CTAs */}
          <div className="space-y-3">
            <button
              onClick={handleGetBestQuote}
              disabled={availableStock === 0}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                availableStock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white'
              }`}
            >
              <FiMail size={18} /> Get Best Quote
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={availableStock === 0}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border ${
                  availableStock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-[#25D366] text-white border-[#25D366] hover:bg-[#20BA5A]'
                }`}
              >
                <FaWhatsapp size={18} /> WhatsApp
              </button>
              <button
                type="button"
                onClick={handleRequestCallBack}
                disabled={availableStock === 0}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border ${
                  availableStock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                }`}
              >
                <FiPhone size={18} /> Call Back
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToBulkRFQ}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${
                isSavedToRfq ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <FiPlus size={18} /> {isSavedToRfq ? 'Added to RFQ List' : 'Add to Bulk RFQ'}
            </button>

            <button
              type="button"
              onClick={openRfqDrawer}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border border-gray-200 bg-white hover:bg-gray-50"
            >
              View RFQ List
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 p-5 bg-gradient-to-br from-green-50 via-blue-50 to-green-50 rounded-xl border border-green-200 shadow-sm">
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

            </div>
          </motion.aside>
        </div>

        {/* Details Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Product Specifications */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-secondary">Product Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 w-1/3 bg-gray-50">Footwear Type</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">{product.footwearType || 'N/A'}</td>
                    </tr>
                    {product.brand ? (
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Brand</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.brand}</td>
                      </tr>
                    ) : null}
                    {product.gender ? (
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Gender</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">{product.gender}</td>
                      </tr>
                    ) : null}
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Available Sizes</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'All Sizes'}
                      </td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Color</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.variantColor || product.color || 'Multi Color'}</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">MOQ</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.moq || 1} units</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Availability</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {availableStock > 0 ? (
                          <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-red-700 font-semibold">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span> Out of Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-secondary mb-3">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 1 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-secondary mb-4">More Options</h3>
                <ProductVariants variants={product.variants} currentProductId={product._id} />
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-secondary mb-3">Need a custom quote?</h3>
              <p className="text-sm text-gray-600 mb-4">Share size mix, colors, delivery city, and timeline. We'll respond quickly with the best possible quote.</p>
              <button
                onClick={handleCustomQuote}
                disabled={availableStock === 0}
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  availableStock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'
                }`}
              >
                <FiMail size={18} /> Send Inquiry
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleGetBestQuote}
              disabled={availableStock === 0}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold ${
                availableStock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white'
              }`}
            >
              <FiMail size={18} /> Quote
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={availableStock === 0}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border ${
                availableStock === 0 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-[#25D366] text-white border-[#25D366]'
              }`}
            >
              <FaWhatsapp size={18} />
            </button>
            <button
              type="button"
              onClick={openRfqDrawer}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border border-gray-200 bg-white"
            >
              RFQ
            </button>
          </div>
        </div>

        <div className="h-20 lg:hidden" />

        {/* Inquiry Form Modals */}
        <InquiryForm
          isOpen={showInquiryForm}
          onClose={() => {
            setShowInquiryForm(false);
            setInquiryType('get_best_price'); // Reset to default
          }}
          product={product}
          defaultQuantity={product?.moq || 1}
          defaultSize={''}
          inquiryType={inquiryType}
        />
        
        <QuickInquiryForm
          isOpen={showQuickInquiry}
          onClose={() => setShowQuickInquiry(false)}
          product={product}
          onSuccess={() => {
            setShowQuickInquiry(false);
          }}
        />

        {/* RfqDrawer is now handled globally in App.jsx */}

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

