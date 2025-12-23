import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, fetchLeadStats, updateLead, setCurrentLead } from '../store/slices/leadsSlice';
import Table from '../components/Table';
import BulkActions from '../components/BulkActions';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { Eye, Filter, X, Download, Phone, Mail, Briefcase, AlertCircle, TrendingUp, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import LeadDetailModal from '../components/Leads/LeadDetailModal';
import LeadStatusBadge from '../components/Leads/LeadStatusBadge';
import LeadPriorityBadge from '../components/Leads/LeadPriorityBadge';
import * as XLSX from 'xlsx';
import { exportLeadsToPDF } from '../utils/pdfExport';

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, loading, pagination, stats } = useSelector((state) => state.leads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const itemsPerPage = 20;

  // Fetch leads on mount and when filters change
  useEffect(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (businessTypeFilter) params.businessType = businessTypeFilter;
    if (dateRangeFilter.start) params.startDate = dateRangeFilter.start;
    if (dateRangeFilter.end) params.endDate = dateRangeFilter.end;
    if (searchQuery) params.search = searchQuery;
    params.page = currentPage;
    params.limit = itemsPerPage;
    
    dispatch(fetchLeads(params));
  }, [dispatch, statusFilter, priorityFilter, businessTypeFilter, dateRangeFilter, searchQuery, currentPage]);

  // Fetch statistics
  useEffect(() => {
    dispatch(fetchLeadStats());
  }, [dispatch]);

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    dispatch(setCurrentLead(lead));
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await dispatch(updateLead({ id: leadId, data: { status: newStatus } })).unwrap();
      toast.success('Lead status updated successfully');
      // Refresh leads
      dispatch(fetchLeads({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      toast.error(error || 'Failed to update lead status');
    }
  };

  const handleMarkContacted = async (leadId) => {
    try {
      await dispatch(updateLead({ 
        id: leadId, 
        data: { 
          status: 'contacted',
          contactedAt: new Date().toISOString(),
        } 
      })).unwrap();
      toast.success('Lead marked as contacted');
      dispatch(fetchLeads({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      toast.error('Failed to mark as contacted');
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setBusinessTypeFilter('');
    setDateRangeFilter({ start: '', end: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Bulk operations
  const handleSelectionChange = useCallback((selected, count) => {
    setSelectedLeads(selected);
  }, []);

  const handleBulkStatusUpdate = useCallback(async (status) => {
    if (selectedLeads.length === 0) return;
    
    setIsBulkProcessing(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const lead of selectedLeads) {
        try {
          await dispatch(updateLead({ 
            id: lead._id, 
            data: { status } 
          })).unwrap();
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} lead(s) to ${status}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to update ${failCount} lead(s)`);
      }
      
      setSelectedLeads([]);
      dispatch(fetchLeads({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      toast.error('Bulk status update failed');
    } finally {
      setIsBulkProcessing(false);
    }
  }, [selectedLeads, dispatch, currentPage, itemsPerPage]);

  const handleBulkPriorityUpdate = useCallback(async (priority) => {
    if (selectedLeads.length === 0) return;
    
    setIsBulkProcessing(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const lead of selectedLeads) {
        try {
          await dispatch(updateLead({ 
            id: lead._id, 
            data: { priority } 
          })).unwrap();
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} lead(s) priority to ${priority}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to update ${failCount} lead(s)`);
      }
      
      setSelectedLeads([]);
      dispatch(fetchLeads({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      toast.error('Bulk priority update failed');
    } finally {
      setIsBulkProcessing(false);
    }
  }, [selectedLeads, dispatch, currentPage, itemsPerPage]);

  const handleBulkExport = useCallback(() => {
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }

    try {
      const exportData = selectedLeads.map(lead => ({
        'Lead ID': lead._id,
        'Buyer Name': lead.buyerName || 'N/A',
        'Email': lead.buyerEmail || 'N/A',
        'Phone': lead.buyerPhone || 'N/A',
        'Company': lead.companyName || 'N/A',
        'Business Type': lead.businessType || 'N/A',
        'Product': lead.productName || 'N/A',
        'Quantity': lead.quantityRequired || 0,
        'Status': lead.status || 'N/A',
        'Priority': lead.priority || 'N/A',
        'Quoted Price': lead.quotedPrice || 'N/A',
        'Follow-up Date': lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'N/A',
        'Created At': lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');
      XLSX.writeFile(wb, `leads-export-${Date.now()}.xlsx`);
      
      toast.success(`Exported ${selectedLeads.length} lead(s) to Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export leads');
    }
  }, [selectedLeads]);

  const handleBulkExportPDF = useCallback(() => {
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }

    try {
      exportLeadsToPDF(selectedLeads);
      toast.success(`Exported ${selectedLeads.length} lead(s) to PDF`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export leads to PDF');
    }
  }, [selectedLeads]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Date/Time',
      render: (lead) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{formatTimeAgo(lead.createdAt)}</div>
          <div className="text-xs text-gray-500">{formatDate(lead.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'buyerName',
      label: 'Buyer',
      render: (lead) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">{lead.buyerName}</div>
          {lead.companyName && (
            <div className="text-xs text-gray-600">{lead.companyName}</div>
          )}
          <div className="text-xs text-gray-500 capitalize">{lead.businessType}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (lead) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-700">
            <Phone size={12} />
            <span>{lead.buyerPhone}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Mail size={12} />
            <span className="truncate max-w-[150px]" title={lead.buyerEmail}>{lead.buyerEmail}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'product',
      label: 'Product',
      render: (lead) => (
        <div className="flex items-center gap-2">
          {lead.productId?.image && (
            <img 
              src={lead.productId.image} 
              alt={lead.productName}
              className="w-10 h-10 object-cover rounded"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={lead.productName}>
              {lead.productName}
            </div>
            <div className="text-xs text-gray-600">
              Qty: {lead.quantityRequired}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (lead) => <LeadStatusBadge status={lead.status} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (lead) => <LeadPriorityBadge priority={lead.priority} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (lead) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="small"
            onClick={() => handleViewDetails(lead)}
          >
            <Eye size={16} />
          </Button>
          {lead.status === 'new' && (
            <Button
              variant="success"
              size="small"
              onClick={() => handleMarkContacted(lead._id)}
              title="Mark as Contacted"
            >
              <Phone size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const activeFiltersCount = [statusFilter, priorityFilter, businessTypeFilter, dateRangeFilter.start, dateRangeFilter.end, searchQuery].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">B2B Leads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage buyer inquiries and business leads
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalLeads || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
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
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.statusCounts?.new || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last 7 days: {stats.newLeadsLast7Days || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
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
              <p className="text-sm text-gray-600">Contacted</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.statusCounts?.contacted || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Phone className="text-yellow-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Closed Deals</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.statusCounts?.closed || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by buyer name, email, phone, company..."
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="quoted">Quoted</option>
                <option value="negotiating">Negotiating</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="distributor">Distributor</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="business_customer">Business Customer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRangeFilter.start}
                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRangeFilter.end}
                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X size={18} />
                  Clear Filters
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedLeads.length}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkExport={handleBulkExport}
        onBulkExportPDF={handleBulkExportPDF}
        showDelete={false}
        showStatusUpdate={true}
        showExport={true}
        showExportPDF={true}
        showAssign={false}
        availableStatuses={[
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'interested', label: 'Interested' },
          { value: 'quoted', label: 'Quoted' },
          { value: 'negotiating', label: 'Negotiating' },
          { value: 'closed', label: 'Closed' },
          { value: 'lost', label: 'Lost' },
        ]}
        customActions={[
          {
            label: 'Update Priority',
            variant: 'secondary',
            onClick: () => {
              const priority = prompt('Enter priority (low, medium, high, urgent):');
              if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority.toLowerCase())) {
                handleBulkPriorityUpdate(priority.toLowerCase());
              }
            },
          },
        ]}
      />

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {loading ? (
          <Loader />
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No leads found</p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={leads}
              enableBulkSelection={true}
              onSelectionChange={handleSelectionChange}
              getRowId={(row) => row._id}
              actions={(row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(row)}
                  icon={<Eye size={16} />}
                >
                  View
                </Button>
              )}
            />
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={pagination.total}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onUpdate={() => {
          dispatch(fetchLeads({ page: currentPage, limit: itemsPerPage }));
          dispatch(fetchLeadStats());
        }}
      />
    </div>
  );
};

export default Leads;

