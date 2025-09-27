import React, { useEffect } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { 
  fetchDashboardData, 
  selectDashboardData, 
  selectDashboardLoading 
} from "../../../store/slices/analyticsSlice";
import InfoCard from "../../subComponents/InfoCard";

// Icons
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";
import UilCheckCircle from "@iconscout/react-unicons/icons/uil-check-circle";
import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";

const DashboardSummary: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dashboardData = useSelector(selectDashboardData);
  const isLoading = useSelector(selectDashboardLoading);

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

  const cardComponents = [
    {
      icon: <UilBox size={60} color={"#F6F4EB"} />,
      title: "Tổng Vật Liệu",
      subTitle: dashboardData?.inventorySummary?.totalItems?.toString() || "0",
      mx: 3,
      my: 0,
    },
    {
      icon: <UilTruck size={60} color={"#F6F4EB"} />,
      title: "Nhập Kho",
      subTitle: dashboardData?.stockInSummary?.totalStockIns?.toString() || "0",
      mx: 5,
      my: 0,
    },
    {
      icon: <UilCheckCircle size={60} color={"#F6F4EB"} />,
      title: "Tổng Đơn Hàng",
      subTitle: dashboardData?.financialSummary?.totalOrders?.toString() || "0",
      mx: 5,
      my: 0,
    },
    {
      icon: <UilReceipt size={60} color={"#F6F4EB"} />,
      title: "Tổng Doanh Thu",
      subTitle: dashboardData?.financialSummary?.totalRevenue 
        ? formatCurrency(dashboardData.financialSummary.totalRevenue)
        : "0 VND",
      mx: 3,
      my: 0,
    },
  ];

  return (
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      sx={{
        marginX: { xs: 0, sm: 1, md: 3 },
        borderRadius: 2,
        padding: 0,
      }}
    >
      {cardComponents.map((card, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <InfoCard card={card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardSummary;
