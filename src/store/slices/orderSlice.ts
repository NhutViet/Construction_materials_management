import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  filters: {
    status: string;
    customerId: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

const initialState: OrderState = {
  orders: [],
  isLoading: false,
  error: null,
  selectedOrder: null,
  filters: {
    status: '',
    customerId: '',
    dateRange: {
      start: '',
      end: '',
    },
  },
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action: PayloadAction<Order[]>) => {
      state.isLoading = false;
      state.orders = action.payload;
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(o => o.id !== action.payload);
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    updateFilters: (state, action: PayloadAction<Partial<OrderState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        customerId: '',
        dateRange: {
          start: '',
          end: '',
        },
      };
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  addOrder,
  updateOrder,
  deleteOrder,
  setSelectedOrder,
  updateOrderStatus,
  updateFilters,
  clearFilters,
} = orderSlice.actions;

export default orderSlice.reducer;
