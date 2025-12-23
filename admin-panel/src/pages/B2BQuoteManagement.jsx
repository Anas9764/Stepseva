import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, FileText, Calendar, Phone, Mail } from 'lucide-react';
import { fetchLeads, setCurrentLead } from '../store/slices/leadsSlice';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import LeadStatusBadge from '../components/Leads/LeadStatusBadge';
import LeadDetailModal from '../components/Leads/LeadDetailModal';

const B2BQuoteManagement = () => {
  const dispatch = useDispatch();
  const { leads, loading, pagination } = useSelector((state) => state.leads);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    const params = {
      status: 'quoted',
      page: currentPage,
      limit: itemsPerPage,
    };
    if (searchQuery) {
      params.search = searchQuery;
    }
    dispatch(fetchLeads(params));
  }, [dispatch, searchQuery, currentPage]);

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    dispatch(setCurrentLead(lead));
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      header: 'Buyer',
      render: (lead) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {lead.buyerName}
          </div>
          {lead.companyName && (
            <div className="text-xs text-gray-600">{lead.companyName}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (lead) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-700">
            <Phone size={12} />
            <span>{lead.buyerPhone}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Mail size={12} />
            <span className="truncate max-w-[150px]" title={lead.buyerEmail}>
              {lead.buyerEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Product',
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
            <div
              className="text-sm font-medium text-gray-900 truncate max-w-[200px]"
              title={lead.productName}
            >
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
      header: 'Quoted Price (₹)',
      render: (lead) => (
        <div className="text-sm font-semibold text-gray-900">
          {lead.quotedPrice
            ? lead.quotedPrice.toLocaleString('en-IN')
            : 'Not set'}
        </div>
      ),
    },
    {
      header: 'Follow-up',
      render: (lead) => (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <Calendar size={12} />
          <span>{formatDate(lead.followUpDate)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (lead) => <LeadStatusBadge status={lead.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all leads where a quote has been sent.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by buyer name, email, phone, or product..."
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {loading ? (
          <Loader />
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No quoted leads found</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={leads}
              actions={(lead) => (
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => handleViewDetails(lead)}
                >
                  <Eye size={16} />
                </Button>
              )}
            />
            {pagination?.pages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    disabled={currentPage === pagination.pages}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(pagination.pages, prev + 1)
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
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
          dispatch(
            fetchLeads({
              status: 'quoted',
              page: currentPage,
              limit: itemsPerPage,
            })
          );
        }}
      />
    </div>
  );
};

export default B2BQuoteManagement;


