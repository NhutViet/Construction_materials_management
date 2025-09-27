import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import { InventoryAnalytics } from "../../../store/slices/analyticsSlice";
import useResponsive from "../../../hooks/useResponsive";

interface BestSelledProductChartBarProps {
  inventoryData?: InventoryAnalytics | null;
}

const BestSelledProductChartBar: React.FC<BestSelledProductChartBarProps> = ({ inventoryData }) => {
  const [chartData, setChartData] = useState([]);
  const { isMobile } = useResponsive();

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
      text: "Top 5 Vật liệu bán chạy trong năm",
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    plotOptions: {
      bar: {
        distributed: true,
        barHeight: "40%",
        horizontal: true,
        borderRadius: 2,
        borderRadiusApplication: 'end'
      },
    },
    xaxis: {
      categories: inventoryData?.topSellingMaterials?.slice(0, 5).map(material => 
        material._id.materialName.length > 15 
          ? material._id.materialName.substring(0, 15) + '...'
          : material._id.materialName
      ) || ["Vật liệu 1", "Vật liệu 2", "Vật liệu 3", "Vật liệu 4", "Vật liệu 5"],
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
          return value.toLocaleString('vi-VN') + ' sản phẩm';
        }
      }
    },
    responsive: [{
      breakpoint: 600,
      options: {
        plotOptions: {
          bar: {
            barHeight: "50%"
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
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '9px'
            }
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

export default BestSelledProductChartBar;
