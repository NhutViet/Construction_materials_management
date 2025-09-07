import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import  AxiosInstance  from '../AxiosInstance';

// Types matching the backend
export interface InvoiceItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'online' | 'debt';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  deliveryDate?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: {
    materialId: string;
    quantity: number;
  }[];
  discountRate?: number;
  paymentMethod: 'cash' | 'online' | 'debt';
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  paidAmount?: number;
  remainingAmount?: number;
  notes?: string;
  deliveryDate?: string;
}

export interface UpdateInvoiceDto {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items?: {
    materialId: string;
    quantity: number;
  }[];
  discountRate?: number;
  paymentMethod?: 'cash' | 'online' | 'debt';
  paidAmount?: number;
  remainingAmount?: number;
  notes?: string;
  deliveryDate?: string;
}

export interface UpdateInvoiceStatusDto {
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount?: number;
  remainingAmount?: number;
  notes?: string;
}

export interface ProcessPaymentDto {
  amount: number;
  notes?: string;
  paymentMethod?: string;
}

export interface InvoiceQueryDto {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  customerName?: string;
  invoiceNumber?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  confirmedInvoices: number;
  deliveredInvoices: number;
  cancelledInvoices: number;
  unpaidInvoices: number;
  paidInvoices: number;
  paymentMethods: Record<string, { count: number; totalAmount: number }>;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentMethodOption {
  value: string;
  label: string;
}

export interface InvoiceState {
  invoices: Invoice[];
  allInvoices: Invoice[]; // Store all invoices for client-side filtering
  selectedInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  filters: InvoiceQueryDto;
  statistics: InvoiceStatistics | null;
  paymentMethods: PaymentMethodOption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: InvoiceState = {
  invoices: [],
  allInvoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
  statistics: null,
  paymentMethods: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (query: InvoiceQueryDto, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/invoices', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoice/fetchInvoiceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice');
    }
  }
);

