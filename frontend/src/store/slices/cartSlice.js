import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';
import { logout } from './authSlice';

const initialState = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
  error: null,
  showPopup: false,
  lastAddedItem: null,
};

const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalAmount };
};

// Async thunks for backend sync
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data || { items: [], totalItems: 0, totalAmount: 0 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/add',
  async (product, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        // Sync with backend
        const quantity = product.quantity || 1;
        const size = product.size || '';
        
        // Only send size if product has sizes, otherwise send empty string
        const productSize = (product.sizes && product.sizes.length > 0) ? size : '';
        
        const response = await cartService.addToCart(product._id, productSize, quantity);
        return { ...response.data, size: productSize };
      } else {
        // Use local storage for guest users
        return { ...product, size: product.size || '' };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, size, quantity }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        // Sync with backend
        await cartService.updateQuantity(productId, size, quantity);
      }
      return { productId, size, quantity };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quantity');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/remove',
  async ({ productId, size }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        // Sync with backend
        await cartService.removeFromCart(productId, size);
      }
      return { productId, size };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated) {
        // Sync with backend
        await cartService.clearCart();
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Sync local storage with state (for guest users)
    syncFromLocalStorage: (state) => {
      const localItems = JSON.parse(localStorage.getItem('cart')) || [];
      state.items = localItems;
      const totals = calculateTotals(localItems);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
    // Set cart items (used when syncing from backend)
    setCartItems: (state, action) => {
      state.items = action.payload.items || action.payload;
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    // Control cart popup visibility
    setCartPopupVisible: (state, action) => {
      state.showPopup = action.payload.show;
      state.lastAddedItem = action.payload.item;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        const product = action.payload;
        const productSize = product.size || '';
        
        // For footwear products, find existing item by both _id and size
        const existingItem = state.items.find(item => 
          item._id === product._id && (item.size || '') === productSize
        );
        
        // Get available stock for validation
        let availableStock = product.stock || 0;
        if (productSize && product.sizeStock) {
          let sizeStockValue;
          if (product.sizeStock instanceof Map) {
            sizeStockValue = product.sizeStock.get(productSize);
          } else if (typeof product.sizeStock === 'object') {
            sizeStockValue = product.sizeStock[productSize];
          }
          if (sizeStockValue !== undefined && sizeStockValue !== null) {
            availableStock = sizeStockValue;
          }
        }
        
        let addedItem;
        if (existingItem) {
          const newQuantity = existingItem.quantity + (product.quantity || 1);
          if (newQuantity > availableStock) {
            state.error = `Only ${availableStock} items available${productSize ? ` in size ${productSize}` : ''}`;
            return;
          }
          existingItem.quantity = newQuantity;
          addedItem = existingItem;
        } else {
          const quantity = product.quantity || 1;
          if (quantity > availableStock) {
            state.error = `Only ${availableStock} items available${productSize ? ` in size ${productSize}` : ''}`;
            return;
          }
          const cleanProduct = {
            ...product,
            category: typeof product.category === 'object' 
              ? product.category?.name 
              : product.category,
            quantity: quantity,
            size: productSize,
          };
          state.items.push(cleanProduct);
          addedItem = cleanProduct;
        }
        
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        localStorage.setItem('cart', JSON.stringify(state.items));
        
        // Show popup with the added item
        state.showPopup = true;
        state.lastAddedItem = addedItem;
        state.error = null;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update quantity
      .addCase(updateQuantityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, size, quantity } = action.payload;
        const productIdStr = String(productId);
        const itemSize = size || '';
        const item = state.items.find(
          item => String(item._id) === productIdStr && (item.size || '') === itemSize
        );
        
        if (item) {
          // Validate stock before updating quantity
          let availableStock = item.stock || 0;
          if (itemSize && item.sizeStock) {
            let sizeStockValue;
            if (item.sizeStock instanceof Map) {
              sizeStockValue = item.sizeStock.get(itemSize);
            } else if (typeof item.sizeStock === 'object') {
              sizeStockValue = item.sizeStock[itemSize];
            }
            if (sizeStockValue !== undefined && sizeStockValue !== null) {
              availableStock = sizeStockValue;
            }
          }
          
          if (quantity <= 0) {
            state.items = state.items.filter(
              item => !(String(item._id) === productIdStr && (item.size || '') === itemSize)
            );
          } else {
            if (quantity > availableStock) {
              state.error = `Only ${availableStock} items available${itemSize ? ` in size ${itemSize}` : ''}`;
              return;
            }
            item.quantity = quantity;
          }
          
          const totals = calculateTotals(state.items);
          state.totalItems = totals.totalItems;
          state.totalAmount = totals.totalAmount;
          localStorage.setItem('cart', JSON.stringify(state.items));
          state.error = null;
        }
      })
      .addCase(updateQuantityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        const productId = String(action.payload);
        state.items = state.items.filter(item => String(item._id) !== productId);
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Even if API fails, remove from local state for better UX
        const productId = String(action.meta.arg);
        state.items = state.items.filter(item => String(item._id) !== productId);
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        localStorage.setItem('cart', JSON.stringify(state.items));
      })
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
        localStorage.removeItem('cart');
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Even if API fails, clear local state for better UX
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
        localStorage.removeItem('cart');
      })
      // Clear cart when user logs out
      .addCase(logout, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
        state.loading = false;
        state.error = null;
        state.showPopup = false;
        state.lastAddedItem = null;
        localStorage.removeItem('cart');
      });
  },
});

export const { syncFromLocalStorage, setCartItems, setCartPopupVisible } = cartSlice.actions;
export default cartSlice.reducer;

