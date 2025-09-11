import React, { useEffect } from "react";
import { Box } from "@mui/material";
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

  const donutOption = {
    labels: categoryData.map(category => category._id),
    legend: {
      position: "right",
      fontSize: "14",
      customLegendItems: categoryData.map(category => {
        const percentage = ((category.totalValue / totalValue) * 100).toFixed(1);
        return `${category._id} <b>${percentage}%</b>`;
      }),
    },
    title: {
      text: "Doanh Thu Theo Danh Mục",
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

  const donutSeries = categoryData.map(category => category.totalValue);

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
        Đang tải dữ liệu danh mục...
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
        options={donutOption}
        series={donutSeries}
        type="pie"
        width="100%"
      />
    </Box>
  );
};

export default RevenueByCategory;
