import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import { RevenueAnalytics } from "../../../store/slices/analyticsSlice";
import useResponsive from "../../../hooks/useResponsive";

interface RevenueCostChartProps {
  revenueData?: RevenueAnalytics | null;
}

const RevenueCostChart: React.FC<RevenueCostChartProps> = ({ revenueData }) => {
  const [chartData, setChartData] = useState([]);
  const { isMobile } = useResponsive();

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
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
      fontSize: '12px',
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    title: {
      text: "Doanh thu & Chi phí theo tháng",
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        horizontal: false,
        borderRadius: 2,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last'
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
      labels: {
        style: {
          fontSize: '11px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (value: number) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M VNĐ';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K VNĐ';
          }
          return value.toLocaleString('vi-VN') + ' VNĐ';
        },
        style: {
          fontSize: '10px'
        }
      }
    },
    tooltip: {
      fixed: {
        enabled: false
      },
      y: {
        formatter: function (value: number) {
          return value.toLocaleString('vi-VN') + ' VNĐ';
        }
      }
    },
    responsive: [{
      breakpoint: 600,
      options: {
        plotOptions: {
          bar: {
            columnWidth: "50%"
          }
        },
        legend: {
          fontSize: '10px',
          itemMargin: {
            horizontal: 5,
            vertical: 3
          }
        },
        title: {
          style: {
            fontSize: '12px'
          }
        }
      }
    }]
  };

  return (
    <Box
      sx={{
        marginX: { xs: 0, sm: 1, md: 2 },
        bgcolor: "white",
        borderRadius: 2,
        padding: { xs: 2, sm: 2.5, md: 3 },
        height: "95%",
        boxShadow: 1,
        overflow: 'hidden'
      }}
    >
      <ApexCharts
        options={options}
        series={chartData}
        type="bar"
        width="100%"
        height={isMobile ? "280" : "320"}
      />
    </Box>
  );
}

export default RevenueCostChart;
