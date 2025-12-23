import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

const initialState = {
  stats: {
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    // B2B Stats
    totalLeads: 0,
    newLeads: 0,
    totalBusinessAccounts: 0,
    activeBusinessAccounts: 0,
    pendingBusinessAccounts: 0,
    b2bRevenue: 0,
  },
  salesData: [],
  recentOrders: [],
  recentLeads: [],
  upcomingFollowups: [],
  recentActivities: [],
  loading: false,
  error: null,
};

export const fetchStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchSalesData = createAsyncThunk(
  'dashboard/fetchSalesData',
  async (period, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getSalesData(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales data');
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'dashboard/fetchRecentOrders',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentOrders(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent orders');
    }
  }
);

export const fetchRecentLeads = createAsyncThunk(
  'dashboard/fetchRecentLeads',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentLeads(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent leads');
    }
  }
);

export const fetchUpcomingFollowups = createAsyncThunk(
  'dashboard/fetchUpcomingFollowups',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getUpcomingFollowups(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming follow-ups');
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentActivities(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sales Data
      .addCase(fetchSalesData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.loading = false;
        state.salesData = action.payload;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Recent Orders
      .addCase(fetchRecentOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.recentOrders = action.payload;
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Recent Leads
      .addCase(fetchRecentLeads.fulfilled, (state, action) => {
        state.recentLeads = action.payload;
      })
      // Fetch Upcoming Follow-ups
      .addCase(fetchUpcomingFollowups.fulfilled, (state, action) => {
        state.upcomingFollowups = action.payload;
      })
      // Fetch Recent Activities
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.recentActivities = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

