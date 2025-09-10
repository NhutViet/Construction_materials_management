import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AxiosInstance from '../AxiosInstance';
import { matchesSearchTerm } from '../../utils/vietnameseUtils';

// StockIn Item interface
export interface StockInItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  supplier?: string;
}

// StockIn interface based on the backend model
export interface StockIn {
  _id: string;
  stockInNumber: string;
  userId: string;
  items: StockInItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  remainingAmount: number;
  paymentNotes?: string;
  status: 'pending' | 'approved' | 'rejected';
  supplier?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  notes?: string;
  receivedDate?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs for API calls
export interface CreateStockInDto {
  items: {
    materialId: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    supplier?: string;
  }[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount: number;
  supplier?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  notes?: string;
  receivedDate?: string;
}

export interface UpdateStockInDto {
  items?: {
    materialId: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    supplier?: string;
  }[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount?: number;
  supplier?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  notes?: string;
  receivedDate?: string;
  remainingAmount?: number;
}

export interface UpdateStockInStatusDto {
  status: 'pending' | 'approved' | 'rejected';
}

export interface UpdatePaymentStatusDto {
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  paymentNotes?: string;
}

export interface StockInQueryDto {
  search?: string;
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  status?: 'pending' | 'approved' | 'rejected';
  supplier?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StockInStatistics {
  totalStockIns: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  unpaidCount: number;
  partialCount: number;
  paidCount: number;
}

export interface StockInListResponse {
  data: StockIn[];
  total: number;
  page: number;
  limit: number;
}

export interface StockInState {
  stockIns: StockIn[];
  allStockIns: StockIn[]; // Store all stock-ins for client-side filtering
  selectedStockIn: StockIn | null;
  isLoading: boolean;
  error: string | null;
  filters: StockInQueryDto;
  statistics: StockInStatistics | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: StockInState = {
  stockIns: [],
  allStockIns: [],
  selectedStockIn: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
  statistics: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchStockIns = createAsyncThunk(
  'stockIn/fetchStockIns',
  async (query: StockInQueryDto = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/stock-in', { params: query });
      console.log('Fetch stock-ins response:', response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock-ins');
    }
  }
);

export const fetchStockInById = createAsyncThunk(
  'stockIn/fetchStockInById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get(`/stock-in/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock-in');
    }
  }
);

export const createStockIn = createAsyncThunk(
  'stockIn/createStockIn',
  async (stockInData: CreateStockInDto, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().post('/stock-in', stockInData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create stock-in');
    }
  }
);

export const updateStockIn = createAsyncThunk(
  'stockIn/updateStockIn',
  async ({ id, data }: { id: string; data: UpdateStockInDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().put(`/stock-in/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update stock-in');
    }
  }
);

export const updateStockInStatus = createAsyncThunk(
  'stockIn/updateStockInStatus',
  async ({ id, data }: { id: string; data: UpdateStockInStatusDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().put(`/stock-in/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update stock-in status');
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'stockIn/updatePaymentStatus',
  async ({ id, data }: { id: string; data: UpdatePaymentStatusDto }, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().put(`/stock-in/${id}/payment-status`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment status');
    }
  }
);

export const deleteStockIn = createAsyncThunk(
  'stockIn/deleteStockIn',
  async (id: string, { rejectWithValue }) => {
    try {
      await AxiosInstance().delete(`/stock-in/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete stock-in');
    }
  }
);

export const fetchStockInStatistics = createAsyncThunk(
  'stockIn/fetchStatistics',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await AxiosInstance().get('/stock-in/stats', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const fetchMaterialsForSelection = createAsyncThunk(
  'stockIn/fetchMaterialsForSelection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/stock-in/materials');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials');
    }
  }
);

const stockInSlice = createSlice({
  name: 'stockIn',
  initialState,
  reducers: {
    setSelectedStockIn: (state, action: PayloadAction<StockIn | null>) => {
      state.selectedStockIn = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<StockInQueryDto>>) => {
      const newFilters = { ...state.filters, ...action.payload };
      
      // Chỉ xóa các field có giá trị undefined, không xóa chuỗi rỗng
      Object.keys(newFilters).forEach(key => {
        const value = newFilters[key as keyof StockInQueryDto];
        if (value === undefined) {
          delete newFilters[key as keyof StockInQueryDto];
        }
      });
      
      state.filters = newFilters;
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        // Keep pagination settings but clear filter values
        search: undefined,
        status: undefined,
        paymentStatus: undefined,
        supplier: undefined,
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
    // Fetch stock-ins
    builder
      .addCase(fetchStockIns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockIns.fulfilled, (state, action: PayloadAction<StockInListResponse>) => {
        state.isLoading = false;
        state.stockIns = action.payload.data;
        state.allStockIns = action.payload.data; // Store all stock-ins for client-side filtering
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.limit = action.payload.limit;
      })
      .addCase(fetchStockIns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stock-in by ID
    builder
      .addCase(fetchStockInById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockInById.fulfilled, (state, action: PayloadAction<StockIn>) => {
        state.isLoading = false;
        state.selectedStockIn = action.payload;
      })
      .addCase(fetchStockInById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create stock-in
    builder
      .addCase(createStockIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStockIn.fulfilled, (state, action: PayloadAction<StockIn>) => {
        state.isLoading = false;
        state.stockIns.unshift(action.payload);
        state.allStockIns.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createStockIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update stock-in
    builder
      .addCase(updateStockIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStockIn.fulfilled, (state, action: PayloadAction<StockIn>) => {
        state.isLoading = false;
        const index = state.stockIns.findIndex(si => si._id === action.payload._id);
        const allIndex = state.allStockIns.findIndex(si => si._id === action.payload._id);
        if (index !== -1) {
          state.stockIns[index] = action.payload;
        }
        if (allIndex !== -1) {
          state.allStockIns[allIndex] = action.payload;
        }
        if (state.selectedStockIn?._id === action.payload._id) {
          state.selectedStockIn = action.payload;
        }
      })
      .addCase(updateStockIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update stock-in status
    builder
      .addCase(updateStockInStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStockInStatus.fulfilled, (state, action: PayloadAction<StockIn>) => {
        state.isLoading = false;
        const index = state.stockIns.findIndex(si => si._id === action.payload._id);
        const allIndex = state.allStockIns.findIndex(si => si._id === action.payload._id);
        if (index !== -1) {
          state.stockIns[index] = action.payload;
        }
        if (allIndex !== -1) {
          state.allStockIns[allIndex] = action.payload;
        }
        if (state.selectedStockIn?._id === action.payload._id) {
          state.selectedStockIn = action.payload;
        }
      })
      .addCase(updateStockInStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update payment status
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action: PayloadAction<StockIn>) => {
        state.isLoading = false;
        const index = state.stockIns.findIndex(si => si._id === action.payload._id);
        const allIndex = state.allStockIns.findIndex(si => si._id === action.payload._id);
        if (index !== -1) {
          state.stockIns[index] = action.payload;
        }
        if (allIndex !== -1) {
          state.allStockIns[allIndex] = action.payload;
        }
        if (state.selectedStockIn?._id === action.payload._id) {
          state.selectedStockIn = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete stock-in
    builder
      .addCase(deleteStockIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteStockIn.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.stockIns = state.stockIns.filter(si => si._id !== action.payload);
        state.allStockIns = state.allStockIns.filter(si => si._id !== action.payload);
        if (state.selectedStockIn?._id === action.payload) {
          state.selectedStockIn = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteStockIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch statistics
    builder
      .addCase(fetchStockInStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockInStatistics.fulfilled, (state, action: PayloadAction<StockInStatistics>) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStockInStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch materials for selection
    builder
      .addCase(fetchMaterialsForSelection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterialsForSelection.fulfilled, (state, action) => {
        state.isLoading = false;
        // Materials are typically stored in a separate state or used directly
        // This case is here for completeness, but materials might be handled elsewhere
      })
      .addCase(fetchMaterialsForSelection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedStockIn,
  updateFilters,
  clearFilters,
  setPage,
  setLimit,
  clearError,
  resetState,
} = stockInSlice.actions;

export default stockInSlice.reducer;

// Selectors
export const selectStockIns = (state: { stockIn: StockInState }) => state.stockIn.stockIns;
export const selectAllStockIns = (state: { stockIn: StockInState }) => state.stockIn.allStockIns;
export const selectSelectedStockIn = (state: { stockIn: StockInState }) => state.stockIn.selectedStockIn;
export const selectStockInsLoading = (state: { stockIn: StockInState }) => state.stockIn.isLoading;
export const selectStockInsError = (state: { stockIn: StockInState }) => state.stockIn.error;
export const selectStockInsFilters = (state: { stockIn: StockInState }) => state.stockIn.filters;
export const selectStockInsPagination = (state: { stockIn: StockInState }) => state.stockIn.pagination;
export const selectStockInStatistics = (state: { stockIn: StockInState }) => state.stockIn.statistics;

// Client-side filtering selector
export const selectFilteredStockIns = (state: { stockIn: StockInState }) => {
  const { allStockIns, filters } = state.stockIn;
  
  return allStockIns.filter(stockIn => {
    // Filter by search term (stock-in number, supplier, notes) - with Vietnamese diacritics support
    const matchesSearch = !filters.search || filters.search === '' ||
      matchesSearchTerm(stockIn.stockInNumber, filters.search) ||
      (stockIn.supplier && matchesSearchTerm(stockIn.supplier, filters.search)) ||
      (stockIn.notes && matchesSearchTerm(stockIn.notes, filters.search));
    
    // Filter by supplier - with Vietnamese diacritics support
    const matchesSupplier = !filters.supplier || filters.supplier === '' ||
      (stockIn.supplier && matchesSearchTerm(stockIn.supplier, filters.supplier));
    
    // Filter by status
    const matchesStatus = !filters.status || stockIn.status === filters.status;
    
    // Filter by payment status
    const matchesPaymentStatus = !filters.paymentStatus || stockIn.paymentStatus === filters.paymentStatus;
    
    // Filter by date range
    const matchesDateRange = (!filters.startDate && !filters.endDate) || 
      (() => {
        const stockInDate = new Date(stockIn.createdAt);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        if (startDate && endDate) {
          return stockInDate >= startDate && stockInDate <= endDate;
        } else if (startDate) {
          return stockInDate >= startDate;
        } else if (endDate) {
          return stockInDate <= endDate;
        }
        return true;
      })();
    
    return matchesSearch && matchesSupplier && matchesStatus && 
           matchesPaymentStatus && matchesDateRange;
  });
};

// Computed selectors
export const selectStockInsByStatus = (state: { stockIn: StockInState }) => {
  const stockIns = selectFilteredStockIns(state);
  const statusGroups = stockIns.reduce((acc, stockIn) => {
    if (!acc[stockIn.status]) {
      acc[stockIn.status] = [];
    }
    acc[stockIn.status].push(stockIn);
    return acc;
  }, {} as Record<string, StockIn[]>);
  
  return Object.entries(statusGroups).map(([status, stockIns]) => ({
    status,
    stockIns,
    count: stockIns.length,
    totalAmount: stockIns.reduce((sum, si) => sum + si.totalAmount, 0),
  }));
};

export const selectStockInsStats = (state: { stockIn: StockInState }) => {
  const stockIns = state.stockIn.allStockIns;
  
  return {
    total: stockIns.length,
    totalAmount: stockIns.reduce((sum, si) => sum + si.totalAmount, 0),
    paidAmount: stockIns.reduce((sum, si) => sum + si.paidAmount, 0),
    remainingAmount: stockIns.reduce((sum, si) => sum + si.remainingAmount, 0),
    pending: stockIns.filter(si => si.status === 'pending').length,
    approved: stockIns.filter(si => si.status === 'approved').length,
    rejected: stockIns.filter(si => si.status === 'rejected').length,
    unpaid: stockIns.filter(si => si.paymentStatus === 'unpaid').length,
    partial: stockIns.filter(si => si.paymentStatus === 'partial').length,
    paid: stockIns.filter(si => si.paymentStatus === 'paid').length,
    averageAmount: stockIns.length > 0 ? stockIns.reduce((sum, si) => sum + si.totalAmount, 0) / stockIns.length : 0,
  };
};
