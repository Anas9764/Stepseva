import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiCreditCard, FiShield, FiArrowLeft, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { paymentService } from '../services/paymentService';
import { clearCartAsync } from '../store/slices/cartSlice';
import PaymentProcessing from '../components/PaymentProcessing';
import api from '../services/api';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !stripePublishableKey;

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [orderData, setOrderData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/payment', requireAuth: true } });
      return;
    }

    // Get order data from location state
    const data = location.state?.orderData;
    if (!data) {
      // If no order data, redirect back to checkout
      navigate('/checkout');
      return;
    }

    setOrderData(data);
  }, [isAuthenticated, location.state, navigate]);

  const handlePaymentSuccess = async (result) => {
    setProcessingPayment(false);
    
    // Only clear cart if this was a regular checkout, not a direct purchase
    if (!orderData.isDirectPurchase) {
      dispatch(clearCartAsync());
    }
    
    navigate('/success', {
      state: {
        orderId: result.orderId || result.data?._id,
        isDemo: true,
        paymentMethod: orderData.paymentMethod,
      },
    });
  };

  const handleCODOrder = async () => {
    setProcessingPayment(true);
    setError(null);
    
    try {
      // Create COD order directly
      const response = await api.post('/orders', {
        userId: orderData.userId || null,
        products: orderData.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.size || '',
        })),
        shippingAddress: orderData.shippingAddress,
        email: orderData.email,
        phone: orderData.phone,
        totalAmount: orderData.totalAmount,
        paymentType: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });
      
      if (response.data && response.data.data) {
        handlePaymentSuccess({
          orderId: response.data.data._id,
          data: response.data.data,
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      handlePaymentError(err);
    }
  };

  const handlePaymentError = (err) => {
    setProcessingPayment(false);
    setError(err.response?.data?.message || err.message || 'Payment processing failed');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  const subtotal = orderData.totalAmount / 1.1;
  const tax = orderData.totalAmount - subtotal;

  return (
    <>
      {processingPayment && <PaymentProcessing />}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back to Checkout</span>
          </button>

          <h1 className="text-4xl font-heading font-bold text-secondary mb-8">
            {orderData.paymentMethod === 'cod' ? 'Confirm Order' : 'Payment'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
                  {orderData.paymentMethod === 'cod' ? 'Order Confirmation' : 'Payment Details'}
                </h2>

                {/* Security Badges */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiLock className="text-primary" size={18} />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiShield className="text-primary" size={18} />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiCreditCard className="text-primary" size={18} />
                      <span>Powered by Stripe</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 whitespace-pre-wrap">
                    {error}
                  </div>
                )}

                {/* COD Payment Flow */}
                {orderData.paymentMethod === 'cod' ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <FiDollarSign className="text-green-600" size={24} />
                        <h3 className="text-lg font-heading font-semibold text-green-800">
                          Cash on Delivery
                        </h3>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">
                        You will pay <strong>₹{orderData.totalAmount.toLocaleString('en-IN')}</strong> when you receive your order.
                      </p>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>What happens next?</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                          <li>Your order will be confirmed immediately</li>
                          <li>We'll process and ship your order</li>
                          <li>Pay cash when the delivery person arrives</li>
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={handleCODOrder}
                      disabled={processingPayment}
                      className="w-full bg-green-600 text-white py-4 rounded-full font-semibold hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={20} />
                          <span>Confirm COD Order</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : !isDemoMode && stripePublishableKey ? (
                  <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <FiCreditCard className="text-primary" size={24} />
                        <h3 className="text-lg font-heading font-semibold text-secondary">
                          Secure Payment Gateway
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        You will be redirected to Stripe's secure payment page to complete your purchase. 
                        Stripe supports all major credit cards, debit cards, and digital wallets.
                      </p>
                      {orderData.shippingAddress?.country?.toLowerCase() === 'india' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-blue-800">
                            <strong>UPI Available:</strong> Google Pay, PhonePe, Paytm, and other UPI apps are supported for Indian customers.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={async () => {
                        setProcessingPayment(true);
                        setError(null);
                        try {
                          const result = await paymentService.redirectToCheckout(orderData);
                          // If we reach here, it's demo mode (Stripe redirects automatically)
                          if (result && result.success) {
                            handlePaymentSuccess(result);
                          }
                        } catch (err) {
                          console.error('Payment error:', err);
                          const errorMessage = err.response?.data?.message || err.message || 'Payment processing failed';
                          const errorDetails = err.response?.data?.details;
                          setError(
                            errorMessage + 
                            (errorDetails ? `\n\nDetails: ${typeof errorDetails === 'object' ? JSON.stringify(errorDetails, null, 2) : errorDetails}` : '')
                          );
                          setProcessingPayment(false);
                        }
                      }}
                      disabled={processingPayment}
                      className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Redirecting to Payment...</span>
                        </>
                      ) : (
                        <>
                          <FiLock size={20} />
                          <span>Pay ₹{orderData.totalAmount.toLocaleString('en-IN')}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <FiCheckCircle className="text-primary" size={32} />
                      </div>
                      <p className="text-gray-700 mb-2 font-semibold">
                        Demo Mode
                      </p>
                      <p className="text-sm text-gray-600 mb-6">
                        Stripe is not configured. This is a demo payment that will create an order without processing actual payment.
                      </p>
                      <button
                        onClick={async () => {
                          setProcessingPayment(true);
                          setError(null);
                          try {
                            const result = await paymentService.demoCheckout(orderData);
                            if (result && result.success) {
                              handlePaymentSuccess(result);
                            }
                          } catch (err) {
                            handlePaymentError(err);
                          }
                        }}
                        disabled={processingPayment}
                        className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FiCheckCircle size={20} />
                            <span>Complete Demo Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Address Review */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
                  Shipping Address
                </h2>
                <div className="text-gray-700 space-y-1">
                  <p>
                    <strong>{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</strong>
                  </p>
                  <p>{orderData.shippingAddress.address}</p>
                  <p>
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{' '}
                    {orderData.shippingAddress.zipCode}
                  </p>
                  <p>{orderData.shippingAddress.country}</p>
                  <p className="mt-2">
                    <strong>Email:</strong> {orderData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {orderData.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity || 1}
                      </span>
                      <span className="font-semibold text-text">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-xl font-bold text-secondary">
                    <span>Total</span>
                    <span className="text-primary">₹{orderData.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;

