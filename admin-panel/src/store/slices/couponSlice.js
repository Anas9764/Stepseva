import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import couponService from '../../services/couponService';

const initialState = {
  coupons: [],
  currentCoupon: null,
  loading: false,
  error: null,
};

export const fetchCoupons = createAsyncThunk(
  'coupons/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponService.getAllCoupons();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupons/create',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await couponService.createCoupon(couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create coupon');
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'coupons/update',
  async ({ id, couponData }, { rejectWithValue }) => {
    try {
      const response = await couponService.updateCoupon(id, couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupons/delete',
  async (id, { rejectWithValue }) => {
    try {
      await couponService.deleteCoupon(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon');
    }
  }
);

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearCurrentCoupon: (state) => {
      state.currentCoupon = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.coupons.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentCoupon, clearError } = couponSlice.actions;
export default couponSlice.reducer;

