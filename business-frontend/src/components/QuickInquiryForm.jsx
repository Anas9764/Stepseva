import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { leadService } from '../services/leadService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const QuickInquiryForm = ({ isOpen, onClose, product, onSuccess }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data: settings } = useSelector((state) => state.settings);
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1); // 1: Mobile, 2: Additional Info (if needed)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requireLoginForInquiry = Boolean(settings?.b2b?.requireLoginForInquiry);
    if (requireLoginForInquiry && !isAuthenticated) {
      toast.error('Please login to send an inquiry');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    if (!product || !product._id) {
      toast.error('Product information is missing');
      return;
    }

    setLoading(true);

    try {
      const leadData = {
        buyerName: user?.name || '',
        buyerEmail: user?.email || '',
        buyerPhone: mobileNumber.trim(),
        buyerCity: '',
        buyerState: '',
        buyerCountry: 'India',
        businessType: 'other',
        productId: product._id,
        quantityRequired: product.moq || 1,
        inquiryType: 'get_best_price',
        notes: `Quick inquiry for ${product.name}`,
      };

      await leadService.createLead(leadData);
      
      setSubmitted(true);
      toast.success('Your inquiry has been submitted! We will contact you soon.');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setMobileNumber('');
        setStep(1);
        onClose();
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
        toast.error(error.response?.data?.message || 'Please check your form data and try again.');
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold">Quick Inquiry</h2>
              <p className="text-sm text-white/90 mt-1">Share your mobile number to connect with seller</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
                <span className="text-gray-600">Select Product</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className="text-gray-600">Log In</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                  step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>3</div>
                <span className="text-gray-600">User Info</span>
              </div>
            </div>
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
                We will contact you on {mobileNumber} shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              {/* Product Preview */}
              {product && (
                <div className="mb-6 flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-text text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {product.moq ? `MOQ: ${product.moq} units` : 'Inquiry'}
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-text mb-2">
                  Enter your mobile
                </label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg focus-within:border-primary transition-colors">
                  <span className="px-4 py-3 text-gray-600 font-medium border-r border-gray-300">+91</span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter your Mobile"
                    required
                    className="flex-1 px-4 py-3 focus:outline-none text-lg"
                    maxLength="10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supplier will contact you on this number
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || mobileNumber.length < 10}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Continue >'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Almost done! Just verify your mobile
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickInquiryForm;

