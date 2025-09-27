import { Edit, Payment, QrCode as QrCodeIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchMaterialById } from "../../../store/slices/materialSlice";
import { Invoice, InvoiceItem, updateInvoiceStatus } from "../../../store/slices/invoiceSlice";
import EditInvoiceModal from "./EditInvoiceModal";
import PaymentModal from "./PaymentModal";
import VietQRModal from "./VietQRModal";
import PaidStamp from "./PaidStamp";

const OrderModal: React.FC<{ order: Invoice | null; onClose?: () => void }> = ({ order, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedMaterial, isLoading: materialLoading } = useSelector((state: RootState) => state.materials);
  const [materialDetails, setMaterialDetails] = useState<Record<string, any>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [vietQRModalOpen, setVietQRModalOpen] = useState(false);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipped': return 'Đã giao hàng';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Add null checks to prevent errors
  if (!order) {
    return (
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Chưa chọn đơn hàng
        </Typography>
      </Box>
    );
  }

  console.log("the order lists are :\n", order);
  
  // Fetch material details for each item
  useEffect(() => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item: InvoiceItem) => {
        if (item.materialId && !materialDetails[item.materialId]) {
          dispatch(fetchMaterialById(item.materialId)).then((result) => {
            if (result.payload) {
              setMaterialDetails(prev => ({
                ...prev,
                [item.materialId]: result.payload
              }));
            }
          });
        }
      });
    }
  }, [order, dispatch, materialDetails]);


  const handleStatusChange = async (newStatus: 'pending' | 'confirmed' | 'delivered' | 'cancelled') => {
    if (!order) return;
    
    try {
      await dispatch(updateInvoiceStatus({
        id: order._id,
        data: { status: newStatus }
      })).unwrap();
      
      console.log(`Đã cập nhật trạng thái đơn hàng ${order.invoiceNumber} thành: ${getStatusText(newStatus)}`);
      
      // Đóng modal sau khi cập nhật thành công
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const handleEditInvoice = () => {
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    // Refresh the order data or close the modal
    if (onClose) {
      onClose();
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    // Refresh the order data or close the modal
    if (onClose) {
      onClose();
    }
  };

  const handleVietQRSuccess = () => {
    setVietQRModalOpen(false);
    // Refresh the order data or close the modal
    if (onClose) {
      onClose();
    }
  };

  // Use items instead of products
  const items = order.items || [];
  const tableRows = items.map((item: InvoiceItem, index: number) => {
    const material = materialDetails[item.materialId];
    return (
      <TableRow key={index}>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          maxWidth: { xs: "120px", sm: "none" },
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {material ? material.name : item.materialName || 'N/A'}
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          display: { xs: "none", sm: "table-cell" }
        }}>
          {item.quantity}
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          display: { xs: "none", sm: "table-cell" }
        }}>
          {item.unit}
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          fontWeight: 600,
          color: "primary.main"
        }}>
          {item.unitPrice?.toLocaleString() + ' VNĐ' || '0'}
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          fontWeight: 600,
          color: "success.main"
        }}>
          {item.totalPrice?.toLocaleString() + ' VNĐ' || '0'}
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          display: { xs: "none", sm: "table-cell" }
        }}>
          {material ? material.quantity : 'N/A'}
        </TableCell>
      </TableRow>
    );
  });
  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "95%", sm: "90%", md: "70%", lg: "50%" },
        maxWidth: "800px",
        maxHeight: { xs: "90vh", sm: "85vh" },
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 24,
        p: { xs: 2, sm: 3, md: 4 },
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ color: "black", display: "flex", flexDirection: "column", flex: 1 }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          m: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 2, sm: 3 }
        }}>
          <Typography variant="h6" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            Chi tiết đơn hàng
          </Typography>
          <Box sx={{ 
            display: "flex", 
            gap: { xs: 0.5, sm: 1 },
            flexWrap: "wrap",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-end" }
          }}>
            {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Payment />}
                  onClick={() => setPaymentModalOpen(true)}
                  size="small"
                  sx={{ 
                    color: "success.main",
                    borderColor: "success.main",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    "&:hover": {
                      backgroundColor: "success.light",
                      color: "white"
                    }
                  }}
                >
                  <Box sx={{ display: { xs: "none", sm: "inline" } }}>Thanh toán</Box>
                  <Box sx={{ display: { xs: "inline", sm: "none" } }}>TT</Box>
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeIcon />}
                  onClick={() => setVietQRModalOpen(true)}
                  size="small"
                  sx={{ 
                    color: "info.main",
                    borderColor: "info.main",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    "&:hover": {
                      backgroundColor: "info.light",
                      color: "white"
                    }
                  }}
                >
                  <Box sx={{ display: { xs: "none", sm: "inline" } }}>VietQR</Box>
                  <Box sx={{ display: { xs: "inline", sm: "none" } }}>QR</Box>
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEditInvoice}
                  size="small"
                  sx={{ 
                    color: "primary.main",
                    borderColor: "primary.main",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    "&:hover": {
                      backgroundColor: "primary.light",
                      color: "white"
                    }
                  }}
                >
                  <Box sx={{ display: { xs: "none", sm: "inline" } }}>Chỉnh sửa</Box>
                  <Box sx={{ display: { xs: "inline", sm: "none" } }}>Sửa</Box>
                </Button>
              </>
            )}
          </Box>
        </Box>
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
          gap: { xs: 1, sm: 2 },
          m: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 2, sm: 3 }
        }}>
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "grey.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Tên khách hàng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, textAlign: { xs: "left", sm: "right" } }}>
              {order.customerName || 'N/A'}
            </Typography>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "grey.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Số hóa đơn
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, textAlign: { xs: "left", sm: "right" } }}>
              {order.invoiceNumber || 'N/A'}
            </Typography>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "grey.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Số điện thoại
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, textAlign: { xs: "left", sm: "right" } }}>
              {order.customerPhone || 'N/A'}
            </Typography>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "grey.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Địa chỉ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, textAlign: { xs: "left", sm: "right" } }}>
              {order.customerAddress || 'N/A'}
            </Typography>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "grey.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Trạng thái
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, textAlign: { xs: "left", sm: "right" } }}>
              {getStatusText(order.status) || 'N/A'}
            </Typography>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "primary.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Tổng tiền
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, textAlign: { xs: "left", sm: "right" } }}>
              {order.totalAmount?.toLocaleString() + ' VNĐ' || '0'}
            </Typography>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "success.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Đã thanh toán
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, textAlign: { xs: "left", sm: "right" } }}>
              {(order.paidAmount || 0).toLocaleString() + ' VNĐ'}
            </Typography>
          </Paper>
          
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "error.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Còn lại
            </Typography>
            <Typography variant="body2" color="error.main" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, textAlign: { xs: "left", sm: "right" } }}>
              {(order.remainingAmount || order.totalAmount || 0).toLocaleString() + ' VNĐ'}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <TableContainer 
            sx={{ 
              marginBottom: { xs: 2, sm: 3 },
              maxHeight: { xs: "300px", sm: "400px" },
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "6px",
                height: "6px"
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "3px"
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.3)",
                borderRadius: "3px"
              }
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1
                  }}>
                    Tên vật liệu
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    display: { xs: "none", sm: "table-cell" }
                  }}>
                    Số lượng
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    display: { xs: "none", sm: "table-cell" }
                  }}>
                    Đơn vị
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1
                  }}>
                    Đơn giá
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1
                  }}>
                    Thành tiền
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    display: { xs: "none", sm: "table-cell" }
                  }}>
                    Tồn kho
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* loop through the items list */}
                {materialLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Đang tải chi tiết vật liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tableRows.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không tìm thấy sản phẩm nào trong đơn hàng này
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              m: 0,
              gap: { xs: 1, sm: 2 },
              flexWrap: "wrap",
              p: { xs: 1, sm: 2 },
              bgcolor: "grey.50",
              borderRadius: 1
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{ 
                bgcolor: "#ff9800", 
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: 80, sm: 120 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": { bgcolor: "#f57c00" }
              }}
              onClick={() => handleStatusChange('pending')}
              disabled={order.status === 'pending' || order.status === 'cancelled' || order.status === 'delivered'}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Chờ xử lý</Box>
              <Box sx={{ display: { xs: "inline", sm: "none" } }}>Chờ</Box>
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ 
                bgcolor: "#2196f3", 
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: 80, sm: 120 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": { bgcolor: "#1976d2" }
              }}
              onClick={() => handleStatusChange('confirmed')}
              disabled={order.status === 'confirmed' || order.status === 'cancelled' || order.status === 'delivered'}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Đã xác nhận</Box>
              <Box sx={{ display: { xs: "inline", sm: "none" } }}>Xác nhận</Box>
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ 
                bgcolor: "#4caf50", 
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: 80, sm: 120 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": { bgcolor: "#388e3c" }
              }}
              onClick={() => handleStatusChange('delivered')}
              disabled={order.status === 'delivered' || order.status === 'cancelled'}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Đã giao</Box>
              <Box sx={{ display: { xs: "inline", sm: "none" } }}>Giao</Box>
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ 
                bgcolor: "#f44336", 
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: 80, sm: 120 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": { bgcolor: "#d32f2f" }
              }}
              onClick={() => handleStatusChange('cancelled')}
              disabled={order.status === 'cancelled' || order.status === 'delivered'}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Hủy đơn</Box>
              <Box sx={{ display: { xs: "inline", sm: "none" } }}>Hủy</Box>
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Paid Stamp */}
      <PaidStamp visible={order.paymentStatus === 'paid'} />

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        invoice={order}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Payment Modal */}
      <PaymentModal
        invoice={order}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* VietQR Modal */}
      <VietQRModal
        invoice={order}
        open={vietQRModalOpen}
        onClose={() => setVietQRModalOpen(false)}
        onSuccess={handleVietQRSuccess}
      />
    </Box>
  );
}

export default OrderModal;

