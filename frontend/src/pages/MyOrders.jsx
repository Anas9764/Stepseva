import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiEye, FiArrowRight } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import Loader from '../components/Loader';

const MyOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-orders' } });
      return;
    }

    if (user && user._id) {
      fetchOrders();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchOrders = async () => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.getUserOrders(user._id);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-600" size={20} />;
      case 'shipped':
        return <FiTruck className="text-blue-600" size={20} />;
      case 'processing':
      case 'confirmed':
        return <FiClock className="text-yellow-600" size={20} />;
      case 'cancelled':
        return <FiXCircle className="text-red-600" size={20} />;
      default:
        return <FiPackage className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentTypeBadge = (paymentType) => {
    return paymentType === 'cod' ? (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
        COD
      </span>
    ) : (
      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
        Online
      </span>
    );
  };

  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(order => order.orderStatus === statusFilter);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            View and track all your orders
          </p>
        </motion.div>

        {/* Status Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {status}
            </button>
          ))}
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <FiPackage className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'All' 
                ? "You haven't placed any orders yet." 
                : `No orders with status "${statusFilter}"`}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              <span>Start Shopping</span>
              <FiArrowRight />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-secondary">
                          Order #{order.orderId || order._id?.slice(-8).toUpperCase()}
                        </h3>
                        {getPaymentTypeBadge(order.paymentType)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="font-semibold capitalize">{order.orderStatus}</span>
                      </div>
                      <Link
                        to={`/order/${order._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                      >
                        <FiEye size={18} />
                        <span className="hidden sm:inline">View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-4">
                    {order.products?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.productId?.images?.[0] || item.image ? (
                            <img
                              src={item.productId?.images?.[0] || item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="text-gray-400" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                            {item.size && ` • Size: ${item.size}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-secondary">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.products?.length > 3 && (
                      <p className="text-sm text-gray-600 text-center pt-2">
                        +{order.products.length - 3} more item(s)
                      </p>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'paid' || order.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus === 'paid' || order.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

