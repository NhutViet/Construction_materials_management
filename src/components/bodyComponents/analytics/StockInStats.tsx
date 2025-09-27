import React from "react";
import { Box, Grid, Paper, Typography, Chip, Tooltip } from "@mui/material";
import { TrendingUp, TrendingDown, Inventory, AttachMoney, Payment, Schedule } from "@mui/icons-material";
import { StockInAnalytics } from "../../../store/slices/analyticsSlice";
import { getShortCurrencyWords } from "../../../utils/numberToWords";

interface StockInStatsProps {
  stockInData?: StockInAnalytics | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  isMoney?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, subtitle, isMoney = false }) => {
  const getColorValue = (color: string) => {
    switch (color) {
      case "success":
        return "#4caf50";
      case "warning":
        return "#ff9800";
      case "error":
        return "#f44336";
      case "info":
        return "#2196f3";
      case "secondary":
        return "#9c27b0";
      default:
        return "#1976d2";
    }
  };

  // Extract numeric value from formatted number string
  const getNumericValue = (val: string | number): number => {
    if (typeof val === 'number') return val;
    const cleanStr = val.replace(/[^\d]/g, '');
    return parseInt(cleanStr) || 0;
  };

  // Get currency words for money values
  const getCurrencyWords = (val: string | number): string => {
    if (!isMoney) return '';
    const numericValue = getNumericValue(val);
    if (numericValue === 0) return '';
    return getShortCurrencyWords(numericValue);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: `${getColorValue(color)}20`,
            color: getColorValue(color),
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{flexDirection:"row", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {isMoney && getCurrencyWords(value) && (
            <Tooltip title={getCurrencyWords(value)} arrow placement="top">
              <Typography 
                variant="caption"
                sx={{ 
                  fontSize: '0.7rem',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  display: 'block',
                  mt: 0.5,
                  cursor: 'help'
                }}
              >
                {getCurrencyWords(value)}
              </Typography>
            </Tooltip>
          )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {trend && (
          <Chip
            icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
            label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
            color={trend.isPositive ? "success" : "error"}
            size="small"
            variant="outlined"
          />
        )}
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

const StockInStats: React.FC<StockInStatsProps> = ({ stockInData }) => {
  const overview = stockInData?.stockInOverview;

  const stats = [
    {
      title: "Tổng số lần nhập",
      value: overview?.totalStockIns?.toLocaleString('vi-VN') || "0",
      icon: <Inventory />,
      color: "primary" as const,
      subtitle: "Tổng số phiếu nhập hàng",
      isMoney: false,
    },
    {
      title: "Tổng giá trị",
      value: overview?.totalAmount?.toLocaleString('vi-VN') + ' VNĐ' || "0 VNĐ",
      icon: <AttachMoney />,
      color: "success" as const,
      subtitle: "Tổng giá trị nhập hàng",
      isMoney: true,
    },
    {
      title: "Đã thanh toán",
      value: overview?.paidAmount?.toLocaleString('vi-VN') + ' VNĐ' || "0 VNĐ",
      icon: <Payment />,
      color: "info" as const,
      subtitle: "Số tiền đã thanh toán",
      isMoney: true,
    },
    {
      title: "Còn nợ",
      value: overview?.remainingAmount?.toLocaleString('vi-VN') + ' VNĐ' || "0 VNĐ",
      icon: <Schedule />,
      color: "warning" as const,
      subtitle: "Số tiền còn nợ",
      isMoney: true,
    },
    {
      title: "Giá trị TB",
      value: overview?.avgAmount?.toLocaleString('vi-VN') + ' VNĐ' || "0 VNĐ",
      icon: <TrendingUp />,
      color: "secondary" as const,
      subtitle: "Giá trị trung bình mỗi lần nhập",
      isMoney: true,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StockInStats;
