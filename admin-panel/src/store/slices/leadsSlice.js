import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadService } from '../../services/leadService';

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await leadService.getAllLeads(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

export const fetchLeadStats = createAsyncThunk(
  'leads/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await leadService.getLeadStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead statistics');
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await leadService.updateLead(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/delete',
  async (id, { rejectWithValue }) => {
    try {
      await leadService.deleteLead(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
    }
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    leads: [],
    stats: {
      totalLeads: 0,
      statusCounts: {},
      priorityCounts: {},
      newLeadsLast7Days: 0,
      topProducts: [],
    },
    currentLead: null,
    loading: false,
    error: null,
    newLeadsCount: 0,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 1,
    },
  },
  reducers: {
    setCurrentLead: (state, action) => {
      state.currentLead = action.payload;
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    },
    decrementNewLeadsCount: (state) => {
      state.newLeadsCount = Math.max(0, state.newLeadsCount - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.newLeadsCount = action.payload.statusCounts?.new || 0;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchLeadStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchLeadStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(l => l._id === action.payload.lead._id);
        if (index !== -1) {
          state.leads[index] = action.payload.lead;
        }
        if (state.currentLead && state.currentLead._id === action.payload.lead._id) {
          state.currentLead = action.payload.lead;
        }
      })
      // Delete lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(l => l._id !== action.payload);
      });
  },
});

export const { setCurrentLead, clearCurrentLead, decrementNewLeadsCount } = leadsSlice.actions;
export default leadsSlice.reducer;

