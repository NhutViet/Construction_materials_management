import React, { useEffect } from "react";
import { Box, Grid, Typography, CircularProgress, Card, CardContent, useTheme } from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { 
  fetchDashboardData, 
  fetchRevenueAnalytics,
  fetchPaymentAnalytics,
  fetchCustomerAnalytics,
  fetchInventoryAnalytics,
  fetchStockInAnalytics,
  selectDashboardData, 
  selectDashboardLoading,
  selectRevenueAnalytics,
  selectPaymentAnalytics,
  selectCustomerAnalytics,
  selectInventoryAnalytics,
  selectStockInAnalytics,
} from "../../../store/slices/analyticsSlice";

// Icons
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";
import UilCheckCircle from "@iconscout/react-unicons/icons/uil-check-circle";
import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";
import UilDollarSign from "@iconscout/react-unicons/icons/uil-dollar-sign";
import UilMoneyBill from "@iconscout/react-unicons/icons/uil-money-bill";
import UilExclamationTriangle from "@iconscout/react-unicons/icons/uil-exclamation-triangle";

const DashboardSummary: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dashboardData = useSelector(selectDashboardData);
  const revenueAnalytics = useSelector(selectRevenueAnalytics);
  const paymentAnalytics = useSelector(selectPaymentAnalytics);
  const customerAnalytics = useSelector(selectCustomerAnalytics);
  const inventoryAnalytics = useSelector(selectInventoryAnalytics);
  const stockInAnalytics = useSelector(selectStockInAnalytics);
  const isLoading = useSelector(selectDashboardLoading);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchDashboardData({}));
    dispatch(fetchRevenueAnalytics({}));
    dispatch(fetchPaymentAnalytics({}));
    dispatch(fetchCustomerAnalytics({}));
    dispatch(fetchInventoryAnalytics());
    dispatch(fetchStockInAnalytics({}));
  }, [dispatch]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          margin: 0,
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu bảng điều khiển...</Typography>
      </Box>
    );
  }

  // Calculate growth rate
  const revenueGrowth = revenueAnalytics?.revenueGrowth || { current: 0, previous: 0, growthRate: 0, growthAmount: 0 };
  const paymentRate = paymentAnalytics?.summary?.paymentRate || 0;
  const debtRate = paymentAnalytics?.summary?.debtRate || 0;
  const avgOrderValue = revenueAnalytics?.averageOrderValue?.avgOrderValue || 0;
  const totalCustomers = customerAnalytics?.summary?.totalCustomers || dashboardData?.customerSummary?.totalCustomers || 0;
  const newCustomers = customerAnalytics?.newVsReturningCustomers?.newCustomers || dashboardData?.customerSummary?.newCustomers || 0;
  const lowStockCount = inventoryAnalytics?.lowStockItems?.length || dashboardData?.inventorySummary?.lowStockCount || 0;
  const pendingStockIns = dashboardData?.stockInSummary?.pendingCount || 0;
  const totalAlerts = dashboardData?.alerts?.totalAlerts || 0;

  const cardData = [
    // Financial KPIs - Row 1
    {
      icon: <UilReceipt size={48} color={"#fff"} />,
      title: "Tổng Doanh Thu",
      value: dashboardData?.financialSummary?.totalRevenue 
        ? formatCurrency(dashboardData.financialSummary.totalRevenue)
        : formatCurrency(revenueAnalytics?.totalRevenue || 0),
      subtitle: revenueGrowth.growthRate >= 0 
        ? `↑ ${Math.abs(revenueGrowth.growthRate).toFixed(1)}% so với kỳ trước` 
        : `↓ ${Math.abs(revenueGrowth.growthRate).toFixed(1)}% so với kỳ trước`,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgColor: "#667eea",
      trend: revenueGrowth.growthRate >= 0 ? "up" : "down",
    },
    {
      icon: <UilDollarSign size={48} color={"#fff"} />,
      title: "Tổng Đã Thanh Toán",
      value: formatCurrency(paymentAnalytics?.summary?.totalPaid || 0),
      subtitle: `Tỷ lệ thanh toán: ${paymentRate.toFixed(1)}%`,
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      bgColor: "#43e97b",
      trend: paymentRate >= 80 ? "up" : "neutral",
    },
    {
      icon: <UilMoneyBill size={48} color={"#fff"} />,
      title: "Tổng Nợ",
      value: formatCurrency(paymentAnalytics?.summary?.totalDebt || 0),
      subtitle: `Tỷ lệ nợ: ${debtRate.toFixed(1)}%`,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      bgColor: "#f5576c",
      trend: debtRate > 30 ? "down" : "neutral",
    },
    {
      icon: <UilCheckCircle size={48} color={"#fff"} />,
      title: "Giá Trị Đơn Hàng TB",
      value: formatCurrency(avgOrderValue),
      subtitle: `Min: ${formatCurrency(revenueAnalytics?.averageOrderValue?.minOrderValue || 0)} | Max: ${formatCurrency(revenueAnalytics?.averageOrderValue?.maxOrderValue || 0)}`,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      bgColor: "#4facfe",
      trend: "neutral",
    },
    // Customer, Inventory, Stock-In, Alerts - Row 2
    {
      icon: <PeopleIcon sx={{ fontSize: 48, color: "#fff" }} />,
      title: "Tổng Khách Hàng",
      value: totalCustomers.toString(),
      subtitle: `+${newCustomers} khách hàng mới trong tháng`,
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      bgColor: "#fa709a",
      trend: "neutral",
    },
    {
      icon: <UilBox size={48} color={"#fff"} />,
      title: "Tổng Vật Liệu",
      value: dashboardData?.inventorySummary?.totalItems?.toString() || inventoryAnalytics?.inventoryOverview?.totalItems?.toString() || "0",
      subtitle: `${lowStockCount} vật liệu tồn kho thấp`,
      color: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      bgColor: "#30cfd0",
      trend: lowStockCount > 0 ? "down" : "neutral",
    },
    {
      icon: <UilTruck size={48} color={"#fff"} />,
      title: "Tổng Đơn Nhập",
      value: dashboardData?.stockInSummary?.totalStockIns?.toString() || stockInAnalytics?.stockInOverview?.totalStockIns?.toString() || "0",
      subtitle: `${pendingStockIns} đơn chờ duyệt`,
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      bgColor: "#a8edea",
      trend: pendingStockIns > 0 ? "down" : "neutral",
    },
    {
      icon: <UilExclamationTriangle size={48} color={"#fff"} />,
      title: "Cảnh Báo",
      value: totalAlerts.toString(),
      subtitle: "Cảnh báo cần xử lý",
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      bgColor: "#ff9a9e",
      trend: totalAlerts > 0 ? "down" : "neutral",
    },
  ];

  return (
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      // sx={{
      //   marginX: { xs: 0, sm: 1, md: 3 },
      //   padding: 0,
      // }}
    >
      {cardData.map((card, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <Card
            sx={{
              background: card.color,
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              },
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 3, position: "relative", zIndex: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "2rem",
                  mb: 0.5,
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {card.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                {card.title}
              </Typography>
              {card.subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {card.trend === "up" && "↑"}
                  {card.trend === "down" && "↓"}
                  {card.subtitle}
                </Typography>
              )}
            </CardContent>
            {/* Decorative elements */}
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                zIndex: 1,
              }}
            />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardSummary;
