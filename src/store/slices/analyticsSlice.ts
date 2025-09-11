import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AxiosInstance from '../AxiosInstance';

// ==================== INTERFACES ====================

// Financial Analytics Interfaces
export interface RevenueAnalytics {
  totalRevenue: number;
  revenueByMonth: Array<{
    _id: {
      year: number;
      month: number;
    };
    revenue: number;
    count: number;
  }>;
  averageOrderValue: {
    avgOrderValue: number;
    minOrderValue: number;
    maxOrderValue: number;
  };
  revenueGrowth: {
    current: number;
    previous: number;
    growthRate: number;
    growthAmount: number;
  };
  paymentMethodRevenue: Array<{
    _id: string;
    totalRevenue: number;
    count: number;
    avgValue: number;
  }>;
}

export interface PaymentAnalytics {
  paymentStatusStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  }>;
  debtAnalysis: {
    totalDebt: number;
    avgDebtPerInvoice: number;
    maxDebt: number;
    minDebt: number;
    debtCount: number;
    unpaidCount: number;
    partialCount: number;
  };
  paymentMethodStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    avgAmount: number;
  }>;
  overdueInvoices: {
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  totalPaidAmount: {
    totalPaid: number;
    totalRevenue: number;
    paymentRate: number;
  };
  debtByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
    };
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
    maxDebt: number;
    lastOrderDate: string;
  }>;
  paymentHistory: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalRevenue: number;
    totalPaid: number;
    totalDebt: number;
    invoiceCount: number;
  }>;
  summary: {
    totalDebt: number;
    totalPaid: number;
    totalRevenue: number;
    paymentRate: number;
    debtRate: number;
  };
}

// Inventory Analytics Interfaces
export interface InventoryAnalytics {
  inventoryOverview: {
    totalItems: number;
    totalQuantity: number;
    avgQuantity: number;
    totalValue: number;
  };
  lowStockItems: Array<{
    _id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
  }>;
  topSellingMaterials: Array<{
    _id: {
      materialId: string;
      materialName: string;
    };
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
  }>;
  slowMovingItems: Array<{
    _id: {
      materialId: string;
      materialName: string;
    };
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    lastOrderDate: string;
  }>;
  categoryAnalysis: Array<{
    _id: string;
    count: number;
    totalQuantity: number;
    totalValue: number;
    avgPrice: number;
  }>;
  inventoryValue: number;
}

// Customer Analytics Interfaces
export interface CustomerAnalytics {
  customerOverview: {
    totalCustomers: number;
    totalInvoices: number;
    avgInvoicesPerCustomer: number;
  };
  topCustomers: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
    };
    totalSpent: number;
    invoiceCount: number;
    avgOrderValue: number;
    lastOrderDate: string;
    firstOrderDate: string;
    totalPaid: number;
    totalDebt: number;
  }>;
  customerSegments: Array<{
    _id: string;
    count: number;
    avgSpent: number;
    avgOrders: number;
  }>;
  customerRetention: {
    retentionRate: number;
    newCustomers: number;
    returningCustomers: number;
  };
  newVsReturningCustomers: {
    newCustomers: number;
    returningCustomers: number;
  };
  customerDetails: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
    };
    totalSpent: number;
    invoiceCount: number;
    avgOrderValue: number;
    lastOrderDate: string;
    firstOrderDate: string;
    totalPaid: number;
    totalDebt: number;
    unpaidInvoices: number;
    partialInvoices: number;
    paidInvoices: number;
  }>;
  customerPaymentAnalysis: Array<{
    _id: string;
    totalDebt: number;
    avgDebt: number;
    maxDebt: number;
    debtInvoices: number;
  }>;
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    totalDebt: number;
    avgCustomerValue: number;
  };
}

// Customer List Interface
export interface CustomerListResponse {
  customers: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
    };
    totalSpent: number;
    invoiceCount: number;
    avgOrderValue: number;
    lastOrderDate: string;
    firstOrderDate: string;
    totalPaid: number;
    totalDebt: number;
    unpaidInvoices: number;
    partialInvoices: number;
    paidInvoices: number;
  }>;
  pagination: {
    total: number;
    limit: number;
    page: number;
    hasMore: boolean;
  };
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    totalDebt: number;
    avgCustomerValue: number;
  };
}

// Region Analytics Interfaces
export interface RegionAnalytics {
  regionStats: Array<{
    region: string;
    customerCount: number;
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalPaid: number;
    totalDebt: number;
  }>;
  topRegions: Array<{
    region: string;
    customerCount: number;
  }>;
  regionRevenue: Array<{
    region: string;
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  }>;
  regionGrowth: Array<{
    region: string;
    currentCustomers: number;
    previousCustomers: number;
    customerGrowth: number;
    currentRevenue: number;
    previousRevenue: number;
    revenueGrowth: number;
  }>;
  summary: {
    totalRegions: number;
    totalCustomers: number;
    totalRevenue: number;
    avgCustomersPerRegion: number;
  };
}

