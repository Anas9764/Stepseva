import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, updateProduct, createProduct } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import Table from '../components/Table';
import BulkActions from '../components/BulkActions';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import ProductForm from './ProductForm';
import { Plus, Edit2, Trash2, Filter, X, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import LazyImage from '../components/LazyImage';
import { exportProductsToPDF } from '../utils/pdfExport';
import * as XLSX from 'xlsx';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import BulkImport from '../components/BulkImport';

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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

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

  // Bulk operations
  const handleSelectionChange = useCallback((selected, count) => {
    setSelectedProducts(selected);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.length === 0) return;
    
    setIsBulkProcessing(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const product of selectedProducts) {
        try {
          const result = await dispatch(deleteProduct(product._id));
          if (result.type === 'products/delete/fulfilled') {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} product(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} product(s)`);
      }
      
      setSelectedProducts([]);
      dispatch(fetchProducts());
    } catch (error) {
      toast.error('Bulk delete operation failed');
    } finally {
      setIsBulkProcessing(false);
    }
  }, [selectedProducts, dispatch]);

  const handleBulkStatusUpdate = useCallback(async (status) => {
    if (selectedProducts.length === 0) return;
    
    setIsBulkProcessing(true);
    try {
      const updateData = {
        isActive: status === 'active',
        featured: status === 'featured' ? true : undefined,
      };

      let successCount = 0;
      let failCount = 0;

      for (const product of selectedProducts) {
        try {
          const result = await dispatch(updateProduct({ 
            id: product._id, 
            productData: updateData 
          }));
          if (result.type === 'products/update/fulfilled') {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} product(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to update ${failCount} product(s)`);
      }
      
      setSelectedProducts([]);
      dispatch(fetchProducts());
    } catch (error) {
      toast.error('Bulk status update failed');
    } finally {
      setIsBulkProcessing(false);
    }
  }, [selectedProducts, dispatch]);

  const handleBulkExport = useCallback(() => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    try {
      const exportData = selectedProducts.map(product => ({
        'Product ID': product._id,
        'Name': product.name,
        'Brand': product.brand || 'N/A',
        'Category': product.category?.name || 'N/A',
        'Price': product.price || 0,
        'Stock': product.stock || 0,
        'Status': product.isActive ? 'Active' : 'Inactive',
        'Featured': product.featured ? 'Yes' : 'No',
        'Gender': product.gender || 'N/A',
        'Type': product.footwearType || 'N/A',
        'Created At': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      XLSX.writeFile(wb, `products-export-${Date.now()}.xlsx`);
      
      toast.success(`Exported ${selectedProducts.length} product(s) to Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export products');
    }
  }, [selectedProducts]);

  const handleBulkExportPDF = useCallback(() => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    try {
      exportProductsToPDF(selectedProducts);
      toast.success(`Exported ${selectedProducts.length} product(s) to PDF`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export products to PDF');
    }
  }, [selectedProducts]);

  const columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (row) => (
        <LazyImage
          src={row.image || row.images?.[0] || '/placeholder.png'}
          alt={row.name}
          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
        />
      ),
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{row.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.brand || 'StepSeva'}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{row.category?.name || 'N/A'}</p>
          <div className="flex gap-1 mt-1">
            {row.gender && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded capitalize">
                {row.gender}
              </span>
            )}
            {row.footwearType && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded capitalize">
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
          <p className="font-semibold text-gray-800 dark:text-white">₹{row.price?.toLocaleString('en-IN')}</p>
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
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : row.stock > 0
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
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
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
          {row.featured && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
              Featured
            </span>
          )}
        </div>
      ),
    },
  ];

  // Handle bulk import
  const handleBulkImport = async (importData) => {
    try {
      // Process imported data
      const processedProducts = importData.map((row) => ({
        name: row.name || row.Name,
        description: row.description || row.Description || '',
        price: parseFloat(row.price || row.Price || 0),
        stock: parseInt(row.stock || row.Stock || 0),
        category: row.category || row.Category,
        brand: row.brand || row.Brand || 'StepSeva',
        gender: row.gender || row.Gender || 'unisex',
        footwearType: row.footwearType || row['Footwear Type'] || 'other',
        sizes: row.sizes ? (Array.isArray(row.sizes) ? row.sizes : row.sizes.split(',')) : [],
        isActive: row.isActive !== false && row['Is Active'] !== false,
        featured: row.featured || row.Featured || false,
      }));

      // Import products (you'll need to implement this in your API)
      for (const product of processedProducts) {
        await dispatch(createProduct(product));
      }

      toast.success(`Successfully imported ${processedProducts.length} products`);
      dispatch(fetchProducts());
    } catch (error) {
      throw new Error('Failed to import products: ' + error.message);
    }
  };

  if (loading && !products.length) {
    return (
      <div className="space-y-6 w-full">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
        </div>
        <TableSkeleton rows={10} columns={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Products Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
            onClick={() => setShowBulkImport(true)}
            variant="outline"
            icon={<Upload size={20} />}
            className="whitespace-nowrap"
            aria-label="Bulk import products"
          >
            <span className="hidden sm:inline">Import</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            icon={<Plus size={20} />}
            className="whitespace-nowrap"
            aria-label="Add new product"
          >
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Products</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary dark:text-primary-300 hover:text-secondary font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</label>
              <select
                value={filters.stock}
                onChange={(e) => handleFilterChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (≤10)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={filters.footwearType}
                onChange={(e) => handleFilterChange('footwearType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedProducts.length}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkExport={handleBulkExport}
        onBulkExportPDF={handleBulkExportPDF}
        showDelete={true}
        showStatusUpdate={true}
        showExport={true}
        showExportPDF={true}
        availableStatuses={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'featured', label: 'Featured' },
        ]}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="mt-2 text-sm underline hover:no-underline text-red-600 dark:text-red-400"
          >
            Try again
          </button>
        </div>
      )}

      {/* Products Table */}
      {filteredProducts.length === 0 && !loading ? (
        <EmptyState
          icon="products"
          title="No products found"
          description={searchQuery ? `No products match "${searchQuery}"` : "Get started by adding your first product"}
          actionLabel="Add Product"
          onAction={() => setIsModalOpen(true)}
          searchQuery={searchQuery}
        />
      ) : (
        <Table
          columns={columns}
          data={paginatedProducts}
          enableBulkSelection={true}
          onSelectionChange={handleSelectionChange}
          getRowId={(row) => row._id}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(row)}
                icon={<Edit2 size={16} />}
                className="whitespace-nowrap"
                aria-label={`Edit ${row.name}`}
              >
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(row._id)}
                icon={<Trash2 size={16} />}
                className="whitespace-nowrap"
                aria-label={`Delete ${row.name}`}
              >
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden">Del</span>
              </Button>
            </div>
          )}
        />
      )}

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

      {/* Bulk Import Modal */}
      <BulkImport
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImport}
        validationRules={[
          { field: 'name', required: true, minLength: 3 },
          { field: 'price', required: true, type: 'number' },
          { field: 'stock', required: true, type: 'number' },
          { field: 'category', required: true },
        ]}
        sampleData={[
          {
            name: 'Sample Product',
            description: 'Product description',
            price: 999,
            stock: 50,
            category: 'Category Name',
            brand: 'StepSeva',
            gender: 'unisex',
            'Footwear Type': 'casual',
            sizes: '7,8,9,10',
            'Is Active': true,
            Featured: false,
          },
        ]}
      />
    </div>
  );
};

export default Products;

