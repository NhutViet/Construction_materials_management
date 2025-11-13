import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchPaymentAnalytics, selectPaymentAnalytics, selectPaymentLoading } from "../../../store/slices/analyticsSlice";

const PaymentStatusDoughnutChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentAnalytics = useSelector(selectPaymentAnalytics);
  const isLoading = useSelector(selectPaymentLoading);

  useEffect(() => {
    dispatch(fetchPaymentAnalytics({}));
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

  const paymentStatusData = paymentAnalytics?.paymentStatusStats || [];
  
  // Calculate totals
  let paidTotal = 0;
  let partialTotal = 0;
  let unpaidTotal = 0;

  paymentStatusData.forEach((status) => {
    if (status._id === "paid") {
      paidTotal = status.totalAmount;
    } else if (status._id === "partial") {
      partialTotal = status.totalAmount;
    } else if (status._id === "unpaid") {
      unpaidTotal = status.totalAmount;
    }
  });

  const totalAmount = paidTotal + partialTotal + unpaidTotal;
  const paidPercentage = totalAmount > 0 ? ((paidTotal / totalAmount) * 100).toFixed(1) : "0";
  const partialPercentage = totalAmount > 0 ? ((partialTotal / totalAmount) * 100).toFixed(1) : "0";
  const unpaidPercentage = totalAmount > 0 ? ((unpaidTotal / totalAmount) * 100).toFixed(1) : "0";

  const series = [paidTotal, partialTotal, unpaidTotal];
  const labels = ["Đã thanh toán", "Thanh toán một phần", "Chưa thanh toán"];

  const options: any = {
    chart: {
      type: "donut" as const,
      height: 350,
    },
    labels,
    colors: ["#4CAF50", "#FF9800", "#F44336"],
    legend: {
      position: "bottom" as const,
      horizontalAlign: "center" as const,
      fontSize: "12px",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 700,
              formatter: (val: number) => {
                return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                }).format(val);
              },
            },
            total: {
              show: true,
              label: "Tổng",
              formatter: () => {
                return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                }).format(totalAmount);
              },
            },
          },
        },
      },
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
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(val);
        },
      },
    },
  };

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
            💳 Phân Bố Trạng Thái Thanh Toán
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan về tình hình thanh toán
          </Typography>
        </Box>
        <ApexCharts
          options={options}
          series={series}
          type="donut"
          height={350}
          width="100%"
        />
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Đã thanh toán
            </Typography>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {paidPercentage}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Một phần
            </Typography>
            <Typography variant="h6" color="warning.main" fontWeight="bold">
              {partialPercentage}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Chưa thanh toán
            </Typography>
            <Typography variant="h6" color="error.main" fontWeight="bold">
              {unpaidPercentage}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentStatusDoughnutChart;

