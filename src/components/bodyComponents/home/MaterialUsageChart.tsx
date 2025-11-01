import React, { useEffect } from "react";
import ApexCharts from "react-apexcharts";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchTimeBasedAnalytics, selectTimeBasedAnalytics, selectTimeBasedLoading } from "../../../store/slices/analyticsSlice";

const MaterialUsageChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const timeBasedAnalytics = useSelector(selectTimeBasedAnalytics);
  const isLoading = useSelector(selectTimeBasedLoading);

  useEffect(() => {
    dispatch(fetchTimeBasedAnalytics({}));
  }, [dispatch]);

  const monthlyData = timeBasedAnalytics?.monthlyTrends || [];
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const currentYearData = monthlyData
    .filter(item => item._id.year === currentYear)
    .map(item => ({ month: item._id.month, revenue: item.revenue, orders: item.orders }));

  const lastYearData = monthlyData
    .filter(item => item._id.year === lastYear)
    .map(item => ({ month: item._id.month, revenue: item.revenue, orders: item.orders }));

  // Create arrays for all 12 months
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYearRevenue = months.map(month => {
    const data = currentYearData.find(item => item.month === month);
    return data ? data.revenue : 0;
  });

  const lastYearRevenue = months.map(month => {
    const data = lastYearData.find(item => item.month === month);
    return data ? data.revenue : 0;
  });

  const options = {
    chart: {
      id: "material-usage-chart",
      type: "bar" as const,
      height: 350,
      stacked: false,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top" as const,
      horizontalAlign: "center" as const,
      fontSize: "12px",
      fontFamily: 'Inter, sans-serif',
      offsetY: -10,
      markers: {
        size: 6,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: 'end' as const,
        borderRadiusWhenStacked: 'last' as const,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#667eea', '#f093fb'],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.3,
        stops: [0, 100]
      },
    },
    colors: ['#667eea', '#f093fb'],
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
    },
    xaxis: {
      categories: months.map(month => {
        const date = new Date(2024, month - 1);
        return date.toLocaleString('en-US', { month: 'short' });
      }),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: '#8e8da4',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        }
      }
    },
    yaxis: {
      title: {
        text: "Doanh Thu (VND)",
        style: {
          color: '#8e8da4',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        }
      },
      labels: {
        formatter: (value: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(value);
        },
        style: {
          colors: '#8e8da4',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        }
      },
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      y: {
        formatter: (value: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(value);
        },
      },
    },
  };

  const series = [
    {
      name: `Năm Hiện Tại (${currentYear})`,
      data: currentYearRevenue,
    },
    {
      name: `Năm Trước (${lastYear})`,
      data: lastYearRevenue,
    },
  ];

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
            Đang tải dữ liệu sử dụng...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        height: "100%",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 1,
            }}
          >
            Xu Hướng Sử Dụng Vật Liệu
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            So sánh doanh thu giữa năm hiện tại và năm trước
          </Typography>
        </Box>
        <ApexCharts
          options={options}
          series={series}
          type="bar"
          width="100%"
          height="350"
        />
      </CardContent>
    </Card>
  );
};

export default MaterialUsageChart;
