import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { fetchLeadStats } from '../store/slices/leadsSlice';
import Loader from '../components/Loader';

const B2BLeadAnalytics = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadStats());
  }, [dispatch]);

  const {
    totalLeads = 0,
    statusCounts = {},
    priorityCounts = {},
    newLeadsLast7Days = 0,
    topProducts = [],
  } = stats || {};

  const closed = statusCounts.closed || 0;
  const contacted = statusCounts.contacted || 0;
  const conversionRate =
    totalLeads > 0 && closed > 0
      ? Math.round((closed / totalLeads) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Analyze how your B2B leads are moving through the funnel.
          </p>
        </div>
      </div>

      {loading && <Loader />}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalLeads}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                New in last 7 days: {newLeadsLast7Days}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="text-indigo-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contacted Leads</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {contacted}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Leads that have been contacted at least once.
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <PieChart className="text-amber-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {conversionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on closed deals vs total leads.
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status & priority breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Lead Status Breakdown
          </h2>
          <div className="space-y-3">
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-sm text-gray-500">
                No lead status data available yet.
              </p>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize text-gray-700">
                    {status.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Priority Breakdown
          </h2>
          <div className="space-y-3">
            {Object.keys(priorityCounts).length === 0 ? (
              <p className="text-sm text-gray-500">
                No priority data available yet.
              </p>
            ) : (
              Object.entries(priorityCounts).map(([priority, count]) => (
                <div
                  key={priority}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize text-gray-700">
                    {priority.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Top products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Top Products by Inquiry Volume
          </h2>
        </div>
        {(!topProducts || topProducts.length === 0) ? (
          <p className="text-sm text-gray-500">
            Once inquiries start coming in, you&apos;ll see which products
            attract the most interest here.
          </p>
        ) : (
          <div className="space-y-3">
            {topProducts.slice(0, 10).map((product, index) => (
              <div
                key={`${product.productName}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{product.productName}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {product.leadCount} lead
                  {product.leadCount === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default B2BLeadAnalytics;


