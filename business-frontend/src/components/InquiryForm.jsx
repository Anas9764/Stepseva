import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiShoppingCart, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import { leadService } from '../services/leadService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const InquiryForm = ({ isOpen, onClose, product, defaultQuantity = null, defaultSize = null }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  
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
    inquiryType: 'get_best_price',
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

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        quantityRequired: defaultQuantity || product.moq || 1,
        size: defaultSize || '',
      }));
    }
  }, [product, defaultQuantity, defaultSize]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.buyerName || !formData.buyerEmail || !formData.buyerPhone || !formData.buyerCity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!product || !product._id) {
      toast.error('Product information is missing');
      return;
    }

    if (formData.quantityRequired < (product.moq || 1)) {
      toast.error(`Minimum order quantity is ${product.moq || 1} units`);
      return;
    }

    setLoading(true);

    try {
      const leadData = {
        ...formData,
        productId: product._id,
        quantityRequired: parseInt(formData.quantityRequired),
      };

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
          inquiryType: 'get_best_price',
          notes: '',
          requirements: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold">Get Best Price</h2>
              <p className="text-sm text-white/90 mt-1">
                {product?.name || 'Product Inquiry'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

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

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-heading font-semibold text-secondary flex items-center gap-2">
                  <FiUser className="text-primary" />
                  Personal Information
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

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="buyerState"
                      value={formData.buyerState}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="buyerCountry"
                      value={formData.buyerCountry}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
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
                      Company Name
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

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="GSTIN"
                    />
                  </div>
                </div>
              </div>

              {/* Order Details */}
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
                        Size
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

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Color Preference
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Preferred color"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="get_best_price">Get Best Price</option>
                      <option value="contact_supplier">Contact Supplier</option>
                      <option value="bulk_order">Bulk Order</option>
                      <option value="customization">Customization</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-heading font-semibold text-secondary flex items-center gap-2">
                  <FiMessageSquare className="text-primary" />
                  Additional Information
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Any special requirements or customization needs..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>
              </div>

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
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InquiryForm;

