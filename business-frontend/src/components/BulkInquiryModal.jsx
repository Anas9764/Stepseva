import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiPhone, FiUser, FiMapPin, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BulkInquiryModal = ({ isOpen, onClose, onSuccess, products }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const { data: settings } = useSelector((state) => state.settings);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const initialQuantities = useMemo(() => {
    const map = {};
    (products || []).forEach((p) => {
      map[p._id] = p?.quantityRequired || p?.moq || 1;
    });
    return map;
  }, [products]);

  const [quantities, setQuantities] = useState(initialQuantities);

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
    notes: '',
    requirements: '',
    inquiryType: 'bulk_inquiry',
  });

  useEffect(() => {
    setQuantities(initialQuantities);
  }, [initialQuantities]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQtyChange = (productId, value) => {
    const qty = Number(value);
    setQuantities((prev) => ({ ...prev, [productId]: Number.isFinite(qty) ? qty : 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to submit an inquiry');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!formData.buyerName || !formData.buyerEmail || !formData.buyerPhone || !formData.buyerCity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!products || products.length === 0) {
      toast.error('No products selected');
      return;
    }

    // Validate MOQs
    for (const p of products) {
      const q = parseInt(quantities[p._id] ?? (p.moq || 1));
      if (q < (p.moq || 1)) {
        toast.error(`MOQ for ${p.name} is ${p.moq || 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        buyerCity: formData.buyerCity,
        buyerState: formData.buyerState,
        buyerCountry: formData.buyerCountry,
        businessType: formData.businessType,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        requirements: formData.requirements,
        notes: formData.notes,
        items: products.map((p) => ({
          productId: p._id,
          quantityRequired: parseInt(quantities[p._id] ?? (p.moq || 1)),
        })),
      };

      await api.post('/bulk-rfqs', payload);

      setSubmitted(true);
      toast.success('Bulk inquiry submitted! We will contact you soon.');

      // Clear RFQ list from localStorage after successful submission
      try {
        localStorage.removeItem('rfqDraftItems');
        // Dispatch event to update count in header
        window.dispatchEvent(new Event('rfqUpdated'));
      } catch (e) {
        console.error('Failed to clear RFQ list:', e);
      }

      setTimeout(() => {
        setSubmitted(false);
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }, 1500);
    } catch (error) {
      console.error('❌ Error submitting bulk inquiry:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data,
      });
      
      // Handle different error types
      if (error.response?.status === 401) {
        // Authentication required
        const errorMessage = error.response?.data?.message || 
                           'Authentication required. Please login to submit an inquiry.';
        toast.error(errorMessage);
        
        // Only navigate to login if the backend explicitly requires auth
        // Give user time to read the error message first
        if (error.response?.data?.requiresAuth) {
          setTimeout(() => {
            onClose(); // Close modal first
            navigate('/login', { 
              state: { 
                from: window.location.pathname,
                message: 'Please login to submit your RFQ inquiry'
              } 
            });
          }, 2500); // 2.5 seconds to read the message
        }
      } else if (error.response?.status === 400) {
        // Validation error - show specific message
        const errorMessage = error.response?.data?.message || 
                           'Please check your input and try again.';
        toast.error(errorMessage);
      } else if (error.response?.status === 404) {
        // Product not found
        const errorMessage = error.response?.data?.message || 
                           'One or more products were not found. Please refresh and try again.';
        toast.error(errorMessage);
      } else if (error.response?.status >= 500) {
        // Server error
        toast.error('Server error. Please try again later or contact support.');
      } else {
        // Other errors
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to submit bulk inquiry. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold">Bulk Inquiry (RFQ)</h2>
              <p className="text-sm text-white/90 mt-1">
                Request quotes for {products?.length || 0} selected product{products?.length === 1 ? '' : 's'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <FiX size={24} />
            </button>
          </div>

          {submitted ? (
            <div className="p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-4">
                <FiCheckCircle size={64} className="text-green-500 mx-auto" />
              </motion.div>
              <h3 className="text-2xl font-heading font-bold text-secondary mb-2">Inquiry Submitted!</h3>
              <p className="text-gray-600">We received your request and will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Selected Products */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <div className="text-sm font-semibold text-secondary mb-3">Selected Products</div>
                <div className="space-y-3">
                  {products.map((p) => (
                    <div key={p._id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-secondary line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gray-500">MOQ: {p.moq || 1}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600">Qty</label>
                        <input
                          type="number"
                          min={p.moq || 1}
                          value={quantities[p._id] ?? (p.moq || 1)}
                          onChange={(e) => handleQtyChange(p._id, e.target.value)}
                          className="w-28 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-heading font-semibold text-secondary">Buyer Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="buyerEmail"
                        value={formData.buyerEmail}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="buyerPhone"
                        value={formData.buyerPhone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="buyerCity"
                        value={formData.buyerCity}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your city"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Company Name</label>
                    <div className="relative">
                      <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Company"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">GST Number</label>
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

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Requirements / Notes</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us size range, colors, delivery location, packaging needs, etc."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Send RFQ'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BulkInquiryModal;
