import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiShoppingCart, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import { leadService } from '../services/leadService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const InquiryForm = ({ isOpen, onClose, product, defaultQuantity = null, defaultSize = null, inquiryType: propInquiryType = 'get_best_price' }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const { data: settings } = useSelector((state) => state.settings);
  const navigate = useNavigate();

  const isCallbackRequest = propInquiryType === 'request_callback' || propInquiryType === 'callback';
  const isCustomizationRequest = propInquiryType === 'customization';

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerCity: '',
    buyerState: '',
    buyerCountry: 'India',
    businessType: 'other',
    companyName: '',
    gstNumber: '',
    quantityRequired: defaultQuantity || (product?.moq || 1),
    size: defaultSize || '',
    color: '',
    inquiryType: propInquiryType,
    notes: '',
    requirements: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill form if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        buyerName: user.name || '',
        buyerEmail: user.email || '',
        buyerPhone: user.phone || '',
        companyName: account?.companyName || '',
        businessType: account?.businessType || 'other',
        gstNumber: account?.taxId || '',
      }));
    }
  }, [isAuthenticated, user, account]);

  // Reset form when product or inquiryType changes
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        quantityRequired: defaultQuantity || product.moq || 1,
        size: defaultSize || '',
        inquiryType: propInquiryType,
      }));
    }
  }, [product, defaultQuantity, defaultSize, propInquiryType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to submit an inquiry');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Validation - different requirements for callback vs quote vs customization
    if (isCallbackRequest) {
      // For callback, only name and phone are required
      if (!formData.buyerName || !formData.buyerPhone) {
        toast.error('Please provide your name and phone number');
        return;
      }
    } else {
      // For quote and customization, name, email, phone, and city are required
      if (!formData.buyerName || !formData.buyerEmail || !formData.buyerPhone || !formData.buyerCity) {
        toast.error('Please fill in all required fields');
        return;
      }

      // For customization, requirements field is mandatory
      if (isCustomizationRequest && (!formData.requirements || formData.requirements.trim() === '')) {
        toast.error('Please provide customization details (size mix, colors, delivery city, timeline)');
        return;
      }

      // Validate quantity for quote requests
      if (formData.quantityRequired < (product?.moq || 1)) {
        toast.error(`Minimum order quantity is ${product.moq || 1} units`);
        return;
      }
    }

    if (!product || !product._id) {
      toast.error('Product information is missing');
      return;
    }

    setLoading(true);

    try {
      // Prepare lead data with proper defaults for callback requests
      // Backend requires: buyerName, buyerEmail, buyerPhone, buyerCity (all non-empty)
      const leadData = {
        buyerName: (formData.buyerName || '').trim(),
        buyerPhone: (formData.buyerPhone || '').trim(),
        buyerEmail: (!formData.buyerEmail || formData.buyerEmail.trim() === '')
          ? (isCallbackRequest ? `callback_${Date.now()}@stepseva.com` : '')
          : formData.buyerEmail.trim(),
        buyerCity: (!formData.buyerCity || formData.buyerCity.trim() === '')
          ? (isCallbackRequest ? 'Not specified' : '')
          : formData.buyerCity.trim(),
        buyerState: (formData.buyerState || '').trim() || undefined,
        buyerCountry: (formData.buyerCountry || 'India').trim(),
        businessType: formData.businessType || 'other',
        productId: product._id,
        quantityRequired: isCallbackRequest ? (product?.moq || 1) : parseInt(formData.quantityRequired),
        inquiryType: formData.inquiryType || propInquiryType,
      };

      // Add optional fields only if they have values
      if (formData.companyName && formData.companyName.trim()) {
        leadData.companyName = formData.companyName.trim();
      }
      if (formData.gstNumber && formData.gstNumber.trim()) {
        leadData.gstNumber = formData.gstNumber.trim();
      }
      if (formData.size && formData.size.trim()) {
        leadData.size = formData.size.trim();
      }
      if (formData.color && formData.color.trim()) {
        leadData.color = formData.color.trim();
      }
      if (formData.requirements && formData.requirements.trim()) {
        leadData.requirements = formData.requirements.trim();
      }
      if (formData.notes && formData.notes.trim()) {
        leadData.notes = formData.notes.trim();
      }

      // Remove undefined values (but keep empty strings for required fields)
      Object.keys(leadData).forEach(key => {
        if (leadData[key] === undefined) {
          delete leadData[key];
        }
      });

      // Ensure required fields are never empty (backend validation)
      if (!leadData.buyerName || leadData.buyerName.trim() === '') {
        toast.error('Name is required');
        setLoading(false);
        return;
      }
      if (!leadData.buyerEmail || leadData.buyerEmail.trim() === '') {
        toast.error('Email is required');
        setLoading(false);
        return;
      }
      if (!leadData.buyerPhone || leadData.buyerPhone.trim() === '') {
        toast.error('Phone is required');
        setLoading(false);
        return;
      }
      if (!leadData.buyerCity || leadData.buyerCity.trim() === '') {
        toast.error('City is required');
        setLoading(false);
        return;
      }

      console.log('Submitting lead data:', leadData);

      await leadService.createLead(leadData);

      setSubmitted(true);
      toast.success('Your inquiry has been submitted successfully! We will contact you soon.');

      // Close modal after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        // Reset form
        setFormData({
          buyerName: isAuthenticated && user ? user.name : '',
          buyerEmail: isAuthenticated && user ? user.email : '',
          buyerPhone: isAuthenticated && user ? user.phone : '',
          buyerCity: '',
          buyerState: '',
          buyerCountry: 'India',
          businessType: account?.businessType || 'other',
          companyName: account?.companyName || '',
          gstNumber: account?.taxId || '',
          quantityRequired: product?.moq || 1,
          size: '',
          color: '',
          inquiryType: propInquiryType,
          notes: '',
          requirements: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data,
      });

      // Handle specific error cases
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 'Please login to submit an inquiry';
        toast.error(errorMessage);

        // If explicitly requires auth, redirect to login after a delay
        if (error.response?.data?.requiresAuth) {
          setTimeout(() => {
            navigate('/login', { state: { from: window.location.pathname } });
          }, 2500);
        }
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Please check your form data and try again.';
        toast.error(errorMessage);
        console.error('400 Validation error details:', {
          message: error.response?.data?.message,
          data: error.response?.data,
        });
      } else if (error.response?.status === 404) {
        toast.error(error.response?.data?.message || 'Product not found. Please try again.');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden relative"
        >
          {/* Header */}
          <div className="sticky top-0 z-30 bg-gradient-to-r from-primary to-secondary text-white p-4 sm:p-6 flex items-center justify-between shadow-md">
            <div className="pr-8">
              <h2 className="text-xl sm:text-2xl font-heading font-bold leading-tight">
                {isCallbackRequest
                  ? 'Request Call Back'
                  : isCustomizationRequest
                    ? 'Request Custom Quote'
                    : 'Get Best Price'}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-1 line-clamp-1">
                {product?.name || 'Product Inquiry'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 sm:static p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">

            {/* Success Message */}
            {submitted ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block mb-4"
                >
                  <FiCheckCircle size={64} className="text-green-500 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-heading font-bold text-secondary mb-2">
                  Inquiry Submitted!
                </h3>
                <p className="text-gray-600">
                  We have received your inquiry and will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Product Info */}
                {product && (
                  <div className="bg-sky/30 rounded-lg p-4 flex items-center gap-4">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-text">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        MOQ: {product.moq || 1} units
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-semibold text-secondary flex items-center gap-2">
                    <FiUser className="text-primary" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="buyerPhone"
                        value={formData.buyerPhone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    {!isCallbackRequest && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-text mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="buyerEmail"
                            value={formData.buyerEmail}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="your@email.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="buyerCity"
                            value={formData.buyerCity}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Your city"
                          />
                        </div>
                      </>
                    )}

                    {isCallbackRequest && (
                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          name="buyerEmail"
                          value={formData.buyerEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="your@email.com"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information - Only for Get Best Quote */}
                {!isCallbackRequest && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-heading font-semibold text-secondary flex items-center gap-2">
                      <FiBriefcase className="text-primary" />
                      Business Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Business Type
                        </label>
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="retailer">Retailer</option>
                          <option value="wholesaler">Wholesaler</option>
                          <option value="distributor">Distributor</option>
                          <option value="manufacturer">Manufacturer</option>
                          <option value="business_customer">Business Customer</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Company Name (Optional)
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Details - Only for Get Best Quote */}
                {!isCallbackRequest && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-heading font-semibold text-secondary flex items-center gap-2">
                      <FiShoppingCart className="text-primary" />
                      Order Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-text mb-2">
                          Quantity Required <span className="text-red-500">*</span>
                          {product && product.moq > 1 && (
                            <span className="ml-2 text-xs text-primary">
                              (MOQ: {product.moq})
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          name="quantityRequired"
                          value={formData.quantityRequired}
                          onChange={handleChange}
                          min={product?.moq || 1}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {product?.sizes && product.sizes.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-text mb-2">
                            Size (Optional)
                          </label>
                          <select
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select Size</option>
                            {product.sizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {product?.colors && product.colors.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-text mb-2">
                            Color Preference (Optional)
                          </label>
                          <select
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select Color</option>
                            {product.colors.map((color) => (
                              <option key={color} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information - Only for Get Best Quote */}
                {!isCallbackRequest && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-heading font-semibold text-secondary flex items-center gap-2">
                      <FiMessageSquare className="text-primary" />
                      {isCustomizationRequest ? 'Customization Details' : 'Additional Information (Optional)'}
                    </h3>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        {isCustomizationRequest ? (
                          <>
                            Size Mix, Colors, Delivery City & Timeline <span className="text-red-500">*</span>
                          </>
                        ) : (
                          'Special Requirements or Notes'
                        )}
                      </label>
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows={isCustomizationRequest ? "5" : "3"}
                        required={isCustomizationRequest}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={
                          isCustomizationRequest
                            ? "Please share: Size mix, color preferences, delivery city, timeline, and any other customization requirements..."
                            : "Any special requirements, customization needs, or additional information..."
                        }
                      />
                      {isCustomizationRequest && (
                        <p className="text-xs text-gray-500 mt-1">
                          Please provide detailed information about your customization needs for a faster response.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? 'Submitting...'
                      : isCallbackRequest
                        ? 'Request Call Back'
                        : isCustomizationRequest
                          ? 'Request Custom Quote'
                          : 'Get Best Quote'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default InquiryForm;

