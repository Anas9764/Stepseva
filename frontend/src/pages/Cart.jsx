import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useEffect } from 'react';
import { removeFromCartAsync, updateQuantityAsync, fetchCart } from '../store/slices/cartSlice';

const Cart = () => {
  const { items, totalAmount, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart from backend if user is authenticated
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const handleRemoveItem = (id, size) => {
    dispatch(removeFromCartAsync({ productId: id, size: size || '' }));
  };

  const handleUpdateQuantity = (id, size, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantityAsync({ productId: id, size: size || '', quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <FiShoppingCart className="mx-auto text-gray-300 mb-6" size={100} />
        <h2 className="text-3xl font-heading font-bold text-secondary mb-4">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any products yet.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-primary text-white px-8 py-3 rounded-full hover:bg-secondary transition-all font-semibold"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-secondary mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={`${item._id}-${item.size || index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4"
            >
              {/* Product Image */}
              <Link to={`/product/${item._id}`} className="flex-shrink-0">
                <img
                  src={item.image || item.images?.[0] || 'https://via.placeholder.com/150'}
                  alt={item.name}
                  className="w-full sm:w-32 h-32 object-cover rounded-lg"
                />
              </Link>

              {/* Product Details */}
              <div className="flex-1">
                <Link to={`/product/${item._id}`}>
                  <h3 className="text-lg font-heading font-semibold text-text hover:text-primary transition-colors mb-2">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-2">
                  {typeof item.category === 'object' ? item.category?.name : item.category || 'Uncategorized'}
                </p>
                {item.size && (
                  <p className="text-sm text-gray-600 mb-2">
                    Size: <span className="font-semibold">{item.size}</span>
                  </p>
                )}
                <p className="text-xl font-bold text-primary">
                  ₹{item.price?.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.size, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="px-4 font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.size, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(item._id, item.size)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (Estimated)</span>
                <span>₹{(totalAmount * 0.1).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold text-secondary">
                <span>Total</span>
                <span className="text-primary">₹{(totalAmount * 1.1).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:bg-secondary transition-all transform hover:scale-105 mb-4"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/shop"
              className="block text-center text-primary hover:text-secondary transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

