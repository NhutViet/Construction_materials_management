import React, { useEffect } from "react";
import { Box } from "@mui/material";
import ApexCharts from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchRevenueAnalytics, selectRevenueAnalytics, selectRevenueLoading } from "../../../store/slices/analyticsSlice";

const RevenueChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const revenueAnalytics = useSelector(selectRevenueAnalytics);
  const isLoading = useSelector(selectRevenueLoading);

  useEffect(() => {
    dispatch(fetchRevenueAnalytics({}));
  }, [dispatch]);

  const options: any = {
    title: {
      text: "Phân Tích Doanh Thu",
      align: "left",
      style: {
        fontSize: "16px",
        color: "#666",
      },
    },
    subtitle: {
      text: "Xu hướng doanh thu theo thời gian",
      align: "left",
      style: {
        fontSize: "14px",
        color: "#666",
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Helvetica, Arial",
      offsetY: -20,
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 9,
      },
    },
    theme: {
      mode: "light",
    },
    chart: {
      height: 328,
      type: "line" as const,
      zoom: {
        enabled: true,
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 2,
        blur: 4,
        opacity: 0.2,
      },
    },
    xaxis: {
      categories: revenueAnalytics?.revenueByMonth?.map(item => 
        `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      ) || [],
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
      name: "Kỳ Hiện Tại",
      data: revenueAnalytics?.revenueByMonth?.map(item => item.revenue) || [],
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
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Đang tải dữ liệu doanh thu...
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
        height: "100%",
      }}
    >
      <ApexCharts
        options={options}
        series={series}
        height={300}
        type="line"
        width="100%"
      />
    </Box>
  );
};

export default RevenueChart;
