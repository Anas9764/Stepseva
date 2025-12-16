import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../store/slices/categorySlice';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiUrl } from '../utils/apiConfig';

const schema = yup.object().shape({
  name: yup.string().required('Category name is required'),
  description: yup.string(),
});

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleEdit = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
    });
    setImagePreview(category.image || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const result = await dispatch(deleteCategory(id));
      if (result.type === 'categories/delete/fulfilled') {
        toast.success('Category deleted successfully');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImagePreview('');
    setImageFile(null);
    reset();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = editingCategory?.image || '';

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.error('Failed to upload image');
          return;
        }
      }

      const categoryData = {
        ...data,
        image: imageUrl,
      };

      let result;
      if (editingCategory) {
        result = await dispatch(
          updateCategory({ id: editingCategory._id, categoryData })
        );
      } else {
        result = await dispatch(createCategory(categoryData));
      }

      if (result.type.includes('fulfilled')) {
        toast.success(
          editingCategory
            ? 'Category updated successfully'
            : 'Category created successfully'
        );
        handleCloseModal();
      } else if (result.type.includes('rejected')) {
        const errorMessage = result.payload || 'Failed to save category';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  // Filter and paginate categories
  const filteredCategories = useMemo(() => {
    if (searchQuery) {
      return categories.filter(
        (cat) =>
          cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return categories;
  }, [searchQuery, categories]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (row) => (
        <img
          src={row.image || '/placeholder.png'}
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
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <span className="line-clamp-2 text-sm text-gray-600">{row.description || 'No description'}</span>
      ),
    },
    {
      header: 'Products',
      accessor: 'productCount',
      render: (row) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {row.productCount || 0} products
        </span>
      ),
    },
  ];

  if (loading && !categories.length) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories Management</h1>
          <p className="text-gray-600 mt-1">
            Manage product categories • {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={20} />}>
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="w-full sm:w-96">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
        />
      </div>

      {/* Categories Table */}
      <Table
        columns={columns}
        data={paginatedCategories}
        actions={(row) => (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(row)}
              icon={<Edit2 size={16} />}
            >
              Edit
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
        emptyMessage="No categories found"
      />

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCategories.length}
          showInfo={true}
          align="right"
        />
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-lavender-500 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm text-gray-600">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              placeholder="Enter category description"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;

