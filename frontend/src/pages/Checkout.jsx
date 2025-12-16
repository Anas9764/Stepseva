  import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiLock, FiCreditCard, FiShield } from 'react-icons/fi';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().required('ZIP code is required'),
  country: yup.string().required('Country is required'),
});

const Checkout = () => {
  const location = useLocation();
  const { items: cartItems, totalAmount: cartTotalAmount } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'cod' or 'online'
  
  // Check if this is a direct buy now purchase
  const buyNowProduct = location.state?.buyNowProduct;
  const isDirectPurchase = !!buyNowProduct;
  
  // Use buy now product if available, otherwise use cart items
  const items = isDirectPurchase ? [buyNowProduct] : cartItems;
  const totalAmount = isDirectPurchase 
    ? (buyNowProduct.price * buyNowProduct.quantity)
    : cartTotalAmount;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Prepare order data
      const orderData = {
        userId: user?._id || null, // Include user ID if logged in
        items: items.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.size || '',
          description: item.description || '',
          image: item.image || item.images?.[0] || '',
        })),
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        email: data.email,
        phone: data.phone,
        totalAmount: totalAmount * 1.1, // Including tax
        paymentMethod: paymentMethod, // 'cod' or 'online'
        isDirectPurchase: isDirectPurchase,
      };

      // If COD, create order directly, otherwise navigate to payment page
      if (paymentMethod === 'cod') {
        // Navigate to payment page which will handle COD order creation
        navigate('/payment', { 
          state: { 
            orderData: orderData 
          } 
        });
      } else {
        // Navigate to payment page with order data for online payment
        navigate('/payment', { 
          state: { 
            orderData: orderData 
          } 
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`❌ Error: ${error.message || 'An unknown error occurred'}\n\nPlease try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Store buyNowProduct in sessionStorage if it exists
      if (buyNowProduct) {
        sessionStorage.setItem('buyNowProduct', JSON.stringify(buyNowProduct));
      }
      navigate('/login', { state: { from: '/checkout', requireAuth: true } });
      return;
    }
    
    // Check for buyNowProduct in sessionStorage (from login redirect)
    if (!buyNowProduct && !isDirectPurchase) {
      const storedProduct = sessionStorage.getItem('buyNowProduct');
      if (storedProduct) {
        const parsedProduct = JSON.parse(storedProduct);
        // Update location state with stored product
        navigate('/checkout', {
          state: { buyNowProduct: parsedProduct },
          replace: true,
        });
        sessionStorage.removeItem('buyNowProduct');
        return;
      }
    }
    
    // Redirect if no items (and not a direct purchase)
    if (!isDirectPurchase && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, isDirectPurchase, cartItems.length, navigate, buyNowProduct]);

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  if (!isDirectPurchase && cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-secondary mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Billing Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
                Billing Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Street Address *
                  </label>
                  <input
                    {...register('address')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      State *
                    </label>
                    <input
                      {...register('state')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      ZIP Code *
                    </label>
                    <input
                      {...register('zipCode')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Country *
                    </label>
                    <input
                      {...register('country')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
                Payment Method
              </h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'online' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary focus:ring-primary mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">Online Payment</p>
                        <p className="text-sm text-gray-600">Pay securely with credit/debit card, UPI, or digital wallet</p>
                      </div>
                      <FiCreditCard className="text-primary" size={24} />
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'cod' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary focus:ring-primary mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">Cash on Delivery (COD)</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        COD
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Security Badges */}
            {paymentMethod === 'online' && (
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {paymentMethod === 'cod' ? (
                    <>
                      <span>Place COD Order</span>
                    </>
                  ) : (
                    <>
                      <FiCreditCard size={20} />
                      <span>Continue to Payment</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={`${item._id}-${index}`} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} {item.size && `(Size: ${item.size})`} x {item.quantity || 1}
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
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹{(totalAmount * 0.1).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-xl font-bold text-secondary">
                <span>Total</span>
                <span className="text-primary">₹{(totalAmount * 1.1).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

