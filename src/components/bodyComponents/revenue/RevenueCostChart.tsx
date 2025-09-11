import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import { RevenueAnalytics } from "../../../store/slices/analyticsSlice";

interface RevenueCostChartProps {
  revenueData?: RevenueAnalytics | null;
}

const RevenueCostChart: React.FC<RevenueCostChartProps> = ({ revenueData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (revenueData?.revenueByMonth) {
      // Process revenue data by month
      const revenueDataArray = revenueData.revenueByMonth.map(item => item.revenue);
      
      // For cost data, we'll use a placeholder since it's not in the revenue analytics
      // In a real scenario, you might want to fetch cost data separately
      const costDataArray = revenueData.revenueByMonth.map(() => 0);
      
      setChartData([
        {
          name: "Doanh thu",
          type: "column",
          data: revenueDataArray,
        },
        {
          name: "Chi phí",
          type: "column",
          data: costDataArray,
        },
      ]);
    } else {
      // Fallback data
      setChartData([
        {
          name: "Doanh thu",
          type: "column",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: "Chi phí",
          type: "column",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ]);
    }
  }, [revenueData]);

  const options = {
    colors: ["#00D100", "#FF2E2E"],
    chart: {
      id: "revenue-cost-chart",
      type: "bar" as const,
      stacked: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Doanh thu & Chi phí theo tháng",
    },
    plotOptions: {
      bar: {
        columnWidth: "30%",
        horizontal: false,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: [
        "T1", "T2", "T3", "T4", "T5", "T6",
        "T7", "T8", "T9", "T10", "T11", "T12"
      ],
    },
    yaxis: {
      labels: {
        formatter: function (value: number) {
          return value.toLocaleString('vi-VN') + ' VNĐ';
        }
      }
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft",
        offsetY: 30,
        offsetX: 60,
      },
      y: {
        formatter: function (value: number) {
          return value.toLocaleString('vi-VN') + ' VNĐ';
        }
      }
    },
  };

  return (
    <Box
      sx={{
        marginX: 4,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <ApexCharts
        options={options}
        series={chartData}
        type="bar"
        width="100%"
        height="320"
      />
    </Box>
  );
}

export default RevenueCostChart;
