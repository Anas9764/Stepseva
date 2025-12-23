import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiMessageCircle,
  FiCreditCard,
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
} from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import { fetchOrderAnalytics, fetchLeadAnalytics, fetchCreditAnalytics, setDateRange } from '../store/slices/analyticsSlice';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Analytics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderAnalytics, leadAnalytics, creditAnalytics, loading, dateRange } = useSelector((state) => state.analytics);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const [selectedPeriod, setSelectedPeriod] = useState('30days'); // 7days, 30days, 90days, 365days, custom

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/analytics' } });
      return;
    }

    if (!account || account.status !== 'active') {
      navigate('/dashboard');
      return;
    }

    // Fetch analytics data
    const params = { period: selectedPeriod };
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;

    dispatch(fetchOrderAnalytics(params));
    dispatch(fetchLeadAnalytics(params));
    dispatch(fetchCreditAnalytics(params));
  }, [isAuthenticated, account, dispatch, navigate, selectedPeriod, dateRange]);

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  // Order Analytics Chart
  const orderChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#B37BA4',
      borderWidth: 1,
      textStyle: {
        color: '#333',
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
      data: orderAnalytics?.salesByDate?.labels || orderAnalytics?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      axisLine: {
        lineStyle: {
          color: '#B37BA4',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#B37BA4',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: (value) => `₹${(value / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        smooth: true,
        data: orderAnalytics?.salesByDate?.values || orderAnalytics?.values || [150, 230, 224, 218, 135, 147],
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
  }), [orderAnalytics]);

  // Lead Analytics Chart
  const leadChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#10B981',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#666',
      },
    },
    series: [
      {
        name: 'Lead Status',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: leadAnalytics?.statusDistribution || [
          { value: 10, name: 'New' },
          { value: 5, name: 'Contacted' },
          { value: 3, name: 'Quoted' },
          { value: 2, name: 'Closed' },
        ],
      },
    ],
  }), [leadAnalytics]);

  // Credit Usage Chart
  const creditChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#3B82F6',
      borderWidth: 1,
      textStyle: {
        color: '#333',
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
      data: creditAnalytics?.usageByDate?.labels || creditAnalytics?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      axisLine: {
        lineStyle: {
          color: '#3B82F6',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#3B82F6',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: (value) => `₹${(value / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        name: 'Credit Used',
        type: 'bar',
        data: creditAnalytics?.usageByDate?.values || creditAnalytics?.values || [50, 80, 60, 90, 70, 100],
        itemStyle: {
          color: '#3B82F6',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }), [creditAnalytics]);

  const handleExportReport = async (type) => {
    try {
      const { analyticsService } = await import('../services/analyticsService');
      const params = { period: selectedPeriod };
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const blob = await analyticsService.generateReport(type, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${type}-${new Date().toISOString().split('T')[0]}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Report exported successfully as ${type.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  if (loading && !orderAnalytics && !leadAnalytics && !creditAnalytics) {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-heading font-bold text-secondary mb-2">Analytics & Reports</h1>
              <p className="text-gray-600">Track your business performance and insights</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="365days">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <button
                onClick={() => handleExportReport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                <FiDownload size={18} />
                Export PDF
              </button>
              <button
                onClick={() => handleExportReport('excel')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                <FiDownload size={18} />
                Export Excel
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary"
          >
            <div className="flex items-center justify-between mb-4">
              <FiDollarSign className="text-primary" size={24} />
              <FiTrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-secondary">
              {formatCurrency(orderAnalytics?.totalRevenue || 0)}
            </p>
            {orderAnalytics?.revenueGrowth && (
              <p className="text-xs text-green-600 mt-1">
                {orderAnalytics.revenueGrowth > 0 ? '+' : ''}{orderAnalytics.revenueGrowth}% from last period
              </p>
            )}
          </motion.div>

          {/* Total Orders */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-secondary"
          >
            <div className="flex items-center justify-between mb-4">
              <FiShoppingBag className="text-secondary" size={24} />
              <FiTrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-secondary">
              {orderAnalytics?.totalOrders || 0}
            </p>
            {orderAnalytics?.averageOrderValue && (
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatCurrency(orderAnalytics.averageOrderValue)}
              </p>
            )}
          </motion.div>

          {/* Total Inquiries */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between mb-4">
              <FiMessageCircle className="text-green-500" size={24} />
              <FiTrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Inquiries</h3>
            <p className="text-2xl font-bold text-secondary">
              {leadAnalytics?.totalInquiries || 0}
            </p>
            {leadAnalytics?.conversionRate && (
              <p className="text-xs text-gray-500 mt-1">
                Conversion: {leadAnalytics.conversionRate}%
              </p>
            )}
          </motion.div>

          {/* Credit Usage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <FiCreditCard className="text-blue-500" size={24} />
              <FiBarChart2 className="text-blue-500" size={20} />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Credit Used</h3>
            <p className="text-2xl font-bold text-secondary">
              {formatCurrency(creditAnalytics?.totalCreditUsed || account?.creditUsed || 0)}
            </p>
            {account && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatCurrency(account.creditLimit - account.creditUsed)}
              </p>
            )}
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary flex items-center gap-2">
                <FiBarChart2 className="text-primary" size={24} />
                Order Revenue Trend
              </h2>
            </div>
            <ReactECharts option={orderChartOption} style={{ height: '300px' }} />
          </motion.div>

          {/* Lead Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary flex items-center gap-2">
                <FiPieChart className="text-green-500" size={24} />
                Inquiry Status Distribution
              </h2>
            </div>
            <ReactECharts option={leadChartOption} style={{ height: '300px' }} />
          </motion.div>
        </div>

        {/* Credit Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary flex items-center gap-2">
              <FiCreditCard className="text-blue-500" size={24} />
              Credit Usage Trend
            </h2>
          </div>
          <ReactECharts option={creditChartOption} style={{ height: '300px' }} />
        </motion.div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Products */}
          {orderAnalytics?.topProducts && orderAnalytics.topProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-secondary mb-4">Top Products</h3>
              <div className="space-y-3">
                {orderAnalytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product._id || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.quantity} units</p>
                      </div>
                    </div>
                    <p className="font-semibold text-primary">{formatCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Inquiry Conversion */}
          {leadAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-secondary mb-4">Inquiry Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">New Inquiries</p>
                  <p className="text-2xl font-bold text-secondary">{leadAnalytics.newInquiries || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quoted</p>
                  <p className="text-2xl font-bold text-green-600">{leadAnalytics.quoted || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    {leadAnalytics.conversionRate || 0}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Credit Summary */}
          {account && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-secondary mb-4">Credit Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Credit Limit</p>
                  <p className="text-2xl font-bold text-secondary">
                    {formatCurrency(account.creditLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Credit Used</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(account.creditUsed)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(account.creditLimit - account.creditUsed)}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min((account.creditUsed / account.creditLimit) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round((account.creditUsed / account.creditLimit) * 100)}% used
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

