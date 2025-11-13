import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchCustomerRegionAnalytics, selectRegionAnalytics, selectRegionAnalyticsLoading } from "../../../store/slices/analyticsSlice";

const RegionRevenueChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const regionAnalytics = useSelector(selectRegionAnalytics);
  const isLoading = useSelector(selectRegionAnalyticsLoading);

  useEffect(() => {
    dispatch(fetchCustomerRegionAnalytics({}));
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

  const regionRevenue = regionAnalytics?.regionRevenue || [];
  
  // Sort by revenue descending and take top 10
  const sortedRegions = [...regionRevenue].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
  
  const regionNames = sortedRegions.map(r => r.region || "Không xác định");
  const revenues = sortedRegions.map(r => r.totalRevenue);
  const orderCounts = sortedRegions.map(r => r.totalOrders);

  const options: any = {
    chart: {
      type: "bar" as const,
      height: 400,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "60%",
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
      categories: regionNames,
      labels: {
        style: {
          fontSize: "11px",
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: "Doanh thu (VND)",
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
      data: revenues,
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
            🗺️ Doanh Thu Theo Khu Vực
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Top 10 khu vực theo doanh thu
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

export default RegionRevenueChart;

