import { useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { MessageCircle, CheckCircle, XCircle, Eye } from 'lucide-react';

const CustomerSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Fetch support tickets from API
  const tickets = [];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      render: (row) => `#${row.id}`,
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => row.customerName || 'N/A',
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (row) => row.subject || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'Resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
          row.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
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
          onClick={() => {
            setSelectedTicket(row);
            setIsModalOpen(true);
          }}
          icon={<Eye size={16} />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customer Support</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage customer support tickets • {filteredTickets.length} tickets found
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by ticket ID, customer name, or subject..."
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <Table
        columns={columns}
        data={filteredTickets}
        emptyMessage="No support tickets found"
      />

      {/* Ticket Details Modal */}
      {isModalOpen && selectedTicket && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Support Ticket Details"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Ticket Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Ticket ID</p>
                  <p className="font-medium text-gray-800 dark:text-white">#{selectedTicket.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedTicket.status}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Customer</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedTicket.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-800 dark:text-white">{new Date(selectedTicket.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Subject</h3>
              <p className="text-gray-800 dark:text-white">{selectedTicket.subject}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Message</h3>
              <p className="text-gray-600 dark:text-gray-400">{selectedTicket.message}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerSupport;

