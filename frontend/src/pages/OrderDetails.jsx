import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle, 
  FiArrowLeft, FiMapPin, FiMail, FiPhone, FiDollarSign, FiCreditCard,
  FiCalendar, FiShoppingBag
} from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/Loader';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/order/${id}` } });
      return;
    }

    fetchOrderDetails();
  }, [id, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/order/${id}`);
      if (response.data.success) {
        const orderData = response.data.data;
        // Verify this order belongs to the current user
        if (orderData.userId?._id !== user._id && orderData.userId?._id?.toString() !== user._id?.toString()) {
          navigate('/my-orders');
          return;
        }
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-600" size={24} />;
      case 'shipped':
        return <FiTruck className="text-blue-600" size={24} />;
      case 'processing':
      case 'confirmed':
        return <FiClock className="text-yellow-600" size={24} />;
      case 'cancelled':
        return <FiXCircle className="text-red-600" size={24} />;
      default:
        return <FiPackage className="text-gray-600" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimelineStatus = (status) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return statusOrder.indexOf(status);
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h3>
          <Link to="/my-orders" className="text-primary hover:underline">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const timelineSteps = [
    { status: 'pending', label: 'Order Placed', icon: FiPackage },
    { status: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
    { status: 'processing', label: 'Processing', icon: FiClock },
    { status: 'shipped', label: 'Shipped', icon: FiTruck },
    { status: 'delivered', label: 'Delivered', icon: FiCheckCircle },
  ];

  const currentStatusIndex = getTimelineStatus(order.orderStatus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <FiArrowLeft size={20} />
          <span>Back to My Orders</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-secondary mb-2">
                Order #{order.orderId || order._id?.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="font-semibold capitalize">{order.orderStatus}</span>
                </div>
                {order.paymentType === 'cod' ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    Cash on Delivery
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                    Online Payment
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                <FiClock size={24} />
                Order Timeline
              </h2>
              <div className="space-y-4">
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const timelineEntry = order.orderTimeline?.find(t => t.status === step.status);

                  return (
                    <div key={step.status} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                              Current
                            </span>
                          )}
                        </div>
                        {timelineEntry && (
                          <p className="text-sm text-gray-600 mb-1">{timelineEntry.note}</p>
                        )}
                        {timelineEntry && (
                          <p className="text-xs text-gray-500">
                            {new Date(timelineEntry.timestamp).toLocaleString('en-IN')}
                          </p>
                        )}
                        {!timelineEntry && isCompleted && (
                          <p className="text-xs text-gray-500">Status updated</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                <FiShoppingBag size={24} />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.products?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      {item.productId?.images?.[0] || item.image ? (
                        <img
                          src={item.productId?.images?.[0] || item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="text-gray-400" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span>Size: {item.size}</span>}
                        <span>Price: ₹{item.price?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-secondary">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-secondary mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-secondary">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === 'paid' || order.paymentStatus === 'Paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' || order.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {order.paymentType === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                  <FiMapPin size={24} />
                  Delivery Address
                </h2>
                <div className="text-gray-700 space-y-1">
                  <p className="font-semibold">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.phone && (
                    <p className="pt-2 flex items-center gap-2">
                      <FiPhone size={16} />
                      {order.phone}
                    </p>
                  )}
                  {order.email && (
                    <p className="flex items-center gap-2">
                      <FiMail size={16} />
                      {order.email}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6"
            >
              <h3 className="font-bold text-secondary mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <Link
                to="/contact"
                className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors font-semibold text-sm"
              >
                Contact Support
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

