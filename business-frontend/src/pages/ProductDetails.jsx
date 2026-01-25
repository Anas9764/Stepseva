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
  FiChevronRight,
  FiBox,
  FiPocket,
  FiUsers,
  FiMaximize,
  FiLayers,
  FiTruck,
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
  const supplierPhone = '+91-9764319087';
  const supplierWhatsApp = '919764319087';
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
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-secondary via-primary to-secondary pt-32 pb-16">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center lg:text-left">
          {/* Breadcrumb - High Contrast */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center lg:justify-start gap-2 text-sm mb-6 text-white/90"
          >
            <Link to="/" className="hover:text-gold transition-colors font-medium">Home</Link>
            <FiChevronRight className="opacity-40" />
            <Link to="/shop" className="hover:text-gold transition-colors font-medium">Shop</Link>
            <FiChevronRight className="opacity-40" />
            <span className="text-white font-bold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-4 leading-tight tracking-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <span className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest shadow-xl">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                Official Listing
              </span>
              <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
              <p className="text-sm font-medium text-white/80">
                SKU: <span className="text-white font-bold">{id.slice(-8).toUpperCase()}</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-10">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14">
          {/* Left: Images */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-4 rounded-2xl overflow-hidden bg-white border border-gray-200"
              style={{ boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.15)' }}
            >
              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold to-gold-light text-secondary text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                    Featured Product
                  </span>
                </div>
              )}
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
                    className={`rounded-xl overflow-hidden transition-all ${selectedImage === index
                      ? 'ring-3 ring-primary shadow-lg'
                      : 'border-2 border-gray-200 hover:border-primary/50 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover"
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
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.12)' }}>
              {/* Premium Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-secondary via-primary to-secondary p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                  <div className="text-sm text-white/80">StepSeva Verified Listing</div>
                  <div className="text-white font-semibold">Fast quotes • WhatsApp support</div>
                </div>
              </div>

              <div className="p-6">
                {/* Category & Quick Info */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                    {typeof product.category === 'object' ? product.category?.name : product.category}
                  </span>
                  {product.gender && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {product.gender}
                    </span>
                  )}
                  {availableStock > 0 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      In Stock
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Pricing & MOQ Card */}
                <div className="relative mb-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                  <div className="relative z-10">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Wholesale Pricing</div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl lg:text-4xl font-heading font-black text-secondary">
                        Price on Request
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mb-4">MOQ: <span className="text-secondary font-bold">{product.moq || 1} Units</span></p>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Buyer" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">12+ recent inquiries</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleGetBestQuote}
                    disabled={availableStock === 0}
                    className={`w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all shadow-lg hover:shadow-primary/25 active:scale-[0.98] ${availableStock === 0
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-primary hover:bg-secondary'
                      }`}
                  >
                    <FiMail size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>Get Best Price Now</span>
                    {availableStock > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      disabled={availableStock === 0}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border ${availableStock === 0
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
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border ${availableStock === 0
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
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${isSavedToRfq ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
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

                {/* Premium Trust Signal Bar */}
                <div className="mt-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-primary/5 to-green-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white/80 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm overflow-hidden text-center">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                      <div className="flex items-center gap-2 group/item">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                          <FiShield className="text-green-600 group-hover/item:text-inherit" size={16} />
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Verified</div>
                          <div className="text-xs font-black text-secondary">Manufacturer</div>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                      <div className="flex items-center gap-2 group/item">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                          <FiCheckCircle className="text-primary group-hover/item:text-inherit" size={16} />
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Quality</div>
                          <div className="text-xs font-black text-secondary">Premium Grade</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.aside>
        </div>

        {/* Details Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Product Intel Grid */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-heading font-black text-secondary uppercase tracking-tight">
                  Product <span className="text-primary">Intel</span>
                </h3>
                <div className="h-px flex-1 bg-gray-100 mx-6 hidden md:block" />
                <span className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Technical Specs
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {[
                  { label: 'Type', value: product.footwearType, icon: <FiBox className="text-blue-500" /> },
                  { label: 'Brand', value: product.brand || 'StepSeva', icon: <FiPocket className="text-purple-500" /> },
                  { label: 'Gender', value: product.gender, icon: <FiUsers className="text-pink-500" /> },
                  { label: 'Sizes', value: product.sizes?.length > 0 ? product.sizes.join(', ') : 'All', icon: <FiMaximize className="text-amber-500" /> },
                  { label: 'Color', value: product.variantColor || product.color, icon: <FiLayers className="text-green-500" /> },
                  { label: 'MOQ', value: `${product.moq || 1} Units`, icon: <FiTruck className="text-cyan-500" /> },
                ].map((spec, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                      {spec.icon}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{spec.label}</div>
                    <div className="text-base font-black text-secondary capitalize">{spec.value || 'Standard'}</div>
                  </motion.div>
                ))}
              </div>

              {/* Availability Status */}
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${availableStock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm font-bold text-secondary uppercase tracking-wider">
                    {availableStock > 0 ? 'Ready to Ship' : 'Pre-order Required'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-medium italic">
                  * Specifications may vary based on customization requirements
                </div>
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
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${availableStock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'
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
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold ${availableStock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white'
                }`}
            >
              <FiMail size={18} /> Quote
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={availableStock === 0}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border ${availableStock === 0 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-[#25D366] text-white border-[#25D366]'
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
        {
          similarProducts.length > 0 && (
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
          )
        }

        {/* Related Categories Section (IndiaMART Style) */}
        {
          relatedCategories.length > 0 && (
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
          )
        }

        {/* Reviews Section */}
        <ProductReviews productId={product._id} />

        {/* Q&A Section */}
        <ProductQnA productId={product._id} />

        {/* Related Products */}
        {
          relatedProducts.length > 0 && (
            <section className="mt-24 mb-24">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-heading font-black text-secondary">
                  Related <span className="text-primary">Products</span>
                </h2>
                <Link to="/shop" className="text-primary font-bold hover:text-secondary transition-colors group flex items-center gap-2">
                  Browse More <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </section>
          )
        }
      </div>
    </div >
  );
};

export default ProductDetails;

