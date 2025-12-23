import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/analyticsService';

const initialState = {
  orderAnalytics: null,
  leadAnalytics: null,
  creditAnalytics: null,
  loading: false,
  error: null,
  dateRange: {
    start: null,
    end: null,
  },
};

// Async thunks
export const fetchOrderAnalytics = createAsyncThunk(
  'analytics/fetchOrderAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getOrderAnalytics(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order analytics');
    }
  }
);

export const fetchLeadAnalytics = createAsyncThunk(
  'analytics/fetchLeadAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getLeadAnalytics(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead analytics');
    }
  }
);

export const fetchCreditAnalytics = createAsyncThunk(
  'analytics/fetchCreditAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCreditAnalytics(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credit analytics');
    }
  }
);

export const generateReport = createAsyncThunk(
  'analytics/generateReport',
  async ({ type, params = {} }, { rejectWithValue }) => {
    try {
      const blob = await analyticsService.generateReport(type, params);
      return { type, blob };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearAnalytics: (state) => {
      state.orderAnalytics = null;
      state.leadAnalytics = null;
      state.creditAnalytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch order analytics
      .addCase(fetchOrderAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.orderAnalytics = action.payload;
      })
      .addCase(fetchOrderAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch lead analytics
      .addCase(fetchLeadAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.leadAnalytics = action.payload;
      })
      .addCase(fetchLeadAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch credit analytics
      .addCase(fetchCreditAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreditAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.creditAnalytics = action.payload;
      })
      .addCase(fetchCreditAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDateRange, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;

