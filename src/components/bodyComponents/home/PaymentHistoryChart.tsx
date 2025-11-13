import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchPaymentHistoryAnalytics, selectPaymentHistoryAnalytics, selectPaymentHistoryLoading } from "../../../store/slices/analyticsSlice";

const PaymentHistoryChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentHistory = useSelector(selectPaymentHistoryAnalytics);
  const isLoading = useSelector(selectPaymentHistoryLoading);

  useEffect(() => {
    dispatch(fetchPaymentHistoryAnalytics({}));
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

  const paymentByTimeRange = paymentHistory?.paymentByTimeRange || [];
  
  const categories = paymentByTimeRange.map(item => 
    `T${item._id.month}/${item._id.year}`
  );

  const revenueData = paymentByTimeRange.map(item => item.totalRevenue);
  const paidData = paymentByTimeRange.map(item => item.totalPaid);
  const debtData = paymentByTimeRange.map(item => item.totalRemaining);
  const paymentRateData = paymentByTimeRange.map(item => item.paymentRate);

  const options: any = {
    chart: {
      type: "line" as const,
      height: 350,
      toolbar: {
        show: true,
      },
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Số tiền (VND)",
        },
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
      {
        opposite: true,
        title: {
          text: "Tỷ lệ (%)",
        },
        labels: {
          formatter: (val: number) => {
            return val.toFixed(0) + "%";
          },
        },
      },
    ],
    colors: ["#667eea", "#4CAF50", "#F44336", "#FF9800"],
    legend: {
      position: "top" as const,
      horizontalAlign: "right" as const,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, opts: any) => {
          if (opts.seriesIndex === 3) {
            return val.toFixed(1) + "%";
          }
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
      name: "Tổng doanh thu",
      data: revenueData,
      type: "line",
    },
    {
      name: "Đã thanh toán",
      data: paidData,
      type: "line",
    },
    {
      name: "Tổng nợ",
      data: debtData,
      type: "line",
    },
    {
      name: "Tỷ lệ thanh toán",
      data: paymentRateData,
      type: "line",
      yAxisIndex: 1,
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
            💸 Lịch Sử Thanh Toán
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xu hướng thanh toán theo thời gian
          </Typography>
        </Box>
        <ApexCharts
          options={options}
          series={series}
          type="line"
          height={350}
          width="100%"
        />
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryChart;

