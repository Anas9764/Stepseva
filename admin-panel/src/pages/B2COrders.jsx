import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const B2COrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Filter orders to show only B2C orders (isB2BOrder === false or undefined)
  const b2cOrders = orders.filter(order => !order.isB2BOrder);

  // Apply search and filters
  const filteredOrders = b2cOrders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: '_id',
      render: (row) => `#${row._id?.slice(-6).toUpperCase()}`,
    },
    {
      header: 'Customer',
      accessor: 'user',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{row.user?.name || 'Guest'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.user?.email || ''}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      accessor: 'items',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-800 dark:text-white">{row.items?.length || 0} items</p>
          {row.items?.[0] && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.items[0].product?.name || 'N/A'}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (row) => `₹${row.totalAmount?.toLocaleString('en-IN') || '0.00'}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
          row.status === 'Shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
          row.status === 'Delivered' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewOrder(row)}
          icon={<Eye size={16} />}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">B2C Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage retail orders from individual customers • {filteredOrders.length} orders found
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by order ID, customer name, or email..."
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Table
        columns={columns}
        data={paginatedOrders}
        emptyMessage="No B2C orders found"
      />

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredOrders.length}
          showInfo={true}
          align="right"
        />
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Order Details"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Order Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Order ID</p>
                  <p className="font-medium text-gray-800 dark:text-white">#{selectedOrder._id?.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="font-medium text-gray-800 dark:text-white">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-800 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Customer Information</h3>
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-800 dark:text-white">{selectedOrder.user?.name || 'Guest'}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Email</p>
                <p className="font-medium text-gray-800 dark:text-white">{selectedOrder.user?.email || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{item.product?.name || item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-white">₹{item.price?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default B2COrders;

