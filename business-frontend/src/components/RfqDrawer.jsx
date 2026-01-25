import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiX, FiTrash2, FiArrowRight, FiUser, FiMail, FiPhone, FiMapPin, FiCheck } from 'react-icons/fi';
import { removeFromRfq, clearRfq } from '../store/slices/rfqSlice';
import LazyImage from './LazyImage';
import { leadService } from '../services/leadService';
import toast from 'react-hot-toast';

const RfqDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.rfq.items);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerCity: '',
    companyName: '',
    notes: '',
  });

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        buyerName: user.name || '',
        buyerEmail: user.email || '',
        buyerPhone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Reset form state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleRemove = (id) => {
    dispatch(removeFromRfq(id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToForm = () => {
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validate form
    if (!formData.buyerName || !formData.buyerEmail || !formData.buyerPhone || !formData.buyerCity) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const bulkLeadData = {
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        buyerCity: formData.buyerCity,
        companyName: formData.companyName,
        notes: formData.notes,
        products: items.map(item => ({
          productId: item._id,
          quantity: item.quantity || item.moq || 1,
        })),
      };

      const response = await leadService.createBulkLead(bulkLeadData);

      if (response.success) {
        setSubmitted(true);
        toast.success(response.message || 'RFQ submitted successfully!');

        // Clear and close after 2 seconds
        setTimeout(() => {
          dispatch(clearRfq());
          onClose();
          setShowForm(false);
          setSubmitted(false);
        }, 2500);
      } else {
        toast.error(response.message || 'Failed to submit RFQ');
      }
    } catch (error) {
      console.error('RFQ submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit RFQ. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (showForm) {
            setShowForm(false);
          } else {
            onClose();
          }
        }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-secondary to-primary text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <FiShoppingBag size={20} />
            <h2 className="text-xl font-heading font-bold">
              {showForm ? 'Contact Details' : 'Your RFQ List'}
            </h2>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {items.length} Items
            </span>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
              } else {
                onClose();
              }
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
            >
              <FiCheck size={40} className="text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-secondary mb-2">RFQ Submitted!</h3>
            <p className="text-gray-600">We will contact you soon with the best prices.</p>
          </div>
        ) : showForm ? (
          /* Form View */
          <form onSubmit={handleSubmitInquiry} className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="buyerEmail"
                  value={formData.buyerEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="buyerCity"
                  value={formData.buyerCity}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any specific requirements..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Products Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2">Products in RFQ:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {items.map(item => (
                  <li key={item._id} className="flex justify-between">
                    <span className="truncate mr-2">{item.name}</span>
                    <span className="text-gray-500 whitespace-nowrap">Qty: {item.quantity || item.moq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </form>
        ) : (
          /* List View */
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FiShoppingBag size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">Your RFQ list is empty</h3>
                <p className="text-gray-500 mb-6">Add products from the Shop or Product pages to request bulk pricing quotes</p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <motion.div
                  layout
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <LazyImage
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-secondary text-sm line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">MOQ: {item.moq} units</p>
                    </div>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="self-start text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-2"
                    >
                      <FiTrash2 size={12} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        {!submitted && items.length > 0 && (
          <div className="p-5 bg-white border-t border-gray-100 pb-8 sm:pb-5">
            {showForm ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitInquiry}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit RFQ'}
                  <FiArrowRight />
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-center text-gray-500 mb-4">
                  Review your items before requesting a quote.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => dispatch(clearRfq())}
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleProceedToForm}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Request Quote
                    <FiArrowRight />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default RfqDrawer;
