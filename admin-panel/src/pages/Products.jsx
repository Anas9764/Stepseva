import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import ProductForm from './ProductForm';
import { Plus, Edit2, Trash2, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LazyImage from '../components/LazyImage';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories || { categories: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    stock: '',
    gender: '',
    footwearType: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter and paginate products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category?._id === filters.category || product.category?.name === filters.category
      );
    }

    // Status filter
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter((product) => product.isActive === true);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter((product) => product.isActive === false);
      } else if (filters.status === 'featured') {
        filtered = filtered.filter((product) => product.featured === true);
      }
    }

    // Stock filter
    if (filters.stock) {
      if (filters.stock === 'in-stock') {
        filtered = filtered.filter((product) => product.stock > 0);
      } else if (filters.stock === 'out-of-stock') {
        filtered = filtered.filter((product) => product.stock === 0);
      } else if (filters.stock === 'low-stock') {
        filtered = filtered.filter((product) => product.stock > 0 && product.stock <= 10);
      }
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter((product) => product.gender === filters.gender);
    }

    // Footwear type filter
    if (filters.footwearType) {
      filtered = filtered.filter((product) => product.footwearType === filters.footwearType);
    }

    return filtered;
  }, [searchQuery, products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      status: '',
      stock: '',
      gender: '',
      footwearType: '',
    });
    setCurrentPage(1);
  }, []);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await dispatch(deleteProduct(id));
      if (result.type === 'products/delete/fulfilled') {
        toast.success('Product deleted successfully');
      }
    }
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  const columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (row) => (
        <LazyImage
          src={row.image || row.images?.[0] || '/placeholder.png'}
          alt={row.name}
          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
        />
      ),
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">{row.name}</p>
          <p className="text-xs text-gray-500">{row.brand || 'StepSeva'}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.category?.name || 'N/A'}</p>
          <div className="flex gap-1 mt-1">
            {row.gender && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded capitalize">
                {row.gender}
              </span>
            )}
            {row.footwearType && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded capitalize">
                {row.footwearType}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">₹{row.price?.toLocaleString('en-IN')}</p>
        </div>
      ),
    },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (row) => (
        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              row.stock > 10
                ? 'bg-green-100 text-green-800'
                : row.stock > 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.stock} units
          </span>
          {row.sizes && row.sizes.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {row.sizes.length} sizes
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              row.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
          {row.featured && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Featured
            </span>
          )}
        </div>
      ),
    },
  ];

  if (loading && !products.length) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your product inventory • {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            icon={<Filter size={20} />}
            className="whitespace-nowrap"
          >
            Filters
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={20} />}
            className="whitespace-nowrap"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter Products</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-secondary font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories && Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <select
                value={filters.stock}
                onChange={(e) => handleFilterChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (≤10)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Gender</option>
                <option value="ladies">Ladies</option>
                <option value="gents">Gents</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            {/* Footwear Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.footwearType}
                onChange={(e) => handleFilterChange('footwearType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="sneakers">Sneakers</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sports">Sports</option>
                <option value="sandals">Sandals</option>
                <option value="boots">Boots</option>
                <option value="flip-flops">Flip-Flops</option>
                <option value="slippers">Slippers</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="w-full sm:w-96">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, brand, or category..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Products Table */}
      <Table
        columns={columns}
        data={paginatedProducts}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(row)}
              icon={<Edit2 size={16} />}
              className="whitespace-nowrap"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(row._id)}
              icon={<Trash2 size={16} />}
              className="whitespace-nowrap"
            >
              Delete
            </Button>
          </div>
        )}
        emptyMessage={error ? "Failed to load products" : "No products found"}
      />

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredProducts.length}
          showInfo={true}
          align="right"
        />
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Products;

