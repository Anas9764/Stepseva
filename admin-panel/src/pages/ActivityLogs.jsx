import { useEffect, useState, useCallback } from 'react';
import { activityLogService } from '../services/activityLogService';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { 
  History, 
  Filter, 
  X, 
  Eye, 
  Calendar,
  User,
  Activity,
  FileText,
  Download,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  
  const itemsPerPage = 50;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (actionFilter) params.action = actionFilter;
      if (entityTypeFilter) params.entityType = entityTypeFilter;
      if (userIdFilter) params.userId = userIdFilter;
      if (dateRangeFilter.start) params.startDate = dateRangeFilter.start;
      if (dateRangeFilter.end) params.endDate = dateRangeFilter.end;

      const response = await activityLogService.getAllLogs(params);
      if (response.success) {
        setLogs(response.data || []);
        setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, actionFilter, entityTypeFilter, userIdFilter, dateRangeFilter, itemsPerPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await activityLogService.getStats({
        startDate: dateRangeFilter.start,
        endDate: dateRangeFilter.end,
      });
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [dateRangeFilter]);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleDeleteLogs = async () => {
    try {
      const filters = {};
      if (dateRangeFilter.start || dateRangeFilter.end) {
        // Calculate days from start date
        if (dateRangeFilter.start) {
          const startDate = new Date(dateRangeFilter.start);
          const today = new Date();
          const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
          if (days > 0) filters.days = days;
        }
      }
      if (actionFilter) filters.action = actionFilter;
      if (entityTypeFilter) filters.entityType = entityTypeFilter;

      const response = await activityLogService.deleteLogs(filters);
      if (response.success) {
        toast.success(`Deleted ${response.deletedCount} log(s)`);
        setShowDeleteModal(false);
        fetchLogs();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete logs');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('');
    setEntityTypeFilter('');
    setUserIdFilter('');
    setDateRangeFilter({ start: '', end: '' });
    setCurrentPage(1);
  };

  const getActionBadge = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      view: 'bg-gray-100 text-gray-800',
      export: 'bg-purple-100 text-purple-800',
      import: 'bg-indigo-100 text-indigo-800',
      approve: 'bg-emerald-100 text-emerald-800',
      reject: 'bg-orange-100 text-orange-800',
      login: 'bg-cyan-100 text-cyan-800',
      logout: 'bg-slate-100 text-slate-800',
      status_change: 'bg-yellow-100 text-yellow-800',
      bulk_update: 'bg-pink-100 text-pink-800',
      bulk_delete: 'bg-rose-100 text-rose-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[action] || 'bg-gray-100 text-gray-800'}`}>
        {action}
      </span>
    );
  };

  const getEntityTypeBadge = (entityType) => {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
        {entityType}
      </span>
    );
  };

  const columns = [
    {
      header: 'Date/Time',
      accessor: 'createdAt',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {format(new Date(row.createdAt), 'MMM dd, yyyy')}
          </div>
          <div className="text-xs text-gray-500">
            {format(new Date(row.createdAt), 'HH:mm:ss')}
          </div>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'userName',
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row.userName}</div>
          <div className="text-xs text-gray-500">{row.userEmail}</div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => getActionBadge(row.action),
    },
    {
      header: 'Entity',
      accessor: 'entityType',
      render: (row) => (
        <div className="space-y-1">
          {getEntityTypeBadge(row.entityType)}
          {row.entityName && (
            <div className="text-xs text-gray-600 truncate max-w-[150px]" title={row.entityName}>
              {row.entityName}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <div className="text-sm text-gray-700 max-w-[300px] truncate" title={row.description}>
          {row.description}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewDetails(row)}
          icon={<Eye size={16} />}
        >
          View
        </Button>
      ),
    },
  ];

  const activeFiltersCount = [
    searchQuery,
    actionFilter,
    entityTypeFilter,
    userIdFilter,
    dateRangeFilter.start,
    dateRangeFilter.end,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track all admin actions and system activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            icon={<Filter size={20} />}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
            icon={<Trash2 size={20} />}
          >
            Cleanup
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs?.toLocaleString() || 0}</p>
              </div>
              <History className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 24 Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentActivity?.toLocaleString() || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.logsByAction?.length || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entity Types</p>
                <p className="text-2xl font-bold text-gray-900">{stats.logsByEntity?.length || 0}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter Activity Logs</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="small" onClick={clearFilters}>
                Clear All
              </Button>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
                <option value="export">Export</option>
                <option value="import">Import</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="status_change">Status Change</option>
                <option value="bulk_update">Bulk Update</option>
                <option value="bulk_delete">Bulk Delete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
              <select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">All Entities</option>
                <option value="product">Product</option>
                <option value="category">Category</option>
                <option value="order">Order</option>
                <option value="user">User</option>
                <option value="lead">Lead</option>
                <option value="business_account">Business Account</option>
                <option value="review">Review</option>
                <option value="question">Question</option>
                <option value="coupon">Coupon</option>
                <option value="banner">Banner</option>
                <option value="settings">Settings</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRangeFilter.start}
                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRangeFilter.end}
                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="w-full sm:w-96">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by user, description, or entity name..."
        />
      </div>

      {/* Activity Logs Table */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <Table
            columns={columns}
            data={logs}
            emptyMessage="No activity logs found"
          />
          {pagination.pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={pagination.total}
            />
          )}
        </>
      )}

      {/* Log Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLog(null);
        }}
        title="Activity Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">User</p>
                <p className="font-medium">{selectedLog.userName}</p>
                <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date/Time</p>
                <p className="font-medium">
                  {format(new Date(selectedLog.createdAt), 'PPpp')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Action</p>
                {getActionBadge(selectedLog.action)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Entity Type</p>
                {getEntityTypeBadge(selectedLog.entityType)}
              </div>
              {selectedLog.entityId && (
                <div>
                  <p className="text-sm text-gray-600">Entity ID</p>
                  <p className="font-mono text-sm">{selectedLog.entityId}</p>
                </div>
              )}
              {selectedLog.entityName && (
                <div>
                  <p className="text-sm text-gray-600">Entity Name</p>
                  <p className="font-medium">{selectedLog.entityName}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">{selectedLog.description}</p>
            </div>
            {selectedLog.changes && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Changes</p>
                <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedLog.changes, null, 2)}
                </pre>
              </div>
            )}
            {selectedLog.ipAddress && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
                {selectedLog.metadata?.method && (
                  <div>
                    <p className="text-sm text-gray-600">HTTP Method</p>
                    <p className="font-medium">{selectedLog.metadata.method}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Activity Logs"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This will delete activity logs based on your current filters. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteLogs}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActivityLogs;

