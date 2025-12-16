import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 1000,
    search: '',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
    },
    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  setProducts,
  setFeaturedProducts,
  setCurrentProduct,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  setPagination,
} = productSlice.actions;

export default productSlice.reducer;

