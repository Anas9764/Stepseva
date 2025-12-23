import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadService } from '../../services/leadService';

const initialState = {
  inquiries: [],
  selectedInquiry: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchMyInquiries = createAsyncThunk(
  'inquiries/fetchMyInquiries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await leadService.getMyInquiries(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inquiries');
    }
  }
);

export const fetchInquiryById = createAsyncThunk(
  'inquiries/fetchInquiryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await leadService.getInquiryById(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inquiry');
    }
  }
);

export const requestQuoteFromInquiry = createAsyncThunk(
  'inquiries/requestQuote',
  async (inquiryId, { rejectWithValue }) => {
    try {
      const response = await leadService.requestQuoteFromInquiry(inquiryId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request quote');
    }
  }
);

const inquiriesSlice = createSlice({
  name: 'inquiries',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedInquiry: (state, action) => {
      state.selectedInquiry = action.payload;
    },
    clearSelectedInquiry: (state) => {
      state.selectedInquiry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch inquiries
      .addCase(fetchMyInquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyInquiries.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.inquiries = action.payload;
        } else if (action.payload.inquiries) {
          state.inquiries = action.payload.inquiries;
          state.pagination = action.payload.pagination || state.pagination;
        } else {
          state.inquiries = [];
        }
      })
      .addCase(fetchMyInquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch inquiry by ID
      .addCase(fetchInquiryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInquiryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInquiry = action.payload;
      })
      .addCase(fetchInquiryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Request quote
      .addCase(requestQuoteFromInquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestQuoteFromInquiry.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestQuoteFromInquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setSelectedInquiry, clearSelectedInquiry } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;

