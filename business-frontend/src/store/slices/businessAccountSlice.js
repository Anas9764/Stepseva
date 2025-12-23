import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import businessAccountService from '../../services/businessAccountService';

const initialState = {
  account: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchBusinessAccount = createAsyncThunk(
  'businessAccount/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await businessAccountService.getMyBusinessAccount();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch business account');
    }
  }
);

export const createBusinessAccount = createAsyncThunk(
  'businessAccount/create',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await businessAccountService.createBusinessAccount(accountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create business account');
    }
  }
);

export const updateBusinessAccount = createAsyncThunk(
  'businessAccount/update',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await businessAccountService.updateBusinessAccount(accountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update business account');
    }
  }
);

const businessAccountSlice = createSlice({
  name: 'businessAccount',
  initialState,
  reducers: {
    clearBusinessAccount: (state) => {
      state.account = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch business account
      .addCase(fetchBusinessAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(fetchBusinessAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create business account
      .addCase(createBusinessAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusinessAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(createBusinessAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update business account
      .addCase(updateBusinessAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBusinessAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(updateBusinessAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBusinessAccount } = businessAccountSlice.actions;
export default businessAccountSlice.reducer;

