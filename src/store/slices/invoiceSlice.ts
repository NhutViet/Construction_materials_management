import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import  AxiosInstance  from '../AxiosInstance';
import { matchesSearchTerm } from '../../utils/vietnameseUtils';

// Types matching the backend
export interface InvoiceItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  deliveredQuantity?: number;
  deliveryStatus?: 'pending' | 'partial' | 'delivered';
  deliveredAt?: string;
  deliveredBy?: string;
  
  // Các trường theo dõi giá ban đầu và giá đã điều chỉnh
  originalUnitPrice?: number;
  originalTotalPrice?: number;
  adjustedUnitPrice?: number;
  adjustedTotalPrice?: number;
  priceAdjustmentAmount?: number;
  priceAdjustmentReason?: string;
  priceAdjustedAt?: string;
  priceAdjustedBy?: string;
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
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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
  
  // Các trường theo dõi giá ban đầu và giá đã điều chỉnh cho toàn bộ hóa đơn
  originalTotalAmount?: number;
  adjustedTotalAmount?: number;
  totalPriceAdjustmentAmount?: number;
  priceAdjustmentReason?: string;
  priceAdjustedAt?: string;
  priceAdjustedBy?: string;
}

export interface CreateInvoiceDto {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: {
    materialId: string;
    quantity: number;
  }[];
  taxRate?: number;
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
  taxRate?: number;
  discountRate?: number;
  paymentMethod?: 'cash' | 'online' | 'debt';
  paidAmount?: number;
  remainingAmount?: number;
  notes?: string;
  deliveryDate?: string;
}

export interface UpdateInvoiceStatusDto {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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

export interface UpdateItemDeliveryDto {
  deliveredQuantity: number;
  notes?: string;
}

export interface DeliveryStatus {
  totalItems: number;
  deliveredItems: number;
  partialItems: number;
  pendingItems: number;
  totalQuantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  items: {
    index: number;
    materialName: string;
    quantity: number;
    deliveredQuantity: number;
    remainingQuantity: number;
    deliveryStatus: 'pending' | 'partial' | 'delivered';
    deliveredAt?: string;
    unit: string;
  }[];
}

export interface DeliveredAmount {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  totalOrderedAmount: number;
  deliveredAmount: number;
  remainingAmount: number;
  totalOrderedQuantity: number;
  totalDeliveredQuantity: number;
  deliveryPercentage: number;
  deliveredAmountPercentage: number;
  deliveredItems: {
    materialId: string;
    materialName: string;
    unit: string;
    orderedQuantity: number;
    deliveredQuantity: number;
    remainingQuantity: number;
    unitPrice: number;
    deliveredAmount: number;
    deliveryStatus: 'pending' | 'partial' | 'delivered';
    deliveredAt?: string;
  }[];
  summary: {
    totalItems: number;
    deliveredItems: number;
    pendingItems: number;
    partialItems: number;
    fullyDeliveredItems: number;
  };
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

export interface PublicInvoiceSearchDto {
  customerPhone?: string;
  invoiceNumber?: string;
  customerName?: string;
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
  deliveryStatus: DeliveryStatus | null;
  deliveredAmount: DeliveredAmount | null;
  deliveredAmountLoading: boolean;
  publicSearchResults: Invoice[]; // Store public search results
  publicSearchLoading: boolean;
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
  deliveryStatus: null,
  deliveredAmount: null,
  deliveredAmountLoading: false,
  publicSearchResults: [],
  publicSearchLoading: false,
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

export const updateItemDelivery = createAsyncThunk(
  'invoice/updateItemDelivery',
  async ({ id, itemIndex, data }: { id: string; itemIndex: number; data: UpdateItemDeliveryDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().patch(`/invoices/${id}/items/${itemIndex}/delivery`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item delivery');
    }
  }
);

export const fetchDeliveryStatus = createAsyncThunk(
  'invoice/fetchDeliveryStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/${id}/delivery-status`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery status');
    }
  }
);

export const debugInvoice = createAsyncThunk(
  'invoice/debugInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/${id}/debug`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to debug invoice');
    }
  }
);

export const getInvoiceForPrint = createAsyncThunk(
  'invoice/getInvoiceForPrint',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/${id}/print`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get invoice for print');
    }
  }
);

export const sendInvoiceByEmail = createAsyncThunk(
  'invoice/sendInvoiceByEmail',
  async ({ id, emailData }: { id: string; emailData: { email: string } }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().post(`/invoices/${id}/send-email`, emailData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invoice by email');
    }
  }
);

export const exportInvoiceToPDF = createAsyncThunk(
  'invoice/exportInvoiceToPDF',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/${id}/export-pdf`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export invoice to PDF');
    }
  }
);

