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
  Card,
  CardContent,
  Chip,
  Paper,
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
            Đang tải vật liệu bán chạy...
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
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 1,
            }}
          >
            Vật Liệu Bán Chạy Nhất
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Top vật liệu có doanh số cao nhất
          </Typography>
        </Box>
        
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e9ecef",
                  }}
                >
                  Tên Vật Liệu
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e9ecef",
                  }} 
                  align="right"
                >
                  Số Lượng Bán
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e9ecef",
                  }} 
                  align="right"
                >
                  Tổng Doanh Thu
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #e9ecef",
                  }} 
                  align="right"
                >
                  Số Đơn Hàng
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topSellingMaterials.length > 0 ? (
                topSellingMaterials.map((material, id) => (
                  <TableRow 
                    key={id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                      },
                      "&:nth-of-type(even)": {
                        backgroundColor: "#fafbfc",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                      {material._id.materialName}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.875rem" }}>
                      <Chip
                        label={material.totalQuantity.toLocaleString()}
                        size="small"
                        sx={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {formatCurrency(material.totalRevenue)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.875rem" }}>
                      <Chip
                        label={material.orderCount}
                        size="small"
                        sx={{
                          backgroundColor: "#f3e5f5",
                          color: "#7b1fa2",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" variant="body2">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TopSellingMaterials;
