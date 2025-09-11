import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import {
  fetchDashboardData,
  fetchRevenueAnalytics,
  fetchInventoryAnalytics,
  fetchCustomerAnalytics,
  fetchStockInAnalytics,
  fetchTimeBasedAnalytics,
  selectDashboardData,
  selectRevenueAnalytics,
  selectInventoryAnalytics,
  selectCustomerAnalytics,
  selectStockInAnalytics,
  selectTimeBasedAnalytics,
  selectDashboardLoading,
  selectRevenueLoading,
  selectInventoryLoading,
  selectCustomerLoading,
  selectStockInLoading,
  selectTimeBasedLoading,
  selectAnalyticsError,
  clearError,
} from "../../../store/slices/analyticsSlice";

// Import chart components
import RevenueChart from "../home/RevenueChart";
import RevenueByCategory from "../home/RevenueByCategory";
import MaterialUsageChart from "../home/MaterialUsageChart";
import TopSellingMaterials from "../home/TopSellingMaterials";
import DashboardSummary from "../home/DashboardSummary";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState(0);

  // Selectors
  const dashboardData = useSelector(selectDashboardData);
  const revenueAnalytics = useSelector(selectRevenueAnalytics);
  const inventoryAnalytics = useSelector(selectInventoryAnalytics);
  const customerAnalytics = useSelector(selectCustomerAnalytics);
  const stockInAnalytics = useSelector(selectStockInAnalytics);
  const timeBasedAnalytics = useSelector(selectTimeBasedAnalytics);

  const isLoading = useSelector(selectDashboardLoading);
  const isRevenueLoading = useSelector(selectRevenueLoading);
  const isInventoryLoading = useSelector(selectInventoryLoading);
  const isCustomerLoading = useSelector(selectCustomerLoading);
  const isStockInLoading = useSelector(selectStockInLoading);
  const isTimeBasedLoading = useSelector(selectTimeBasedLoading);
  const error = useSelector(selectAnalyticsError);

  useEffect(() => {
    // Load all analytics data
    dispatch(fetchDashboardData({}));
    dispatch(fetchRevenueAnalytics({}));
    dispatch(fetchInventoryAnalytics());
    dispatch(fetchCustomerAnalytics({}));
    dispatch(fetchStockInAnalytics({}));
    dispatch(fetchTimeBasedAnalytics({}));
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    dispatch(clearError());
    dispatch(fetchDashboardData({}));
    dispatch(fetchRevenueAnalytics({}));
    dispatch(fetchInventoryAnalytics());
    dispatch(fetchCustomerAnalytics({}));
    dispatch(fetchStockInAnalytics({}));
    dispatch(fetchTimeBasedAnalytics({}));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getLoadingState = () => {
    return isLoading || isRevenueLoading || isInventoryLoading || 
           isCustomerLoading || isStockInLoading || isTimeBasedLoading;
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        p: 3,
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Bảng Điều Khiển Phân Tích
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {getLoadingState() && <CircularProgress size={24} />}
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
            disabled={getLoadingState()}
          >
            Làm Mới Dữ Liệu
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <DashboardSummary />

      {/* Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Phân Tích Doanh Thu" />
            <Tab label="Phân Tích Kho" />
            <Tab label="Phân Tích Khách Hàng" />
            <Tab label="Phân Tích Nhập Kho" />
            <Tab label="Xu Hướng Thời Gian" />
          </Tabs>
        </Box>

        {/* Revenue Analysis Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <RevenueChart />
            </Grid>
            <Grid item xs={12} md={4}>
              <RevenueByCategory />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Inventory Analysis Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MaterialUsageChart />
            </Grid>
            <Grid item xs={12} md={6}>
              <TopSellingMaterials />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Customer Analysis Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Phân Tích Khách Hàng
                </Typography>
                {isCustomerLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {customerAnalytics?.customerOverview?.totalCustomers || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tổng Khách Hàng
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {customerAnalytics?.customerOverview?.totalInvoices || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tổng Hóa Đơn
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {customerAnalytics?.customerOverview?.avgInvoicesPerCustomer?.toFixed(1) || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          TB Hóa Đơn/Khách Hàng
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {customerAnalytics?.customerRetention?.retentionRate?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tỷ Lệ Giữ Chân
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Stock-In Analysis Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Phân Tích Nhập Kho
                </Typography>
                {isStockInLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {stockInAnalytics?.stockInOverview?.totalStockIns || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tổng Lần Nhập Kho
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(stockInAnalytics?.stockInOverview?.totalAmount || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tổng Số Tiền
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(stockInAnalytics?.stockInOverview?.paidAmount || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Số Tiền Đã Thanh Toán
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(stockInAnalytics?.stockInOverview?.remainingAmount || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Số Tiền Còn Lại
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Time Trends Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MaterialUsageChart />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;
