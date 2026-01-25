import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiEye,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiMessageSquare,
} from 'react-icons/fi';
import { fetchMyInquiries, fetchInquiryById, requestQuoteFromInquiry, setFilters, setSelectedInquiry } from '../store/slices/inquiriesSlice';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const MyInquiries = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inquiries, loading, filters, selectedInquiry } = useSelector((state) => state.inquiries);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-inquiries' } });
      return;
    }

    if (!account || account.status !== 'active') {
      navigate('/dashboard');
      return;
    }

    // Fetch inquiries with current filters
    const params = {
      ...filters,
      search: searchQuery,
    };
    dispatch(fetchMyInquiries(params));
  }, [isAuthenticated, account, dispatch, navigate, filters, searchQuery]);

  const handleViewDetails = async (inquiryId) => {
    try {
      await dispatch(fetchInquiryById(inquiryId)).unwrap();
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load inquiry details');
    }
  };

  const handleRequestQuote = async (inquiryId) => {
    try {
      await dispatch(requestQuoteFromInquiry(inquiryId)).unwrap();
      toast.success('Quote request submitted successfully!');
    } catch (error) {
      toast.error(error || 'Failed to request quote');
    }
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status: status || '' }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New', icon: FiAlertCircle },
      contacted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Contacted', icon: FiMessageSquare },
      interested: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Interested', icon: FiTrendingUp },
      quoted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Quoted', icon: FiFileText },
      negotiating: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Negotiating', icon: FiClock },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed', icon: FiCheckCircle },
      lost: { bg: 'bg-red-100', text: 'text-red-800', label: 'Lost', icon: FiXCircle },
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      urgent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading && inquiries.length === 0) {
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
          <h1 className="text-4xl font-heading font-bold text-secondary mb-2">My Inquiries</h1>
          <p className="text-gray-600">Track all your product inquiries and quote requests</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar-thin scroll-smooth">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${!filters.status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-100'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('new')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${filters.status === 'new'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-100'
                  }`}
              >
                New
              </button>
              <button
                onClick={() => handleStatusFilter('quoted')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${filters.status === 'quoted'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-100'
                  }`}
              >
                Quoted
              </button>
              <button
                onClick={() => handleStatusFilter('closed')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${filters.status === 'closed'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-100'
                  }`}
              >
                Closed
              </button>
            </div>
          </div>
        </motion.div>

        {/* Inquiries List */}
        {inquiries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <FiFileText className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-heading font-bold text-secondary mb-2">No Inquiries Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by submitting an inquiry for any product you're interested in.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {inquiries.map((inquiry, index) => (
              <motion.div
                key={inquiry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      {inquiry.productId?.image && (
                        <img
                          src={inquiry.productId.image}
                          alt={inquiry.productId.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-secondary mb-1">
                          {inquiry.productId?.name || 'Product Inquiry'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getStatusBadge(inquiry.status)}
                          {inquiry.priority && getPriorityBadge(inquiry.priority)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Quantity:</strong> {inquiry.quantityRequired} units</p>
                          {inquiry.size && <p><strong>Size:</strong> {inquiry.size}</p>}
                          {inquiry.inquiryType && (
                            <p><strong>Type:</strong> {inquiry.inquiryType.replace('_', ' ')}</p>
                          )}
                          <p><strong>Submitted:</strong> {new Date(inquiry.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleViewDetails(inquiry._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <FiEye size={18} />
                      View Details
                    </button>
                    {inquiry.status === 'new' || inquiry.status === 'contacted' ? (
                      <button
                        onClick={() => handleRequestQuote(inquiry._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        <FiFileText size={18} />
                        Request Quote
                      </button>
                    ) : inquiry.status === 'quoted' ? (
                      <Link
                        to="/my-quotes"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        <FiFileText size={18} />
                        View Quote
                      </Link>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Inquiry Details Modal */}
        {showDetailsModal && selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-2xl font-heading font-bold">Inquiry Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    dispatch(setSelectedInquiry(null));
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiXCircle size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Product Info */}
                {selectedInquiry.productId && (
                  <div className="bg-sky/30 rounded-lg p-4">
                    <h3 className="font-semibold text-secondary mb-2">Product</h3>
                    <div className="flex items-center gap-4">
                      {selectedInquiry.productId.image && (
                        <img
                          src={selectedInquiry.productId.image}
                          alt={selectedInquiry.productId.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{selectedInquiry.productId.name}</p>
                        <Link
                          to={`/product/${selectedInquiry.productId._id}`}
                          className="text-primary text-sm hover:underline"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inquiry Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priority</p>
                    {selectedInquiry.priority && getPriorityBadge(selectedInquiry.priority)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity Required</p>
                    <p className="font-semibold">{selectedInquiry.quantityRequired} units</p>
                  </div>
                  {selectedInquiry.size && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Size</p>
                      <p className="font-semibold">{selectedInquiry.size}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Inquiry Type</p>
                    <p className="font-semibold capitalize">
                      {selectedInquiry.inquiryType?.replace('_', ' ') || 'General'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted</p>
                    <p className="font-semibold">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                {selectedInquiry.requirements && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Special Requirements</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedInquiry.requirements}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedInquiry.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Additional Notes</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedInquiry.notes}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedInquiry.adminNotes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Admin Notes</p>
                    <p className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {selectedInquiry.adminNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  {(selectedInquiry.status === 'new' || selectedInquiry.status === 'contacted') && (
                    <button
                      onClick={() => {
                        handleRequestQuote(selectedInquiry._id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Request Quote
                    </button>
                  )}
                  {selectedInquiry.status === 'quoted' && (
                    <Link
                      to="/my-quotes"
                      className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-center"
                    >
                      View Quote
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInquiries;

