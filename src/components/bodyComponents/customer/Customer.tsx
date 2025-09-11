import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import { AppDispatch, RootState } from "../../../store";
import { fetchCustomerAnalytics, fetchCustomerRegionAnalytics, fetchCustomerListByRegion } from "../../../store/slices/analyticsSlice";
import CustomerList from "./CustomerList";
import CustomerAnalytics from "./CustomerAnalytics";
import RegionAnalytics from "./RegionAnalytics";
import RegionList from "./RegionList";

const Customer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    customerAnalytics, 
    isCustomerLoading, 
    error,
    regionAnalytics,
    isRegionAnalyticsLoading,
    customerListByRegion,
    isCustomerListByRegionLoading
  } = useSelector((state: RootState) => ({
    customerAnalytics: state.analytics.customerAnalytics,
    isCustomerLoading: state.analytics.isCustomerLoading,
    error: state.analytics.error,
    regionAnalytics: state.analytics.regionAnalytics,
    isRegionAnalyticsLoading: state.analytics.isRegionAnalyticsLoading,
    customerListByRegion: state.analytics.customerListByRegion,
    isCustomerListByRegionLoading: state.analytics.isCustomerListByRegionLoading,
  }));

  const [tabValue, setTabValue] = React.useState(0);

  useEffect(() => {
    dispatch(fetchCustomerAnalytics({}));
    dispatch(fetchCustomerRegionAnalytics({}));
    dispatch(fetchCustomerListByRegion({}));
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isCustomerLoading || isRegionAnalyticsLoading || isCustomerListByRegionLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ m: 0, p: 3, width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Thống Kê Khách Hàng
      </Typography>
      
      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer analytics tabs">
          <Tab label="Tổng Quan Khách Hàng" />
          <Tab label="Thống Kê Khu Vực" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          {customerAnalytics && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Tổng Khách Hàng
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {customerAnalytics.customerOverview.totalCustomers.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Tổng Hóa Đơn
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {customerAnalytics.customerOverview.totalInvoices.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      HĐ Trung Bình/KH
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {customerAnalytics.customerOverview.avgInvoicesPerCustomer.toFixed(1)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Tỷ Lệ Giữ Chân
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {(customerAnalytics.customerRetention.retentionRate * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <CustomerAnalytics />
          <CustomerList />
        </>
      )}

      {tabValue === 1 && (
        <>
          <RegionAnalytics />
          <RegionList />
        </>
      )}
    </Box>
  );
};

export default Customer;
