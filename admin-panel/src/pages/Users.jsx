import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole, deleteUser } from '../store/slices/userSlice';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { Trash2, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    if (searchQuery) {
      return users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return users;
  }, [searchQuery, users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMessage = `Are you sure you want to change this user's role to ${newRole}?`;
    
    if (window.confirm(confirmMessage)) {
      const result = await dispatch(updateUserRole({ id: userId, role: newRole }));
      if (result.type === 'users/updateRole/fulfilled') {
        toast.success('User role updated successfully');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const result = await dispatch(deleteUser(id));
      if (result.type === 'users/delete/fulfilled') {
        toast.success('User deleted successfully');
      }
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-light to-lavender-500 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.role === 'admin' ? (
            <span className="flex items-center gap-1">
              <Shield size={12} />
              Admin
            </span>
          ) : (
            'User'
          )}
        </span>
      ),
    },
    {
      header: 'Registration Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Total Orders',
      accessor: 'orderCount',
      render: (row) => row.orderCount || 0,
    },
    {
      header: 'Total Spent',
      accessor: 'totalSpent',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">₹{row.totalSpent?.toLocaleString('en-IN') || '0'}</p>
        </div>
      ),
    },
  ];

  if (loading && !users.length) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
        <p className="text-gray-600 mt-1">
          Manage registered users • {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
        </p>
      </div>

      {/* Search */}
      <div className="w-full sm:w-96">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or email..."
        />
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Users</p>
          <h3 className="text-3xl font-bold text-gray-800">{users.length}</h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Admin Users</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {users.filter((u) => u.role === 'admin').length}
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Regular Users</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {users.filter((u) => u.role !== 'admin').length}
          </h3>
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={paginatedUsers}
        actions={(row) => (
          <>
            <Button
              size="sm"
              variant={row.role === 'admin' ? 'secondary' : 'outline'}
              onClick={() => handleRoleChange(row._id, row.role)}
              icon={<Shield size={16} />}
            >
              {row.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(row._id)}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </>
        )}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredUsers.length}
          showInfo={true}
          align="right"
        />
      )}
    </div>
  );
};

export default Users;

