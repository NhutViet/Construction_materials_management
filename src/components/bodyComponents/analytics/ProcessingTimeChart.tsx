import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { StockInAnalytics } from "../../../store/slices/analyticsSlice";

interface ProcessingTimeChartProps {
  stockInData?: StockInAnalytics | null;
}

const ProcessingTimeChart: React.FC<ProcessingTimeChartProps> = ({ stockInData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (stockInData?.processingTimeAnalysis && stockInData.processingTimeAnalysis.length > 0) {
      // Process processing time analysis data
      const timeData = stockInData.processingTimeAnalysis[0]; // Usually only one record
      
      const chartData = [
        {
          name: "Thời gian xử lý (ngày)",
          data: [
            timeData.avgProcessingTime,
            timeData.minProcessingTime,
            timeData.maxProcessingTime
          ]
        }
      ];
      
      setChartData(chartData);
    } else {
      // Fallback data
      setChartData([{
        name: "Thời gian xử lý (ngày)",
        data: [0, 0, 0]
      }]);
    }
  }, [stockInData]);

  const options = {
    colors: ["#2196F3", "#4CAF50", "#FF9800"],
    chart: {
      id: "processing-time",
      type: "bar" as const,
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + " ngày";
      },
      style: {
        fontSize: "12px",
        fontWeight: "bold",
      },
    },
    legend: {
      position: "top" as const,
      horizontalAlign: "center" as const,
      offsetY: 0,
    },
    title: {
      text: "Thời gian xử lý nhập hàng",
      align: "left" as const,
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        horizontal: false,
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: ["Trung bình", "Tối thiểu", "Tối đa"],
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Thời gian (ngày)"
      },
      labels: {
        formatter: function (value: number) {
          return value.toFixed(1);
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
          return value.toFixed(1) + " ngày";
        }
      }
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 3,
    },
    fill: {
      opacity: 0.8,
    },
  };

  const processingData = stockInData?.processingTimeAnalysis?.[0];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thời gian xử lý nhập hàng
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {processingData?.avgProcessingTime?.toFixed(1) || "0.0"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trung bình (ngày)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" gutterBottom>
              {processingData?.minProcessingTime?.toFixed(1) || "0.0"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tối thiểu (ngày)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" gutterBottom>
              {processingData?.maxProcessingTime?.toFixed(1) || "0.0"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tối đa (ngày)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart */}
      <ApexCharts
        options={options}
        series={chartData}
        type="bar"
        width="100%"
        height="300"
      />
    </Box>
  );
};

export default ProcessingTimeChart;
