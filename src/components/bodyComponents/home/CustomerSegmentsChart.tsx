import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchCustomerAnalytics, selectCustomerAnalytics, selectCustomerLoading } from "../../../store/slices/analyticsSlice";

const CustomerSegmentsChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const customerAnalytics = useSelector(selectCustomerAnalytics);
  const isLoading = useSelector(selectCustomerLoading);

  useEffect(() => {
    dispatch(fetchCustomerAnalytics({}));
  }, [dispatch]);

  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          height: "100%",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            p: 4,
          }}
        >
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Đang tải dữ liệu...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Calculate customer segments based on total spent
  const topCustomers = customerAnalytics?.topCustomers || [];
  
  let highValue = 0; // > 10M
  let mediumValue = 0; // 5M - 10M
  let lowValue = 0; // < 5M

  topCustomers.forEach((customer) => {
    if (customer.totalSpent >= 10000000) {
      highValue++;
    } else if (customer.totalSpent >= 5000000) {
      mediumValue++;
    } else {
      lowValue++;
    }
  });

  const series = [highValue, mediumValue, lowValue];
  const labels = ["Giá trị cao (>10M)", "Giá trị trung bình (5M-10M)", "Giá trị thấp (<5M)"];

  const options: any = {
    chart: {
      type: "pie" as const,
      height: 350,
    },
    labels,
    colors: ["#667eea", "#4facfe", "#43e97b"],
    legend: {
      position: "bottom" as const,
      horizontalAlign: "center" as const,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return val.toFixed(1) + "%";
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          return val + " khách hàng";
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
        },
      },
    },
  };

  const totalCustomers = series.reduce((sum, val) => sum + val, 0);

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 1,
            }}
          >
            🎯 Phân Khúc Khách Hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phân loại khách hàng theo giá trị
          </Typography>
        </Box>
        <ApexCharts
          options={options}
          series={series}
          type="pie"
          height={350}
          width="100%"
        />
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Giá trị cao
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {highValue}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Giá trị trung bình
            </Typography>
            <Typography variant="h6" color="info.main" fontWeight="bold">
              {mediumValue}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Giá trị thấp
            </Typography>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {lowValue}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomerSegmentsChart;

