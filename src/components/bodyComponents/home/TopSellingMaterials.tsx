import React, { useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchInventoryAnalytics, selectInventoryAnalytics, selectInventoryLoading } from "../../../store/slices/analyticsSlice";

const TopSellingMaterials: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const inventoryAnalytics = useSelector(selectInventoryAnalytics);
  const isLoading = useSelector(selectInventoryLoading);

  useEffect(() => {
    dispatch(fetchInventoryAnalytics());
  }, [dispatch]);

  const topSellingMaterials = inventoryAnalytics?.topSellingMaterials || [];

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
          margin: 3,
          bgcolor: "white",
          borderRadius: 2,
          padding: 3,
          height: "95%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải vật liệu bán chạy...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <Typography variant="h6" fontWeight={"bold"} sx={{ mx: 3, mb: 2 }}>
        Vật Liệu Bán Chạy Nhất
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bolder" }}>Tên Vật Liệu</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }} align="right">Số Lượng Bán</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }} align="right">Tổng Doanh Thu</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }} align="right">Số Đơn Hàng</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topSellingMaterials.length > 0 ? (
              topSellingMaterials.map((material, id) => (
                <TableRow key={id}>
                  <TableCell>{material._id.materialName}</TableCell>
                  <TableCell align="right">{material.totalQuantity.toLocaleString()}</TableCell>
                  <TableCell align="right">{formatCurrency(material.totalRevenue)}</TableCell>
                  <TableCell align="right">{material.orderCount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
        <Typography color="text.secondary">
          Không có dữ liệu
        </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TopSellingMaterials;
