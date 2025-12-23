import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '../../services/messageService';

const initialState = {
  messages: [],
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(messageData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'messages/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await messageService.getNotifications(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getUnreadCount();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'messages/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await messageService.markNotificationAsRead(notificationId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.unshift(action.payload);
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = Array.isArray(action.payload) ? action.payload : action.payload.messages || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.unshift(action.payload);
      })
      // Fetch notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = Array.isArray(action.payload) ? action.payload : action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count || action.payload || 0;
      })
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.meta.arg;
        const notification = state.notifications.find((n) => n._id === notificationId);
        if (notification) {
          notification.read = true;
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      });
  },
});

export const { addMessage, addNotification, clearMessages, clearNotifications } = messagesSlice.actions;
export default messagesSlice.reducer;

