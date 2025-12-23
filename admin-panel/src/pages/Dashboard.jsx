import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStats, fetchSalesData, fetchRecentOrders, fetchRecentLeads, fetchUpcomingFollowups, fetchRecentActivities } from '../store/slices/dashboardSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Loader from '../components/Loader';
import ReactECharts from 'echarts-for-react';
import { DollarSign, Users, Package, ShoppingBag, Briefcase, Phone, Calendar, TrendingUp, UserCheck, AlertCircle, History } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadStatusBadge from '../components/Leads/LeadStatusBadge';
import { useDarkMode } from '../hooks/useDarkMode';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, salesData, recentOrders, recentLeads, upcomingFollowups, recentActivities, loading } = useSelector((state) => state.dashboard);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchSalesData());
    dispatch(fetchRecentOrders(5));
    dispatch(fetchRecentLeads(5));
    dispatch(fetchUpcomingFollowups(5));
    dispatch(fetchRecentActivities(10));
  }, [dispatch]);

  // Chart options - memoized to update when dark mode changes
  const chartOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: '#B37BA4',
      borderWidth: 1,
      textStyle: {
        color: darkMode ? '#f3f4f6' : '#333',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: salesData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      axisLine: {
        lineStyle: {
          color: darkMode ? '#9ca3af' : '#B37BA4',
        },
      },
      axisLabel: {
        color: darkMode ? '#9ca3af' : '#666',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: darkMode ? '#9ca3af' : '#B37BA4',
        },
      },
      axisLabel: {
        color: darkMode ? '#9ca3af' : '#666',
      },
    },
    series: [
      {
        name: 'Sales',
        type: 'line',
        smooth: true,
        data: salesData?.values || [150, 230, 224, 218, 135, 147],
        itemStyle: {
          color: '#B37BA4',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(179, 123, 164, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(179, 123, 164, 0.05)',
              },
            ],
          },
        },
      },
    ],
  }), [darkMode, salesData]);

  const orderColumns = [
    {
      header: 'Order ID',
      accessor: '_id',
      render: (row) => `#${row._id?.slice(-6).toUpperCase()}`,
    },
    {
      header: 'Customer',
      accessor: 'user',
      render: (row) => row.user?.name || 'Guest',
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (row) => `$${row.totalAmount?.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === 'Completed'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : row.status === 'Shipped'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          icon={DollarSign}
          color="lavender"
          trend={12}
        />
        <Card
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          color="blue"
          trend={8}
        />
        <Card
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="green"
          trend={5}
        />
        <Card
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="orange"
          trend={15}
        />
      </div>

      {/* B2B Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/b2b')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">B2B Revenue</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                ₹{stats?.b2bRevenue?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <Briefcase className="text-blue-600 dark:text-blue-400" size={28} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/leads')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Leads</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.totalLeads || 0}
              </p>
              {stats?.newLeads > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {stats.newLeads} new
                </p>
              )}
            </div>
            <Phone className="text-purple-600 dark:text-purple-400" size={28} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/business-accounts')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Business Accounts</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.totalBusinessAccounts || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats?.activeBusinessAccounts || 0} active
              </p>
            </div>
            <UserCheck className="text-green-600 dark:text-green-400" size={28} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/business-accounts')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.pendingBusinessAccounts || 0}
              </p>
            </div>
            <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={28} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/b2b/calendar')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming Follow-ups</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {upcomingFollowups?.length || 0}
              </p>
            </div>
            <Calendar className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
        </motion.div>
      </div>

      {/* Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sales Overview</h2>
        <ReactECharts option={chartOption} style={{ height: '350px' }} />
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-primary dark:text-primary-300 hover:underline"
            >
              View All
            </button>
        </div>
        <Table
          columns={orderColumns}
          data={recentOrders}
          emptyMessage="No recent orders"
        />
      </motion.div>

        {/* Recent B2B Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent B2B Leads</h2>
            <button
              onClick={() => navigate('/leads')}
              className="text-sm text-primary dark:text-primary-300 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No recent leads
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentLeads.map((lead, index) => (
                  <div
                    key={lead._id || index}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => navigate('/leads')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{lead.buyerName}</p>
                          <LeadStatusBadge status={lead.status} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{lead.productName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Qty: {lead.quantityRequired} • {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Follow-ups */}
      {upcomingFollowups && upcomingFollowups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Follow-ups</h2>
            <button
              onClick={() => navigate('/b2b/calendar')}
              className="text-sm text-primary dark:text-primary-300 hover:underline"
            >
              View Calendar
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingFollowups.map((lead, index) => (
                <div
                  key={lead._id || index}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => navigate('/leads')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="text-indigo-600 dark:text-indigo-400" size={16} />
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(lead.followUpDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{lead.buyerName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lead.productName}</p>
                      {lead.followUpNotes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lead.followUpNotes}</p>
                      )}
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity Logs */}
      {recentActivities && recentActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <button
              onClick={() => navigate('/activity-logs')}
              className="text-sm text-primary hover:underline"
            >
              View All Logs
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity._id || index}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/activity-logs')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <History className="text-primary" size={16} />
                        <p className="font-semibold text-gray-900">{activity.userName}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          activity.action === 'create' ? 'bg-green-100 text-green-800' :
                          activity.action === 'update' ? 'bg-blue-100 text-blue-800' :
                          activity.action === 'delete' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.action}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          {activity.entityType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

