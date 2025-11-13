import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchDebtAnalytics, selectDebtAnalytics, selectDebtLoading } from "../../../store/slices/analyticsSlice";

const DebtAgingChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const debtAnalytics = useSelector(selectDebtAnalytics);
  const isLoading = useSelector(selectDebtLoading);

  useEffect(() => {
    dispatch(fetchDebtAnalytics({}));
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

  const debtAging = debtAnalytics?.debtAging || [];
  
  // Map aging buckets
  const agingBuckets = [
    { label: "0-30 ngày", key: "0-30", color: "#4CAF50" },
    { label: "31-60 ngày", key: "31-60", color: "#FF9800" },
    { label: "61-90 ngày", key: "61-90", color: "#FF5722" },
    { label: "91-180 ngày", key: "91-180", color: "#F44336" },
    { label: ">180 ngày", key: ">180", color: "#D32F2F" },
  ];

  const categories: string[] = [];
  const seriesData: number[] = [];

  agingBuckets.forEach((bucket) => {
    const matched = debtAging.find((item) => item._id === bucket.key);
    categories.push(bucket.label);
    seriesData.push(matched ? matched.totalAmount : 0);
  });

  const options: any = {
    chart: {
      type: "bar" as const,
      height: 350,
      stacked: false,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
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
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
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
    colors: agingBuckets.map((b) => b.color),
    fill: {
      opacity: 0.8,
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: agingBuckets.map((b) => b.color),
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
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Số tiền nợ",
      data: seriesData,
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
            📅 Phân Tích Tuổi Nợ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phân bố nợ theo thời gian
          </Typography>
        </Box>
        <ApexCharts
          options={options}
          series={series}
          type="bar"
          height={350}
          width="100%"
        />
      </CardContent>
    </Card>
  );
};

export default DebtAgingChart;

