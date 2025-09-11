import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import { InventoryAnalytics } from "../../../store/slices/analyticsSlice";

interface BestSelledProductChartBarProps {
  inventoryData?: InventoryAnalytics | null;
}

const BestSelledProductChartBar: React.FC<BestSelledProductChartBarProps> = ({ inventoryData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (inventoryData?.topSellingMaterials && inventoryData.topSellingMaterials.length > 0) {
      // Process top selling materials data for yearly view
      const topMaterials = inventoryData.topSellingMaterials.slice(0, 5);
      
      const yearlyData = [{
        data: topMaterials.map(material => material.totalQuantity)
      }];
      
      setChartData(yearlyData);
    } else {
      // Fallback data
      setChartData([{
        data: [0, 0, 0, 0, 0]
      }]);
    }
  }, [inventoryData]);

  const options = {
    colors: ["#5A4FCF", "#FFA500", "#C53500", "#FFBF00", "#FF3659"],
    chart: {
      id: "top-selling-products-yearly",
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
      text: "Top 5 Vật liệu bán chạy trong năm",
    },
    plotOptions: {
      bar: {
        distributed: true,
        barHeight: "40%",
        horizontal: true,
      },
    },
    xaxis: {
      categories: inventoryData?.topSellingMaterials?.slice(0, 5).map(material => 
        material._id.materialName.length > 15 
          ? material._id.materialName.substring(0, 15) + '...'
          : material._id.materialName
      ) || ["Vật liệu 1", "Vật liệu 2", "Vật liệu 3", "Vật liệu 4", "Vật liệu 5"],
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
          return value.toLocaleString('vi-VN') + ' sản phẩm';
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

export default BestSelledProductChartBar;
