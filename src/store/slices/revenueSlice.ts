import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RevenueData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
}

interface ProductRevenue {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  profit: number;
}

interface RevenueState {
  revenueData: RevenueData[];
  topProducts: ProductRevenue[];
  isLoading: boolean;
  error: string | null;
  filters: {
    dateRange: {
      start: string;
      end: string;
    };
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalOrders: number;
    profitMargin: number;
  };
}

const initialState: RevenueState = {
  revenueData: [],
  topProducts: [],
  isLoading: false,
  error: null,
  filters: {
    dateRange: {
      start: '',
      end: '',
    },
    period: 'monthly',
  },
  summary: {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalOrders: 0,
    profitMargin: 0,
  },
};

const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {
    fetchRevenueDataStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRevenueDataSuccess: (state, action: PayloadAction<RevenueData[]>) => {
      state.isLoading = false;
      state.revenueData = action.payload;
    },
    fetchRevenueDataFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchTopProductsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTopProductsSuccess: (state, action: PayloadAction<ProductRevenue[]>) => {
      state.isLoading = false;
      state.topProducts = action.payload;
    },
    fetchTopProductsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateSummary: (state, action: PayloadAction<RevenueState['summary']>) => {
      state.summary = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<RevenueState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        dateRange: {
          start: '',
          end: '',
        },
        period: 'monthly',
      };
    },
    addRevenueData: (state, action: PayloadAction<RevenueData>) => {
      state.revenueData.push(action.payload);
    },
    updateRevenueData: (state, action: PayloadAction<RevenueData>) => {
      const index = state.revenueData.findIndex(r => r.date === action.payload.date);
      if (index !== -1) {
        state.revenueData[index] = action.payload;
      }
    },
  },
});

export const {
  fetchRevenueDataStart,
  fetchRevenueDataSuccess,
  fetchRevenueDataFailure,
  fetchTopProductsStart,
  fetchTopProductsSuccess,
  fetchTopProductsFailure,
  updateSummary,
  updateFilters,
  clearFilters,
  addRevenueData,
  updateRevenueData,
} = revenueSlice.actions;

export default revenueSlice.reducer;
