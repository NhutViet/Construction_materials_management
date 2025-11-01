import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchInventoryAnalytics, selectInventoryAnalytics, selectInventoryLoading } from "../../../store/slices/analyticsSlice";

const RevenueByCategory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const inventoryAnalytics = useSelector(selectInventoryAnalytics);
  const isLoading = useSelector(selectInventoryLoading);

  useEffect(() => {
    dispatch(fetchInventoryAnalytics());
  }, [dispatch]);

  const categoryData = inventoryAnalytics?.categoryAnalysis || [];
  const totalValue = categoryData.reduce((sum, category) => sum + category.totalValue, 0);

  // Modern color palette
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', 
    '#f5576c', '#764ba2', '#00f2fe', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];

  const donutOption = {
    chart: {
      type: 'donut' as const,
      height: 350,
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
    },
    labels: categoryData.map(category => category._id),
    colors: colors.slice(0, categoryData.length),
    legend: {
      position: "bottom" as const,
      fontSize: "12px",
      fontFamily: 'Inter, sans-serif',
      offsetY: 0,
      markers: {
        size: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
      customLegendItems: categoryData.map(category => {
        const percentage = ((category.totalValue / totalValue) * 100).toFixed(1);
        return `${category._id} (${percentage}%)`;
      }),
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              color: '#373d3f',
              offsetY: 16,
              formatter: function (val: string) {
                return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                }).format(parseFloat(val));
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Tổng',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
              formatter: function (w: any) {
                return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                }).format(totalValue);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false,
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
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  const donutSeries = categoryData.map(category => category.totalValue);

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
            Đang tải dữ liệu danh mục...
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
            Doanh Thu Theo Danh Mục
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Phân bổ doanh thu theo từng danh mục vật liệu
          </Typography>
        </Box>
        <ApexCharts
          options={donutOption}
          series={donutSeries}
          type="donut"
          height={350}
          width="100%"
        />
      </CardContent>
    </Card>
  );
};

export default RevenueByCategory;
