import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchInventoryAnalytics, selectInventoryAnalytics, selectInventoryLoading } from "../../../store/slices/analyticsSlice";

const LowStockTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const inventoryAnalytics = useSelector(selectInventoryAnalytics);
  const isLoading = useSelector(selectInventoryLoading);

  useEffect(() => {
    dispatch(fetchInventoryAnalytics());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          height: "100%",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            p: 4,
          }}
        >
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Đang tải dữ liệu...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const lowStockItems = inventoryAnalytics?.lowStockItems || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (lowStockItems.length === 0) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          height: "100%",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 2,
            }}
          >
            ⚠️ Cảnh Báo Tồn Kho Thấp
          </Typography>
          <Alert severity="success">Không có vật liệu nào ở mức tồn kho thấp!</Alert>
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
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 1,
            }}
          >
            ⚠️ Cảnh Báo Tồn Kho Thấp
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lowStockItems.length} vật liệu cần bổ sung
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Tên vật liệu</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Danh mục</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Số lượng</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Giá</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockItems.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="center">{item.category}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: item.quantity < 10 ? "error.main" : "warning.main",
                      }}
                    >
                      {item.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.quantity < 10 ? "Nguy hiểm" : "Thấp"}
                      color={item.quantity < 10 ? "error" : "warning"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default LowStockTable;

