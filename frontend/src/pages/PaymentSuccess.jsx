import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { clearCartAsync } from '../store/slices/cartSlice';
import api from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(location.state?.orderDetails || null);
  const [loading, setLoading] = useState(!!sessionId && !location.state?.isDemo);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifyPayment = async () => {
      // If demo mode, use order from state
      if (location.state?.isDemo && location.state?.orderId) {
        try {
          const response = await api.get(`/orders/order/${location.state.orderId}`);
          if (response.data.success) {
            setOrderDetails(response.data.data || response.data);
            dispatch(clearCartAsync());
          }
        } catch (err) {
          console.error('Error fetching demo order:', err);
        }
        setLoading(false);
        return;
      }

      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // Verify payment with backend
        const response = await api.get(`/orders/session/${sessionId}`);
        
        if (response.data.success) {
          setOrderDetails(response.data.order);
          
          // Clear cart after successful payment
          dispatch(clearCartAsync());
        } else {
          setError('Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Unable to verify payment. Please contact support if you were charged.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, dispatch, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-secondary mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-accent text-white py-3 rounded-full font-semibold hover:bg-primary hover:text-secondary transition-all"
              >
                Go to Home
              </Link>
              <Link
                to="/contact"
                className="block w-full border-2 border-accent text-accent py-3 rounded-full font-semibold hover:bg-accent hover:text-white transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FiCheckCircle size={48} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-heading font-bold mb-2">
              {orderDetails?.paymentType === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!'}
            </h1>
            <p className="text-green-50">
              {orderDetails?.paymentType === 'cod' 
                ? 'Your COD order has been confirmed' 
                : 'Thank you for your purchase'}
            </p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            {orderDetails && (
              <>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FiPackage className="text-accent" size={24} />
                    <h2 className="text-xl font-heading font-semibold text-secondary">
                      Order Details
                    </h2>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 space-y-3 border border-gray-200">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Order ID:</span>
                      <span className="font-bold text-primary text-lg">
                        #{orderDetails.orderId || orderDetails._id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Total Amount:</span>
                      <span className="font-bold text-accent text-xl">
                        ₹{orderDetails.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Payment Method:</span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        orderDetails.paymentType === 'cod'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {orderDetails.paymentType === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Payment Status:</span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        orderDetails.paymentStatus === 'paid' || orderDetails.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {orderDetails.paymentStatus === 'paid' || orderDetails.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Order Status:</span>
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize border border-blue-200">
                        {orderDetails.orderStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Products Ordered */}
                {orderDetails.products && orderDetails.products.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-heading font-semibold text-secondary mb-4">
                      Items Ordered
                    </h3>
                    <div className="space-y-3">
                      {orderDetails.products.map((item, index) => {
                        // Get image from various possible locations
                        const productImage = 
                          item.productId?.images?.[0] || 
                          item.productId?.image || 
                          item.image || 
                          null;
                        
                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="w-full h-full flex items-center justify-center bg-gray-200"
                                style={{ display: productImage ? 'none' : 'flex' }}
                              >
                                <FiPackage className="text-gray-400" size={32} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-secondary mb-1">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} × ₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {item.size && ` • Size: ${item.size}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent text-lg">
                                ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {orderDetails.shippingAddress && (
                  <div className="mb-6">
                    <h3 className="text-lg font-heading font-semibold text-secondary mb-4">
                      Shipping Address
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {orderDetails.shippingAddress.firstName}{' '}
                        {orderDetails.shippingAddress.lastName}
                      </p>
                      <p className="text-gray-700">{orderDetails.shippingAddress.address}</p>
                      <p className="text-gray-700">
                        {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}{' '}
                        {orderDetails.shippingAddress.zipCode}
                      </p>
                      <p className="text-gray-700">{orderDetails.shippingAddress.country}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Confirmation Message */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-primary" size={24} />
                </div>
              </div>
              <p className="text-gray-800 text-center font-bold text-lg mb-2">
                What's next?
              </p>
              <p className="text-gray-700 text-center text-sm leading-relaxed">
                {orderDetails?.paymentType === 'cod' ? (
                  <>
                    Your order has been confirmed! You'll receive an email confirmation at{' '}
                    <strong className="text-primary">{orderDetails?.email || 'your email'}</strong>. 
                    <br className="hidden sm:block" />
                    Please keep <strong className="text-primary">₹{orderDetails?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ready for cash payment when the delivery person arrives.
                  </>
                ) : (
                  <>
                    You'll receive an email confirmation at{' '}
                    <strong className="text-primary">{orderDetails?.email || 'your email'}</strong> with your order details and
                    tracking information once your order ships.
                  </>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/shop"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white py-3 px-6 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                <FiShoppingCart size={20} />
                <span>Continue Shopping</span>
              </Link>
              <Link
                to={isAuthenticated ? "/my-orders" : "/login"}
                className="flex items-center justify-center space-x-2 border-2 border-primary text-primary bg-white py-3 px-6 rounded-full font-semibold hover:bg-primary hover:text-white transition-all transform hover:scale-105"
              >
                <FiShoppingBag size={20} />
                <span>View Orders</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

