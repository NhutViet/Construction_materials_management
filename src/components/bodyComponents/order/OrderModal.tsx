import { Delete, DeleteOutline, Edit, Payment } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
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
import PaidStamp from "./PaidStamp";

const OrderModal: React.FC<{ order: Invoice | null; onClose?: () => void }> = ({ order, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedMaterial, isLoading: materialLoading } = useSelector((state: RootState) => state.materials);
  const [materialDetails, setMaterialDetails] = useState<Record<string, any>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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

  const handleDeleteProductFromOrder = (orderId: string, materialId: string) => {
    console.log(
      "delete the material : ",
      materialId,
      " from the order ",
      orderId
    );
  };

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

  // Use items instead of products
  const items = order.items || [];
  const tableRows = items.map((item: InvoiceItem, index: number) => {
    const material = materialDetails[item.materialId];
    return (
      <TableRow key={index}>
        <TableCell>
          {material ? material.name : item.materialName || 'N/A'}
        </TableCell>
        <TableCell>{item.quantity}</TableCell>
        <TableCell>{item.unit}</TableCell>
        <TableCell>{item.unitPrice?.toLocaleString() + ' VNĐ' || '0'}</TableCell>
        <TableCell>{item.totalPrice?.toLocaleString() + ' VNĐ' || '0'}</TableCell>
        <TableCell>
          {material ? material.quantity : 'N/A'}
        </TableCell>
        <TableCell>
          <IconButton
            onClick={() =>
              handleDeleteProductFromOrder(order._id, item.materialId)
            }
          >
            <DeleteOutline color="error" />
          </IconButton>
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
        width: "50%",
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        overflow: "hidden",
      }}
    >
      <Box sx={{ color: "black", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", m: 3 }}>
          <Typography variant="h6">
            Chi tiết đơn hàng
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Payment />}
              onClick={() => setPaymentModalOpen(true)}
              sx={{ 
                color: "success.main",
                borderColor: "success.main",
                "&:hover": {
                  backgroundColor: "success.light",
                  color: "white"
                }
              }}
            >
              Thanh toán
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEditInvoice}
              sx={{ 
                color: "primary.main",
                borderColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "white"
                }
              }}
            >
              Chỉnh sửa
            </Button>
          </Box>
        </Box>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "30%",
            m: 3,
          }}
        >
          <Typography variant="subtitle1">Tên khách hàng </Typography>
          <Typography variant="subtitle1" color={"grey"}>
            {order.customerName || 'N/A'}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "30%",
            m: 3,
          }}
        >
          <Typography variant="subtitle1">Số hóa đơn </Typography>
          <Typography variant="subtitle1" color={"grey"}>
            {order.invoiceNumber || 'N/A'}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "30%",
            m: 3,
          }}
        >
          <Typography variant="subtitle1">Số điện thoại </Typography>
          <Typography variant="subtitle1" color={"grey"}>
            {order.customerPhone || 'N/A'}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "30%",
            m: 3,
          }}
        >
          <Typography variant="subtitle1">Trạng thái </Typography>
          <Typography variant="subtitle1" color={"grey"}>
            {getStatusText(order.status) || 'N/A'}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "30%",
            m: 3,
          }}
        >
          <Typography variant="subtitle1">Tổng tiền </Typography>
          <Typography variant="subtitle1" color={"grey"}>
            {order.totalAmount?.toLocaleString() + ' VNĐ' || '0'}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "30%",
            m: 3,
          }}
        >
          <Typography variant="subtitle1">Đã thanh toán </Typography>
          <Typography variant="subtitle1" color={"success.main"}>
            {(order.paidAmount || 0).toLocaleString() + ' VNĐ'}
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "30%",
            m: 3,
          }}
        >
          <Typography variant="subtitle1">Còn lại </Typography>
          <Typography variant="subtitle1" color={"error.main"}>
            {(order.remainingAmount || order.totalAmount || 0).toLocaleString() + ' VNĐ'}
          </Typography>
        </Paper>
        <Box>
          <TableContainer sx={{ marginBottom: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên vật liệu</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Đơn vị</TableCell>
                  <TableCell>Đơn giá</TableCell>
                  <TableCell>Thành tiền</TableCell>
                  <TableCell>Tồn kho</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* loop through the items list */}
                {materialLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Đang tải chi tiết vật liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tableRows.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
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
              justifyContent: "space-between",
              width: "100%",
              m: 0,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              sx={{ 
                bgcolor: "#ff9800", 
                m: 1, 
                px: 3,
                minWidth: 120,
                "&:hover": { bgcolor: "#f57c00" }
              }}
              onClick={() => handleStatusChange('pending')}
              disabled={order.status === 'pending' || order.status === 'cancelled'}
            >
              Chờ xử lý
            </Button>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: "#2196f3", 
                m: 1, 
                px: 3,
                minWidth: 120,
                "&:hover": { bgcolor: "#1976d2" }
              }}
              onClick={() => handleStatusChange('confirmed')}
              disabled={order.status === 'confirmed' || order.status === 'cancelled'}
            >
              Đã xác nhận
            </Button>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: "#4caf50", 
                m: 1, 
                px: 3,
                minWidth: 120,
                "&:hover": { bgcolor: "#388e3c" }
              }}
              onClick={() => handleStatusChange('delivered')}
              disabled={order.status === 'delivered' || order.status === 'cancelled'}
            >
              Đã giao
            </Button>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: "#f44336", 
                m: 1, 
                px: 3,
                minWidth: 120,
                "&:hover": { bgcolor: "#d32f2f" }
              }}
              onClick={() => handleStatusChange('cancelled')}
              disabled={order.status === 'cancelled'}
            >
              Hủy đơn
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
    </Box>
  );
}

export default OrderModal;

