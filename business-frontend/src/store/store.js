import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import businessAccountReducer from './slices/businessAccountSlice';
import inquiriesReducer from './slices/inquiriesSlice';
import quotesReducer from './slices/quotesSlice';
import messagesReducer from './slices/messagesSlice';
import dashboardReducer from './slices/dashboardSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import rfqReducer from './slices/rfqSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    businessAccount: businessAccountReducer,
    inquiries: inquiriesReducer,
    quotes: quotesReducer,
    messages: messagesReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
    rfq: rfqReducer,
  },
});

export default store;

