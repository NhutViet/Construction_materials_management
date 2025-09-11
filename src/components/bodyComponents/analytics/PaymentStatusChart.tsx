import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box, Typography } from "@mui/material";
import { StockInAnalytics } from "../../../store/slices/analyticsSlice";

interface PaymentStatusChartProps {
  stockInData?: StockInAnalytics | null;
}

const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({ stockInData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (stockInData?.paymentStatusAnalysis && stockInData.paymentStatusAnalysis.length > 0) {
      // Process payment status analysis data
      const paymentData = stockInData.paymentStatusAnalysis;
      
      const chartData = [
        {
          name: "Đã thanh toán",
          data: paymentData.map(item => item.paidAmount)
        },
        {
          name: "Còn nợ",
          data: paymentData.map(item => item.remainingAmount)
        }
      ];
      
      setChartData(chartData);
    } else {
      // Fallback data
      setChartData([
        {
          name: "Đã thanh toán",
          data: [0, 0, 0]
        },
        {
          name: "Còn nợ",
          data: [0, 0, 0]
        }
      ]);
    }
  }, [stockInData]);

  const options = {
    colors: ["#4CAF50", "#FF9800"],
    chart: {
      id: "payment-status",
      type: "bar" as const,
      stacked: true,
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
      text: "Trạng thái thanh toán theo phương thức",
      align: "left" as const,
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        horizontal: false,
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: stockInData?.paymentStatusAnalysis?.map(item => 
        item._id === "CASH" ? "Tiền mặt" :
        item._id === "BANK_TRANSFER" ? "Chuyển khoản" :
        item._id === "CREDIT" ? "Trả góp" :
        item._id === "OTHER" ? "Khác" :
        item._id
      ) || ["Tiền mặt", "Chuyển khoản", "Trả góp"],
      labels: {
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
    fill: {
      opacity: 0.8,
    },
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trạng thái thanh toán
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

export default PaymentStatusChart;
