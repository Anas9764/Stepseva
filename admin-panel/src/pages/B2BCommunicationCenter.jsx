import { useEffect, useState, useMemo } from 'react';
import { Phone, Mail, MessageCircle, Filter, Clock, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import leadService from '../services/leadService';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';

const B2BCommunicationCenter = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const params = {
          limit: 200,
        };
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        if (searchQuery) params.search = searchQuery;

        const response = await leadService.getAllLeads(params);
        const payload = response?.data || response;
        setLeads(payload?.leads || []);
      } catch (error) {
        console.error('Error fetching leads for communication center:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [statusFilter, priorityFilter, searchQuery]);

  const filteredLeads = useMemo(() => leads, [leads]);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      header: 'Buyer',
      render: (lead) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{lead.buyerName}</p>
            {lead.companyName && (
              <p className="text-xs text-gray-600">{lead.companyName}</p>
            )}
            <p className="text-xs text-gray-500 capitalize">
              {lead.businessType?.replace('_', ' ')}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (lead) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1 text-gray-700">
            <Phone size={12} />
            <span>{lead.buyerPhone}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Mail size={12} />
            <span className="truncate max-w-[180px]" title={lead.buyerEmail}>
              {lead.buyerEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Product / Inquiry',
      render: (lead) => (
        <div className="text-sm">
          <p
            className="font-medium text-gray-900 truncate max-w-[220px]"
            title={lead.productName}
          >
            {lead.productName}
          </p>
          <p className="text-xs text-gray-500">
            Qty: {lead.quantityRequired} • Type:{' '}
            {lead.inquiryType?.replace('_', ' ')}
          </p>
        </div>
      ),
    },
    {
      header: 'Last Activity',
      render: (lead) => (
        <div className="text-xs text-gray-700">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>
              {lead.lastContactedAt
                ? 'Last contacted'
                : lead.contactedAt
                ? 'First contact'
                : 'Created'}
            </span>
          </div>
          <p className="mt-1">
            {formatTime(
              lead.lastContactedAt || lead.contactedAt || lead.createdAt
            )}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Center</h1>
          <p className="mt-1 text-sm text-gray-600">
            Central place to see who to contact next and through which channel.
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by buyer, email, phone, or company..."
            />
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Filter size={16} />
            <span>Quick filters</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'interested', label: 'Interested' },
                { value: 'quoted', label: 'Quoted' },
                { value: 'negotiating', label: 'Negotiating' },
                { value: 'closed', label: 'Closed' },
              ].map((opt) => (
                <Button
                  key={opt.value || 'all'}
                  size="sm"
                  variant={statusFilter === opt.value ? 'primary' : 'secondary'}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Priority</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ].map((opt) => (
                <Button
                  key={opt.value || 'all'}
                  size="sm"
                  variant={
                    priorityFilter === opt.value ? 'primary' : 'secondary'
                  }
                  onClick={() => setPriorityFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {loading ? (
          <Loader />
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle
              className="mx-auto text-gray-400 mb-4"
              size={48}
            />
            <p className="text-gray-600">
              No leads found for the selected filters.
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredLeads}
            actions={(lead) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() =>
                    window.open(`tel:${lead.buyerPhone}`, '_blank')
                  }
                >
                  <Phone size={14} />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${lead.buyerPhone}?text=Hi%20${encodeURIComponent(
                        lead.buyerName || ''
                      )}%2C%20regarding%20your%20inquiry%20for%20${encodeURIComponent(
                        lead.productName || 'our products'
                      )}`,
                      '_blank'
                    )
                  }
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    window.open(`mailto:${lead.buyerEmail}`, '_blank')
                  }
                >
                  <Mail size={14} />
                  Email
                </Button>
              </div>
            )}
            emptyMessage="No leads found"
          />
        )}
      </div>
    </div>
  );
};

export default B2BCommunicationCenter;


