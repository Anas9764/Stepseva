import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createProduct, updateProduct } from '../store/slices/productSlice';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiUrl } from '../utils/apiConfig';

const schema = yup.object().shape({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  stock: yup.number().integer().min(0, 'Stock cannot be negative').required('Stock is required'),
  category: yup.string().required('Category is required'),
  brand: yup.string(),
  gender: yup.string().required('Gender category is required'),
  footwearType: yup.string().required('Footwear type is required'),
  sizes: yup.array().min(1, 'At least one size is required').required('Sizes are required'),
  isActive: yup.boolean(),
  featured: yup.boolean(),
});

const ProductForm = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const { loading } = useSelector((state) => state.products);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [imageFile, setImageFile] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState(product?.sizes || []);
  const [sizeStock, setSizeStock] = useState(() => {
    if (product?.sizeStock) {
      // Convert Map or object to plain object
      if (product.sizeStock instanceof Map) {
        return Object.fromEntries(product.sizeStock);
      }
      return product.sizeStock;
    }
    return {};
  });
  const [isVariant, setIsVariant] = useState(product?.isVariant || false);
  const [parentProducts, setParentProducts] = useState([]);
  
  // Available sizes for footwear
  const allSizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
  
  // Gender options
  const genderOptions = [
    { value: 'ladies', label: 'Ladies' },
    { value: 'gents', label: 'Gents' },
    { value: 'kids', label: 'Kids' },
    { value: 'unisex', label: 'Unisex' },
  ];
  
  // Footwear type options
  const footwearTypeOptions = [
    { value: 'sneakers', label: 'Sneakers' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'sports', label: 'Sports' },
    { value: 'sandals', label: 'Sandals' },
    { value: 'boots', label: 'Boots' },
    { value: 'flip-flops', label: 'Flip-Flops' },
    { value: 'slippers', label: 'Slippers' },
    { value: 'other', label: 'Other' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      category: product?.category?._id || '',
      brand: product?.brand || 'StepSeva',
      gender: product?.gender || '',
      footwearType: product?.footwearType || '',
      sizes: product?.sizes || [],
      isActive: product?.isActive !== false,
      featured: product?.featured || false,
    },
  });

  useEffect(() => {
    // Fetch parent products for variant dropdown
    const fetchParentProducts = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/products?limit=1000`);
        const data = await response.json();
        if (data.success) {
          // Filter out variants and current product
          const parents = data.data.filter(
            (p) => !p.isVariant && p._id !== product?._id
          );
          setParentProducts(parents);
        }
      } catch (error) {
        console.error('Error fetching parent products:', error);
      }
    };
    fetchParentProducts();
  }, [product]);

  useEffect(() => {
    if (product) {
      const productSizes = product.sizes || [];
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category?._id,
        brand: product.brand || 'StepSeva',
        gender: product.gender || '',
        footwearType: product.footwearType || '',
        sizes: productSizes,
        isActive: product.isActive !== false,
        featured: product.featured || false,
        parentProduct: product.parentProduct?._id || product.parentProduct || '',
        variantColor: product.variantColor || '',
        variantName: product.variantName || '',
      });
      setImagePreview(product.image);
      setSelectedSizes(productSizes);
      setIsVariant(product.isVariant || false);
      setValue('sizes', productSizes, { shouldValidate: true });
      if (product.sizeStock) {
        if (product.sizeStock instanceof Map) {
          setSizeStock(Object.fromEntries(product.sizeStock));
        } else {
          setSizeStock(product.sizeStock);
        }
      } else {
        setSizeStock({});
      }
    } else {
      // Reset for new product
      setSelectedSizes([]);
      setValue('sizes', [], { shouldValidate: false });
    }
  }, [product, reset, setValue]);
  
  const toggleSize = (size) => {
    let newSizes;
    if (selectedSizes.includes(size)) {
      newSizes = selectedSizes.filter(s => s !== size);
      setSelectedSizes(newSizes);
      // Remove from sizeStock when size is deselected
      const newSizeStock = { ...sizeStock };
      delete newSizeStock[size];
      setSizeStock(newSizeStock);
    } else {
      newSizes = [...selectedSizes, size];
      setSelectedSizes(newSizes);
      // Initialize stock to 0 for new size
      setSizeStock({ ...sizeStock, [size]: 0 });
    }
    // Sync with form
    setValue('sizes', newSizes, { shouldValidate: true });
  };
  
  const updateSizeStock = (size, stock) => {
    const stockValue = parseInt(stock) || 0;
    const totalStock = watch('stock') || 0;
    
    // Validate that size-specific stock doesn't exceed total stock
    if (stockValue > totalStock) {
      toast.error(`Size ${size} stock cannot exceed total stock (${totalStock})`);
      return;
    }
    
    setSizeStock({ ...sizeStock, [size]: stockValue });
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

  const uploadToCloudinary = async (file) => {
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
      // Validate sizes before submission
      if (!selectedSizes || selectedSizes.length === 0) {
        toast.error('Please select at least one size');
        setValue('sizes', [], { shouldValidate: true });
        return;
      }

      // Validate size-specific stock doesn't exceed total stock
      const totalStock = data.stock || 0;
      for (const size of selectedSizes) {
        const sizeStockValue = sizeStock[size];
        if (sizeStockValue !== undefined && sizeStockValue !== null && sizeStockValue > totalStock) {
          toast.error(`Size ${size} stock (${sizeStockValue}) cannot exceed total stock (${totalStock})`);
          return;
        }
      }

      let imageUrl = product?.image || '';

      // Upload image if a new one was selected
      if (imageFile) {
        const uploadedUrl = await uploadToCloudinary(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.error('Failed to upload image');
          return;
        }
      }

      const productData = {
        ...data,
        image: imageUrl,
        sizes: selectedSizes,
        sizeStock: sizeStock, // Include size-specific stock
        isVariant: isVariant,
        parentProduct: isVariant && data.parentProduct ? data.parentProduct : null,
        variantColor: isVariant ? data.variantColor : null,
        variantName: isVariant ? data.variantName : null,
      };

      let result;
      if (product) {
        result = await dispatch(updateProduct({ id: product._id, productData }));
      } else {
        result = await dispatch(createProduct(productData));
      }

      if (result.type.includes('fulfilled')) {
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        onClose();
      } else if (result.type.includes('rejected')) {
        const errorMessage = result.payload || 'Failed to save product';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
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
            <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
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

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter product description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              {...register('price')}
              type="number"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock *
            </label>
            <input
              {...register('stock')}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
            )}
          </div>
        </div>

        {/* Category and Brand */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              {...register('brand')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter brand name"
            />
          </div>
        </div>

        {/* Gender and Footwear Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              {...register('gender')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Gender</option>
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footwear Type *
            </label>
            <select
              {...register('footwearType')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Type</option>
              {footwearTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.footwearType && (
              <p className="mt-1 text-sm text-red-600">{errors.footwearType.message}</p>
            )}
          </div>
        </div>

        {/* Sizes Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Sizes *
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {allSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedSizes.includes(size)
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:border-primary text-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {errors.sizes && (
            <p className="mt-1 text-sm text-red-600">{errors.sizes.message}</p>
          )}
          {selectedSizes.length === 0 && (
            <p className="text-sm text-amber-600">Please select at least one size</p>
          )}
        </div>

        {/* Size-Specific Stock */}
        {selectedSizes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock by Size (Optional - leave empty to use total stock)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {selectedSizes.map((size) => (
                <div key={size}>
                  <label className="block text-xs text-gray-600 mb-1">Size {size}</label>
                  <input
                    type="number"
                    min="0"
                    value={sizeStock[size] || ''}
                    onChange={(e) => updateSizeStock(size, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              If size-specific stock is provided, it will override the total stock field.
            </p>
          </div>
        )}

        {/* Variant Settings */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={isVariant}
              onChange={(e) => setIsVariant(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label className="text-sm font-medium text-gray-700">
              This is a product variant (color option)
            </label>
          </div>

          {isVariant && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Product *
                </label>
                <select
                  {...register('parentProduct')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Parent Product</option>
                  {parentProducts.map((parent) => (
                    <option key={parent._id} value={parent._id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
                {errors.parentProduct && (
                  <p className="mt-1 text-sm text-red-600">{errors.parentProduct.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Color
                  </label>
                  <input
                    {...register('variantColor')}
                    type="text"
                    placeholder="e.g., Red, Blue, Black"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Name
                  </label>
                  <input
                    {...register('variantName')}
                    type="text"
                    placeholder="e.g., Red Variant"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Variants share the same product name but have different colors. All variants will be linked together on the product page.
              </p>
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              {...register('isActive')}
              type="checkbox"
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label className="text-sm text-gray-700">
              Product is active and visible to customers
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              {...register('featured')}
              type="checkbox"
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label className="text-sm text-gray-700">
              <span className="font-medium">Featured Product</span> - Display on homepage
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
          <Button type="button" variant="secondary" onClick={onClose} className="min-w-[100px]">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="min-w-[150px]">
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;

