import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { fetchStockInAnalytics } from "../../../store/slices/analyticsSlice";
import { Box, Grid, CircularProgress, Alert, Typography, Paper } from "@mui/material";
import StockInStats from "./StockInStats";
import SupplierAnalysisChart from "./SupplierAnalysisChart";
import PaymentStatusChart from "./PaymentStatusChart";
import ProcessingTimeChart from "./ProcessingTimeChart";

const StockInAnalytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    stockInAnalytics,
    isStockInLoading,
    error 
  } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    // Fetch stock-in analytics data when component mounts
    dispatch(fetchStockInAnalytics({}));
  }, [dispatch]);

  if (error) {
    return (
      <Box sx={{ p: 3, mx: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isStockInLoading) {
    return (
      <Box sx={{ p: 3, mx: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mx: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Thống kê nhập hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Phân tích chi tiết về hoạt động nhập hàng và quản lý kho
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <StockInStats stockInData={stockInAnalytics} />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Supplier Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <SupplierAnalysisChart stockInData={stockInAnalytics} />
          </Paper>
        </Grid>

        {/* Payment Status */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <PaymentStatusChart stockInData={stockInAnalytics} />
          </Paper>
        </Grid>

        {/* Processing Time */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <ProcessingTimeChart stockInData={stockInAnalytics} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockInAnalytics;