export const fetchInvoiceByNumber = createAsyncThunk(
  'invoice/fetchInvoiceByNumber',
  async (invoiceNumber: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/number/${invoiceNumber}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoice/createInvoice',
  async (invoiceData: CreateInvoiceDto, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().post('/invoices', invoiceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoice/updateInvoice',
  async ({ id, data }: { id: string; data: UpdateInvoiceDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().patch(`/invoices/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const updateInvoiceStatus = createAsyncThunk(
  'invoice/updateInvoiceStatus',
  async ({ id, data }: { id: string; data: UpdateInvoiceStatusDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().patch(`/invoices/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice status');
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'invoice/updatePaymentStatus',
  async ({ id, data }: { id: string; data: UpdatePaymentStatusDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().patch(`/invoices/${id}/payment-status`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment status');
    }
  }
);

export const processPayment = createAsyncThunk(
  'invoice/processPayment',
  async ({ id, data }: { id: string; data: ProcessPaymentDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().post(`/invoices/${id}/payment`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoice/deleteInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      await AxiosInstance().delete(`/invoices/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete invoice');
    }
  }
);

export const fetchInvoiceStatistics = createAsyncThunk(
  'invoice/fetchStatistics',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await AxiosInstance().get('/invoices/statistics', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'invoice/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/invoices/payment-methods');
      return response.data.methods;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

export const fetchPendingInvoices = createAsyncThunk(
  'invoice/fetchPendingInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/invoices/pending');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending invoices');
    }
  }
);

export const fetchConfirmedInvoices = createAsyncThunk(
  'invoice/fetchConfirmedInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/invoices/confirmed');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch confirmed invoices');
    }
  }
);

export const fetchDeliveredInvoices = createAsyncThunk(
  'invoice/fetchDeliveredInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/invoices/delivered');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivered invoices');
    }
  }
);

export const fetchUnpaidInvoices = createAsyncThunk(
  'invoice/fetchUnpaidInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/invoices/unpaid');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unpaid invoices');
    }
  }
);

export const fetchPaidInvoices = createAsyncThunk(
  'invoice/fetchPaidInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/invoices/paid');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch paid invoices');
    }
  }
);

export const fetchInvoicesByPaymentMethod = createAsyncThunk(
  'invoice/fetchInvoicesByPaymentMethod',
  async (method: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/payment-method/${method}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices by payment method');
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<InvoiceQueryDto>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        // Keep pagination settings but clear filter values
        status: undefined,
        paymentStatus: undefined,
        paymentMethod: undefined,
        customerName: undefined,
        invoiceNumber: undefined,
        startDate: undefined,
        endDate: undefined,
      };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.filters.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action: PayloadAction<InvoiceListResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.allInvoices = action.payload.invoices; // Store all invoices for client-side filtering
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch invoice by ID
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch invoice by number
    builder
      .addCase(fetchInvoiceByNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceByNumber.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchInvoiceByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create invoice
    builder
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload);
        state.allInvoices.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update invoice
    builder
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        const index = state.invoices.findIndex(inv => inv._id === action.payload._id);
        const allIndex = state.allInvoices.findIndex(inv => inv._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (allIndex !== -1) {
          state.allInvoices[allIndex] = action.payload;
        }
        if (state.selectedInvoice?._id === action.payload._id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update invoice status
    builder
      .addCase(updateInvoiceStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        const index = state.invoices.findIndex(inv => inv._id === action.payload._id);
        const allIndex = state.allInvoices.findIndex(inv => inv._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (allIndex !== -1) {
          state.allInvoices[allIndex] = action.payload;
        }
        if (state.selectedInvoice?._id === action.payload._id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update payment status
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        const index = state.invoices.findIndex(inv => inv._id === action.payload._id);
        const allIndex = state.allInvoices.findIndex(inv => inv._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (allIndex !== -1) {
          state.allInvoices[allIndex] = action.payload;
        }
        if (state.selectedInvoice?._id === action.payload._id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Process payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        const index = state.invoices.findIndex(inv => inv._id === action.payload._id);
        const allIndex = state.allInvoices.findIndex(inv => inv._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (allIndex !== -1) {
          state.allInvoices[allIndex] = action.payload;
        }
        if (state.selectedInvoice?._id === action.payload._id) {
          state.selectedInvoice = action.payload;
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete invoice
    builder
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.invoices = state.invoices.filter(inv => inv._id !== action.payload);
        state.allInvoices = state.allInvoices.filter(inv => inv._id !== action.payload);
        if (state.selectedInvoice?._id === action.payload) {
          state.selectedInvoice = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch statistics
    builder
      .addCase(fetchInvoiceStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceStatistics.fulfilled, (state, action: PayloadAction<InvoiceStatistics>) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchInvoiceStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch payment methods
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action: PayloadAction<PaymentMethodOption[]>) => {
        state.isLoading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch pending invoices
    builder
      .addCase(fetchPendingInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingInvoices.fulfilled, (state, action: PayloadAction<InvoiceListResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.allInvoices = action.payload.invoices;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchPendingInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch confirmed invoices
    builder
      .addCase(fetchConfirmedInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConfirmedInvoices.fulfilled, (state, action: PayloadAction<InvoiceListResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.allInvoices = action.payload.invoices;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchConfirmedInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch delivered invoices
    builder
      .addCase(fetchDeliveredInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveredInvoices.fulfilled, (state, action: PayloadAction<InvoiceListResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.allInvoices = action.payload.invoices;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchDeliveredInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unpaid invoices
    builder
      .addCase(fetchUnpaidInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnpaidInvoices.fulfilled, (state, action: PayloadAction<InvoiceListResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.allInvoices = action.payload.invoices;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchUnpaidInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch paid invoices
    builder
      .addCase(fetchPaidInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaidInvoices.fulfilled, (state, action: PayloadAction<InvoiceListResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.allInvoices = action.payload.invoices;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchPaidInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch invoices by payment method
    builder
      .addCase(fetchInvoicesByPaymentMethod.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoicesByPaymentMethod.fulfilled, (state, action: PayloadAction<InvoiceListResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.allInvoices = action.payload.invoices;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchInvoicesByPaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedInvoice,
  updateFilters,
  clearFilters,
  setPage,
  setLimit,
  clearError,
  resetState,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

// Selectors
export const selectInvoices = (state: { invoice: InvoiceState }) => state.invoice.invoices;
export const selectAllInvoices = (state: { invoice: InvoiceState }) => state.invoice.allInvoices;
export const selectSelectedInvoice = (state: { invoice: InvoiceState }) => state.invoice.selectedInvoice;
export const selectInvoicesLoading = (state: { invoice: InvoiceState }) => state.invoice.isLoading;
export const selectInvoicesError = (state: { invoice: InvoiceState }) => state.invoice.error;
export const selectInvoicesFilters = (state: { invoice: InvoiceState }) => state.invoice.filters;
export const selectInvoicesPagination = (state: { invoice: InvoiceState }) => state.invoice.pagination;
export const selectInvoiceStatistics = (state: { invoice: InvoiceState }) => state.invoice.statistics;
export const selectPaymentMethods = (state: { invoice: InvoiceState }) => state.invoice.paymentMethods;

// Client-side filtering selector
export const selectFilteredInvoices = (state: { invoice: InvoiceState }) => {
  const { allInvoices, filters } = state.invoice;
  
  return allInvoices.filter(invoice => {
    // Filter by invoice number
    const matchesInvoiceNumber = !filters.invoiceNumber || 
      invoice.invoiceNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase());
    
    // Filter by customer name
    const matchesCustomerName = !filters.customerName || 
      invoice.customerName.toLowerCase().includes(filters.customerName.toLowerCase());
    
    // Filter by status
    const matchesStatus = !filters.status || invoice.status === filters.status;
    
    // Filter by payment status
    const matchesPaymentStatus = !filters.paymentStatus || invoice.paymentStatus === filters.paymentStatus;
    
    // Filter by payment method
    const matchesPaymentMethod = !filters.paymentMethod || invoice.paymentMethod === filters.paymentMethod;
    
    // Filter by date range
    const matchesDateRange = (!filters.startDate && !filters.endDate) || 
      (() => {
        const invoiceDate = new Date(invoice.createdAt);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        if (startDate && endDate) {
          return invoiceDate >= startDate && invoiceDate <= endDate;
        } else if (startDate) {
          return invoiceDate >= startDate;
        } else if (endDate) {
          return invoiceDate <= endDate;
        }
        return true;
      })();
    
    return matchesInvoiceNumber && matchesCustomerName && matchesStatus && 
           matchesPaymentStatus && matchesPaymentMethod && matchesDateRange;
  });
};
