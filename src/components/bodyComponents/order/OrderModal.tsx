import { Edit, Payment, QrCode as QrCodeIcon, LocalShipping, CheckCircle, Edit as EditIcon } from "@mui/icons-material";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchMaterialById, fetchMaterials, Material } from "../../../store/slices/materialSlice";
import { Invoice, InvoiceItem, updateInvoiceStatus, updateItemDelivery, fetchInvoiceById, fetchDeliveredAmount } from "../../../store/slices/invoiceSlice";
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
  const [materialDetails, setMaterialDetails] = useState<Record<string, any>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [vietQRModalOpen, setVietQRModalOpen] = useState(false);
  const [itemDeliveryStatus, setItemDeliveryStatus] = useState<Record<number, 'pending' | 'partial' | 'delivered'>>({});
  const [itemDeliveredQuantity, setItemDeliveredQuantity] = useState<Record<number, number>>({});
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedItemForStatus, setSelectedItemForStatus] = useState<number | null>(null);
  const [showQuantityInput, setShowQuantityInput] = useState<Record<number, boolean>>({});
  const [tempQuantityInput, setTempQuantityInput] = useState<Record<number, string>>({});

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

  const handlePartialDeliveryClick = (itemIndex: number) => {
    setSelectedItemIndex(itemIndex);
    setQuantityInput('0');
    setQuantityModalOpen(true);
  };

  const handleQuantityModalClose = () => {
    setQuantityModalOpen(false);
    setSelectedItemIndex(null);
    setQuantityInput('');
  };

  const handleStatusIconClick = (itemIndex: number) => {
    setSelectedItemForStatus(itemIndex);
    setStatusModalOpen(true);
  };

  const handleStatusModalClose = () => {
    setStatusModalOpen(false);
    setSelectedItemForStatus(null);
    setShowQuantityInput({});
    setTempQuantityInput({});
  };

  const handleStatusSelect = (status: 'pending' | 'partial' | 'delivered') => {
    if (selectedItemForStatus === null) return;

    if (status === 'partial') {
      // Check if we have any inventory available for partial delivery
      const currentDelivered = itemDeliveredQuantity[selectedItemForStatus] || 0;
      const totalQuantity = currentOrder?.items[selectedItemForStatus].quantity || 0;
      const remainingQuantity = totalQuantity - currentDelivered;
      
      if (remainingQuantity <= 0) {
        alertModal.showWarning(
          'Sản phẩm này đã được giao đủ số lượng',
          'Cảnh báo',
          {
            maxWidth: 'sm',
            showCloseButton: true,
            autoClose: false
          }
        );
        return;
      }

      // Check if we have any inventory available
      const inventoryCheck = checkInventoryAvailability(selectedItemForStatus, totalQuantity);
      if (!inventoryCheck.available) {
        alertModal.showWarning(
          inventoryCheck.message || 'Không đủ tồn kho',
          'Cảnh báo tồn kho',
          {
            maxWidth: 'md',
            showCloseButton: true,
            autoClose: false
          }
        );
        return;
      }

      // Show quantity input for partial delivery
      setShowQuantityInput(prev => ({
        ...prev,
        [selectedItemForStatus]: true
      }));
      setTempQuantityInput(prev => ({
        ...prev,
        [selectedItemForStatus]: '0'
      }));
    } else {
      // Direct status change for pending or delivered
      handleDeliveryStatusChange(selectedItemForStatus, status);
      handleStatusModalClose();
    }
  };

  const handleQuantityInputChange = (itemIndex: number, value: string) => {
    setTempQuantityInput(prev => ({
      ...prev,
      [itemIndex]: value
    }));
  };

  const handleQuantityInputSubmit = async (itemIndex: number) => {
    const quantity = parseInt(tempQuantityInput[itemIndex] || '0');
    const maxQuantity = currentOrder?.items[itemIndex].quantity || 0;

    if (isNaN(quantity) || quantity < 0) {
      alertModal.showError('Vui lòng nhập số lượng hợp lệ (>= 0)', 'Lỗi nhập liệu');
      return;
    }

    if (quantity > maxQuantity) {
      alertModal.showError(`Số lượng không được vượt quá ${maxQuantity}`, 'Lỗi nhập liệu');
      return;
    }

    // Check inventory availability before proceeding
    if (quantity > 0) {
      const inventoryCheck = checkInventoryAvailability(itemIndex, quantity);
      if (!inventoryCheck.available) {
        alertModal.showWarning(
          inventoryCheck.message || 'Không đủ tồn kho',
          'Cảnh báo tồn kho',
          {
            maxWidth: 'md',
            showCloseButton: true,
            autoClose: false
          }
        );
        return;
      }
    }

    // Update the quantity and status
    await handleDeliveredQuantityChange(itemIndex, quantity);
    
    // Close modal and reset states
    handleStatusModalClose();
  };

  const handleQuantityInputCancel = (itemIndex: number) => {
    setShowQuantityInput(prev => ({
      ...prev,
      [itemIndex]: false
    }));
    setTempQuantityInput(prev => ({
      ...prev,
      [itemIndex]: ''
    }));
  };

  const handleQuantitySubmit = async () => {
    if (selectedItemIndex === null || !currentOrder) return;

    const quantity = parseInt(quantityInput);
    const maxQuantity = currentOrder.items[selectedItemIndex].quantity;

    if (isNaN(quantity) || quantity < 0) {
      alertModal.showError('Vui lòng nhập số lượng hợp lệ (>= 0)', 'Lỗi nhập liệu');
      return;
    }

    if (quantity > maxQuantity) {
      alertModal.showError(`Số lượng không được vượt quá ${maxQuantity}`, 'Lỗi nhập liệu');
      return;
    }

    // Check inventory availability before proceeding
    if (quantity > 0) {
      const inventoryCheck = checkInventoryAvailability(selectedItemIndex, quantity);
      if (!inventoryCheck.available) {
        alertModal.showWarning(
          inventoryCheck.message || 'Không đủ tồn kho',
          'Cảnh báo tồn kho',
          {
            maxWidth: 'md',
            showCloseButton: true,
            autoClose: false
          }
        );
        return;
      }
    }

    // Update the quantity and status
    await handleDeliveredQuantityChange(selectedItemIndex, quantity);
    handleQuantityModalClose();
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

  const handleDeliveryStatusChange = async (itemIndex: number, newStatus: 'pending' | 'partial' | 'delivered') => {
    if (!currentOrder) return;

    // Prevent changes if order is already delivered
    if ((currentOrder.status as string) === 'delivered') {
      console.log('Không thể thay đổi trạng thái giao hàng khi đơn hàng đã giao');
      return;
    }

    // Store previous state for potential rollback
    const previousDeliveryStatus = itemDeliveryStatus[itemIndex];
    const previousDeliveredQuantity = itemDeliveredQuantity[itemIndex];

    try {
      let deliveredQuantity: number;
      
      if (newStatus === 'delivered') {
        // Khi chọn "Đã giao", set số lượng đã giao = tổng số lượng
        deliveredQuantity = currentOrder.items[itemIndex].quantity;
      } else if (newStatus === 'partial') {
        // Khi chọn "Giao một phần", giữ nguyên số lượng đã giao hiện tại
        deliveredQuantity = itemDeliveredQuantity[itemIndex] || 0;
      } else {
        // Khi chọn "Chờ giao", set số lượng đã giao = 0
        deliveredQuantity = 0;
      }

      // Kiểm tra xem có phải backend đang hiểu deliveredQuantity là số lượng giao thêm không
      // Nếu có, thì cần tính toán lại
      const currentDelivered = itemDeliveredQuantity[itemIndex] || 0;
      const totalQuantity = currentOrder.items[itemIndex].quantity;
      
      // Nếu backend hiểu deliveredQuantity là số lượng giao thêm
      // thì khi chọn "Đã giao", cần gửi số lượng còn lại cần giao
      if (newStatus === 'delivered' && currentDelivered > 0) {
        const remainingToDeliver = totalQuantity - currentDelivered;
        console.log(`Backend có thể hiểu deliveredQuantity là số lượng giao thêm. Số lượng còn lại cần giao: ${remainingToDeliver}`);
        // Thử gửi số lượng còn lại thay vì tổng số lượng
        deliveredQuantity = remainingToDeliver;
      }

      // Check inventory availability before proceeding
      if (newStatus === 'delivered' || newStatus === 'partial') {
        const inventoryCheck = checkInventoryAvailability(itemIndex, deliveredQuantity);
        if (!inventoryCheck.available) {
          alertModal.showWarning(
            inventoryCheck.message || 'Không đủ tồn kho',
            'Cảnh báo tồn kho',
            {
              maxWidth: 'md',
              showCloseButton: true,
              autoClose: false
            }
          );
          return;
        }
      }

      // Debug log để kiểm tra
      console.log(`Item ${itemIndex}:`, {
        currentDelivered: itemDeliveredQuantity[itemIndex] || 0,
        totalQuantity: currentOrder.items[itemIndex].quantity,
        newStatus,
        deliveredQuantity,
        remainingToDeliver: currentOrder.items[itemIndex].quantity - (itemDeliveredQuantity[itemIndex] || 0)
      });

      // Update local state first
      const newDeliveryStatuses = {
        ...itemDeliveryStatus,
        [itemIndex]: newStatus
      };
      
      const newDeliveredQuantities = {
        ...itemDeliveredQuantity,
        [itemIndex]: deliveredQuantity
      };

      setItemDeliveryStatus(newDeliveryStatuses);
      setItemDeliveredQuantity(newDeliveredQuantities);

      // Calculate new overall invoice status
      const newInvoiceStatus = calculateInvoiceStatus(currentOrder.items, newDeliveryStatuses);
      
      // Update item delivery
      await dispatch(updateItemDelivery({
        id: currentOrder._id,
        itemIndex,
        data: { 
          deliveredQuantity,
          notes: `Cập nhật trạng thái giao hàng: ${getDeliveryStatusText(newStatus)}`
        }
      })).unwrap();

      // Update overall invoice status if it has changed and invoice is not completed/cancelled
      if (newInvoiceStatus !== currentOrder.status && 
          (currentOrder.status as string) !== 'delivered' && 
          (currentOrder.status as string) !== 'cancelled') {
        try {
          await dispatch(updateInvoiceStatus({
            id: currentOrder._id,
            data: { status: newInvoiceStatus }
          })).unwrap();
          console.log(`Đã cập nhật trạng thái hóa đơn thành: ${getStatusText(newInvoiceStatus)}`);
        } catch (statusError) {
          console.warn('Không thể cập nhật trạng thái hóa đơn:', statusError);
          // Continue execution even if status update fails
        }
      }

      // Refresh the invoice data to get updated delivery status from database
      try {
        await dispatch(fetchInvoiceById(currentOrder._id)).unwrap();
        // Also refresh delivered amount
        await dispatch(fetchDeliveredAmount(currentOrder._id)).unwrap();
      } catch (refreshError) {
        console.warn('Không thể refresh dữ liệu hóa đơn:', refreshError);
        // Continue execution even if refresh fails
      }

      console.log(`Đã cập nhật trạng thái giao hàng item ${itemIndex} thành: ${getDeliveryStatusText(newStatus)}`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái giao hàng:', error);
      // Revert local state changes on error
      setItemDeliveryStatus(prev => ({
        ...prev,
        [itemIndex]: previousDeliveryStatus // Revert to previous status
      }));
      setItemDeliveredQuantity(prev => ({
        ...prev,
        [itemIndex]: previousDeliveredQuantity // Revert to previous quantity
      }));
    }
  };

  const handleDeliveredQuantityChange = async (itemIndex: number, quantity: number) => {
    // Prevent changes if order is already delivered
    if (currentOrder && (currentOrder.status as string) === 'delivered') {
      return;
    }

    // Store previous state for potential rollback
    const previousDeliveredQuantity = itemDeliveredQuantity[itemIndex];

    try {
      // Validate quantity
      const maxQuantity = currentOrder.items[itemIndex].quantity;
      if (quantity < 0 || quantity > maxQuantity) {
        console.error(`Số lượng phải từ 0 đến ${maxQuantity}`);
        return;
      }

      // Check inventory availability before proceeding
      if (quantity > 0) {
        const inventoryCheck = checkInventoryAvailability(itemIndex, quantity);
        if (!inventoryCheck.available) {
          alertModal.showWarning(
            inventoryCheck.message || 'Không đủ tồn kho',
            'Cảnh báo tồn kho',
            {
              maxWidth: 'md',
              showCloseButton: true,
              autoClose: false
            }
          );
          return;
        }
      }

      // Update local state first
      setItemDeliveredQuantity(prev => ({
        ...prev,
        [itemIndex]: quantity
      }));

      // Determine new delivery status based on quantity
      let newDeliveryStatus: 'pending' | 'partial' | 'delivered' = 'pending';
      if (quantity === 0) {
        newDeliveryStatus = 'pending';
      } else if (quantity >= maxQuantity) {
        newDeliveryStatus = 'delivered';
      } else {
        newDeliveryStatus = 'partial';
      }

      // Always update delivery status based on quantity
      setItemDeliveryStatus(prev => ({
        ...prev,
        [itemIndex]: newDeliveryStatus
      }));

      // Update item delivery in backend
      await dispatch(updateItemDelivery({
        id: currentOrder._id,
        itemIndex,
        data: { 
          deliveredQuantity: quantity,
          notes: `Cập nhật số lượng đã giao: ${quantity}/${currentOrder.items[itemIndex].quantity}`
        }
      })).unwrap();

      // Calculate new overall invoice status
      const newDeliveryStatuses = {
        ...itemDeliveryStatus,
        [itemIndex]: newDeliveryStatus
      };
      const newInvoiceStatus = calculateInvoiceStatus(currentOrder.items, newDeliveryStatuses);
      
      // Update overall invoice status if it has changed
      if (newInvoiceStatus !== currentOrder.status && 
          (currentOrder.status as string) !== 'delivered' && 
          (currentOrder.status as string) !== 'cancelled') {
        try {
          await dispatch(updateInvoiceStatus({
            id: currentOrder._id,
            data: { status: newInvoiceStatus }
          })).unwrap();
          console.log(`Đã cập nhật trạng thái hóa đơn thành: ${getStatusText(newInvoiceStatus)}`);
        } catch (statusError) {
          console.warn('Không thể cập nhật trạng thái hóa đơn:', statusError);
        }
      }

      // Refresh the invoice data
      try {
        await dispatch(fetchInvoiceById(currentOrder._id)).unwrap();
        // Also refresh delivered amount
        await dispatch(fetchDeliveredAmount(currentOrder._id)).unwrap();
      } catch (refreshError) {
        console.warn('Không thể refresh dữ liệu hóa đơn:', refreshError);
      }

    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng đã giao:', error);
      // Revert local state changes on error
      setItemDeliveredQuantity(prev => ({
        ...prev,
        [itemIndex]: previousDeliveredQuantity
      }));
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
          <Tooltip title="Thao tác trạng thái">
            <IconButton
              size="small"
              onClick={() => handleStatusIconClick(index)}
              disabled={(currentOrder.status as string) === 'delivered'}
              sx={{ 
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <EditIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          </Tooltip>
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
        width: { xs: "98%", sm: "95%", md: "85%", lg: "75%" },
        maxWidth: "1200px",
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
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr 1fr" },
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
            <Typography variant="body2" color="primary.main" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, textAlign: { xs: "left", sm: "right" } }}>
              {currentOrder.totalAmount?.toLocaleString() + ' VNĐ' || '0'}
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
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Đang tải chi tiết vật liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tableRows.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
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
                bgcolor: "#2196f3", 
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                minWidth: { xs: 80, sm: 120 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": { bgcolor: "#1976d2" }
              }}
              onClick={() => handleStatusChange('confirmed')}
              disabled={currentOrder.status === 'confirmed' || currentOrder.status === 'cancelled' || currentOrder.status === 'delivered'}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Đã giao một phần</Box>
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
              onClick={() => handleStatusChange('delivered')}
              disabled={currentOrder.status === 'delivered' || currentOrder.status === 'cancelled'}
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
              disabled={currentOrder.status === 'cancelled' || currentOrder.status === 'delivered'}
            >
              <Box sx={{ display: { xs: "none", sm: "inline" } }}>Hủy đơn</Box>
              <Box sx={{ display: { xs: "inline", sm: "none" } }}>Hủy</Box>
            </Button>
          </Paper>
        </Box>
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

      {/* Status Selection Modal */}
      <Dialog
        open={statusModalOpen}
        onClose={handleStatusModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chọn trạng thái giao hàng
        </DialogTitle>
        <DialogContent>
          {selectedItemForStatus !== null && currentOrder && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vật liệu: {materialDetails[currentOrder.items[selectedItemForStatus].materialId]?.name || currentOrder.items[selectedItemForStatus].materialName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tổng số lượng: {currentOrder.items[selectedItemForStatus].quantity} {currentOrder.items[selectedItemForStatus].unit}
              </Typography>
              
              {/* Quantity Input for Partial Delivery */}
              {showQuantityInput[selectedItemForStatus] && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Nhập số lượng đã giao:
                  </Typography>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Số lượng đã giao"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={tempQuantityInput[selectedItemForStatus] || ''}
                    onChange={(e) => handleQuantityInputChange(selectedItemForStatus, e.target.value)}
                    inputProps={{
                      min: 0,
                      max: currentOrder.items[selectedItemForStatus].quantity
                    }}
                    helperText={`Nhập số lượng từ 0 đến ${currentOrder.items[selectedItemForStatus].quantity}`}
                  />
                </Box>
              )}
              
              {/* Status Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />}
                  onClick={() => handleStatusSelect('partial')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Giao một phần
                </Button>
                
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircle sx={{ fontSize: '1.2rem' }} />}
                  onClick={() => handleStatusSelect('delivered')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  Đã giao
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusModalClose} color="secondary">
            Hủy
          </Button>
          {showQuantityInput[selectedItemForStatus || 0] && (
            <>
              <Button 
                onClick={() => handleQuantityInputCancel(selectedItemForStatus || 0)} 
                color="secondary"
              >
                Hủy nhập
              </Button>
              <Button 
                onClick={() => handleQuantityInputSubmit(selectedItemForStatus || 0)} 
                variant="contained" 
                color="primary"
              >
                Xác nhận
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Quantity Input Modal */}
      <Dialog
        open={quantityModalOpen}
        onClose={handleQuantityModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Nhập số lượng đã giao
        </DialogTitle>
        <DialogContent>
          {selectedItemIndex !== null && currentOrder && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Vật liệu: {materialDetails[currentOrder.items[selectedItemIndex].materialId]?.name || currentOrder.items[selectedItemIndex].materialName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tổng số lượng: {currentOrder.items[selectedItemIndex].quantity} {currentOrder.items[selectedItemIndex].unit}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Số lượng đã giao"
                type="number"
                fullWidth
                variant="outlined"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                inputProps={{
                  min: 0,
                  max: currentOrder.items[selectedItemIndex].quantity
                }}
                helperText={`Nhập số lượng từ 0 đến ${currentOrder.items[selectedItemIndex].quantity}`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQuantityModalClose} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleQuantitySubmit} variant="contained" color="primary">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

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


