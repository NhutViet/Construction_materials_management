import React from "react";
import { Box, Grid, Container } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import {
  fetchDashboardData,
  fetchRevenueAnalytics,
  fetchPaymentAnalytics,
  fetchCustomerAnalytics,
  fetchInventoryAnalytics,
  fetchStockInAnalytics,
  fetchDebtAnalytics,
  fetchPaymentHistoryAnalytics,
  fetchCustomerRegionAnalytics,
  fetchAlerts,
} from "../../../store/slices/analyticsSlice";

import DashboardSummary from "./DashboardSummary";
import DateRangeFilter from "./DateRangeFilter";
import AlertsWidget from "./AlertsWidget";
import RevenueChart from "./RevenueChart";
import RevenueByCategory from "./RevenueByCategory";
import PaymentStatusDoughnutChart from "./PaymentStatusDoughnutChart";
import DebtAgingChart from "./DebtAgingChart";
import PaymentHistoryChart from "./PaymentHistoryChart";
import TopCustomersChart from "./TopCustomersChart";
import CustomerSegmentsChart from "./CustomerSegmentsChart";
import LowStockTable from "./LowStockTable";
import TopSellingMaterials from "./TopSellingMaterials";
import RegionRevenueChart from "./RegionRevenueChart";

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRefresh = () => {
    dispatch(fetchDashboardData({}));
    dispatch(fetchRevenueAnalytics({}));
    dispatch(fetchPaymentAnalytics({}));
    dispatch(fetchCustomerAnalytics({}));
    dispatch(fetchInventoryAnalytics());
    dispatch(fetchStockInAnalytics({}));
    dispatch(fetchDebtAnalytics({}));
    dispatch(fetchPaymentHistoryAnalytics({}));
    dispatch(fetchCustomerRegionAnalytics({}));
    dispatch(fetchAlerts());
  };

  const handlePeriodChange = (period: string) => {
    // Handle period change - you can add date range logic here
    console.log("Period changed:", period);
  };

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    // Handle date range change - you can add date filtering logic here
    console.log("Date range changed:", startDate, endDate);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl" sx={{ px: 0 }}>
        {/* Date Range Filter */}
        {/* <DateRangeFilter
          onPeriodChange={handlePeriodChange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
        /> */}

        {/* Dashboard Summary Cards - 8 KPI Cards */}
        <Box sx={{ mb: 4 }}>
          <DashboardSummary />
        </Box>

        {/* Revenue Trends Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12}>
              <RevenueChart />
            </Grid>
          </Grid>
        </Box>

        {/* Payment & Debt Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <PaymentStatusDoughnutChart />
            </Grid>
            <Grid item xs={12} md={6}>
              <DebtAgingChart />
            </Grid>
            <Grid item xs={12}>
              <PaymentHistoryChart />
            </Grid>
          </Grid>
        </Box>

        {/* Inventory Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <LowStockTable />
            </Grid>
            <Grid item xs={12} md={6}>
              <TopSellingMaterials />
            </Grid>
          </Grid>
        </Box>

        {/* Customers & Regions Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={8}>
              <TopCustomersChart />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomerSegmentsChart />
            </Grid>
            <Grid item xs={12} md={6}>
              <RegionRevenueChart />
            </Grid>
            <Grid item xs={12} md={6}>
              <RevenueByCategory />
            </Grid>
          </Grid>
        </Box>

        {/* Alerts Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={4}>
              <AlertsWidget />
            </Grid>
            <Grid item xs={12} md={8}>
              {/* Additional info or charts can go here */}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
