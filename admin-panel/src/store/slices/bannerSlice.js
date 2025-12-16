import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bannerService from '../../services/bannerService';

const initialState = {
  banners: [],
  currentBanner: null,
  loading: false,
  error: null,
};

export const fetchBanners = createAsyncThunk(
  'banners/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bannerService.getAllBanners();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banners');
    }
  }
);

export const createBanner = createAsyncThunk(
  'banners/create',
  async (bannerData, { rejectWithValue }) => {
    try {
      const response = await bannerService.createBanner(bannerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create banner');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banners/update',
  async ({ id, bannerData }, { rejectWithValue }) => {
    try {
      const response = await bannerService.updateBanner(id, bannerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update banner');
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banners/delete',
  async (id, { rejectWithValue }) => {
    try {
      await bannerService.deleteBanner(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete banner');
    }
  }
);

const bannerSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Banner
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.unshift(action.payload);
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentBanner, clearError } = bannerSlice.actions;
export default bannerSlice.reducer;

