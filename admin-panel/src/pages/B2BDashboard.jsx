import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Briefcase, PhoneCall, CheckCircle2, Building2, Users, BarChart3 } from 'lucide-react';
import { fetchLeadStats } from '../store/slices/leadsSlice';
import Card from '../components/Card';
import Loader from '../components/Loader';
import api from '../services/api';

const B2BDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.leads);
  const [accountStats, setAccountStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
  });
  const [accountsLoading, setAccountsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchLeadStats());

    const fetchAccounts = async () => {
      try {
        setAccountsLoading(true);
        const response = await api.get('/business-accounts');
        const accounts = response.data?.data || [];
        const total = accounts.length;
        const pending = accounts.filter((a) => a.status === 'pending').length;
        const active = accounts.filter((a) => a.status === 'active').length;
        setAccountStats({ total, pending, active });
      } catch (error) {
        console.error('Error fetching business accounts for B2B dashboard:', error);
      } finally {
        setAccountsLoading(false);
      }
    };

    fetchAccounts();
  }, [dispatch]);

  const {
    totalLeads = 0,
    statusCounts = {},
    priorityCounts = {},
    newLeadsLast7Days = 0,
    topProducts = [],
  } = stats || {};

  const closedCount = statusCounts.closed || 0;
  const conversionRate =
    totalLeads > 0 && closedCount > 0
      ? Math.round((closedCount / totalLeads) * 100)
      : 0;

  const isLoading = loading || accountsLoading;

  const priorityConfig = [
    { key: 'urgent', label: 'Urgent', dotClass: 'bg-red-500', textClass: 'text-red-700' },
    { key: 'high', label: 'High', dotClass: 'bg-orange-500', textClass: 'text-orange-700' },
    { key: 'medium', label: 'Medium', dotClass: 'bg-yellow-400', textClass: 'text-yellow-700' },
    { key: 'low', label: 'Low', dotClass: 'bg-green-500', textClass: 'text-green-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">B2B Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          High-level snapshot of your B2B leads and business accounts.
        </p>
      </div>

      {isLoading && <Loader />}

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total B2B Leads"
          value={totalLeads}
          icon={Briefcase}
          color="lavender"
        />
        <Card
          title="New Leads (Last 7 Days)"
          value={newLeadsLast7Days}
          icon={PhoneCall}
          color="blue"
        />
        <Card
          title="Closed Deals"
          value={closedCount}
          icon={CheckCircle2}
          color="green"
        />
        <Card
          title="Lead Conversion Rate"
          value={`${conversionRate}%`}
          icon={BarChart3}
          color="orange"
        />
      </div>

      {/* Detail sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business accounts summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Business Accounts</h2>
            <Building2 className="text-primary" size={22} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Accounts</span>
              <span className="text-base font-semibold text-gray-900">
                {accountStats.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Approvals</span>
              <span className="text-base font-semibold text-yellow-600">
                {accountStats.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Accounts</span>
              <span className="text-base font-semibold text-green-600">
                {accountStats.active}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Priority breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Lead Priority Breakdown</h2>
            <Users className="text-primary" size={22} />
          </div>
          <div className="space-y-3">
            {priorityConfig.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${item.dotClass}`}
                  />
                  <span className={item.textClass}>{item.label}</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {priorityCounts[item.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Top Inquired Products
            </h2>
          </div>
          {(!topProducts || topProducts.length === 0) ? (
            <p className="text-sm text-gray-500">
              No lead data available yet. Once inquiries start coming in, you'll
              see the most requested products here.
            </p>
          ) : (
            <ul className="space-y-3">
              {topProducts.slice(0, 5).map((product) => (
                <li
                  key={product.productName}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {product.productImage && (
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.leadCount} lead
                        {product.leadCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default B2BDashboard;


