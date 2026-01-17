import { useEffect, useMemo, useState } from 'react';
import { Eye, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

import bulkRfqService from '../services/bulkRfqService';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'closed', label: 'Closed' },
];

const StatusBadge = ({ status }) => {
  const map = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    quoted: 'bg-purple-50 text-purple-700 border-purple-200',
    won: 'bg-green-50 text-green-700 border-green-200',
    lost: 'bg-red-50 text-red-700 border-red-200',
    closed: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const cls = map[status] || map.closed;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {String(status || 'closed').replace('_', ' ')}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const map = {
    low: 'bg-gray-50 text-gray-700 border-gray-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = map[priority] || map.low;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {priority || 'low'}
    </span>
  );
};

const DetailModal = ({ open, onClose, rfq, onUpdated }) => {
  const [status, setStatus] = useState(rfq?.status || 'new');
  const [adminNotes, setAdminNotes] = useState(rfq?.adminNotes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(rfq?.status || 'new');
    setAdminNotes(rfq?.adminNotes || '');
  }, [rfq]);

  if (!open || !rfq) return null;

  const save = async () => {
    setSaving(true);
    try {
      await bulkRfqService.update(rfq._id, { status, adminNotes });
      toast.success('Bulk RFQ updated');
      onUpdated?.();
      onClose();
    } catch (e) {
      toast.error('Failed to update Bulk RFQ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">Bulk RFQ</div>
            <div className="text-sm text-gray-500">{rfq._id}</div>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold mb-3">Buyer</div>
            <div className="text-sm text-gray-700 space-y-1">
              <div><span className="font-semibold">Name:</span> {rfq.buyerName}</div>
              <div><span className="font-semibold">Email:</span> {rfq.buyerEmail}</div>
              <div><span className="font-semibold">Phone:</span> {rfq.buyerPhone}</div>
              <div><span className="font-semibold">City:</span> {rfq.buyerCity}</div>
              {rfq.companyName && <div><span className="font-semibold">Company:</span> {rfq.companyName}</div>}
              {rfq.gstNumber && <div><span className="font-semibold">GST:</span> {rfq.gstNumber}</div>}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold mb-3">Status</div>
            <div className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border"
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 rounded-lg border"
                placeholder="Admin notes"
              />
              <Button onClick={save} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border p-4">
            <div className="text-sm font-semibold mb-3">Items</div>
            <div className="divide-y">
              {Array.isArray(rfq.items) && rfq.items.length > 0 ? (
                rfq.items.map((it, idx) => {
                  // Ensure it's an object and has required properties
                  if (!it || typeof it !== 'object') {
                    console.warn('Invalid item at index', idx, ':', it);
                    return null;
                  }
                  return (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 line-clamp-1">
                          {it.productName || 'Unknown Product'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {it.size ? `Size: ${it.size}` : ''}
                          {it.size && it.color ? ' • ' : ''}
                          {it.color ? `Color: ${it.color}` : ''}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        Qty: {it.quantityRequired || 0}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-3 text-sm text-gray-500">No items found</div>
              )}
            </div>
          </div>

          {rfq.requirements && (
            <div className="md:col-span-2 rounded-xl border p-4">
              <div className="text-sm font-semibold mb-2">Requirements</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{rfq.requirements}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BulkRFQs = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const columns = useMemo(
    () => [
      { 
        header: 'RFQ ID', 
        accessor: '_id',
        render: (row) => <span className="font-mono text-xs">{String(row._id || '').substring(0, 8)}...</span>
      },
      { 
        header: 'Buyer', 
        accessor: 'buyerName',
        render: (row) => <span>{row.buyerName || '-'}</span>
      },
      { 
        header: 'Email', 
        accessor: 'buyerEmail',
        render: (row) => <span>{row.buyerEmail || '-'}</span>
      },
      {
        header: 'Items',
        accessor: 'items',
        render: (row) => {
          const items = row.items;
          // Ensure items is an array before checking length
          if (!items) return <span className="font-semibold">0</span>;
          if (Array.isArray(items)) {
            return <span className="font-semibold">{items.length}</span>;
          }
          // If items is an object (shouldn't happen, but handle it)
          if (typeof items === 'object') {
            console.warn('Items is not an array:', items);
            return <span className="font-semibold">-</span>;
          }
          return <span className="font-semibold">0</span>;
        },
      },
      {
        header: 'Status',
        accessor: 'status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        header: 'Priority',
        accessor: 'priority',
        render: (row) => <PriorityBadge priority={row.priority} />,
      },
      {
        header: 'Created',
        accessor: 'createdAt',
        render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'),
      },
      {
        header: 'Actions',
        accessor: 'actions',
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelected(row);
                setModalOpen(true);
              }}
            >
              <Eye size={16} />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const fetchData = async () => {
    // Check if token exists before making request
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.error('❌ No adminToken found in localStorage');
      toast.error('Please login to access Bulk RFQs');
      setRows([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 1 });
      return;
    }

    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.q = searchQuery;

      console.log('📡 Fetching Bulk RFQs with params:', params);
      const resp = await bulkRfqService.getAll(params);
      
      console.log('📦 Raw response from service:', resp);
      console.log('📦 Response type:', typeof resp);
      console.log('📦 Response keys:', resp ? Object.keys(resp) : 'null');
      
      // Handle response structure - backend returns { success: true, data: [...], pagination: {...} }
      if (resp && resp.success !== false) {
        // Ensure data is an array
        const rfqData = Array.isArray(resp.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        const paginationData = resp.pagination || { page: 1, limit: 20, total: 0, pages: 1 };
        
        console.log('✅ Setting RFQs:', rfqData.length, 'items');
        console.log('✅ Pagination:', paginationData);
        
        setRows(rfqData);
        setPagination(paginationData);
        
        console.log('✅ State updated - rows:', rfqData.length, 'pagination:', paginationData);
        console.log('✅ First RFQ item:', rfqData.length > 0 ? rfqData[0] : 'none');
        
        if (rfqData.length === 0 && paginationData.total === 0) {
          console.log('ℹ️ No RFQs found in database');
        }
      } else {
        console.error('❌ Bulk RFQ API Error - Invalid response:', resp);
        console.error('❌ Response success:', resp?.success);
        console.error('❌ Response data:', resp?.data);
        toast.error(resp?.message || 'Failed to load Bulk RFQs');
        setRows([]);
        setPagination({ page: 1, limit: 20, total: 0, pages: 1 });
      }
    } catch (e) {
      console.error('❌ Error fetching Bulk RFQs:', e);
      console.error('❌ Error response:', e.response);
      console.error('❌ Error status:', e.response?.status);
      console.error('❌ Error data:', e.response?.data);
      
      const errorMessage = e.response?.data?.message || e.message || 'Failed to load Bulk RFQs';
      
      if (e.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(errorMessage);
      }
      
      setRows([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    console.log('🔄 useEffect triggered - fetching Bulk RFQs', { currentPage, statusFilter });
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const clearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk RFQs</h1>
        <p className="text-sm text-gray-600">Multi-item inquiries submitted from the B2B Shop.</p>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by buyer, email, company, product"
              onSearch={handleSearch}
            />

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-200"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={clearFilters}>
              <X size={16} className="mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bulk RFQs Found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter
              ? 'No RFQs match your current filters. Try adjusting your search criteria.'
              : 'No bulk RFQ requests have been submitted yet. They will appear here once customers submit inquiries.'}
          </p>
          {(searchQuery || statusFilter) && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <Table columns={columns} data={rows} />
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        </>
      )}

      <DetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rfq={selected}
        onUpdated={fetchData}
      />
    </div>
  );
};

export default BulkRFQs;
