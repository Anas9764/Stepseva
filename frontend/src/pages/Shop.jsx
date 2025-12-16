import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]); // Products from API
  const [categories, setCategories] = useState(['All']);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 12; // Backend pagination limit
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    footwearType: searchParams.get('footwearType') || '',
    size: '',
    color: '',
    rating: '',
    discount: '',
    minPrice: 0,
    maxPrice: 10000,
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    size: true,
    color: true,
    gender: true,
    type: true,
    rating: true,
    discount: true,
    price: true,
  });

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    fetchCategories();
    // Fetch initial sizes and colors (without filters)
    fetchInitialFilters();
  }, []);

  // Fetch products when filters or page changes (with debounced search)
  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, filters.category, filters.gender, filters.footwearType, filters.size, filters.color, filters.rating, filters.discount, filters.minPrice, filters.maxPrice, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      // Handle both response structures: response.data.data or response.data
      const dbCategories = response?.data?.data || response?.data || response || [];
      const categoryNames = ['All', ...(Array.isArray(dbCategories) ? dbCategories.map((cat) => cat.name || cat) : [])];
      setCategories(categoryNames.length > 1 ? categoryNames : ['All', 'Ladies Footwear', 'Gents Footwear', 'Kids Footwear', 'Sneakers', 'Casual Shoes', 'Formal Shoes', 'Sports Shoes', 'Sandals', 'Boots']);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories(['All', 'Ladies Footwear', 'Gents Footwear', 'Kids Footwear', 'Sneakers', 'Casual Shoes', 'Formal Shoes', 'Sports Shoes', 'Sandals', 'Boots']);
    }
  };

  // Fetch initial filters (sizes and colors) without pagination
  const fetchInitialFilters = async () => {
    try {
      const response = await productService.getAllProducts({ limit: 1000 });
      const productsData = response?.data?.data || response?.data || [];
      const productsArray = Array.isArray(productsData) ? productsData : [];
      
      // Extract unique sizes
      const sizes = Array.from(new Set(productsArray.flatMap((product) => product.sizes || []))).sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });
      setAvailableSizes(['All', ...sizes]);
      
      // Extract unique colors
      const colors = Array.from(new Set(productsArray.map((product) => product.variantColor).filter(Boolean))).sort();
      setAvailableColors(['All', ...colors]);
    } catch (error) {
      console.error('Error fetching initial filters:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Build params with ALL filters applied in a single API call
      const params = {
        ...(filters.category && filters.category !== 'All' && { category: filters.category }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.gender && filters.gender !== 'All' && { gender: filters.gender }),
        ...(filters.footwearType && filters.footwearType !== 'All' && { footwearType: filters.footwearType }),
        ...(filters.size && filters.size !== 'All' && { size: filters.size }),
        ...(filters.color && filters.color !== 'All' && { color: filters.color }),
        ...(filters.rating && filters.rating !== 'All' && { rating: filters.rating }),
        ...(filters.discount && filters.discount !== 'All' && { discount: filters.discount }),
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // API call with backend pagination
      const response = await productService.getAllProducts(params);
      // Handle both response structures: response.data.data or response.data
      const productsData = response?.data?.data || response?.data || [];
      const productsArray = Array.isArray(productsData) ? productsData : [];
      
      setAllProducts(productsArray);
      
      // Update pagination info from backend
      if (response?.data?.pagination) {
        setTotalPages(response.data.pagination.pages || 1);
        setTotalProducts(response.data.pagination.total || productsArray.length);
      } else if (response?.data?.total !== undefined) {
        const total = response.data.total || productsArray.length;
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setTotalProducts(productsArray.length);
        setTotalPages(1);
      }
      
      // Update URL with current page
      const newParams = new URLSearchParams();
      if (filters.category && filters.category !== 'All') newParams.set('category', filters.category);
      if (currentPage > 1) newParams.set('page', currentPage.toString());
      setSearchParams(newParams);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, currentPage, itemsPerPage, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Reset to page 1 when filters change (except for search which is debounced)
    if (key !== 'search') {
      setCurrentPage(1);
    }
    if (key === 'category') {
      setSearchParams(value && value !== 'All' ? { category: value } : {});
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      footwearType: '',
      size: '',
      color: '',
      rating: '',
      discount: '',
      minPrice: 0,
      maxPrice: 10000,
      search: '',
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  // Page change handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.gender) count++;
    if (filters.footwearType) count++;
    if (filters.size) count++;
    if (filters.color) count++;
    if (filters.rating) count++;
    if (filters.discount) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 10000) count++;
    return count;
  }, [filters]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter Section Component
  const FilterSection = ({ title, children, sectionKey, defaultExpanded = true }) => {
    const isExpanded = expandedSections[sectionKey] ?? defaultExpanded;
    return (
      <div className="mb-4 sm:mb-5 border-b border-gray-100 pb-4 sm:pb-5 last:border-b-0 last:pb-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
          <FiChevronDown
            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            size={18}
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/30">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-secondary mb-4 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Shop Footwear
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">Explore our curated collection of premium footwear for Ladies, Gents, and Kids</p>
          </motion.div>
        </div>

      {/* Search Bar */}
      <div className="mb-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search for shoes, sneakers, sandals..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm hover:shadow-md transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold transform hover:scale-105"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden relative bg-white border-2 border-primary text-primary px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-primary hover:text-white transition-all font-semibold flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm hover:shadow-md"
          >
            <FiFilter size={18} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </motion.form>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Filters Sidebar - Desktop Only */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:w-72 flex-shrink-0"
        >
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-secondary">Filters</h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-primary hover:text-secondary font-semibold transition-colors hover:underline"
                >
                  Clear All ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Category Filter */}
            <FilterSection title="Category" sectionKey="category">
              <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar-thin">
                {categories.map((category) => {
                  const categoryName = typeof category === 'string' ? category : category.name || category;
                  const isSelected = filters.category === categoryName || (categoryName === 'All' && !filters.category);
                  return (
                    <label
                      key={categoryName}
                      className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={isSelected}
                        onChange={() => handleFilterChange('category', categoryName === 'All' ? '' : categoryName)}
                        className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-sm flex-1">{categoryName}</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Size Filter */}
            <FilterSection title="Size - UK/India" sectionKey="size">
              <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar-thin">
                {availableSizes.map((size) => (
                  <label
                    key={size}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                      filters.size === size || (size === 'All' && !filters.size)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      checked={filters.size === size || (size === 'All' && !filters.size)}
                      onChange={() => handleFilterChange('size', size === 'All' ? '' : size)}
                      className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm flex-1">{size}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Color Filter */}
            <FilterSection title="Color" sectionKey="color">
              <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar-thin">
                {availableColors.map((color) => (
                  <label
                    key={color}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                      filters.color === color || (color === 'All' && !filters.color)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="color"
                      checked={filters.color === color || (color === 'All' && !filters.color)}
                      onChange={() => handleFilterChange('color', color === 'All' ? '' : color)}
                      className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm capitalize flex-1">{color}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Rating Filter */}
            <FilterSection title="Rating" sectionKey="rating">
              <div className="space-y-1.5 sm:space-y-2">
                {['All', '4+', '3+', '2+', '1+'].map((rating) => (
                  <label
                    key={rating}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                      filters.rating === rating || (rating === 'All' && !filters.rating)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating || (rating === 'All' && !filters.rating)}
                      onChange={() => handleFilterChange('rating', rating === 'All' ? '' : rating)}
                      className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm flex items-center gap-1 flex-1">
                      {rating !== 'All' && (
                        <>
                          {'⭐'.repeat(parseInt(rating))}
                          <span className="text-gray-500">& above</span>
                        </>
                      )}
                      {rating === 'All' && <span>All Ratings</span>}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Discount Filter */}
            <FilterSection title="Discount" sectionKey="discount">
              <div className="space-y-1.5 sm:space-y-2">
                {['All', '10%+', '20%+', '30%+', '50%+'].map((discount) => (
                  <label
                    key={discount}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                      filters.discount === discount || (discount === 'All' && !filters.discount)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="discount"
                      checked={filters.discount === discount || (discount === 'All' && !filters.discount)}
                      onChange={() => handleFilterChange('discount', discount === 'All' ? '' : discount)}
                      className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm flex-1">{discount === 'All' ? 'All Products' : `${discount} Off`}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Gender Filter */}
            <FilterSection title="Gender" sectionKey="gender">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                {['All', 'Ladies', 'Gents', 'Kids', 'Unisex'].map((gender) => (
                  <label
                    key={gender}
                    className={`flex items-center justify-center space-x-2 cursor-pointer p-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                      filters.gender === gender.toLowerCase() || (gender === 'All' && !filters.gender)
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={filters.gender === gender.toLowerCase() || (gender === 'All' && !filters.gender)}
                      onChange={() => handleFilterChange('gender', gender === 'All' ? '' : gender.toLowerCase())}
                      className="hidden"
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Footwear Type Filter */}
            <FilterSection title="Occasion" sectionKey="type">
              <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1 custom-scrollbar-thin">
                {['All', 'Sneakers', 'Casual', 'Formal', 'Sports', 'Sandals', 'Boots', 'Flip-Flops', 'Slippers', 'Other'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                      filters.footwearType === type.toLowerCase() || (type === 'All' && !filters.footwearType)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="footwearType"
                      checked={filters.footwearType === type.toLowerCase() || (type === 'All' && !filters.footwearType)}
                      onChange={() => handleFilterChange('footwearType', type === 'All' ? '' : type.toLowerCase())}
                      className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm flex-1">{type}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" sectionKey="price">
              <div className="space-y-3 sm:space-y-4 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm text-gray-600 font-medium">Min</label>
                    <span className="text-xs sm:text-sm font-bold text-primary">₹{filters.minPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm text-gray-600 font-medium">Max</label>
                    <span className="text-xs sm:text-sm font-bold text-primary">₹{filters.maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </FilterSection>
          </div>
        </motion.aside>

        {/* Mobile & Tablet Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              
              {/* Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-[85vw] sm:w-96 max-w-sm bg-white shadow-2xl z-50 lg:hidden overflow-y-auto custom-scrollbar"
              >
                <div className="p-5 sm:p-6">
                  {/* Mobile/Tablet Header */}
                  <div className="flex justify-between items-center mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-secondary">Filters</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiX size={24} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Active Filters Count */}
                  {activeFiltersCount > 0 && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-primary">
                          {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
                        </span>
                        <button
                          onClick={clearFilters}
                          className="text-xs text-primary hover:text-secondary font-semibold transition-colors underline"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Category Filter */}
                  <FilterSection title="Category" sectionKey="category">
                    <div className="space-y-1.5 sm:space-y-2">
                      {categories.map((category) => {
                        const categoryName = typeof category === 'string' ? category : category.name || category;
                        const isSelected = filters.category === categoryName || (categoryName === 'All' && !filters.category);
                        return (
                          <label
                            key={categoryName}
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="category-mobile"
                              checked={isSelected}
                              onChange={() => handleFilterChange('category', categoryName === 'All' ? '' : categoryName)}
                              className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                            />
                            <span className="text-sm flex-1">{categoryName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FilterSection>

                  {/* Size Filter */}
                  <FilterSection title="Size - UK/India" sectionKey="size">
                    <div className="space-y-1.5 sm:space-y-2">
                      {availableSizes.map((size) => (
                        <label
                          key={size}
                          className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                            filters.size === size || (size === 'All' && !filters.size)
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="size-mobile"
                            checked={filters.size === size || (size === 'All' && !filters.size)}
                            onChange={() => handleFilterChange('size', size === 'All' ? '' : size)}
                            className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-sm flex-1">{size}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Color Filter */}
                  <FilterSection title="Color" sectionKey="color">
                    <div className="space-y-1.5 sm:space-y-2">
                      {availableColors.map((color) => (
                        <label
                          key={color}
                          className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                            filters.color === color || (color === 'All' && !filters.color)
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="color-mobile"
                            checked={filters.color === color || (color === 'All' && !filters.color)}
                            onChange={() => handleFilterChange('color', color === 'All' ? '' : color)}
                            className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-sm capitalize flex-1">{color}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Rating Filter */}
                  <FilterSection title="Rating" sectionKey="rating">
                    <div className="space-y-1.5 sm:space-y-2">
                      {['All', '4+', '3+', '2+', '1+'].map((rating) => (
                        <label
                          key={rating}
                          className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                            filters.rating === rating || (rating === 'All' && !filters.rating)
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="rating-mobile"
                            checked={filters.rating === rating || (rating === 'All' && !filters.rating)}
                            onChange={() => handleFilterChange('rating', rating === 'All' ? '' : rating)}
                            className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-sm flex items-center gap-1 flex-1">
                            {rating !== 'All' && (
                              <>
                                {'⭐'.repeat(parseInt(rating))}
                                <span className="text-gray-500">& above</span>
                              </>
                            )}
                            {rating === 'All' && <span>All Ratings</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Discount Filter */}
                  <FilterSection title="Discount" sectionKey="discount">
                    <div className="space-y-1.5 sm:space-y-2">
                      {['All', '10%+', '20%+', '30%+', '50%+'].map((discount) => (
                        <label
                          key={discount}
                          className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                            filters.discount === discount || (discount === 'All' && !filters.discount)
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="discount-mobile"
                            checked={filters.discount === discount || (discount === 'All' && !filters.discount)}
                            onChange={() => handleFilterChange('discount', discount === 'All' ? '' : discount)}
                            className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-sm flex-1">{discount === 'All' ? 'All Products' : `${discount} Off`}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Gender Filter */}
                  <FilterSection title="Gender" sectionKey="gender">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['All', 'Ladies', 'Gents', 'Kids', 'Unisex'].map((gender) => (
                        <label
                          key={gender}
                          className={`flex items-center justify-center space-x-2 cursor-pointer p-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            filters.gender === gender.toLowerCase() || (gender === 'All' && !filters.gender)
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="gender-mobile"
                            checked={filters.gender === gender.toLowerCase() || (gender === 'All' && !filters.gender)}
                            onChange={() => handleFilterChange('gender', gender === 'All' ? '' : gender.toLowerCase())}
                            className="hidden"
                          />
                          <span>{gender}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Footwear Type Filter */}
                  <FilterSection title="Occasion" sectionKey="type">
                    <div className="space-y-1.5 sm:space-y-2">
                      {['All', 'Sneakers', 'Casual', 'Formal', 'Sports', 'Sandals', 'Boots', 'Flip-Flops', 'Slippers', 'Other'].map((type) => (
                        <label
                          key={type}
                          className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${
                            filters.footwearType === type.toLowerCase() || (type === 'All' && !filters.footwearType)
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="footwearType-mobile"
                            checked={filters.footwearType === type.toLowerCase() || (type === 'All' && !filters.footwearType)}
                            onChange={() => handleFilterChange('footwearType', type === 'All' ? '' : type.toLowerCase())}
                            className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-sm flex-1">{type}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Price Range */}
                  <FilterSection title="Price Range" sectionKey="price">
                    <div className="space-y-3 sm:space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs sm:text-sm text-gray-600 font-medium">Min</label>
                          <span className="text-xs sm:text-sm font-bold text-primary">₹{filters.minPrice.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs sm:text-sm text-gray-600 font-medium">Max</label>
                          <span className="text-xs sm:text-sm font-bold text-primary">₹{filters.maxPrice.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </FilterSection>

                  {/* Apply Button for Mobile/Tablet */}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold mt-4"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Loading...
                </span>
              ) : (
                <span className="text-secondary font-semibold">
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
                </span>
              )}
            </p>
            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    {filters.category}
                  </span>
                )}
                {filters.gender && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    {filters.gender}
                  </span>
                )}
                {filters.footwearType && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    {filters.footwearType}
                  </span>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
            </div>
          ) : allProducts.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {allProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} showActions={false} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Component */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalProducts}
                  showInfo={true}
                  align="right"
                  className="mt-8"
                />
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200"
            >
              <div className="text-6xl mb-4">👟</div>
              <p className="text-gray-600 text-lg font-medium mb-2">No products found</p>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters to see more results</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1E73D9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0F2C4C;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Shop;

