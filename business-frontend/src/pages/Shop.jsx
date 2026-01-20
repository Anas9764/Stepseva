import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiGrid, FiSliders, FiCheckSquare, FiSquare, FiSend } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/ProductCard';
import ProductListItem from '../components/ProductListItem';
import BulkInquiryModal from '../components/BulkInquiryModal';
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
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [view, setView] = useState(searchParams.get('view') || 'grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [selectedProductsMap, setSelectedProductsMap] = useState(() => new Map()); // Store full product objects
  const [showBulkInquiry, setShowBulkInquiry] = useState(false);
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

  const fetchCategories = useCallback(async () => {
    try {
      const dbCategories = await categoryService.getAllCategories();
      console.log('📦 Shop Categories extracted:', dbCategories);
      const categoryNames = ['All', ...(Array.isArray(dbCategories) ? dbCategories.map((cat) => cat.name || cat) : [])];
      setCategories(categoryNames.length > 1 ? categoryNames : ['All', 'Ladies Footwear', 'Gents Footwear', 'Kids Footwear', 'Sneakers', 'Casual Shoes', 'Formal Shoes', 'Sports Shoes', 'Sandals', 'Boots']);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories(['All', 'Ladies Footwear', 'Gents Footwear', 'Kids Footwear', 'Sneakers', 'Casual Shoes', 'Formal Shoes', 'Sports Shoes', 'Sandals', 'Boots']);
    }
  }, []);

  // Fetch initial filters (sizes and colors) without pagination
  const fetchInitialFilters = useCallback(async () => {
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
  }, []);

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
        ...(sortBy && sortBy !== 'relevance' && { sort: sortBy }),
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
      if (sortBy && sortBy !== 'relevance') newParams.set('sort', sortBy);
      if (view && view !== 'grid') newParams.set('view', view);
      setSearchParams(newParams);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, currentPage, itemsPerPage, setSearchParams, sortBy, view]);

  useEffect(() => {
    // API-level deduplication handles duplicate calls, so we can call directly
    fetchCategories();
    // Fetch initial sizes and colors (without filters)
    fetchInitialFilters();
  }, [fetchCategories, fetchInitialFilters]);

  // Fetch products when filters or page changes (with debounced search)
  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, filters.category, filters.gender, filters.footwearType, filters.size, filters.color, filters.rating, filters.discount, filters.minPrice, filters.maxPrice, currentPage, sortBy]);

  useEffect(() => {
    const v = searchParams.get('view');
    if (v && v !== view) setView(v);
    const s = searchParams.get('sort');
    if (s && s !== sortBy) setSortBy(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const removeFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setCurrentPage(1);
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.category) chips.push({ key: 'category', label: filters.category });
    if (filters.gender) chips.push({ key: 'gender', label: filters.gender });
    if (filters.footwearType) chips.push({ key: 'footwearType', label: filters.footwearType });
    if (filters.size) chips.push({ key: 'size', label: `Size ${filters.size}` });
    if (filters.color) chips.push({ key: 'color', label: `${filters.color}` });
    if (filters.rating) chips.push({ key: 'rating', label: `${filters.rating} rating` });
    if (filters.discount) chips.push({ key: 'discount', label: `${filters.discount} off` });

    if (filters.minPrice > 0 || filters.maxPrice < 10000) {
      chips.push({
        key: 'price',
        label: `₹${filters.minPrice.toLocaleString()} - ₹${filters.maxPrice.toLocaleString()}`,
      });
    }
    return chips;
  }, [filters]);

  const selectedProducts = useMemo(() => {
    if (selectedProductsMap.size === 0) return [];
    return Array.from(selectedProductsMap.values());
  }, [selectedProductsMap]);

  const toggleSelectId = (product) => {
    const productId = product._id;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    // Store/remove full product object
    setSelectedProductsMap((prev) => {
      const next = new Map(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        // Store minimal product data needed for RFQ
        next.set(productId, {
          _id: product._id,
          name: product.name,
          moq: product.moq || 1,
          price: product.price,
          image: product.images?.[0] || product.image,
        });
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedProductsMap(new Map());
    setSelectionMode(false);
  };

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

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '' || value === false) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setSearchParams(next);
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
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-secondary">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute inset-0 line-pattern opacity-5" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 text-sm text-white/70 mb-4">
              <span>Home</span>
              <span className="text-white/40">/</span>
              <span className="text-white font-medium">Shop</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4 text-shadow-hero">
              B2B Product Catalog
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Premium wholesale footwear collection with bulk pricing, flexible MOQ, and dedicated support
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {!loading && (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold">
                  <FiGrid className="text-gold" />
                  <span>{totalProducts} Products</span>
                </div>
              )}
              {activeFiltersCount > 0 && (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 text-white text-sm font-semibold">
                  <FiSliders />
                  <span>{activeFiltersCount} Active {activeFiltersCount === 1 ? 'Filter' : 'Filters'}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Integrated Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-strong overflow-hidden">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/60" size={22} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Search shoes, sneakers, sandals, slippers..."
                    className="w-full pl-14 pr-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="m-1.5 bg-white text-secondary px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 shadow-md"
                >
                  <FiSearch size={18} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </motion.form>

          {/* Mobile Filter Button */}
          <div className="flex justify-center mt-4 lg:hidden">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              <FiFilter size={18} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-secondary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar - Desktop Only */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:w-80 flex-shrink-0"
          >
            <div className="relative bg-white rounded-2xl shadow-strong border border-gray-100 sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
              {/* Premium Header */}
              <div className="bg-gradient-to-r from-secondary via-primary to-secondary p-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FiFilter className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-bold text-white">Filters</h2>
                      <p className="text-white/70 text-xs">Refine your search</p>
                    </div>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-white/90 hover:text-white font-semibold transition-colors px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      Clear ({activeFiltersCount})
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 overflow-y-auto max-h-[calc(100vh-14rem)] custom-scrollbar">

                {/* Category Filter */}
                <FilterSection title="Category" sectionKey="category">
                  <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar-thin">
                    {categories.map((category) => {
                      const categoryName = typeof category === 'string' ? category : category.name || category;
                      const isSelected = filters.category === categoryName || (categoryName === 'All' && !filters.category);
                      return (
                        <label
                          key={categoryName}
                          className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${isSelected
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
                        className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.size === size || (size === 'All' && !filters.size)
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
                        className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.color === color || (color === 'All' && !filters.color)
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
                        className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.rating === rating || (rating === 'All' && !filters.rating)
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
                        className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.discount === discount || (discount === 'All' && !filters.discount)
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
                        className={`flex items-center justify-center space-x-2 cursor-pointer p-2.5 rounded-lg border-2 transition-all text-sm font-medium ${filters.gender === gender.toLowerCase() || (gender === 'All' && !filters.gender)
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
                        className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.footwearType === type.toLowerCase() || (type === 'All' && !filters.footwearType)
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
                              className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${isSelected
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
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.size === size || (size === 'All' && !filters.size)
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
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.color === color || (color === 'All' && !filters.color)
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
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.rating === rating || (rating === 'All' && !filters.rating)
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
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.discount === discount || (discount === 'All' && !filters.discount)
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
                            className={`flex items-center justify-center space-x-2 cursor-pointer p-2.5 rounded-lg border-2 transition-all text-sm font-medium ${filters.gender === gender.toLowerCase() || (gender === 'All' && !filters.gender)
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
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-all ${filters.footwearType === type.toLowerCase() || (type === 'All' && !filters.footwearType)
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
            <div className="mb-4 sm:mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center justify-between gap-3">
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

                  <button
                    type="button"
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:border-primary/40 hover:bg-primary/5"
                  >
                    <FiFilter />
                    Filters
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 bg-white w-fit">
                    <button
                      type="button"
                      onClick={() => {
                        setView('grid');
                        updateParam('view', '');
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setView('list');
                        updateParam('view', 'list');
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      List
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectionMode((v) => !v);
                      setSelectedIds(new Set());
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors w-fit ${selectionMode
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {selectionMode ? <FiCheckSquare /> : <FiSquare />}
                    Select
                  </button>

                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {activeChips.map((chip) => (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={() => {
                            if (chip.key === 'price') {
                              handleFilterChange('minPrice', 0);
                              handleFilterChange('maxPrice', 10000);
                            } else {
                              removeFilter(chip.key);
                            }
                          }}
                          className="group inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/15 hover:border-primary/30"
                          title="Remove filter"
                        >
                          <span className="capitalize">{chip.label}</span>
                          <FiX className="opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-semibold text-gray-600 hover:text-secondary underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Sort</span>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="newest">Newest</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={view === 'list' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6'}>
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
              </div>
            ) : allProducts.length > 0 ? (
              <>
                {view === 'list' ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {allProducts.map((product) => (
                      <div key={product._id} className="relative">
                        {selectionMode && (
                          <button
                            type="button"
                            onClick={() => toggleSelectId(product)}
                            className={`absolute z-20 top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-xl border shadow-sm transition-colors ${selectedIds.has(product._id)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40'
                              }`}
                            aria-label={selectedIds.has(product._id) ? 'Deselect product' : 'Select product'}
                          >
                            {selectedIds.has(product._id) ? <FiCheckSquare /> : <FiSquare />}
                          </button>
                        )}
                        <div
                          className={selectionMode ? 'cursor-pointer' : ''}
                          onClick={() => {
                            if (selectionMode) toggleSelectId(product);
                          }}
                        >
                          <ProductListItem product={product} />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
                  >
                    {allProducts.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        {selectionMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSelectId(product);
                            }}
                            className={`absolute z-40 top-3 left-3 inline-flex items-center justify-center w-10 h-10 rounded-2xl border shadow-sm transition-colors ring-4 ring-white/70 backdrop-blur ${selectedIds.has(product._id)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white/95 text-gray-700 border-gray-200 hover:border-primary/40'
                              }`}
                            aria-label={selectedIds.has(product._id) ? 'Deselect product' : 'Select product'}
                          >
                            {selectedIds.has(product._id) ? <FiCheckSquare /> : <FiSquare />}
                          </button>
                        )}
                        <ProductCard product={product} showActions={true} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft border-2 border-dashed border-gray-200 overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-5xl">👟</span>
                  </div>
                  <p className="text-gray-700 text-xl font-semibold mb-2">No products found</p>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">Try adjusting your filters or search criteria to discover more products</p>
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3.5 rounded-full hover:shadow-strong transition-all font-semibold"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}

            {/* Selection Bar */}
            {selectionMode && selectedIds.size > 0 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-4xl">
                <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 text-sm font-semibold text-secondary">
                    {selectedIds.size} selected
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-sm hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkInquiry(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg"
                    >
                      <FiSend />
                      Send RFQ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BulkInquiryModal
        isOpen={showBulkInquiry}
        onClose={() => {
          setShowBulkInquiry(false);
        }}
        onSuccess={() => {
          clearSelection();
          setShowBulkInquiry(false);
        }}
        products={selectedProducts}
      />

      {/* Custom Scrollbar Styles */}
      <style>{`
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