export interface CustomerListByRegionResponse {
  regions: Array<{
    region: string;
    customerCount: number;
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalPaid: number;
    totalDebt: number;
    lastOrderDate: string;
    firstOrderDate: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    page: number;
    hasMore: boolean;
  };
  summary: {
    totalRegions: number;
    totalCustomers: number;
    totalRevenue: number;
    avgCustomersPerRegion: number;
  };
}

// Stock-In Analytics Interfaces
export interface StockInAnalytics {
  stockInOverview: {
    totalStockIns: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    avgAmount: number;
  };
  supplierAnalysis: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
    lastOrderDate: string;
  }>;
  paymentStatusAnalysis: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  }>;
  processingTimeAnalysis: Array<{
    _id: null;
    avgProcessingTime: number;
    minProcessingTime: number;
    maxProcessingTime: number;
  }>;
}

// Debt Analytics Interfaces
export interface DebtAnalytics {
  debtOverview: {
    totalDebt: number;
    totalInvoices: number;
    avgDebtPerInvoice: number;
    maxDebt: number;
    minDebt: number;
    unpaidCount: number;
    partialCount: number;
  };
  debtByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
    };
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
    maxDebt: number;
    lastOrderDate: string;
    firstDebtDate: string;
    unpaidInvoices: number;
    partialInvoices: number;
  }>;
  debtByStatus: Array<{
    _id: string;
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
  }>;
  debtByTimeRange: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
  }>;
  topDebtCustomers: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
    };
    totalDebt: number;
    invoiceCount: number;
    lastOrderDate: string;
  }>;
  debtAging: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
    invoices: Array<{
      invoiceNumber: string;
      customerName: string;
      remainingAmount: number;
      daysSinceCreated: number;
    }>;
  }>;
  summary: {
    totalDebt: number;
    totalDebtCustomers: number;
    avgDebtPerCustomer: number;
  };
}

// Payment History Analytics Interfaces
export interface PaymentHistoryAnalytics {
  paymentOverview: {
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    totalInvoices: number;
    paidInvoices: number;
    partialInvoices: number;
    unpaidInvoices: number;
    avgPaymentRate: number;
  };
  paymentByMethod: Array<{
    _id: string;
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    invoiceCount: number;
    avgPaymentRate: number;
  }>;
  paymentByTimeRange: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    invoiceCount: number;
    paymentRate: number;
  }>;
  paymentByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
    };
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    invoiceCount: number;
    avgPaymentRate: number;
    lastPaymentDate: string;
  }>;
  recentPayments: Array<{
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
  summary: {
    totalPaid: number;
    totalRevenue: number;
    paymentRate: number;
    totalCustomers: number;
  };
}

// Overdue Debt Report Interfaces
export interface OverdueDebtReport {
  overdueOverview: {
    totalOverdueAmount: number;
    totalOverdueInvoices: number;
    avgOverdueAmount: number;
    maxOverdueAmount: number;
    minOverdueAmount: number;
  };
  overdueByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
    };
    totalOverdueAmount: number;
    overdueInvoices: number;
    avgOverdueAmount: number;
    oldestOverdueDate: string;
    newestOverdueDate: string;
  }>;
  overdueByTimeRange: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  criticalOverdue: Array<{
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    remainingAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
  summary: {
    totalOverdueAmount: number;
    totalOverdueInvoices: number;
    totalOverdueCustomers: number;
    criticalOverdueCount: number;
  };
}

// Time-Based Analytics Interfaces
export interface TimeBasedAnalytics {
  dailyTrends: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    revenue: number;
    orders: number;
  }>;
  weeklyTrends: Array<{
    _id: {
      year: number;
      week: number;
    };
    revenue: number;
    orders: number;
  }>;
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
    };
    revenue: number;
    orders: number;
  }>;
  seasonalAnalysis: Array<{
    _id: number;
    revenue: number;
    orders: number;
  }>;
  yearOverYearComparison: {
    currentYear: {
      year: number;
      revenue: number;
      orders: number;
    };
    lastYear: {
      year: number;
      revenue: number;
      orders: number;
    };
    revenueGrowth: number;
    orderGrowth: number;
  };
}

// Dashboard Interfaces
export interface FinancialSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface InventorySummary {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
}

export interface CustomerSummary {
  totalCustomers: number;
  newCustomers: number;
}

export interface StockInSummary {
  totalStockIns: number;
  pendingCount: number;
  totalAmount: number;
}

export interface Alert {
  lowStockItems: Array<{
    _id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
  }>;
  overdueInvoices: Array<{
    _id: string;
    invoiceNumber: string;
    customerName: string;
    remainingAmount: number;
    createdAt: string;
  }>;
  pendingStockIns: Array<{
    _id: string;
    supplier: string;
    totalAmount: number;
    createdAt: string;
  }>;
  totalAlerts: number;
}

export interface DashboardData {
  financialSummary: FinancialSummary;
  inventorySummary: InventorySummary;
  customerSummary: CustomerSummary;
  stockInSummary: StockInSummary;
  alerts: Alert;
  lastUpdated: string;
}

