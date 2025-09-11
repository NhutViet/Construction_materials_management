import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box, Typography } from "@mui/material";
import { StockInAnalytics } from "../../../store/slices/analyticsSlice";

interface SupplierAnalysisChartProps {
  stockInData?: StockInAnalytics | null;
}

const SupplierAnalysisChart: React.FC<SupplierAnalysisChartProps> = ({ stockInData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (stockInData?.supplierAnalysis && stockInData.supplierAnalysis.length > 0) {
      // Process supplier analysis data
      const suppliers = stockInData.supplierAnalysis.slice(0, 10); // Top 10 suppliers
      
      const chartData = [{
        name: "Tổng giá trị",
        data: suppliers.map(supplier => supplier.totalAmount)
      }];
      
      setChartData(chartData);
    } else {
      // Fallback data
      setChartData([{
        name: "Tổng giá trị",
        data: [0, 0, 0, 0, 0]
      }]);
    }
  }, [stockInData]);

  const options = {
    colors: ["#5A4FCF", "#FFA500", "#C53500", "#FFBF00", "#FF3659", "#00D100", "#FF2E2E", "#2196F3", "#9C27B0", "#FF9800"],
    chart: {
      id: "supplier-analysis",
      type: "bar" as const,
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top" as const,
      horizontalAlign: "center" as const,
      offsetY: 0,
    },
    title: {
      text: "Top 10 Nhà cung cấp theo giá trị",
      align: "left" as const,
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    plotOptions: {
      bar: {
        distributed: true,
        columnWidth: "60%",
        horizontal: false,
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: stockInData?.supplierAnalysis?.slice(0, 10).map(supplier => 
        supplier._id.length > 15 
          ? supplier._id.substring(0, 15) + '...'
          : supplier._id
      ) || ["Nhà cung cấp 1", "Nhà cung cấp 2", "Nhà cung cấp 3", "Nhà cung cấp 4", "Nhà cung cấp 5"],
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Giá trị (VNĐ)"
      },
      labels: {
        formatter: function (value: number) {
          return value.toLocaleString('vi-VN');
        }
      }
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: "topRight",
        offsetY: 30,
        offsetX: 60,
      },
      y: {
        formatter: function (value: number) {
          return value.toLocaleString('vi-VN') + ' VNĐ';
        }
      }
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 3,
    },
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Phân tích nhà cung cấp
      </Typography>
      <ApexCharts
        options={options}
        series={chartData}
        type="bar"
        width="100%"
        height="350"
      />
    </Box>
  );
};

export default SupplierAnalysisChart;
