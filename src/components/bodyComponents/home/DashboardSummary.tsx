import React, { useEffect } from "react";
import { Box, Grid, Typography, CircularProgress, Card, CardContent, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { 
  fetchDashboardData, 
  selectDashboardData, 
  selectDashboardLoading 
} from "../../../store/slices/analyticsSlice";

// Icons
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";
import UilCheckCircle from "@iconscout/react-unicons/icons/uil-check-circle";
import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";

const DashboardSummary: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dashboardData = useSelector(selectDashboardData);
  const isLoading = useSelector(selectDashboardLoading);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchDashboardData({}));
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

  const cardData = [
    {
      icon: <UilBox size={48} color={"#fff"} />,
      title: "Tổng Vật Liệu",
      value: dashboardData?.inventorySummary?.totalItems?.toString() || "0",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgColor: "#667eea",
    },
    {
      icon: <UilTruck size={48} color={"#fff"} />,
      title: "Nhập Kho",
      value: dashboardData?.stockInSummary?.totalStockIns?.toString() || "0",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      bgColor: "#f5576c",
    },
    {
      icon: <UilCheckCircle size={48} color={"#fff"} />,
      title: "Tổng Đơn Hàng",
      value: dashboardData?.financialSummary?.totalOrders?.toString() || "0",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      bgColor: "#4facfe",
    },
    {
      icon: <UilReceipt size={48} color={"#fff"} />,
      title: "Tổng Doanh Thu",
      value: dashboardData?.financialSummary?.totalRevenue 
        ? formatCurrency(dashboardData.financialSummary.totalRevenue)
        : "0 VND",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      bgColor: "#43e97b",
    },
  ];

  return (
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      sx={{
        marginX: { xs: 0, sm: 1, md: 3 },
        padding: 0,
      }}
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
                  mb: 1,
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
                }}
              >
                {card.title}
              </Typography>
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
