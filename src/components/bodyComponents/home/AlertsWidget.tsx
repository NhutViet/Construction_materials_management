import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchAlerts, fetchDashboardData, selectDashboardData } from "../../../store/slices/analyticsSlice";
import UilExclamationTriangle from "@iconscout/react-unicons/icons/uil-exclamation-triangle";
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";

const AlertsWidget: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dashboardData = useSelector(selectDashboardData);
  const alerts = dashboardData?.alerts;

  useEffect(() => {
    dispatch(fetchDashboardData({}));
    dispatch(fetchAlerts());
  }, [dispatch]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const lowStockCount = alerts?.lowStockItems?.length || 0;
  const overdueCount = alerts?.overdueInvoices?.length || 0;
  const pendingCount = alerts?.pendingStockIns?.length || 0;
  const criticalOverdueCount = alerts?.overdueInvoices?.filter(
    inv => {
      const daysSince = Math.floor(
        (new Date().getTime() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince > 90;
    }
  ).length || 0;
  const totalAlerts = alerts?.totalAlerts || 0;

  if (totalAlerts === 0) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          height: "100%",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <UilExclamationTriangle size={24} color="#4caf50" />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
              Cảnh Báo
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Không có cảnh báo nào cần xử lý
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <UilExclamationTriangle size={24} color="#f5576c" />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
              Cảnh Báo Hoạt Động
            </Typography>
          </Box>
          <Badge badgeContent={totalAlerts} color="error">
            <Chip label={`${totalAlerts} cảnh báo`} color="error" size="small" />
          </Badge>
        </Box>

        <List>
          {/* Low Stock Alert */}
          {lowStockCount > 0 && (
            <>
              <ListItem>
                <ListItemIcon>
                  <UilBox size={20} color="#ff9800" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Tồn kho thấp
                      </Typography>
                      <Chip label={lowStockCount} color="warning" size="small" />
                    </Box>
                  }
                  secondary={`${lowStockCount} vật liệu cần bổ sung`}
                />
              </ListItem>
              {overdueCount > 0 && <Divider />}
            </>
          )}

          {/* Overdue Invoices Alert */}
          {overdueCount > 0 && (
            <>
              <ListItem>
                <ListItemIcon>
                  <UilReceipt size={20} color="#f44336" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Hóa đơn quá hạn
                      </Typography>
                      <Chip label={overdueCount} color="error" size="small" />
                      {criticalOverdueCount > 0 && (
                        <Chip label={`${criticalOverdueCount} nghiêm trọng`} color="error" size="small" variant="outlined" />
                      )}
                    </Box>
                  }
                  secondary={`${overdueCount} hóa đơn cần theo dõi`}
                />
              </ListItem>
              {pendingCount > 0 && <Divider />}
            </>
          )}

          {/* Pending Stock-Ins Alert */}
          {pendingCount > 0 && (
            <ListItem>
              <ListItemIcon>
                <UilTruck size={20} color="#2196f3" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Đơn nhập chờ duyệt
                    </Typography>
                    <Chip label={pendingCount} color="info" size="small" />
                  </Box>
                }
                secondary={`${pendingCount} đơn nhập cần phê duyệt`}
              />
            </ListItem>
          )}
        </List>

        {/* Quick view of critical items */}
        {criticalOverdueCount > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "error.light", borderRadius: 2 }}>
            <Typography variant="caption" color="error.dark" fontWeight="bold">
              ⚠️ CẢNH BÁO: {criticalOverdueCount} hóa đơn quá hạn hơn 90 ngày cần xử lý ngay!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;

