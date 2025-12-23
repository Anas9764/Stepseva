import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../services/dashboardService';

const initialState = {
  stats: null,
  recentOrders: [],
  recentInquiries: [],
  pendingQuotes: [],
  upcomingFollowups: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchB2BStats = createAsyncThunk(
  'dashboard/fetchB2BStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getB2BStats();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch B2B stats');
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'dashboard/fetchRecentOrders',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentOrders(limit);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent orders');
    }
  }
);

export const fetchRecentInquiries = createAsyncThunk(
  'dashboard/fetchRecentInquiries',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentInquiries(limit);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent inquiries');
    }
  }
);

export const fetchPendingQuotes = createAsyncThunk(
  'dashboard/fetchPendingQuotes',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getPendingQuotes(limit);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending quotes');
    }
  }
);

export const fetchUpcomingFollowups = createAsyncThunk(
  'dashboard/fetchUpcomingFollowups',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getUpcomingFollowups(limit);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming followups');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.stats = null;
      state.recentOrders = [];
      state.recentInquiries = [];
      state.pendingQuotes = [];
      state.upcomingFollowups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch B2B stats
      .addCase(fetchB2BStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchB2BStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchB2BStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch recent orders
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = Array.isArray(action.payload) ? action.payload : action.payload.orders || [];
      })
      // Fetch recent inquiries
      .addCase(fetchRecentInquiries.fulfilled, (state, action) => {
        state.recentInquiries = Array.isArray(action.payload) ? action.payload : action.payload.inquiries || [];
      })
      // Fetch pending quotes
      .addCase(fetchPendingQuotes.fulfilled, (state, action) => {
        state.pendingQuotes = Array.isArray(action.payload) ? action.payload : action.payload.quotes || [];
      })
      // Fetch upcoming followups
      .addCase(fetchUpcomingFollowups.fulfilled, (state, action) => {
        state.upcomingFollowups = Array.isArray(action.payload) ? action.payload : action.payload.followups || [];
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;

