import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import { InventoryAnalytics } from "../../../store/slices/analyticsSlice";

interface BestSelledProductChartProps {
  inventoryData?: InventoryAnalytics | null;
}

const BestSelledProductChart: React.FC<BestSelledProductChartProps> = ({ inventoryData }) => {
  const [chartData, setChartData] = useState([]);

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
      text: "Top 5 Vật liệu bán chạy tuần qua",
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
    },
    yaxis: {
      title: {
        text: "Số lượng bán"
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
          return value + ' sản phẩm';
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
        type="line"
        width="100%"
        height="320"
      />
    </Box>
  );
}

export default BestSelledProductChart;
