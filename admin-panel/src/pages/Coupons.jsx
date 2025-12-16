import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../store/slices/couponSlice';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  code: yup
    .string()
    .required('Coupon code is required')
    .min(3, 'Code must be at least 3 characters')
    .matches(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  discountType: yup.string().required('Discount type is required'),
  discountValue: yup
    .number()
    .positive('Discount value must be positive')
    .required('Discount value is required'),
  minPurchase: yup.number().min(0, 'Minimum purchase cannot be negative'),
  expiryDate: yup.date().required('Expiry date is required'),
  usageLimit: yup.number().integer().min(1, 'Usage limit must be at least 1'),
  isActive: yup.boolean(),
});

const Coupons = () => {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector((state) => state.coupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const discountType = watch('discountType');

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || 0,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || 1,
      isActive: coupon.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      const result = await dispatch(deleteCoupon(id));
      if (result.type === 'coupons/delete/fulfilled') {
        toast.success('Coupon deleted successfully');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    reset({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchase: 0,
      expiryDate: '',
      usageLimit: 1,
      isActive: true,
    });
  };

  const onSubmit = async (data) => {
    try {
      const couponData = {
        ...data,
        code: data.code.toUpperCase(),
      };

      let result;
      if (editingCoupon) {
        result = await dispatch(updateCoupon({ id: editingCoupon._id, couponData }));
      } else {
        result = await dispatch(createCoupon(couponData));
      }

      if (result.type.includes('fulfilled')) {
        toast.success(
          editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully'
        );
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-lavender-500" />
          <span className="font-mono font-bold text-lavender-600">{row.code}</span>
        </div>
      ),
    },
    {
      header: 'Discount',
      accessor: 'discountValue',
      render: (row) =>
        row.discountType === 'percentage'
          ? `${row.discountValue}%`
          : `$${row.discountValue}`,
    },
    {
      header: 'Min Purchase',
      accessor: 'minPurchase',
      render: (row) => (row.minPurchase ? `$${row.minPurchase}` : 'No minimum'),
    },
    {
      header: 'Usage',
      accessor: 'usageCount',
      render: (row) => `${row.usageCount || 0} / ${row.usageLimit || '∞'}`,
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate',
      render: (row) => new Date(row.expiryDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => {
        const isExpired = new Date(row.expiryDate) < new Date();
        const isLimitReached = row.usageCount >= row.usageLimit;
        
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              row.isActive && !isExpired && !isLimitReached
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isExpired
              ? 'Expired'
              : isLimitReached
              ? 'Limit Reached'
              : row.isActive
              ? 'Active'
              : 'Inactive'}
          </span>
        );
      },
    },
  ];

  if (loading && !coupons.length) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount codes and promotions</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={20} />}>
          Add Coupon
        </Button>
      </div>

      {/* Coupons Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Coupons</p>
          <h3 className="text-3xl font-bold text-gray-800">{coupons.length}</h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Active Coupons</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {coupons.filter((c) => c.isActive && new Date(c.expiryDate) > new Date()).length}
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Uses</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)}
          </h3>
        </div>
      </div>

      {/* Coupons Table */}
      <Table
        columns={columns}
        data={coupons}
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
        emptyMessage="No coupons found"
      />

      {/* Coupon Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code *
            </label>
            <input
              {...register('code')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent uppercase font-mono"
              placeholder="ECLORA10"
              maxLength={20}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Use uppercase letters and numbers only
            </p>
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                {...register('discountType')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value *
              </label>
              <input
                {...register('discountValue')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder={discountType === 'percentage' ? '10' : '10.00'}
              />
              {errors.discountValue && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.discountValue.message}
                </p>
              )}
            </div>
          </div>

          {/* Min Purchase and Usage Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Purchase ($)
              </label>
              <input
                {...register('minPurchase')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit *
              </label>
              <input
                {...register('usageLimit')}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="100"
              />
              {errors.usageLimit && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.usageLimit.message}
                </p>
              )}
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date *
            </label>
            <input
              {...register('expiryDate')}
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              {...register('isActive')}
              type="checkbox"
              className="w-4 h-4 text-lavender-600 border-gray-300 rounded focus:ring-lavender-500"
            />
            <label className="text-sm text-gray-700">
              Coupon is active and can be used by customers
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;

