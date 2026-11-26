import { Edit, Payment, QrCode as QrCodeIcon, LocalShipping, Edit as EditIcon, History as HistoryIcon } from "@mui/icons-material";
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
  Select,
  MenuItem,
  FormControl,
  Chip,
  Tooltip,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../../store";
import { fetchMaterialById, fetchMaterials, Material } from "../../../store/slices/materialSlice";
import { Invoice, InvoiceItem, updateInvoiceStatus, updateItemPriceLock, fetchInvoiceById, fetchDeliveredAmount } from "../../../store/slices/invoiceSlice";
import DeliveryModal from "./DeliveryModal";
import EditInvoiceModal from "./EditInvoiceModal";
import PaymentModal from "./PaymentModal";
import VietQRModal from "./VietQRModal";
import PaidStamp from "./PaidStamp";
import AlertModal from "../components/AlertModal";
import { useAlertModal } from "../../../hooks/useAlertModal";

const OrderModal: React.FC<{ order: Invoice | null; onClose?: () => void }> = ({ order, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedMaterial, isLoading: materialLoading, materials } = useSelector((state: RootState) => state.materials);
  const { selectedInvoice, deliveredAmount, deliveredAmountLoading } = useSelector((state: RootState) => state.invoice);
  const alertModal = useAlertModal();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [materialDetails, setMaterialDetails] = useState<Record<string, any>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [vietQRModalOpen, setVietQRModalOpen] = useState(false);
  const [itemDeliveryStatus, setItemDeliveryStatus] = useState<Record<number, 'pending' | 'partial' | 'delivered'>>({});
  const [itemDeliveredQuantity, setItemDeliveredQuantity] = useState<Record<number, number>>({});
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'partial' | 'all'>('partial');
  const [deliveryItemIndex, setDeliveryItemIndex] = useState<number | null>(null);
  const [priceLockSaving, setPriceLockSaving] = useState<number | null>(null);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã giao một phần';
      case 'shipped': return 'Đã giao hàng';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Function to check inventory availability
  const checkInventoryAvailability = (itemIndex: number, requestedQuantity: number): { available: boolean; message?: string } => {
    if (!currentOrder || !currentOrder.items[itemIndex]) {
      return { available: false, message: 'Không tìm thấy thông tin sản phẩm' };
    }

    const item = currentOrder.items[itemIndex];
    const material = materials.find(m => m._id === item.materialId);
    
    if (!material) {
      return { available: false, message: `Không tìm thấy thông tin tồn kho cho "${item.materialName}"` };
    }

    // Calculate current delivered quantity for this item
    const currentDelivered = itemDeliveredQuantity[itemIndex] || 0;
    
    // Calculate how much more needs to be delivered
    const additionalQuantityNeeded = requestedQuantity - currentDelivered;
    
    // Check if we have enough inventory
    if (additionalQuantityNeeded > material.quantity) {
      return { 
        available: false, 
        message: `Không đủ tồn kho cho "${material.name}".\nTồn kho hiện tại: ${material.quantity} ${material.unit}\nCần thêm: ${additionalQuantityNeeded} ${material.unit}\nĐã giao: ${currentDelivered} ${material.unit}` 
      };
    }

    return { available: true };
  };

  // Use selectedInvoice from Redux store or fallback to order prop
  const currentOrder = selectedInvoice || order;

  // Fetch delivered amount from API when order changes
  useEffect(() => {
    if (currentOrder?._id) {
      dispatch(fetchDeliveredAmount(currentOrder._id));
    }
  }, [currentOrder?._id, dispatch]);

  // Fetch materials when modal opens to ensure inventory data is available
  useEffect(() => {
    if (currentOrder && materials.length === 0) {
      dispatch(fetchMaterials());
    }
  }, [currentOrder, materials.length, dispatch]);

  
  // Fetch material details for each item
  useEffect(() => {
    if (currentOrder.items && currentOrder.items.length > 0) {
      currentOrder.items.forEach((item: InvoiceItem) => {
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
  }, [currentOrder, dispatch, materialDetails]);

  // Initialize delivery status for items
  useEffect(() => {
    if (currentOrder && currentOrder.items) {
      const initialStatus: Record<number, 'pending' | 'partial' | 'delivered'> = {};
      const initialQuantity: Record<number, number> = {};
      
      currentOrder.items.forEach((item, index) => {
        // Check if item has delivery status from database
        if (item.deliveryStatus) {
          initialStatus[index] = item.deliveryStatus;
        } else {
          initialStatus[index] = 'pending';
        }
        
        // Check if item has delivered quantity from database
        if (item.deliveredQuantity !== undefined) {
          initialQuantity[index] = item.deliveredQuantity;
        } else {
          initialQuantity[index] = 0;
        }
      });
      
      setItemDeliveryStatus(initialStatus);
      setItemDeliveredQuantity(initialQuantity);
      
      // Calculate and update invoice status based on item delivery statuses
      const calculatedStatus = calculateInvoiceStatus(currentOrder.items, initialStatus);
      if (calculatedStatus !== currentOrder.status) {
        // Only update if the calculated status is different from current status
        // This will be handled by the backend when we update item delivery
        console.log(`Calculated status: ${calculatedStatus}, Current status: ${currentOrder.status}`);
      }
    }
  }, [currentOrder]);


  const handleStatusChange = async (newStatus: 'pending' | 'confirmed' | 'delivered' | 'cancelled') => {
    if (!currentOrder) return;
    
    // Check inventory availability for all items when changing to delivered or confirmed status
    if (newStatus === 'delivered' || newStatus === 'confirmed') {
      const insufficientStockItems: string[] = [];
      
      for (let i = 0; i < currentOrder.items.length; i++) {
        const item = currentOrder.items[i];
        const currentDelivered = itemDeliveredQuantity[i] || 0;
        const totalQuantity = item.quantity;
        const remainingQuantity = totalQuantity - currentDelivered;
        
        // Only check if there's still quantity to be delivered
        if (remainingQuantity > 0) {
          const inventoryCheck = checkInventoryAvailability(i, totalQuantity);
          if (!inventoryCheck.available) {
            const material = materials.find(m => m._id === item.materialId);
            insufficientStockItems.push(
              `• ${material?.name || item.materialName}: Cần ${remainingQuantity} ${item.unit}, tồn kho: ${material?.quantity || 0} ${material?.unit || item.unit}`
            );
          }
        }
      }
      
      if (insufficientStockItems.length > 0) {
        const statusText = newStatus === 'delivered' ? 'giao toàn bộ hóa đơn' : 'giao một phần hóa đơn';
        alertModal.showWarning(
          `Không thể ${statusText} do không đủ tồn kho:\n\n${insufficientStockItems.join('\n')}\n\nVui lòng kiểm tra và cập nhật tồn kho trước khi giao hàng.`,
          'Cảnh báo tồn kho',
          {
            maxWidth: 'lg',
            showCloseButton: true,
            autoClose: false
          }
        );
        return;
      }
    }
    
    try {
      await dispatch(updateInvoiceStatus({
        id: currentOrder._id,
        data: { status: newStatus }
      })).unwrap();
      
      console.log(`Đã cập nhật trạng thái đơn hàng ${currentOrder.invoiceNumber} thành: ${getStatusText(newStatus)}`);
      
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

  const openDeliveryModal = (mode: 'partial' | 'all', itemIndex: number | null = null) => {
    setDeliveryMode(mode);
    setDeliveryItemIndex(itemIndex);
    setDeliveryModalOpen(true);
  };

  const handleDeliveryModalClose = () => {
    setDeliveryModalOpen(false);
    setDeliveryItemIndex(null);
  };

  const handleDeliverySuccess = async () => {
    setDeliveryModalOpen(false);
    setDeliveryItemIndex(null);
    if (!currentOrder) return;
    try {
      await dispatch(fetchInvoiceById(currentOrder._id)).unwrap();
      await dispatch(fetchDeliveredAmount(currentOrder._id)).unwrap();
    } catch (refreshError) {
      console.warn('Không thể refresh dữ liệu hóa đơn:', refreshError);
    }
    alertModal.showSuccess('Đã ghi nhận giao hàng.', 'Thành công');
  };

  const handleTogglePriceLock = async (itemIndex: number, locked: boolean) => {
    if (!currentOrder) return;
    setPriceLockSaving(itemIndex);
    try {
      await dispatch(
        updateItemPriceLock({ id: currentOrder._id, itemIndex, locked })
      ).unwrap();
      try {
        await dispatch(fetchInvoiceById(currentOrder._id)).unwrap();
        await dispatch(fetchDeliveredAmount(currentOrder._id)).unwrap();
      } catch (refreshError) {
        console.warn('Không thể refresh dữ liệu hóa đơn:', refreshError);
      }
      alertModal.showSuccess(
        locked ? 'Đã chốt giá sản phẩm.' : 'Đã bỏ chốt giá sản phẩm.',
        'Thành công'
      );
    } catch (err: any) {
      alertModal.showError(
        typeof err === 'string' ? err : 'Không thể cập nhật chốt giá.',
        'Lỗi'
      );
    } finally {
      setPriceLockSaving(null);
    }
  };

  const getDeliveryStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ giao';
      case 'partial': return 'Giao một phần';
      case 'delivered': return 'Đã giao';
      default: return 'Chờ giao';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'partial': return 'info';
      case 'delivered': return 'success';
      default: return 'warning';
    }
  };

  // Function to calculate overall invoice status based on item delivery statuses
  const calculateInvoiceStatus = (items: InvoiceItem[], deliveryStatuses: Record<number, 'pending' | 'partial' | 'delivered'>) => {
    if (!items || items.length === 0) return 'pending';
    
    const totalItems = items.length;
    let deliveredItems = 0;
    let partialItems = 0;
    let pendingItems = 0;
    
    items.forEach((_, index) => {
      const status = deliveryStatuses[index] || 'pending';
      switch (status) {
        case 'delivered':
          deliveredItems++;
          break;
        case 'partial':
          partialItems++;
          break;
        case 'pending':
        default:
          pendingItems++;
          break;
      }
    });
    
    // Logic for determining overall status:
    // - If all items are delivered: 'delivered'
    // - If some items are delivered or partial: 'confirmed' (partially delivered)
    // - If all items are pending: 'pending'
    if (deliveredItems === totalItems) {
      return 'delivered';
    } else if (deliveredItems > 0 || partialItems > 0) {
      return 'confirmed'; // Partially delivered
    } else {
      return 'pending';
    }
  };

  // Use delivered amount from API or fallback to local calculation
  const totalDeliveredAmount = deliveredAmount?.deliveredAmount || 0;

  // Add null checks to prevent errors
  if (!currentOrder) {
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

  // Show loading state while fetching delivered amount
  if (deliveredAmountLoading) {
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Đang tải thông tin giao hàng...
        </Typography>
      </Box>
    );
  }

  // Use items instead of products
  const items = currentOrder.items || [];
  const tableRows = items.map((item: InvoiceItem, index: number) => {
    const material = materialDetails[item.materialId];
    const currentDeliveryStatus = itemDeliveryStatus[index] || 'pending';
    const currentDeliveredQuantity = itemDeliveredQuantity[index] || 0;
    const deliveredAmountForDisplay =
      item.deliveredAmount ??
      Number(item.deliveredQuantity || 0) * Number(item.originalUnitPrice ?? item.unitPrice);
    
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.unitPrice?.toLocaleString() + ' VNĐ' || '0'}
            </Typography>
            {item.originalUnitPrice && item.originalUnitPrice !== item.unitPrice && (
              <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {item.originalUnitPrice.toLocaleString()} VNĐ
              </Typography>
            )}
            {(item.deliveredQuantity ?? 0) > 0 && item.originalUnitPrice && item.originalUnitPrice !== item.unitPrice && (
              <Typography variant="caption" color="text.secondary">
                Giá áp dụng cho phần còn lại
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          fontWeight: 600,
          color: "success.main"
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.totalPrice?.toLocaleString() + ' VNĐ' || '0'}
            </Typography>
            {(item.deliveredQuantity ?? 0) > 0 && (
              <Typography variant="caption" color="text.secondary">
                Đã giao: {deliveredAmountForDisplay.toLocaleString()} VNĐ
              </Typography>
            )}
            {item.originalTotalPrice && item.originalTotalPrice !== item.totalPrice && (
              <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                {item.originalTotalPrice.toLocaleString()} VNĐ
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          fontWeight: 600,
          color: "info.main",
          textAlign: "center",
          minWidth: "120px"
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentDeliveredQuantity}/{item.quantity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.unit}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          minWidth: "130px",
          textAlign: "center"
        }}>
          <FormControlLabel
            sx={{ m: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}
            control={
              <Switch
                size="small"
                checked={item.priceLocked === true}
                onChange={(event) => handleTogglePriceLock(index, event.target.checked)}
                disabled={currentOrder.status === 'cancelled' || priceLockSaving === index}
              />
            }
            label={
              <Typography
                variant="caption"
                color={item.priceLocked ? 'success.main' : 'text.secondary'}
                sx={{ fontWeight: 600 }}
              >
                {item.priceLocked ? 'Đã chốt' : 'Chưa chốt'}
              </Typography>
            }
          />
          {item.priceLocked && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Giữ giá gốc
            </Typography>
          )}
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          minWidth: "200px"
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip 
              label={getDeliveryStatusText(currentDeliveryStatus)} 
              color={getDeliveryStatusColor(currentDeliveryStatus)}
              size="small"
              sx={{ fontSize: '0.7rem', width: 'fit-content' }}
            />
          </Box>
        </TableCell>
        <TableCell sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          minWidth: "80px",
          textAlign: "center"
        }}>
          <Tooltip title="Ghi nhận giao hàng cho mặt hàng này">
            <span>
              <IconButton
                size="small"
                onClick={() => openDeliveryModal('partial', index)}
                disabled={currentOrder.status === 'cancelled' || currentDeliveredQuantity >= item.quantity}
                sx={{ 
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <EditIcon sx={{ fontSize: '1.2rem' }} />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
    );
  });

  const totalRemaining = items.reduce(
    (acc: number, item: InvoiceItem) =>
      acc + Math.max(0, Number(item.quantity || 0) - Number(item.deliveredQuantity || 0)),
    0
  );

  const taxFactor =
    1 + Number(currentOrder.taxRate || 0) / 100 - Number(currentOrder.discountRate || 0) / 100;
  const originalItemsSubtotal = items.reduce(
    (acc: number, item: InvoiceItem) =>
      acc + Number(item.originalTotalPrice ?? item.totalPrice ?? 0),
    0
  );
  const currentItemsSubtotal = items.reduce(
    (acc: number, item: InvoiceItem) => acc + Number(item.totalPrice || 0),
    0
  );
  const priceAdjustmentTotal = Math.round((currentItemsSubtotal - originalItemsSubtotal) * taxFactor * 100) / 100;
  const originalTotalForDisplay = Math.round(originalItemsSubtotal * taxFactor * 100) / 100;
  const priceAdjustmentReason = items.find((item: InvoiceItem) => item.priceAdjustmentReason)?.priceAdjustmentReason;
  const priceAdjustedAt = items
    .map((item: InvoiceItem) => item.priceAdjustedAt)
    .filter(Boolean)
    .sort()
    .pop() as string | undefined;
  const hasPriceAdjustment = items.some(
    (item: InvoiceItem) => Boolean(item.priceAdjustedAt) || item.priceAdjustmentAmount !== undefined
  );

  const mobileItemCards = items.map((item: InvoiceItem, index: number) => {
    const material = materialDetails[item.materialId];
    const currentDeliveryStatus = itemDeliveryStatus[index] || 'pending';
    const currentDeliveredQuantity = itemDeliveredQuantity[index] || 0;
    const deliveredAmountForDisplay =
      item.deliveredAmount ??
      Number(item.deliveredQuantity || 0) * Number(item.originalUnitPrice ?? item.unitPrice);

    return (
      <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
              {material ? material.name : item.materialName || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentDeliveredQuantity}/{item.quantity} {item.unit} đã giao
            </Typography>
          </Box>
          <Chip
            label={getDeliveryStatusText(currentDeliveryStatus)}
            color={getDeliveryStatusColor(currentDeliveryStatus)}
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Đơn giá</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {item.unitPrice?.toLocaleString()} VNĐ
            </Typography>
            {item.originalUnitPrice && item.originalUnitPrice !== item.unitPrice && (
              <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through', display: 'block' }}>
                {item.originalUnitPrice.toLocaleString()} VNĐ
              </Typography>
            )}
            {(item.deliveredQuantity ?? 0) > 0 && item.originalUnitPrice && item.originalUnitPrice !== item.unitPrice && (
              <Typography variant="caption" color="text.secondary">
                Giá phần còn lại
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Thành tiền</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              {item.totalPrice?.toLocaleString()} VNĐ
            </Typography>
            {(item.deliveredQuantity ?? 0) > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Đã giao: {deliveredAmountForDisplay.toLocaleString()} VNĐ
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                size="small"
                checked={item.priceLocked === true}
                onChange={(event) => handleTogglePriceLock(index, event.target.checked)}
                disabled={currentOrder.status === 'cancelled' || priceLockSaving === index}
              />
            }
            label={
              <Typography variant="caption" color={item.priceLocked ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>
                {item.priceLocked ? 'Đã chốt giá' : 'Chốt giá'}
              </Typography>
            }
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => openDeliveryModal('partial', index)}
            disabled={currentOrder.status === 'cancelled' || currentDeliveredQuantity >= item.quantity}
          >
            Giao hàng
          </Button>
        </Box>
      </Paper>
    );
  });

  return (
    <Box
      sx={{
        position: "absolute",
        left: { xs: 0, sm: "50%" },
        top: { xs: 0, sm: "50%" },
        transform: { xs: "none", sm: "translate(-50%, -50%)" },
        width: { xs: "100%", sm: "95%", md: "85%", lg: "75%" },
        maxWidth: { xs: "100%", sm: "1200px" },
        height: { xs: "100dvh", sm: "auto" },
        maxHeight: { xs: "100dvh", sm: "85vh" },
        bgcolor: "white",
        borderRadius: { xs: 0, sm: 2 },
        boxShadow: 24,
        p: { xs: 1.5, sm: 3, md: 4 },
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
            {currentOrder.status !== 'cancelled' && (
              <Button
                variant="contained"
                startIcon={<HistoryIcon />}
                onClick={() => navigate(`/dashboard/orders/${currentOrder._id}/deliveries`)}
                size="small"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                }}
              >
                <Box sx={{ display: { xs: "none", sm: "inline" } }}>Giao hàng / Lịch sử</Box>
                <Box sx={{ display: { xs: "inline", sm: "none" } }}>Giao</Box>
              </Button>
            )}
            {currentOrder.paymentStatus !== 'paid' && currentOrder.status !== 'cancelled' && (
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
                {currentOrder.status !== 'delivered' && (
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
                )}
              </>
            )}
          </Box>
        </Box>
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr 1fr 1fr" },
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
              {currentOrder.customerName || 'N/A'}
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
              {currentOrder.invoiceNumber || 'N/A'}
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
              {currentOrder.customerPhone || 'N/A'}
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
              {currentOrder.customerAddress || 'N/A'}
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
              {getStatusText(currentOrder.status) || 'N/A'}
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
            <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
              <Typography variant="body2" color="primary.main" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600 }}>
                {currentOrder.totalAmount?.toLocaleString() + ' VNĐ' || '0'}
              </Typography>
              {hasPriceAdjustment && priceAdjustmentTotal !== 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through', display: 'block' }}>
                  {originalTotalForDisplay.toLocaleString()} VNĐ
                </Typography>
              )}
            </Box>
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
              {(currentOrder.paidAmount || 0).toLocaleString() + ' VNĐ'}
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
              {(currentOrder.remainingAmount || currentOrder.totalAmount || 0).toLocaleString() + ' VNĐ'}
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
              bgcolor: "info.50",
              borderRadius: 1,
              minHeight: { xs: "auto", sm: "60px" }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
              Đã giao hàng
            </Typography>
            <Typography variant="body2" color="info.main" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, textAlign: { xs: "left", sm: "right" } }}>
              {totalDeliveredAmount.toLocaleString() + ' VNĐ'}
            </Typography>
          </Paper>
          
          {/* Price Adjustment Information */}
          {hasPriceAdjustment && priceAdjustmentTotal !== 0 && (
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                p: { xs: 1.5, sm: 2 },
                bgcolor: "warning.50",
                borderRadius: 1,
                minHeight: { xs: "auto", sm: "60px" }
              }}
            >
              <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, mb: { xs: 0.5, sm: 0 } }}>
                Điều chỉnh giá
              </Typography>
              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography variant="body2" color="warning.main" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600 }}>
                  {priceAdjustmentTotal > 0 ? '+' : ''}{priceAdjustmentTotal.toLocaleString()} VNĐ
                </Typography>
                {priceAdjustmentReason && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Lý do: {priceAdjustmentReason}
                  </Typography>
                )}
                {priceAdjustedAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Ngày: {new Date(priceAdjustedAt).toLocaleDateString('vi-VN')}
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </Box>
        {isMobile ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
            {mobileItemCards}
          </Box>
        ) : (
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
                    minWidth: "120px"
                  }}>
                    Đã giao
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    minWidth: "130px"
                  }}>
                    Chốt giá
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    minWidth: "200px"
                  }}>
                    Trạng thái giao hàng
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 600,
                    bgcolor: "grey.100",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    minWidth: "150px"
                  }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* loop through the items list */}
                {materialLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Đang tải chi tiết vật liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tableRows.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không tìm thấy sản phẩm nào trong đơn hàng này
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        )}
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
                bgcolor: "#2196f3", 
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: 80, sm: 120 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": { bgcolor: "#1976d2" }
              }}
              onClick={() => openDeliveryModal('partial')}
              disabled={currentOrder.status === 'cancelled' || totalRemaining <= 0}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Giao một phần</Box>
              <Box sx={{ display: { xs: "inline", sm: "none" } }}>Một phần</Box>
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
              onClick={() => openDeliveryModal('all')}
              disabled={currentOrder.status === 'cancelled' || totalRemaining <= 0}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Đã giao hết</Box>
              <Box sx={{ display: { xs: "inline", sm: "none" } }}>Giao hết</Box>
            </Button>
            {currentOrder.paymentStatus !== 'paid' && (
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
                disabled={currentOrder.status === 'cancelled' || currentOrder.status === 'delivered'}
              >
                <Box sx={{ display: { xs: "none", sm: "inline" } }}>Hủy đơn</Box>
                <Box sx={{ display: { xs: "inline", sm: "none" } }}>Hủy</Box>
              </Button>
            )}
          </Paper>
      </Box>

      {/* Paid Stamp */}
      <PaidStamp visible={currentOrder.paymentStatus === 'paid'} />

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        invoice={currentOrder}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Payment Modal */}
      <PaymentModal
        invoice={currentOrder}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* VietQR Modal */}
      <VietQRModal
        invoice={currentOrder}
        open={vietQRModalOpen}
        onClose={() => setVietQRModalOpen(false)}
        onSuccess={handleVietQRSuccess}
      />

      {/* Delivery Modal */}
      <DeliveryModal
        invoice={currentOrder}
        open={deliveryModalOpen}
        mode={deliveryMode}
        initialItemIndex={deliveryItemIndex}
        onClose={handleDeliveryModalClose}
        onSuccess={handleDeliverySuccess}
      />

      {/* Alert Modal for inventory warnings */}
      <AlertModal
        open={alertModal.open}
        onClose={alertModal.hideAlert}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        variant={alertModal.variant}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        showCloseButton={alertModal.showCloseButton}
        autoClose={alertModal.autoClose}
        autoCloseDelay={alertModal.autoCloseDelay}
        transition={alertModal.transition}
        maxWidth={alertModal.maxWidth}
        fullWidth={alertModal.fullWidth}
        showIcon={alertModal.showIcon}
        customIcon={alertModal.customIcon}
      />
    </Box>
  );
}

export default OrderModal;


