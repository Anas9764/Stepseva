import { useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import { Users, Filter } from 'lucide-react';

const CustomerSegmentation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');

  // TODO: Fetch customer segments from API
  const segments = [];

  const filteredSegments = segments.filter(segment => {
    const matchesSearch = 
      segment.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = segmentFilter === 'All' || segment.type === segmentFilter;
    
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      header: 'Segment Name',
      accessor: 'name',
      render: (row) => row.name || 'N/A',
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.type === 'VIP' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
          row.type === 'Regular' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        }`}>
          {row.type}
        </span>
      ),
    },
    {
      header: 'Customers',
      accessor: 'customerCount',
      render: (row) => row.customerCount || 0,
    },
    {
      header: 'Total Revenue',
      accessor: 'totalRevenue',
      render: (row) => `₹${row.totalRevenue?.toLocaleString('en-IN') || '0'}`,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {/* TODO: View segment details */}}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Customer Segmentation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Segment and target your B2C customers • {filteredSegments.length} segments found
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search segments..."
            />
          </div>
          <div className="sm:w-48">
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="VIP">VIP</option>
              <option value="Regular">Regular</option>
              <option value="New">New</option>
            </select>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredSegments}
        emptyMessage="No customer segments found"
      />
    </div>
  );
};

export default CustomerSegmentation;

