import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Table from '../components/Table';
import Loader from '../components/Loader';
import { ShoppingBag, Users, Star, MessageCircle, TrendingUp, DollarSign, Package, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const B2CDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // TODO: Add B2C-specific stats from Redux store
  const loading = false;

  // B2C-specific statistics (to be fetched from API)
  const b2cStats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    totalReviews: 0,
    totalQuestions: 0,
    activeCoupons: 0,
    wishlistItems: 0,
  };

  // Recent B2C orders (to be fetched)
  const recentB2COrders = [];

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">B2C Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your B2C (Business-to-Consumer) operations</p>
      </div>

      {/* B2C Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="B2C Revenue"
          value={`₹${b2cStats?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          icon={DollarSign}
          color="green"
          trend={12}
        />
        <Card
          title="B2C Orders"
          value={b2cStats?.totalOrders || 0}
          icon={ShoppingBag}
          color="blue"
          trend={8}
        />
        <Card
          title="Total Customers"
          value={b2cStats?.totalCustomers || 0}
          icon={Users}
          color="orange"
          trend={15}
        />
        <Card
          title="Avg Order Value"
          value={`₹${b2cStats?.averageOrderValue?.toLocaleString('en-IN') || 0}`}
          icon={TrendingUp}
          color="lavender"
          trend={5}
        />
      </div>

      {/* B2C Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/b2c/reviews')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer Reviews</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {b2cStats?.totalReviews || 0}
              </p>
            </div>
            <Star className="text-blue-600 dark:text-blue-400" size={28} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/b2c/questions')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer Q&A</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {b2cStats?.totalQuestions || 0}
              </p>
            </div>
            <MessageCircle className="text-purple-600 dark:text-purple-400" size={28} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/b2c/coupons')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {b2cStats?.activeCoupons || 0}
              </p>
            </div>
            <Package className="text-green-600 dark:text-green-400" size={28} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-pink-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/b2c/wishlists')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wishlist Items</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {b2cStats?.wishlistItems || 0}
              </p>
            </div>
            <Heart className="text-pink-600 dark:text-pink-400" size={28} />
          </div>
        </motion.div>
      </div>

      {/* Recent B2C Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent B2C Orders</h2>
          <button
            onClick={() => navigate('/b2c/orders')}
            className="text-sm text-primary dark:text-primary-300 hover:underline"
          >
            View All
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {recentB2COrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No recent B2C orders
            </div>
          ) : (
            <Table
              columns={[
                { header: 'Order ID', accessor: '_id', render: (row) => `#${row._id?.slice(-6).toUpperCase()}` },
                { header: 'Customer', accessor: 'user', render: (row) => row.user?.name || 'Guest' },
                { header: 'Total', accessor: 'totalAmount', render: (row) => `₹${row.totalAmount?.toFixed(2)}` },
                { header: 'Status', accessor: 'status', render: (row) => (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    row.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    row.status === 'Shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {row.status}
                  </span>
                )},
                { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
              ]}
              data={recentB2COrders}
              emptyMessage="No recent B2C orders"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default B2CDashboard;

