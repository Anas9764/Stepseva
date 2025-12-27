import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { DollarSign, ShoppingBag, Users, TrendingUp, Star, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SafeECharts from '../components/SafeECharts';
import { useDarkMode } from '../hooks/useDarkMode';

const B2CAnalytics = () => {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);

  // TODO: Fetch B2C analytics data from API
  const analytics = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    customerRetentionRate: 0,
  };

  // Sales data for chart
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [150, 230, 224, 218, 135, 147],
  };

  // Chart options
  const chartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: '#10B981',
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
      data: salesData?.labels || [],
      axisLine: {
        lineStyle: {
          color: darkMode ? '#9ca3af' : '#10B981',
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
          color: darkMode ? '#9ca3af' : '#10B981',
        },
      },
      axisLabel: {
        color: darkMode ? '#9ca3af' : '#666',
      },
    },
    series: [
      {
        name: 'B2C Sales',
        type: 'line',
        smooth: true,
        data: salesData?.values || [],
        itemStyle: {
          color: '#10B981',
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
                color: 'rgba(16, 185, 129, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(16, 185, 129, 0.05)',
              },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">B2C Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Analyze your B2C sales and customer behavior</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Total B2C Revenue"
          value={`₹${analytics?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          icon={DollarSign}
          color="green"
        />
        <Card
          title="Total B2C Orders"
          value={analytics?.totalOrders || 0}
          icon={ShoppingBag}
          color="blue"
        />
        <Card
          title="Total Customers"
          value={analytics?.totalCustomers || 0}
          icon={Users}
          color="orange"
        />
        <Card
          title="Average Order Value"
          value={`₹${analytics?.averageOrderValue?.toLocaleString('en-IN') || 0}`}
          icon={TrendingUp}
          color="lavender"
        />
        <Card
          title="Conversion Rate"
          value={`${analytics?.conversionRate || 0}%`}
          icon={TrendingUp}
          color="pink"
        />
        <Card
          title="Customer Retention"
          value={`${analytics?.customerRetentionRate || 0}%`}
          icon={Users}
          color="green"
        />
      </div>

      {/* Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">B2C Sales Overview</h2>
        <SafeECharts option={chartOption} style={{ height: '350px' }} />
      </motion.div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Products</h3>
          <p className="text-gray-500 dark:text-gray-400">Product performance data will be displayed here</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Customer Demographics</h3>
          <p className="text-gray-500 dark:text-gray-400">Customer demographic data will be displayed here</p>
        </motion.div>
      </div>
    </div>
  );
};

export default B2CAnalytics;

