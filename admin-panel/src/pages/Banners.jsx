import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../store/slices/bannerSlice';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiUrl } from '../utils/apiConfig';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  subtitle: yup.string(),
  ctaText: yup.string(),
  ctaLink: yup.string(),
  placement: yup.string(),
  startAt: yup.date().nullable(),
  endAt: yup.date().nullable(),
  priority: yup.number().integer().min(0, 'Priority must be positive'),
  isActive: yup.boolean(),
});

const PLACEMENT_OPTIONS = [
  { value: 'b2b_home_hero', label: 'B2B Home Hero' },
  { value: 'b2c_home_hero', label: 'B2C Home Hero' },
  { value: 'global', label: 'Global (all sites)' },
];

const Banners = () => {
  const location = useLocation();
  // Determine if we're in B2B or B2C section
  const isB2BSection = location.pathname.startsWith('/b2b/banners');
  const isB2CSection = location.pathname.startsWith('/b2c/banners');
  const dispatch = useDispatch();
  const { banners, loading } = useSelector((state) => state.banners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Determine section for API calls
  const section = isB2BSection ? 'b2b' : isB2CSection ? 'b2c' : null;

  useEffect(() => {
    console.log('🔄 Fetching banners...');
    dispatch(fetchBanners(section));
  }, [dispatch, section]);

  // Debug: Log banners when they change
  useEffect(() => {
    console.log('📊 Current banners state:', banners);
    console.log('📊 Banners count:', banners?.length || 0);
    console.log('📊 Loading state:', loading);
  }, [banners, loading]);

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      ctaText: banner.ctaText || '',
      ctaLink: banner.ctaLink || '',
      placement: banner.placement || 'global',
      startAt: banner.startAt ? new Date(banner.startAt).toISOString().slice(0, 16) : '',
      endAt: banner.endAt ? new Date(banner.endAt).toISOString().slice(0, 16) : '',
      priority: banner.priority || 0,
      isActive: banner.isActive !== false,
    });
    setImagePreview(banner.image || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      const result = await dispatch(deleteBanner({ id, section }));
      if (result.type === 'banners/delete/fulfilled') {
        toast.success('Banner deleted successfully');
        // Refetch banners to update the list
        dispatch(fetchBanners(section));
      } else if (result.type === 'banners/delete/rejected') {
        toast.error(result.payload || 'Failed to delete banner');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
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
      let imageUrl = editingBanner?.image || '';

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.error('Failed to upload image');
          return;
        }
      }

      // Validate image is provided
      if (!imageUrl || imageUrl.trim() === '') {
        toast.error('Please upload a banner image');
        return;
      }

      const bannerData = {
        title: data.title,
        subtitle: data.subtitle || '',
        image: imageUrl,
        ctaText: data.ctaText || '',
        ctaLink: data.ctaLink || '',
        placement: data.placement || 'global',
        startAt: data.startAt ? new Date(data.startAt).toISOString() : null,
        endAt: data.endAt ? new Date(data.endAt).toISOString() : null,
        priority: data.priority || 0,
        isActive: data.isActive !== false,
        // No bannerType needed - determined by endpoint (/b2b/banners or /b2c/banners)
      };

      let result;
      if (editingBanner) {
        result = await dispatch(updateBanner({ id: editingBanner._id, bannerData, section }));
      } else {
        result = await dispatch(createBanner({ bannerData, section }));
      }

      if (result.type.includes('fulfilled')) {
        toast.success(
          editingBanner ? 'Banner updated successfully' : 'Banner created successfully'
        );
        // Refetch banners to ensure we have the latest data
        dispatch(fetchBanners(section));
        handleCloseModal();
      } else if (result.type.includes('rejected')) {
        const errorMessage = result.payload || 'Failed to save banner';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(error.response?.data?.message || 'Failed to save banner');
    }
  };

  // No need to filter by bannerType anymore since we're using separate endpoints
  const filteredBanners = useMemo(() => {
    return [...banners];
  }, [banners]);

  const columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (row) => (
        <img
          src={row.image || '/placeholder.png'}
          alt={row.title}
          className="w-32 h-20 object-cover rounded-lg"
        />
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Subtitle',
      accessor: 'subtitle',
      render: (row) => row.subtitle || 'N/A',
    },
    {
      header: 'CTA',
      accessor: 'ctaText',
      render: (row) => row.ctaText || 'N/A',
    },
    {
      header: 'Priority',
      accessor: 'priority',
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  if (loading && !banners.length) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Banners</h1>
          <p className="text-gray-600 mt-1">Manage homepage banners</p>
        </div>
        <Button 
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }} 
          icon={<Plus size={20} />}
        >
          Add Banner
        </Button>
      </div>

      {/* Banners Table */}
      <Table
        columns={columns}
        data={filteredBanners}
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
        emptyMessage="No banners found"
      />

      {/* Banner Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? 'Edit Banner' : 'Add New Banner'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image *
            </label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-lavender-500 transition-colors">
                <Upload size={24} className="text-gray-400" />
                <span className="text-gray-600">Upload Banner Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              placeholder="Enter banner title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              {...register('subtitle')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              placeholder="Enter subtitle"
            />
          </div>

          {/* CTA Text and Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Text
              </label>
              <input
                {...register('ctaText')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="Shop Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Link
              </label>
              <input
                {...register('ctaLink')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="/shop"
              />
            </div>
          </div>


          {/* Placement + Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placement
              </label>
              <select
                {...register('placement')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                defaultValue="global"
              >
                {PLACEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Use <span className="font-mono">b2b_home_hero</span> for the business site carousel.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start At (optional)
              </label>
              <input
                {...register('startAt')}
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End At (optional)
              </label>
              <input
                {...register('endAt')}
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Priority
            </label>
            <input
              {...register('priority')}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              {...register('isActive')}
              type="checkbox"
              className="w-4 h-4 text-lavender-600 border-gray-300 rounded focus:ring-lavender-500"
            />
            <label className="text-sm text-gray-700">
              Banner is active and visible on homepage
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingBanner ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Banners;