// Query Interfaces
export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  format?: 'json' | 'csv';
  category?: string;
  supplier?: string;
  customerId?: string;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface QuickStatsQuery {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

export interface CustomerListQuery {
  startDate?: string;
  endDate?: string;
  sortBy?: 'totalSpent' | 'invoiceCount' | 'lastOrderDate' | 'totalDebt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface RegionAnalyticsQuery {
  startDate?: string;
  endDate?: string;
}

export interface CustomerListByRegionQuery {
  region?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'customerCount' | 'totalRevenue' | 'totalOrders';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface DebtAnalyticsQuery {
  startDate?: string;
  endDate?: string;
}

export interface PaymentHistoryQuery {
  startDate?: string;
  endDate?: string;
}

export interface OverdueDebtQuery {
  daysOverdue?: number;
}

// State Interface
export interface AnalyticsState {
  // Data
  revenueAnalytics: RevenueAnalytics | null;
  paymentAnalytics: PaymentAnalytics | null;
  inventoryAnalytics: InventoryAnalytics | null;
  customerAnalytics: CustomerAnalytics | null;
  customerList: CustomerListResponse | null;
  regionAnalytics: RegionAnalytics | null;
  customerListByRegion: CustomerListByRegionResponse | null;
  stockInAnalytics: StockInAnalytics | null;
  timeBasedAnalytics: TimeBasedAnalytics | null;
  debtAnalytics: DebtAnalytics | null;
  paymentHistoryAnalytics: PaymentHistoryAnalytics | null;
  overdueDebtReport: OverdueDebtReport | null;
  dashboardData: DashboardData | null;
  
  // Loading states
  isLoading: boolean;
  isRevenueLoading: boolean;
  isPaymentLoading: boolean;
  isInventoryLoading: boolean;
  isCustomerLoading: boolean;
  isCustomerListLoading: boolean;
  isRegionAnalyticsLoading: boolean;
  isCustomerListByRegionLoading: boolean;
  isStockInLoading: boolean;
  isTimeBasedLoading: boolean;
  isDebtLoading: boolean;
  isPaymentHistoryLoading: boolean;
  isOverdueDebtLoading: boolean;
  isDashboardLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Filters
  filters: AnalyticsQuery;
  dateRangeFilters: DateRangeQuery;
  quickStatsFilters: QuickStatsQuery;
  customerListFilters: CustomerListQuery;
  regionAnalyticsFilters: RegionAnalyticsQuery;
  customerListByRegionFilters: CustomerListByRegionQuery;
  debtAnalyticsFilters: DebtAnalyticsQuery;
  paymentHistoryFilters: PaymentHistoryQuery;
  overdueDebtFilters: OverdueDebtQuery;
  
  // Cache
  lastFetched: {
    revenue: string | null;
    payment: string | null;
    inventory: string | null;
    customer: string | null;
    customerList: string | null;
    regionAnalytics: string | null;
    customerListByRegion: string | null;
    stockIn: string | null;
    timeBased: string | null;
    debt: string | null;
    paymentHistory: string | null;
    overdueDebt: string | null;
    dashboard: string | null;
  };
}

const initialState: AnalyticsState = {
  // Data
  revenueAnalytics: null,
  paymentAnalytics: null,
  inventoryAnalytics: null,
  customerAnalytics: null,
  customerList: null,
  regionAnalytics: null,
  customerListByRegion: null,
  stockInAnalytics: null,
  timeBasedAnalytics: null,
  debtAnalytics: null,
  paymentHistoryAnalytics: null,
  overdueDebtReport: null,
  dashboardData: null,
  
  // Loading states
  isLoading: false,
  isRevenueLoading: false,
  isPaymentLoading: false,
  isInventoryLoading: false,
  isCustomerLoading: false,
  isCustomerListLoading: false,
  isRegionAnalyticsLoading: false,
  isCustomerListByRegionLoading: false,
  isStockInLoading: false,
  isTimeBasedLoading: false,
  isDebtLoading: false,
  isPaymentHistoryLoading: false,
  isOverdueDebtLoading: false,
  isDashboardLoading: false,
  
  // Error state
  error: null,
  
  // Filters
  filters: {},
  dateRangeFilters: {},
  quickStatsFilters: {},
  customerListFilters: {},
  regionAnalyticsFilters: {},
  customerListByRegionFilters: {},
  debtAnalyticsFilters: {},
  paymentHistoryFilters: {},
  overdueDebtFilters: {},
  
  // Cache
  lastFetched: {
    revenue: null,
    payment: null,
    inventory: null,
    customer: null,
    customerList: null,
    regionAnalytics: null,
    customerListByRegion: null,
    stockIn: null,
    timeBased: null,
    debt: null,
    paymentHistory: null,
    overdueDebt: null,
    dashboard: null,
  },
};

// ==================== ASYNC THUNKS ====================

// Financial Analytics
export const fetchRevenueAnalytics = createAsyncThunk(
  'analytics/fetchRevenueAnalytics',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/revenue', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue analytics');
    }
  }
);

