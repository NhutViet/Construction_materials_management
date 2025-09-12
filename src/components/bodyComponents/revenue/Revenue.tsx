import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { fetchRevenueAnalytics, fetchPaymentAnalytics, fetchInventoryAnalytics } from "../../../store/slices/analyticsSlice";
import { fetchInvoices } from "../../../store/slices/invoiceSlice";
import RevenueCard from "./RevenueCard";
import { Box, Grid, CircularProgress, Alert, Typography } from "@mui/material";
import RevenueCostChart from "./RevenueCostChart";
import BestSelledProductChart from "./BestSelledProductChart";
import BestSelledProductChartBar from "./BestSelledProductChartBar";

const Revenue: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    revenueAnalytics, 
    paymentAnalytics, 
    inventoryAnalytics,
    isRevenueLoading,
    isPaymentLoading,
    isInventoryLoading,
    error 
  } = useSelector((state: RootState) => state.analytics);

  const { invoices, isLoading: isInvoicesLoading } = useSelector((state: RootState) => state.invoice);

  useEffect(() => {
    // Fetch analytics data when component mounts
    dispatch(fetchRevenueAnalytics({}));
    dispatch(fetchPaymentAnalytics({}));
    dispatch(fetchInventoryAnalytics());
    dispatch(fetchInvoices({ page: 1, limit: 1000 })); // Fetch all invoices to filter cancelled ones
  }, [dispatch]);

  // Calculate total debt excluding cancelled orders
  const calculateAdjustedTotalDebt = () => {
    if (!invoices || invoices.length === 0) {
      return paymentAnalytics?.summary?.totalDebt || 0;
    }

    // Filter out cancelled invoices and calculate remaining amount
    const activeInvoices = invoices.filter(invoice => invoice.status !== 'cancelled');
    const totalDebtFromActiveInvoices = activeInvoices.reduce((sum, invoice) => {
      return sum + (invoice.remainingAmount || 0);
    }, 0);

    return totalDebtFromActiveInvoices;
  };

  // Calculate revenue cards data from API
  const getRevenueCards = () => {
    if (!revenueAnalytics || !paymentAnalytics) {
      return [
        {
          isMoney: true,
          number: "0",
          percentage: 0,
          upOrDown: "up" as const,
          color: "green" as const,
          title: "Tổng doanh thu",
          subTitle: "so với năm trước",
        },
        {
          isMoney: true,
          number: "0",
          percentage: 0,
          upOrDown: "up" as const,
          color: "green" as const,
          title: "Doanh thu trung bình",
          subTitle: "mỗi đơn hàng",
        },
        {
          isMoney: true,
          number: "0",
          percentage: 0,
          upOrDown: "down" as const,
          color: "red" as const,
          title: "Tổng nợ",
          subTitle: "cần thu",
        },
        {
          isMoney: true,
          number: "0",
          percentage: undefined,
          upOrDown: "up" as const,
          color: "info" as const,
          title: "Tỷ lệ thanh toán",
          subTitle: "đã thanh toán",
        },
      ];
    }

    const totalRevenue = revenueAnalytics.totalRevenue || 0;
    const avgOrderValue = revenueAnalytics.averageOrderValue?.avgOrderValue || 0;
    const totalDebt = calculateAdjustedTotalDebt(); // Use adjusted debt calculation
    const paymentRate = paymentAnalytics.summary?.paymentRate || 0;
    const revenueGrowth = revenueAnalytics.revenueGrowth?.growthRate || 0;

    return [
      {
        isMoney: true,
        number: totalRevenue.toLocaleString('vi-VN'),
        percentage: Math.abs(revenueGrowth),
        upOrDown: revenueGrowth >= 0 ? "up" as const : "down" as const,
        color: revenueGrowth >= 0 ? "green" as const : "red" as const,
        title: "Tổng doanh thu",
        subTitle: "so với năm trước",
      },
      {
        isMoney: true,
        number: avgOrderValue.toLocaleString('vi-VN'),
        percentage: undefined,
        upOrDown: "up" as const,
        color: "green" as const,
        title: "Giá trị đơn hàng TB",
        subTitle: "mỗi đơn hàng",
      },
      {
        isMoney: true,
        number: totalDebt.toLocaleString('vi-VN'),
        percentage: undefined,
        upOrDown: "down" as const,
        color: "red" as const,
        title: "Tổng nợ",
        subTitle: "cần thu",
      },
      {
        isMoney: false,
        number: `${paymentRate.toFixed(1)}%`,
        percentage: undefined,
        upOrDown: "up" as const,
        color: "info" as const,
        title: "Tỷ lệ thanh toán",
        subTitle: "đã thanh toán",
      },
    ];
  };

  if (error) {
    return (
      <Box sx={{ p: 3, mx: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isRevenueLoading || isPaymentLoading || isInventoryLoading || isInvoicesLoading) {
    return (
      <Box sx={{ p: 3, mx: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const revenueCards = getRevenueCards();

  return (
    <Box sx={{ p: 3, mx: 3 }}>

      <Grid container sx={{ mx: 4 }}>
        {revenueCards.map((card, index) => (
          <Grid item md={3} key={index}>
            <Box m={4}>
              <RevenueCard card={card} />
            </Box>
          </Grid>
        ))}
      </Grid>
      <Grid container sx={{ mx: 4 }}>
        <Grid item md={12}>
          <RevenueCostChart revenueData={revenueAnalytics} />
        </Grid>
      </Grid>
      <Grid container sx={{ mx: 4 }}>
        <Grid item md={6}>
          <BestSelledProductChart inventoryData={inventoryAnalytics} />
        </Grid>
        <Grid item md={6}>
          <BestSelledProductChartBar inventoryData={inventoryAnalytics} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Revenue;
