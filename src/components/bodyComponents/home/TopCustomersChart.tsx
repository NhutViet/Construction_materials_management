import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchCustomerAnalytics, selectCustomerAnalytics, selectCustomerLoading } from "../../../store/slices/analyticsSlice";

const TopCustomersChart: React.FC = () => {
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

  const topCustomers = customerAnalytics?.topCustomers?.slice(0, 10) || [];
  
  // Sort by totalSpent descending
  const sortedCustomers = [...topCustomers].sort((a, b) => b.totalSpent - a.totalSpent);
  
  const customerNames = sortedCustomers.map(c => c._id.customerName);
  const totalSpent = sortedCustomers.map(c => c.totalSpent);
  const orderCounts = sortedCustomers.map(c => c.invoiceCount);

  const totalRevenue = sortedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

  const options: any = {
    chart: {
      type: "bar" as const,
      height: 400,
      horizontal: true,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          minimumFractionDigits: 0,
          notation: 'compact',
          compactDisplay: 'short',
        }).format(val);
      },
      offsetX: -10,
    },
    xaxis: {
      categories: customerNames,
      labels: {
        formatter: (val: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            notation: 'compact',
            compactDisplay: 'short',
          }).format(val);
        },
      },
    },
    yaxis: {
      labels: {
        maxWidth: 150,
        style: {
          fontSize: "11px",
        },
      },
    },
    colors: ["#667eea"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#764ba2"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100],
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(val);
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 5,
    },
  };

  const series = [
    {
      name: "Doanh thu",
      data: totalSpent,
    },
  ];

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
            👑 Top 10 Khách Hàng Theo Doanh Thu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng doanh thu từ top khách hàng: {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0,
            }).format(totalRevenue)}
          </Typography>
        </Box>
        <ApexCharts
          options={options}
          series={series}
          type="bar"
          height={400}
          width="100%"
        />
      </CardContent>
    </Card>
  );
};

export default TopCustomersChart;

