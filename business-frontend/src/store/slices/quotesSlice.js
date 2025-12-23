import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quoteService } from '../../services/quoteService';

const initialState = {
  quotes: [],
  selectedQuote: null,
  loading: false,
  error: null,
  filters: {
    status: '',
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
export const fetchMyQuotes = createAsyncThunk(
  'quotes/fetchMyQuotes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await quoteService.getMyQuotes(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotes');
    }
  }
);

export const fetchQuoteById = createAsyncThunk(
  'quotes/fetchQuoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quoteService.getQuoteById(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quote');
    }
  }
);

export const acceptQuote = createAsyncThunk(
  'quotes/acceptQuote',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quoteService.acceptQuote(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept quote');
    }
  }
);

export const rejectQuote = createAsyncThunk(
  'quotes/rejectQuote',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await quoteService.rejectQuote(id, reason);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject quote');
    }
  }
);

export const convertQuoteToOrder = createAsyncThunk(
  'quotes/convertToOrder',
  async ({ quoteId, orderData }, { rejectWithValue }) => {
    try {
      const response = await quoteService.convertQuoteToOrder(quoteId, orderData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to convert quote to order');
    }
  }
);

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedQuote: (state, action) => {
      state.selectedQuote = action.payload;
    },
    clearSelectedQuote: (state) => {
      state.selectedQuote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quotes
      .addCase(fetchMyQuotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyQuotes.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.quotes = action.payload;
        } else if (action.payload.quotes) {
          state.quotes = action.payload.quotes;
          state.pagination = action.payload.pagination || state.pagination;
        } else {
          state.quotes = [];
        }
      })
      .addCase(fetchMyQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch quote by ID
      .addCase(fetchQuoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedQuote = action.payload;
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Accept quote
      .addCase(acceptQuote.fulfilled, (state, action) => {
        const quoteId = action.meta.arg;
        const quote = state.quotes.find((q) => q._id === quoteId);
        if (quote) {
          quote.status = 'accepted';
          quote.acceptedAt = new Date().toISOString();
        }
        if (state.selectedQuote && state.selectedQuote._id === quoteId) {
          state.selectedQuote.status = 'accepted';
          state.selectedQuote.acceptedAt = new Date().toISOString();
        }
      })
      // Reject quote
      .addCase(rejectQuote.fulfilled, (state, action) => {
        const quoteId = action.meta.arg.id;
        const quote = state.quotes.find((q) => q._id === quoteId);
        if (quote) {
          quote.status = 'rejected';
          quote.rejectedAt = new Date().toISOString();
        }
        if (state.selectedQuote && state.selectedQuote._id === quoteId) {
          state.selectedQuote.status = 'rejected';
          state.selectedQuote.rejectedAt = new Date().toISOString();
        }
      });
  },
});

export const { setFilters, clearFilters, setSelectedQuote, clearSelectedQuote } = quotesSlice.actions;
export default quotesSlice.reducer;

