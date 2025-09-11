import React, { useEffect } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
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
      type: "bar",
      stacked: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Xu Hướng Sử Dụng Vật Liệu",
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        horizontal: false,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: months.map(month => {
        const date = new Date(2024, month - 1);
        return date.toLocaleString('en-US', { month: 'short' });
      }),
    },
    yaxis: {
      title: {
        text: "Doanh Thu (VND)",
      },
      labels: {
        formatter: (value: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(value);
        },
      },
    },
    tooltip: {
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
      <Box
        sx={{
          margin: 3,
          bgcolor: "white",
          borderRadius: 2,
          padding: 3,
          height: "95%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Đang tải dữ liệu sử dụng...
      </Box>
    );
  }

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <ApexCharts
        options={options}
        series={series}
        type="bar"
        width="100%"
        height="320"
      />
    </Box>
  );
};

export default MaterialUsageChart;
