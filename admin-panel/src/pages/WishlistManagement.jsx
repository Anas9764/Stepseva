import { useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import { Heart, Eye } from 'lucide-react';

const WishlistManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Fetch wishlist data from API
  const wishlists = [];

  const filteredWishlists = wishlists.filter(wishlist => {
    return wishlist.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wishlist.productName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => row.customerName || 'N/A',
    },
    {
      header: 'Product',
      accessor: 'productName',
      render: (row) => row.productName || 'N/A',
    },
    {
      header: 'Date Added',
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
          onClick={() => {/* TODO: View wishlist details */}}
          icon={<Eye size={16} />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Wishlist Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage customer wishlists • {filteredWishlists.length} items found
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by customer name or product name..."
        />
      </div>

      <Table
        columns={columns}
        data={filteredWishlists}
        emptyMessage="No wishlist items found"
      />
    </div>
  );
};

export default WishlistManagement;

