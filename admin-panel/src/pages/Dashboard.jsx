import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats, fetchSalesData, fetchRecentOrders } from '../store/slices/dashboardSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Loader from '../components/Loader';
import ReactECharts from 'echarts-for-react';
import { DollarSign, Users, Package, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, salesData, recentOrders, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchSalesData());
    dispatch(fetchRecentOrders(5));
  }, [dispatch]);

  // Chart options
  const chartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
      data: salesData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      axisLine: {
        lineStyle: {
          color: '#B37BA4',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#B37BA4',
        },
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
  };

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
              ? 'bg-green-100 text-green-800'
              : row.status === 'Shipped'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
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

      {/* Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Overview</h2>
        <ReactECharts option={chartOption} style={{ height: '350px' }} />
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
        </div>
        <Table
          columns={orderColumns}
          data={recentOrders}
          emptyMessage="No recent orders"
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;