export const fetchDeliveredAmount = createAsyncThunk(
  'invoice/fetchDeliveredAmount',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/invoices/${id}/delivered-amount`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivered amount');
    }
  }
);

export const searchPublicInvoices = createAsyncThunk(
  'invoice/searchPublicInvoices',
  async (searchData: PublicInvoiceSearchDto, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance("", "application/json", true).get('/invoices/public/search', { params: searchData });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search public invoices');
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
    setDeliveryStatus: (state, action: PayloadAction<DeliveryStatus | null>) => {
      state.deliveryStatus = action.payload;
    },
    clearDeliveryStatus: (state) => {
      state.deliveryStatus = null;
    },
    setDeliveredAmount: (state, action: PayloadAction<DeliveredAmount | null>) => {
      state.deliveredAmount = action.payload;
    },
    clearDeliveredAmount: (state) => {
      state.deliveredAmount = null;
    },
    clearPublicSearchResults: (state) => {
      state.publicSearchResults = [];
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

    // Update item delivery
    builder
      .addCase(updateItemDelivery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateItemDelivery.fulfilled, (state, action: PayloadAction<Invoice>) => {
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
      .addCase(updateItemDelivery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch delivery status
    builder
      .addCase(fetchDeliveryStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryStatus.fulfilled, (state, action: PayloadAction<DeliveryStatus>) => {
        state.isLoading = false;
        state.deliveryStatus = action.payload;
      })
      .addCase(fetchDeliveryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Debug invoice
    builder
      .addCase(debugInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(debugInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(debugInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get invoice for print
    builder
      .addCase(getInvoiceForPrint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvoiceForPrint.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(getInvoiceForPrint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send invoice by email
    builder
      .addCase(sendInvoiceByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendInvoiceByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        // Email sent successfully - no state changes needed
      })
      .addCase(sendInvoiceByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Export invoice to PDF
    builder
      .addCase(exportInvoiceToPDF.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportInvoiceToPDF.fulfilled, (state, action) => {
        state.isLoading = false;
        // PDF exported successfully - no state changes needed
      })
      .addCase(exportInvoiceToPDF.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch delivered amount
    builder
      .addCase(fetchDeliveredAmount.pending, (state) => {
        state.deliveredAmountLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveredAmount.fulfilled, (state, action: PayloadAction<DeliveredAmount>) => {
        state.deliveredAmountLoading = false;
        state.deliveredAmount = action.payload;
      })
      .addCase(fetchDeliveredAmount.rejected, (state, action) => {
        state.deliveredAmountLoading = false;
        state.error = action.payload as string;
      });

    // Search public invoices
    builder
      .addCase(searchPublicInvoices.pending, (state) => {
        state.publicSearchLoading = true;
        state.error = null;
      })
      .addCase(searchPublicInvoices.fulfilled, (state, action: PayloadAction<Invoice[]>) => {
        state.publicSearchLoading = false;
        state.publicSearchResults = action.payload;
      })
      .addCase(searchPublicInvoices.rejected, (state, action) => {
        state.publicSearchLoading = false;
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
  setDeliveryStatus,
  clearDeliveryStatus,
  setDeliveredAmount,
  clearDeliveredAmount,
  clearPublicSearchResults,
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
export const selectDeliveryStatus = (state: { invoice: InvoiceState }) => state.invoice.deliveryStatus;
export const selectDeliveredAmount = (state: { invoice: InvoiceState }) => state.invoice.deliveredAmount;
export const selectPublicSearchResults = (state: { invoice: InvoiceState }) => state.invoice.publicSearchResults;
export const selectPublicSearchLoading = (state: { invoice: InvoiceState }) => state.invoice.publicSearchLoading;

// Client-side filtering selector
export const selectFilteredInvoices = (state: { invoice: InvoiceState }) => {
  const { allInvoices, filters } = state.invoice;
  
  return allInvoices.filter(invoice => {
    // Filter by invoice number - with Vietnamese diacritics support
    const matchesInvoiceNumber = !filters.invoiceNumber || 
      matchesSearchTerm(invoice.invoiceNumber, filters.invoiceNumber);
    
    // Filter by customer name - with Vietnamese diacritics support
    const matchesCustomerName = !filters.customerName || 
      matchesSearchTerm(invoice.customerName, filters.customerName);
    
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