export const fetchPaymentAnalytics = createAsyncThunk(
  'analytics/fetchPaymentAnalytics',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/payments', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment analytics');
    }
  }
);

// Inventory Analytics
export const fetchInventoryAnalytics = createAsyncThunk(
  'analytics/fetchInventoryAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/inventory');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory analytics');
    }
  }
);

// Customer Analytics
export const fetchCustomerAnalytics = createAsyncThunk(
  'analytics/fetchCustomerAnalytics',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/customers', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer analytics');
    }
  }
);

export const fetchCustomerList = createAsyncThunk(
  'analytics/fetchCustomerList',
  async (query: CustomerListQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/customers/list', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer list');
    }
  }
);

export const fetchCustomerRegionAnalytics = createAsyncThunk(
  'analytics/fetchCustomerRegionAnalytics',
  async (query: RegionAnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/customers/regions', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer region analytics');
    }
  }
);

export const fetchCustomerListByRegion = createAsyncThunk(
  'analytics/fetchCustomerListByRegion',
  async (query: CustomerListByRegionQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/customers/regions/list', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer list by region');
    }
  }
);

// Stock-In Analytics
export const fetchStockInAnalytics = createAsyncThunk(
  'analytics/fetchStockInAnalytics',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/stock-in', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock-in analytics');
    }
  }
);

// Time-Based Analytics
export const fetchTimeBasedAnalytics = createAsyncThunk(
  'analytics/fetchTimeBasedAnalytics',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/trends', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch time-based analytics');
    }
  }
);

// Dashboard Data
export const fetchDashboardData = createAsyncThunk(
  'analytics/fetchDashboardData',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/dashboard', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);


// Reports
export const fetchFinancialReport = createAsyncThunk(
  'analytics/fetchFinancialReport',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/reports/financial', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial report');
    }
  }
);

export const fetchInventoryReport = createAsyncThunk(
  'analytics/fetchInventoryReport',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/reports/inventory', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory report');
    }
  }
);

export const fetchCustomerReport = createAsyncThunk(
  'analytics/fetchCustomerReport',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/reports/customers', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer report');
    }
  }
);

export const fetchStockInReport = createAsyncThunk(
  'analytics/fetchStockInReport',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/reports/stock-in', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock-in report');
    }
  }
);

// Debt Analytics
export const fetchDebtAnalytics = createAsyncThunk(
  'analytics/fetchDebtAnalytics',
  async (query: DebtAnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/debt', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch debt analytics');
    }
  }
);

// Payment History Analytics
export const fetchPaymentHistoryAnalytics = createAsyncThunk(
  'analytics/fetchPaymentHistoryAnalytics',
  async (query: PaymentHistoryQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/payments/history', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history analytics');
    }
  }
);

// Overdue Debt Report
export const fetchOverdueDebtReport = createAsyncThunk(
  'analytics/fetchOverdueDebtReport',
  async (query: OverdueDebtQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/debt/overdue', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue debt report');
    }
  }
);

// Debt Report
export const fetchDebtReport = createAsyncThunk(
  'analytics/fetchDebtReport',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/reports/debt', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch debt report');
    }
  }
);

// Payment Report
export const fetchPaymentReport = createAsyncThunk(
  'analytics/fetchPaymentReport',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/reports/payments', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment report');
    }
  }
);

// Overdue Report
export const fetchOverdueReport = createAsyncThunk(
  'analytics/fetchOverdueReport',
  async (query: AnalyticsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/reports/overdue', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue report');
    }
  }
);

// Date Range Analytics
export const fetchDateRangeAnalytics = createAsyncThunk(
  'analytics/fetchDateRangeAnalytics',
  async (query: DateRangeQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/date-range', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch date range analytics');
    }
  }
);

// Quick Stats
export const fetchQuickStats = createAsyncThunk(
  'analytics/fetchQuickStats',
  async (query: QuickStatsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/quick-stats', { params: query });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quick stats');
    }
  }
);

