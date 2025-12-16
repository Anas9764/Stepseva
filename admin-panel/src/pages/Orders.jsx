import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { Eye, Package, Filter, X, Download, Calendar, Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import useNotifications from '../hooks/useNotifications';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, pagination } = useSelector((state) => state.orders);
  const { markOrdersAsSeen, notificationItems, markAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [amountRangeFilter, setAmountRangeFilter] = useState({ min: '', max: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const itemsPerPage = 10;

  // Helper function to get API URL
  const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      // If VITE_API_URL is set, use it (it should already include /api)
      return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }
    // Default to localhost with /api
    return 'http://localhost:5000/api';
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentTypeFilter, paymentStatusFilter, dateRangeFilter, amountRangeFilter, searchQuery]);

  useEffect(() => {
    const params = {};
    if (statusFilter !== 'All') params.status = statusFilter;
    if (paymentTypeFilter !== 'All') params.paymentType = paymentTypeFilter;
    if (paymentStatusFilter !== 'All') params.paymentStatus = paymentStatusFilter;
    if (dateRangeFilter.start) params.startDate = dateRangeFilter.start;
    if (dateRangeFilter.end) params.endDate = dateRangeFilter.end;
    if (amountRangeFilter.min) params.minAmount = amountRangeFilter.min;
    if (amountRangeFilter.max) params.maxAmount = amountRangeFilter.max;
    if (searchQuery) params.search = searchQuery;
    params.page = currentPage;
    params.limit = itemsPerPage;
    
    dispatch(fetchOrders(params));
  }, [dispatch, statusFilter, paymentTypeFilter, paymentStatusFilter, dateRangeFilter, amountRangeFilter, searchQuery, currentPage, itemsPerPage]);

  // Mark orders as seen when page loads
  useEffect(() => {
    markOrdersAsSeen();
    // Mark all order notifications as read when viewing orders page
    notificationItems
      .filter(n => n.type === 'order' && !n.read)
      .forEach(n => markAsRead(n.id));
  }, [markOrdersAsSeen, notificationItems, markAsRead]);

  // Use orders directly from API (already filtered and paginated)
  const filteredOrders = orders;
  const totalPages = pagination?.pages || 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const result = await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    if (result.type === 'orders/updateStatus/fulfilled') {
      toast.success('Order status updated successfully');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setCarrier(order.carrier || '');
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Invoice downloaded successfully');
      } else {
        toast.error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Invoice download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleExportOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (paymentTypeFilter !== 'All') params.append('paymentType', paymentTypeFilter);
      if (paymentStatusFilter !== 'All') params.append('paymentStatus', paymentStatusFilter);
      if (dateRangeFilter.start) params.append('startDate', dateRangeFilter.start);
      if (dateRangeFilter.end) params.append('endDate', dateRangeFilter.end);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/orders/export/csv?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Orders exported successfully');
      } else {
        toast.error('Failed to export orders');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/orders/${selectedOrder._id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ trackingNumber, carrier }),
      });

      if (response.ok) {
        toast.success('Tracking information updated successfully');
        setShowTrackingForm(false);
        setTrackingNumber('');
        setCarrier('');
        dispatch(fetchOrders());
        // Refresh selected order
        const updatedOrder = await response.json();
        setSelectedOrder(updatedOrder.data);
      } else {
        toast.error('Failed to update tracking information');
      }
    } catch (error) {
      console.error('Tracking update error:', error);
      toast.error('Failed to update tracking information');
    }
  };

  const handleAddNote = async () => {
    if (!orderNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/orders/${selectedOrder._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ note: orderNote, isInternal: true }),
      });

      if (response.ok) {
        toast.success('Note added successfully');
        setOrderNote('');
        setShowNoteForm(false);
        dispatch(fetchOrders());
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('Add note error:', error);
      toast.error('Failed to add note');
    }
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: '_id',
      render: (row) => (
        <div>
          <p className="font-medium">#{row.orderId || row._id?.slice(-6).toUpperCase()}</p>
          <p className="text-xs text-gray-500">{row._id?.slice(-6).toUpperCase()}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'user',
      render: (row) => (
        <div>
          <p className="font-medium">{row.user?.name || 'Guest'}</p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      accessor: 'items',
      render: (row) => row.items?.length || 0,
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">₹{row.totalAmount?.toLocaleString('en-IN')}</p>
        </div>
      ),
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (row) => (
        <div className="space-y-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium block ${
              row.paymentStatus === 'Paid'
                ? 'bg-green-100 text-green-800'
                : row.paymentStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {row.paymentStatus || 'Pending'}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium block ${
              row.paymentType === 'cod'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {row.paymentType === 'cod' ? 'COD' : 'Online'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className={`px-3 py-1 rounded-lg text-xs font-medium border-0 focus:ring-2 focus:ring-lavender-500 ${
            row.status === 'delivered'
              ? 'bg-green-100 text-green-800'
              : row.status === 'shipped'
              ? 'bg-blue-100 text-blue-800'
              : row.status === 'processing' || row.status === 'confirmed'
              ? 'bg-yellow-100 text-yellow-800'
              : row.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (loading && !orders.length) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-600 mt-1">
            Manage customer orders • {pagination?.total || filteredOrders.length} {(pagination?.total || filteredOrders.length) === 1 ? 'order' : 'orders'} found
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <Download size={18} />
            Export CSV
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-sm font-semibold text-gray-800">{new Date().toLocaleTimeString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-800">
            {orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-gray-800">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Filter size={16} />
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
            </button>
            {(dateRangeFilter.start || dateRangeFilter.end || amountRangeFilter.min || amountRangeFilter.max || paymentStatusFilter !== 'All') && (
              <button
                onClick={() => {
                  setDateRangeFilter({ start: '', end: '' });
                  setAmountRangeFilter({ min: '', max: '' });
                  setPaymentStatusFilter('All');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <X size={16} />
                Clear Advanced
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by order ID, customer name, email, or phone..."
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Order Status</label>
              <div className="flex gap-2 flex-wrap">
                {['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      statusFilter === status
                        ? 'bg-gradient-to-r from-pink-light to-lavender-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Type</label>
              <div className="flex gap-2">
                {['All', 'cod', 'online'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPaymentTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      paymentTypeFilter === type
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'cod' ? 'COD' : type === 'online' ? 'Online' : type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Status</label>
              <div className="flex gap-2">
                {['All', 'paid', 'pending', 'failed', 'refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setPaymentStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      paymentStatusFilter === status
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-4 mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRangeFilter.start}
                      onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
                      className="px-3 py-1.5 rounded-lg text-xs border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={dateRangeFilter.end}
                      onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
                      className="px-3 py-1.5 rounded-lg text-xs border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Amount Range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={amountRangeFilter.min}
                      onChange={(e) => setAmountRangeFilter({ ...amountRangeFilter, min: e.target.value })}
                      className="px-3 py-1.5 rounded-lg text-xs border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={amountRangeFilter.max}
                      onChange={(e) => setAmountRangeFilter({ ...amountRangeFilter, max: e.target.value })}
                      className="px-3 py-1.5 rounded-lg text-xs border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <Table
        columns={columns}
        data={filteredOrders}
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
        emptyMessage="No orders found"
      />

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={pagination?.total || filteredOrders.length}
          showInfo={true}
          align="right"
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Order #${selectedOrder.orderId || selectedOrder._id?.slice(-6).toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Order Summary Header */}
            <div className="bg-gradient-to-r from-pink-light to-lavender-500 rounded-lg p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Order ID</p>
                  <p className="text-xl font-bold">{selectedOrder.orderId || selectedOrder._id?.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Total Amount</p>
                  <p className="text-xl font-bold">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Order Status & Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Order Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    selectedOrder.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : selectedOrder.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedOrder.status === 'processing' || selectedOrder.status === 'confirmed'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedOrder.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1) || 'Pending'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Payment</p>
                <div className="space-y-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium block ${
                      selectedOrder.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedOrder.paymentStatus || 'Pending'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium block ${
                      selectedOrder.paymentType === 'cod'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedOrder.paymentType === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{selectedOrder.user?.name || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedOrder.user?.email || selectedOrder.email || 'N/A'}</p>
                </div>
                {selectedOrder.phone && (
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-700">
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                  {selectedOrder.shippingAddress.address}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                  {selectedOrder.shippingAddress.country}
                </p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.product?.image || '/placeholder.png'}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                        {item.size && ` • Size: ${item.size}`}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{selectedOrder.shippingCost?.toLocaleString('en-IN') || '0'}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{selectedOrder.discount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Tracking Information</h3>
                <button
                  onClick={() => setShowTrackingForm(!showTrackingForm)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showTrackingForm ? 'Cancel' : selectedOrder.trackingNumber ? 'Update' : 'Add'}
                </button>
              </div>
              {selectedOrder.trackingNumber ? (
                <div className="space-y-2">
                  <p className="text-sm"><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                  {selectedOrder.carrier && <p className="text-sm"><strong>Carrier:</strong> {selectedOrder.carrier}</p>}
                  {selectedOrder.estimatedDelivery && (
                    <p className="text-sm"><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No tracking information added yet</p>
              )}
              {showTrackingForm && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Carrier (e.g., FedEx, DHL, India Post)"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={handleUpdateTracking}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Update Tracking
                  </button>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Order Notes</h3>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="flex items-center gap-1 text-sm text-primary hover:text-secondary font-medium"
                >
                  <Plus size={16} />
                  Add Note
                </button>
              </div>
              {showNoteForm && (
                <div className="mb-4 space-y-2">
                  <textarea
                    placeholder="Add internal note about this order..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold text-sm"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteForm(false);
                        setOrderNote('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {selectedOrder.notes && selectedOrder.notes.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.notes.map((note, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleString('en-IN')} • {note.isInternal ? 'Internal' : 'Customer'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No notes added yet</p>
              )}
            </div>

            {/* Order Timeline */}
            {selectedOrder.orderTimeline && selectedOrder.orderTimeline.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Order Timeline</h3>
                <div className="space-y-3">
                  {selectedOrder.orderTimeline
                    .slice()
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((timeline, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {timeline.status.charAt(0).toUpperCase() + timeline.status.slice(1).replace('_', ' ')}
                          </p>
                          {timeline.note && (
                            <p className="text-xs text-gray-600 mt-1">{timeline.note}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(timeline.timestamp).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleDownloadInvoice(selectedOrder._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
              >
                <FileText size={18} />
                Download Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;

