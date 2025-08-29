import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive' | 'vip';
  notes?: string;
}

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
  filters: {
    status: string;
    searchTerm: string;
    sortBy: 'name' | 'totalOrders' | 'totalSpent' | 'lastOrderDate';
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: CustomerState = {
  customers: [],
  isLoading: false,
  error: null,
  selectedCustomer: null,
  filters: {
    status: '',
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    fetchCustomersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCustomersSuccess: (state, action: PayloadAction<Customer[]>) => {
      state.isLoading = false;
      state.customers = action.payload;
    },
    fetchCustomersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<CustomerState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
      };
    },
    updateCustomerStats: (state, action: PayloadAction<{ customerId: string; totalOrders: number; totalSpent: number; lastOrderDate: string }>) => {
      const customer = state.customers.find(c => c.id === action.payload.customerId);
      if (customer) {
        customer.totalOrders = action.payload.totalOrders;
        customer.totalSpent = action.payload.totalSpent;
        customer.lastOrderDate = action.payload.lastOrderDate;
      }
    },
  },
});

export const {
  fetchCustomersStart,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomer,
  updateFilters,
  clearFilters,
  updateCustomerStats,
} = customerSlice.actions;

export default customerSlice.reducer;
