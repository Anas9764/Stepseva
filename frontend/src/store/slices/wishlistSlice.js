import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';
import { logout } from './authSlice';

const initialState = {
  items: JSON.parse(localStorage.getItem('wishlist')) || [],
  loading: false,
  error: null,
  showPopup: false,
  lastAddedItem: null,
};

// Async thunks for backend sync
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/add',
  async (product, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        // Sync with backend
        const response = await wishlistService.addToWishlist(product._id);
        return response.data;
      } else {
        // Use local storage for guest users
        return product;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        // Sync with backend
        await wishlistService.removeFromWishlist(productId);
      }
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const clearWishlistAsync = createAsyncThunk(
  'wishlist/clear',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        // Sync with backend
        await wishlistService.clearWishlist();
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Sync local storage with state (for guest users)
    syncFromLocalStorage: (state) => {
      const localItems = JSON.parse(localStorage.getItem('wishlist')) || [];
      state.items = localItems;
    },
    // Set wishlist items (used when syncing from backend)
    setWishlistItems: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('wishlist', JSON.stringify(action.payload));
    },
    // Control wishlist popup visibility
    setWishlistPopupVisible: (state, action) => {
      state.showPopup = action.payload.show;
      state.lastAddedItem = action.payload.item;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        localStorage.setItem('wishlist', JSON.stringify(action.payload));
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to wishlist
      .addCase(addToWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        const product = action.payload;
        const existingItem = state.items.find(item => item._id === product._id);
        
        if (!existingItem) {
          const cleanProduct = {
            ...product,
            category: typeof product.category === 'object' 
              ? product.category?.name 
              : product.category,
          };
          state.items.push(cleanProduct);
          localStorage.setItem('wishlist', JSON.stringify(state.items));
          
          // Show popup with the added item
          state.showPopup = true;
          state.lastAddedItem = cleanProduct;
        }
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from wishlist
      .addCase(removeFromWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        const productId = String(action.payload);
        state.items = state.items.filter(item => String(item._id) !== productId);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Even if API fails, remove from local state for better UX
        const productId = String(action.meta.arg);
        state.items = state.items.filter(item => String(item._id) !== productId);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      })
      // Clear wishlist
      .addCase(clearWishlistAsync.fulfilled, (state) => {
        state.items = [];
        localStorage.removeItem('wishlist');
      })
      // Clear wishlist when user logs out
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
        state.showPopup = false;
        state.lastAddedItem = null;
        localStorage.removeItem('wishlist');
      });
  },
});

export const { syncFromLocalStorage, setWishlistItems, setWishlistPopupVisible } = wishlistSlice.actions;

// Selector to check if product is in wishlist
export const isInWishlist = (state, productId) => {
  return state.wishlist.items.some(item => item._id === productId);
};

export default wishlistSlice.reducer;

