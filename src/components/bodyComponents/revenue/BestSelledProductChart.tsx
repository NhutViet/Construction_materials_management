import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import { InventoryAnalytics } from "../../../store/slices/analyticsSlice";
import useResponsive from "../../../hooks/useResponsive";

interface BestSelledProductChartProps {
  inventoryData?: InventoryAnalytics | null;
}

const BestSelledProductChart: React.FC<BestSelledProductChartProps> = ({ inventoryData }) => {
  const [chartData, setChartData] = useState([]);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (inventoryData?.topSellingMaterials && inventoryData.topSellingMaterials.length > 0) {
      // Process top selling materials data
      const topMaterials = inventoryData.topSellingMaterials.slice(0, 5);
      
      // Generate sample weekly data for each material
      const weeklyData = topMaterials.map(material => ({
        name: material._id.materialName,
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 10)
      }));
      
      setChartData(weeklyData);
    } else {
      // Fallback data
      setChartData([
        {
          name: "Vật liệu 1",
          data: [0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: "Vật liệu 2", 
          data: [0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: "Vật liệu 3",
          data: [0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: "Vật liệu 4",
          data: [0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: "Vật liệu 5",
          data: [0, 0, 0, 0, 0, 0, 0],
        },
      ]);
    }
  }, [inventoryData]);

  const options = {
    chart: {
      id: "top-selling-products",
      type: "line" as const,
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
      text: "Top 5 Vật liệu bán chạy tuần qua",
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    plotOptions: {
      bar: {
        columnWidth: "15%",
        horizontal: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 7,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      labels: {
        style: {
          fontSize: '11px'
        }
      }
    },
    yaxis: {
      title: {
        text: "Số lượng bán",
        style: {
          fontSize: '11px'
        }
      },
      labels: {
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
          return value + ' sản phẩm';
        }
      }
    },
    responsive: [{
      breakpoint: 600,
      options: {
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
        },
        markers: {
          size: 3,
          hover: {
            size: 5
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
        type="line"
        width="100%"
        height={isMobile ? "280" : "320"}
      />
    </Box>
  );
}

export default BestSelledProductChart;
