import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import { Eye, CheckCircle, X, Briefcase, CreditCard, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';

const BusinessAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBusinessAccounts();
  }, [searchQuery, statusFilter]);

  const fetchBusinessAccounts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/business-accounts', { params });
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching business accounts:', error);
      toast.error('Failed to fetch business accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (accountId) => {
    try {
      await api.put(`/business-accounts/${accountId}/approve`, { status: 'active' });
      toast.success('Business account approved successfully!');
      fetchBusinessAccounts();
    } catch (error) {
      toast.error('Failed to approve account');
    }
  };

  const handleReject = async (accountId) => {
    try {
      await api.put(`/business-accounts/${accountId}/approve`, { status: 'rejected' });
      toast.success('Business account rejected');
      fetchBusinessAccounts();
    } catch (error) {
      toast.error('Failed to reject account');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspended' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'companyName',
      label: 'Company',
      render: (account) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">{account.companyName}</div>
          <div className="text-xs text-gray-600 capitalize">{account.businessType}</div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      render: (account) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{account.contactPerson?.name}</div>
          <div className="text-xs text-gray-600">{account.contactPerson?.email}</div>
          <div className="text-xs text-gray-600">{account.contactPerson?.phone}</div>
        </div>
      ),
    },
    {
      key: 'pricingTier',
      label: 'Pricing Tier',
      render: (account) => (
        <span className="text-sm font-semibold text-primary capitalize">
          {account.pricingTier}
        </span>
      ),
    },
    {
      key: 'creditLimit',
      label: 'Credit Limit',
      render: (account) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">
            ₹{(account.creditLimit || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-600">
            Available: ₹{((account.creditLimit || 0) - (account.creditUsed || 0)).toLocaleString('en-IN')}
          </div>
        </div>
      ),
    },
    {
      key: 'paymentTerms',
      label: 'Payment Terms',
      render: (account) => (
        <span className="text-sm text-gray-700 uppercase">
          {account.paymentTerms}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (account) => getStatusBadge(account.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (account) => (
        <div className="flex items-center gap-2">
          {account.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="small"
                onClick={() => handleApprove(account._id)}
              >
                <CheckCircle size={16} />
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => handleReject(account._id)}
              >
                <X size={16} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Accounts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage B2B business accounts and approvals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by company name, contact person..."
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {loading ? (
          <Loader />
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No business accounts found</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={accounts}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessAccounts;