// Alerts
export const fetchAlerts = createAsyncThunk(
  'analytics/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance().get('/analytics/alerts');
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

// ==================== SLICE ====================

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Filter actions
    updateFilters: (state, action: PayloadAction<Partial<AnalyticsQuery>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateDateRangeFilters: (state, action: PayloadAction<Partial<DateRangeQuery>>) => {
      state.dateRangeFilters = { ...state.dateRangeFilters, ...action.payload };
    },
    clearDateRangeFilters: (state) => {
      state.dateRangeFilters = {};
    },
    updateQuickStatsFilters: (state, action: PayloadAction<Partial<QuickStatsQuery>>) => {
      state.quickStatsFilters = { ...state.quickStatsFilters, ...action.payload };
    },
    clearQuickStatsFilters: (state) => {
      state.quickStatsFilters = {};
    },
    updateCustomerListFilters: (state, action: PayloadAction<Partial<CustomerListQuery>>) => {
      state.customerListFilters = { ...state.customerListFilters, ...action.payload };
    },
    clearCustomerListFilters: (state) => {
      state.customerListFilters = {};
    },
    updateRegionAnalyticsFilters: (state, action: PayloadAction<Partial<RegionAnalyticsQuery>>) => {
      state.regionAnalyticsFilters = { ...state.regionAnalyticsFilters, ...action.payload };
    },
    clearRegionAnalyticsFilters: (state) => {
      state.regionAnalyticsFilters = {};
    },
    updateCustomerListByRegionFilters: (state, action: PayloadAction<Partial<CustomerListByRegionQuery>>) => {
      state.customerListByRegionFilters = { ...state.customerListByRegionFilters, ...action.payload };
    },
    clearCustomerListByRegionFilters: (state) => {
      state.customerListByRegionFilters = {};
    },
    updateDebtAnalyticsFilters: (state, action: PayloadAction<Partial<DebtAnalyticsQuery>>) => {
      state.debtAnalyticsFilters = { ...state.debtAnalyticsFilters, ...action.payload };
    },
    clearDebtAnalyticsFilters: (state) => {
      state.debtAnalyticsFilters = {};
    },
    updatePaymentHistoryFilters: (state, action: PayloadAction<Partial<PaymentHistoryQuery>>) => {
      state.paymentHistoryFilters = { ...state.paymentHistoryFilters, ...action.payload };
    },
    clearPaymentHistoryFilters: (state) => {
      state.paymentHistoryFilters = {};
    },
    updateOverdueDebtFilters: (state, action: PayloadAction<Partial<OverdueDebtQuery>>) => {
      state.overdueDebtFilters = { ...state.overdueDebtFilters, ...action.payload };
    },
    clearOverdueDebtFilters: (state) => {
      state.overdueDebtFilters = {};
    },
    
    // Error actions
    clearError: (state) => {
      state.error = null;
    },
    
    // Cache actions
    clearCache: (state) => {
      state.lastFetched = {
        revenue: null,
        payment: null,
        inventory: null,
        customer: null,
        customerList: null,
        regionAnalytics: null,
        customerListByRegion: null,
        stockIn: null,
        timeBased: null,
        debt: null,
        paymentHistory: null,
        overdueDebt: null,
        dashboard: null,
      };
    },
    
    // Reset state
    resetAnalyticsState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Revenue Analytics
    builder
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.isRevenueLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.isRevenueLoading = false;
        state.isLoading = false;
        state.revenueAnalytics = action.payload;
        state.lastFetched.revenue = new Date().toISOString();
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.isRevenueLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Payment Analytics
    builder
      .addCase(fetchPaymentAnalytics.pending, (state) => {
        state.isPaymentLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentAnalytics.fulfilled, (state, action) => {
        state.isPaymentLoading = false;
        state.isLoading = false;
        state.paymentAnalytics = action.payload;
        state.lastFetched.payment = new Date().toISOString();
      })
      .addCase(fetchPaymentAnalytics.rejected, (state, action) => {
        state.isPaymentLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Inventory Analytics
    builder
      .addCase(fetchInventoryAnalytics.pending, (state) => {
        state.isInventoryLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        state.isInventoryLoading = false;
        state.isLoading = false;
        state.inventoryAnalytics = action.payload;
        state.lastFetched.inventory = new Date().toISOString();
      })
      .addCase(fetchInventoryAnalytics.rejected, (state, action) => {
        state.isInventoryLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Customer Analytics
    builder
      .addCase(fetchCustomerAnalytics.pending, (state) => {
        state.isCustomerLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action) => {
        state.isCustomerLoading = false;
        state.isLoading = false;
        state.customerAnalytics = action.payload;
        state.lastFetched.customer = new Date().toISOString();
      })
      .addCase(fetchCustomerAnalytics.rejected, (state, action) => {
        state.isCustomerLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Customer List
    builder
      .addCase(fetchCustomerList.pending, (state) => {
        state.isCustomerListLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerList.fulfilled, (state, action) => {
        state.isCustomerListLoading = false;
        state.isLoading = false;
        state.customerList = action.payload;
        state.lastFetched.customerList = new Date().toISOString();
      })
      .addCase(fetchCustomerList.rejected, (state, action) => {
        state.isCustomerListLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Customer Region Analytics
    builder
      .addCase(fetchCustomerRegionAnalytics.pending, (state) => {
        state.isRegionAnalyticsLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerRegionAnalytics.fulfilled, (state, action) => {
        state.isRegionAnalyticsLoading = false;
        state.isLoading = false;
        state.regionAnalytics = action.payload;
        state.lastFetched.regionAnalytics = new Date().toISOString();
      })
      .addCase(fetchCustomerRegionAnalytics.rejected, (state, action) => {
        state.isRegionAnalyticsLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Customer List By Region
    builder
      .addCase(fetchCustomerListByRegion.pending, (state) => {
        state.isCustomerListByRegionLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerListByRegion.fulfilled, (state, action) => {
        state.isCustomerListByRegionLoading = false;
        state.isLoading = false;
        state.customerListByRegion = action.payload;
        state.lastFetched.customerListByRegion = new Date().toISOString();
      })
      .addCase(fetchCustomerListByRegion.rejected, (state, action) => {
        state.isCustomerListByRegionLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Stock-In Analytics
    builder
      .addCase(fetchStockInAnalytics.pending, (state) => {
        state.isStockInLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockInAnalytics.fulfilled, (state, action) => {
        state.isStockInLoading = false;
        state.isLoading = false;
        state.stockInAnalytics = action.payload;
        state.lastFetched.stockIn = new Date().toISOString();
      })
      .addCase(fetchStockInAnalytics.rejected, (state, action) => {
        state.isStockInLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Time-Based Analytics
    builder
      .addCase(fetchTimeBasedAnalytics.pending, (state) => {
        state.isTimeBasedLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeBasedAnalytics.fulfilled, (state, action) => {
        state.isTimeBasedLoading = false;
        state.isLoading = false;
        state.timeBasedAnalytics = action.payload;
        state.lastFetched.timeBased = new Date().toISOString();
      })
      .addCase(fetchTimeBasedAnalytics.rejected, (state, action) => {
        state.isTimeBasedLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isDashboardLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isDashboardLoading = false;
        state.isLoading = false;
        state.dashboardData = action.payload;
        state.lastFetched.dashboard = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Quick Stats
    builder
      .addCase(fetchQuickStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuickStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
        state.lastFetched.dashboard = new Date().toISOString();
      })
      .addCase(fetchQuickStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Alerts
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.dashboardData) {
          state.dashboardData.alerts = action.payload;
        }
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Date Range Analytics
    builder
      .addCase(fetchDateRangeAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDateRangeAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        // This could update multiple analytics based on the response
        // For now, we'll just handle the loading state
      })
      .addCase(fetchDateRangeAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reports - These don't update state, just handle loading/error
    builder
      .addCase(fetchFinancialReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFinancialReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchFinancialReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchInventoryReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchInventoryReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCustomerReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCustomerReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchStockInReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockInReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchStockInReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Debt Analytics
    builder
      .addCase(fetchDebtAnalytics.pending, (state) => {
        state.isDebtLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDebtAnalytics.fulfilled, (state, action) => {
        state.isDebtLoading = false;
        state.isLoading = false;
        state.debtAnalytics = action.payload;
        state.lastFetched.debt = new Date().toISOString();
      })
      .addCase(fetchDebtAnalytics.rejected, (state, action) => {
        state.isDebtLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Payment History Analytics
    builder
      .addCase(fetchPaymentHistoryAnalytics.pending, (state) => {
        state.isPaymentHistoryLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistoryAnalytics.fulfilled, (state, action) => {
        state.isPaymentHistoryLoading = false;
        state.isLoading = false;
        state.paymentHistoryAnalytics = action.payload;
        state.lastFetched.paymentHistory = new Date().toISOString();
      })
      .addCase(fetchPaymentHistoryAnalytics.rejected, (state, action) => {
        state.isPaymentHistoryLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Overdue Debt Report
    builder
      .addCase(fetchOverdueDebtReport.pending, (state) => {
        state.isOverdueDebtLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOverdueDebtReport.fulfilled, (state, action) => {
        state.isOverdueDebtLoading = false;
        state.isLoading = false;
        state.overdueDebtReport = action.payload;
        state.lastFetched.overdueDebt = new Date().toISOString();
      })
      .addCase(fetchOverdueDebtReport.rejected, (state, action) => {
        state.isOverdueDebtLoading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Debt Report
    builder
      .addCase(fetchDebtReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDebtReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchDebtReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Payment Report
    builder
      .addCase(fetchPaymentReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchPaymentReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Overdue Report
    builder
      .addCase(fetchOverdueReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOverdueReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchOverdueReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

  },
});

export const {
  updateFilters,
  clearFilters,
  updateDateRangeFilters,
  clearDateRangeFilters,
  updateQuickStatsFilters,
  clearQuickStatsFilters,
  updateCustomerListFilters,
  clearCustomerListFilters,
  updateRegionAnalyticsFilters,
  clearRegionAnalyticsFilters,
  updateCustomerListByRegionFilters,
  clearCustomerListByRegionFilters,
  updateDebtAnalyticsFilters,
  clearDebtAnalyticsFilters,
  updatePaymentHistoryFilters,
  clearPaymentHistoryFilters,
  updateOverdueDebtFilters,
  clearOverdueDebtFilters,
  clearError,
  clearCache,
  resetAnalyticsState,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

// ==================== SELECTORS ====================

// Basic selectors
export const selectRevenueAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.revenueAnalytics;
export const selectPaymentAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.paymentAnalytics;
export const selectInventoryAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.inventoryAnalytics;
export const selectCustomerAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.customerAnalytics;
export const selectCustomerList = (state: { analytics: AnalyticsState }) => state.analytics.customerList;
export const selectRegionAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.regionAnalytics;
export const selectCustomerListByRegion = (state: { analytics: AnalyticsState }) => state.analytics.customerListByRegion;
export const selectStockInAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.stockInAnalytics;
export const selectTimeBasedAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.timeBasedAnalytics;
export const selectDebtAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.debtAnalytics;
export const selectPaymentHistoryAnalytics = (state: { analytics: AnalyticsState }) => state.analytics.paymentHistoryAnalytics;
export const selectOverdueDebtReport = (state: { analytics: AnalyticsState }) => state.analytics.overdueDebtReport;
export const selectDashboardData = (state: { analytics: AnalyticsState }) => state.analytics.dashboardData;

// Loading selectors
export const selectAnalyticsLoading = (state: { analytics: AnalyticsState }) => state.analytics.isLoading;
export const selectRevenueLoading = (state: { analytics: AnalyticsState }) => state.analytics.isRevenueLoading;
export const selectPaymentLoading = (state: { analytics: AnalyticsState }) => state.analytics.isPaymentLoading;
export const selectInventoryLoading = (state: { analytics: AnalyticsState }) => state.analytics.isInventoryLoading;
export const selectCustomerLoading = (state: { analytics: AnalyticsState }) => state.analytics.isCustomerLoading;
export const selectCustomerListLoading = (state: { analytics: AnalyticsState }) => state.analytics.isCustomerListLoading;
export const selectRegionAnalyticsLoading = (state: { analytics: AnalyticsState }) => state.analytics.isRegionAnalyticsLoading;
export const selectCustomerListByRegionLoading = (state: { analytics: AnalyticsState }) => state.analytics.isCustomerListByRegionLoading;
export const selectStockInLoading = (state: { analytics: AnalyticsState }) => state.analytics.isStockInLoading;
export const selectTimeBasedLoading = (state: { analytics: AnalyticsState }) => state.analytics.isTimeBasedLoading;
export const selectDebtLoading = (state: { analytics: AnalyticsState }) => state.analytics.isDebtLoading;
export const selectPaymentHistoryLoading = (state: { analytics: AnalyticsState }) => state.analytics.isPaymentHistoryLoading;
export const selectOverdueDebtLoading = (state: { analytics: AnalyticsState }) => state.analytics.isOverdueDebtLoading;
export const selectDashboardLoading = (state: { analytics: AnalyticsState }) => state.analytics.isDashboardLoading;

// Error selector
export const selectAnalyticsError = (state: { analytics: AnalyticsState }) => state.analytics.error;

// Filter selectors
export const selectAnalyticsFilters = (state: { analytics: AnalyticsState }) => state.analytics.filters;
export const selectDateRangeFilters = (state: { analytics: AnalyticsState }) => state.analytics.dateRangeFilters;
export const selectQuickStatsFilters = (state: { analytics: AnalyticsState }) => state.analytics.quickStatsFilters;
export const selectCustomerListFilters = (state: { analytics: AnalyticsState }) => state.analytics.customerListFilters;
export const selectRegionAnalyticsFilters = (state: { analytics: AnalyticsState }) => state.analytics.regionAnalyticsFilters;
export const selectCustomerListByRegionFilters = (state: { analytics: AnalyticsState }) => state.analytics.customerListByRegionFilters;
export const selectDebtAnalyticsFilters = (state: { analytics: AnalyticsState }) => state.analytics.debtAnalyticsFilters;
export const selectPaymentHistoryFilters = (state: { analytics: AnalyticsState }) => state.analytics.paymentHistoryFilters;
export const selectOverdueDebtFilters = (state: { analytics: AnalyticsState }) => state.analytics.overdueDebtFilters;

// Cache selectors
export const selectLastFetched = (state: { analytics: AnalyticsState }) => state.analytics.lastFetched;

// Computed selectors
export const selectIsDataStale = (state: { analytics: AnalyticsState }) => {
  const { lastFetched } = state.analytics;
  const now = new Date();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes

  return Object.values(lastFetched).some(lastFetch => {
    if (!lastFetch) return true;
    const fetchTime = new Date(lastFetch);
    return (now.getTime() - fetchTime.getTime()) > staleThreshold;
  });
};

export const selectHasAnyData = (state: { analytics: AnalyticsState }) => {
  const { analytics } = state;
  return !!(
    analytics.revenueAnalytics ||
    analytics.paymentAnalytics ||
    analytics.inventoryAnalytics ||
    analytics.customerAnalytics ||
    analytics.stockInAnalytics ||
    analytics.timeBasedAnalytics ||
    analytics.dashboardData
  );
};

// Dashboard specific selectors
export const selectFinancialSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.dashboardData?.financialSummary || null;

export const selectInventorySummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.dashboardData?.inventorySummary || null;

export const selectCustomerSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.dashboardData?.customerSummary || null;

export const selectStockInSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.dashboardData?.stockInSummary || null;

export const selectAlerts = (state: { analytics: AnalyticsState }) => 
  state.analytics.dashboardData?.alerts || null;

// Revenue specific selectors
export const selectTotalRevenue = (state: { analytics: AnalyticsState }) => 
  state.analytics.revenueAnalytics?.totalRevenue || 0;

export const selectRevenueGrowth = (state: { analytics: AnalyticsState }) => 
  state.analytics.revenueAnalytics?.revenueGrowth || null;

export const selectAverageOrderValue = (state: { analytics: AnalyticsState }) => 
  state.analytics.revenueAnalytics?.averageOrderValue || null;

// Inventory specific selectors
export const selectLowStockItems = (state: { analytics: AnalyticsState }) => 
  state.analytics.inventoryAnalytics?.lowStockItems || [];

export const selectTopSellingMaterials = (state: { analytics: AnalyticsState }) => 
  state.analytics.inventoryAnalytics?.topSellingMaterials || [];

export const selectInventoryValue = (state: { analytics: AnalyticsState }) => 
  state.analytics.inventoryAnalytics?.inventoryValue || 0;

// Customer specific selectors
export const selectTopCustomers = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerAnalytics?.topCustomers || [];

export const selectCustomerRetention = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerAnalytics?.customerRetention || null;

// Time-based specific selectors
export const selectMonthlyTrends = (state: { analytics: AnalyticsState }) => 
  state.analytics.timeBasedAnalytics?.monthlyTrends || [];

export const selectYearOverYearComparison = (state: { analytics: AnalyticsState }) => 
  state.analytics.timeBasedAnalytics?.yearOverYearComparison || null;

// Customer List specific selectors
export const selectCustomerListCustomers = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerList?.customers || [];

export const selectCustomerListPagination = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerList?.pagination || null;

export const selectCustomerListSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerList?.summary || null;

// Region Analytics specific selectors
export const selectRegionStats = (state: { analytics: AnalyticsState }) => 
  state.analytics.regionAnalytics?.regionStats || [];

export const selectTopRegions = (state: { analytics: AnalyticsState }) => 
  state.analytics.regionAnalytics?.topRegions || [];

export const selectRegionRevenue = (state: { analytics: AnalyticsState }) => 
  state.analytics.regionAnalytics?.regionRevenue || [];

export const selectRegionGrowth = (state: { analytics: AnalyticsState }) => 
  state.analytics.regionAnalytics?.regionGrowth || [];

export const selectRegionSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.regionAnalytics?.summary || null;

// Customer List By Region specific selectors
export const selectCustomerListByRegionRegions = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerListByRegion?.regions || [];

export const selectCustomerListByRegionPagination = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerListByRegion?.pagination || null;

export const selectCustomerListByRegionSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.customerListByRegion?.summary || null;

// Debt Analytics specific selectors
export const selectDebtOverview = (state: { analytics: AnalyticsState }) => 
  state.analytics.debtAnalytics?.debtOverview || null;

export const selectDebtByCustomer = (state: { analytics: AnalyticsState }) => 
  state.analytics.debtAnalytics?.debtByCustomer || [];

export const selectDebtByStatus = (state: { analytics: AnalyticsState }) => 
  state.analytics.debtAnalytics?.debtByStatus || [];

export const selectDebtByTimeRange = (state: { analytics: AnalyticsState }) => 
  state.analytics.debtAnalytics?.debtByTimeRange || [];

export const selectTopDebtCustomers = (state: { analytics: AnalyticsState }) => 
  state.analytics.debtAnalytics?.topDebtCustomers || [];

export const selectDebtAging = (state: { analytics: AnalyticsState }) => 
  state.analytics.debtAnalytics?.debtAging || [];

export const selectDebtSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.debtAnalytics?.summary || null;

// Payment History Analytics specific selectors
export const selectPaymentOverview = (state: { analytics: AnalyticsState }) => 
  state.analytics.paymentHistoryAnalytics?.paymentOverview || null;

export const selectPaymentByMethod = (state: { analytics: AnalyticsState }) => 
  state.analytics.paymentHistoryAnalytics?.paymentByMethod || [];

export const selectPaymentByTimeRange = (state: { analytics: AnalyticsState }) => 
  state.analytics.paymentHistoryAnalytics?.paymentByTimeRange || [];

export const selectPaymentByCustomer = (state: { analytics: AnalyticsState }) => 
  state.analytics.paymentHistoryAnalytics?.paymentByCustomer || [];

export const selectRecentPayments = (state: { analytics: AnalyticsState }) => 
  state.analytics.paymentHistoryAnalytics?.recentPayments || [];

export const selectPaymentHistorySummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.paymentHistoryAnalytics?.summary || null;

// Overdue Debt Report specific selectors
export const selectOverdueOverview = (state: { analytics: AnalyticsState }) => 
  state.analytics.overdueDebtReport?.overdueOverview || null;

export const selectOverdueByCustomer = (state: { analytics: AnalyticsState }) => 
  state.analytics.overdueDebtReport?.overdueByCustomer || [];

export const selectOverdueByTimeRange = (state: { analytics: AnalyticsState }) => 
  state.analytics.overdueDebtReport?.overdueByTimeRange || [];

export const selectCriticalOverdue = (state: { analytics: AnalyticsState }) => 
  state.analytics.overdueDebtReport?.criticalOverdue || [];

export const selectOverdueSummary = (state: { analytics: AnalyticsState }) => 
  state.analytics.overdueDebtReport?.summary || null;
