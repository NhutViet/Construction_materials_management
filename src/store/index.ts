import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import materialReducer from './slices/materialSlice';
import customerReducer from './slices/customerSlice';
import revenueReducer from './slices/revenueSlice';
import invoiceReducer from './slices/invoiceSlice';
import stockInReducer from './slices/stockInSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    materials: materialReducer,
    customer: customerReducer,
    revenue: revenueReducer,
    invoice: invoiceReducer,
    stockIn: stockInReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
