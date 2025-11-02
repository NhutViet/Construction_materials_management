import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateInvoice, clearError, updateItemDelivery, fetchInvoiceById } from '../../../store/slices/invoiceSlice';
import { fetchMaterials } from '../../../store/slices/materialSlice';
import { UpdateInvoiceDto, InvoiceItem, Invoice } from '../../../store/slices/invoiceSlice';
import { checkLowStockAndNotify, sendInvoiceUpdateNotification } from '../../../utils/notificationUtils';

interface EditInvoiceModalProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    materialId: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    deliveredQuantity?: number;
    deliveryStatus?: 'pending' | 'partial' | 'delivered';
  }[];
  discountRate: number;
  paymentMethod: 'cash' | 'online' | 'debt';
  notes: string;
  deliveryDate: string;
}

interface Material {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ 
  invoice, 
  open, 
  onClose, 
  onSuccess 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.invoice);
  const { materials } = useSelector((state: RootState) => state.materials);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    discountRate: 0,
    paymentMethod: 'cash',
    notes: '',
    deliveryDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Initialize form data when invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        customerName: invoice.customerName || '',
        customerPhone: invoice.customerPhone || '',
        customerAddress: invoice.customerAddress || '',
        items: invoice.items.map(item => ({
          materialId: item.materialId,
          materialName: item.materialName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          unit: item.unit,
          deliveredQuantity: item.deliveredQuantity || 0,
          deliveryStatus: item.deliveryStatus || 'pending'
        })),
        discountRate: Number(invoice.discountRate) || 0,
        paymentMethod: invoice.paymentMethod || 'cash',
        notes: invoice.notes || '',
        deliveryDate: invoice.deliveryDate ? invoice.deliveryDate.split('T')[0] : ''
      });
    }
  }, [invoice]);

  // Fetch materials on component mount
  useEffect(() => {
    if (open) {
      dispatch(fetchMaterials());
    }
  }, [dispatch, open]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  // Real-time inventory validation when form data changes
  useEffect(() => {
    if (formData.items.length > 0) {
      // Check inventory for all items
      for (const item of formData.items) {
        const material = materials.find(m => m._id === item.materialId);
        if (material) {
          // Need to consider the original invoice quantity that's already "reserved"
          const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === item.materialId)?.quantity || 0;
          const availableQuantity = material.quantity + originalInvoiceQuantity;
          
          if (item.quantity > availableQuantity) {
            setErrors(prev => ({
              ...prev,
              items: `Không đủ tồn kho cho "${item.materialName}". Tồn kho khả dụng: ${availableQuantity}, yêu cầu: ${item.quantity}`
            }));
            return;
          }
        }
      }
      
      // Clear inventory error if all items are valid
      if (errors.items && errors.items.includes('Không đủ tồn kho')) {
        setErrors(prev => ({
          ...prev,
          items: undefined
        }));
      }
    }
  }, [formData.items, materials, errors.items, invoice]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Tên khách hàng là bắt buộc';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Số điện thoại là bắt buộc';
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Địa chỉ là bắt buộc';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Phải có ít nhất một sản phẩm';
    }

    // Kiểm tra tồn kho cho tất cả items trong hóa đơn
    for (const item of formData.items) {
      const material = materials.find(m => m._id === item.materialId);
      if (material) {
        // Need to consider the original invoice quantity that's already "reserved"
        const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === item.materialId)?.quantity || 0;
        const availableQuantity = material.quantity + originalInvoiceQuantity;
        
        if (item.quantity > availableQuantity) {
          newErrors.items = `Không đủ tồn kho cho "${item.materialName}". Tồn kho khả dụng: ${availableQuantity}, yêu cầu: ${item.quantity}`;
          break;
        }
      }
    }

    if (formData.discountRate < 0 || formData.discountRate > 100) {
      newErrors.discountRate = 'Giảm giá phải từ 0-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addItemToInvoice = () => {
    if (!selectedMaterial || itemQuantity <= 0) return;

    const existingItemIndex = formData.items.findIndex(
      item => item.materialId === selectedMaterial._id
    );

    // Calculate total quantity that will be in the invoice after adding
    let totalQuantityInInvoice = itemQuantity;
    if (existingItemIndex >= 0) {
      totalQuantityInInvoice += formData.items[existingItemIndex].quantity;
    }

    // Check inventory availability - need to consider the original invoice quantity
    // The original invoice items are already "reserved" from inventory
    const originalInvoiceQuantity = invoice?.items.find(item => item.materialId === selectedMaterial._id)?.quantity || 0;
    const availableQuantity = selectedMaterial.quantity + originalInvoiceQuantity;
    
    if (totalQuantityInInvoice > availableQuantity) {
      const errorMessage = `Không đủ tồn kho cho "${selectedMaterial.name}". Tồn kho khả dụng: ${availableQuantity}, yêu cầu: ${totalQuantityInInvoice}`;
      setErrors(prev => ({
        ...prev,
        items: errorMessage
      }));
      return;
    }

    const newItem = {
      materialId: selectedMaterial._id,
      materialName: selectedMaterial.name,
      quantity: itemQuantity,
      unitPrice: selectedMaterial.price,
      totalPrice: selectedMaterial.price * itemQuantity,
      unit: selectedMaterial.unit,
      deliveredQuantity: 0,
      deliveryStatus: 'pending' as const
    };

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      updatedItems[existingItemIndex].totalPrice = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      // Preserve deliveredQuantity when adding quantity to existing item
      // deliveredQuantity remains the same, only quantity increases
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }

    // Clear any previous inventory errors
    if (errors.items) {
      setErrors(prev => ({
        ...prev,
        items: undefined
      }));
    }

    // Reset selection
    setSelectedMaterial(null);
    setItemQuantity(1);
  };

  const removeItemFromInvoice = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedItems = [...formData.items];
    const item = updatedItems[index];
    
    // Find the material to check available stock
    const material = materials.find(m => m._id === item.materialId);
    if (material) {
      // Check if new quantity exceeds available stock
      // Need to consider the original invoice quantity that's already "reserved"
      const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === item.materialId)?.quantity || 0;
      const availableQuantity = material.quantity + originalInvoiceQuantity;
      
      if (newQuantity > availableQuantity) {
        const errorMessage = `Không đủ tồn kho cho "${material.name}". Tồn kho khả dụng: ${availableQuantity}, yêu cầu: ${newQuantity}`;
        setErrors(prev => ({
          ...prev,
          items: errorMessage
        }));
        return;
      }
    }

    // If new quantity is less than current deliveredQuantity, adjust deliveredQuantity
    const currentDeliveredQuantity = item.deliveredQuantity || 0;
    if (newQuantity < currentDeliveredQuantity) {
      // Adjust deliveredQuantity to match new quantity (can't deliver more than ordered)
      updatedItems[index].deliveredQuantity = newQuantity;
      // Update delivery status: if new quantity equals adjusted deliveredQuantity, it's fully delivered
      if (newQuantity === 0) {
        updatedItems[index].deliveryStatus = 'pending';
      } else {
        // Since deliveredQuantity is now equal to quantity, status is delivered
        updatedItems[index].deliveryStatus = 'delivered';
      }
    }

    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice = updatedItems[index].unitPrice * newQuantity;
    setFormData(prev => ({ ...prev, items: updatedItems }));

    // Clear any previous inventory errors
    if (errors.items) {
      setErrors(prev => ({
        ...prev,
        items: undefined
      }));
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * formData.discountRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form trước khi submit
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    if (!invoice) return;

    try {
      // Store deliveredQuantity mapping before update to restore it later
      // Map by materialId to match items after update
      const deliveredQuantityMap = new Map<string, number>();
      formData.items.forEach((item, index) => {
        if (item.deliveredQuantity && item.deliveredQuantity > 0) {
          deliveredQuantityMap.set(item.materialId, item.deliveredQuantity);
        }
      });

      const updateData: UpdateInvoiceDto = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: formData.items.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity
        })),
        discountRate: formData.discountRate,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        deliveryDate: formData.deliveryDate
      };

      const updatedInvoice = await dispatch(updateInvoice({
        id: invoice._id,
        data: updateData
      })).unwrap();

      // Restore deliveredQuantity for items that had it before update
      // Match items by materialId since indices might have changed
      if (deliveredQuantityMap.size > 0) {
        const restorePromises: Promise<any>[] = [];
        
        updatedInvoice.items.forEach((updatedItem: InvoiceItem, itemIndex: number) => {
          const preservedDeliveredQuantity = deliveredQuantityMap.get(updatedItem.materialId);
          
          if (preservedDeliveredQuantity !== undefined) {
            // Ensure deliveredQuantity doesn't exceed new quantity
            const finalDeliveredQuantity = Math.min(
              preservedDeliveredQuantity, 
              updatedItem.quantity
            );
            
            if (finalDeliveredQuantity > 0) {
              restorePromises.push(
                dispatch(updateItemDelivery({
                  id: invoice._id,
                  itemIndex,
                  data: {
                    deliveredQuantity: finalDeliveredQuantity,
                    notes: `Khôi phục số lượng đã giao sau khi cập nhật hóa đơn: ${finalDeliveredQuantity}/${updatedItem.quantity}`
                  }
                })).unwrap()
              );
            }
          }
        });

        // Wait for all delivery quantities to be restored
        if (restorePromises.length > 0) {
          try {
            await Promise.all(restorePromises);
            console.log('Đã khôi phục số lượng đã giao cho các items');
            // Refresh invoice to get updated data with restored deliveredQuantity
            await dispatch(fetchInvoiceById(invoice._id)).unwrap();
          } catch (restoreError) {
            console.warn('Một số số lượng đã giao không thể khôi phục:', restoreError);
          }
        }
      } else {
        // If no deliveredQuantity to restore, still refresh invoice to get latest data
        await dispatch(fetchInvoiceById(invoice._id)).unwrap();
      }

      // Fetch updated materials after invoice update (inventory was updated)
      await dispatch(fetchMaterials());
      
      // Send invoice update notification
      await sendInvoiceUpdateNotification(dispatch, updatedInvoice);
      
      // Check for low stock and send notifications with updated materials
      const updatedMaterials = await dispatch(fetchMaterials()).unwrap();
      console.log('Checking low stock with updated materials:', updatedMaterials.length, 'materials');
      await checkLowStockAndNotify(dispatch, updatedInvoice, updatedMaterials);

      console.log('Hóa đơn đã được cập nhật thành công');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật hóa đơn:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      discountRate: 0,
      paymentMethod: 'cash',
      notes: '',
      deliveryDate: ''
    });
    setErrors({});
    setSelectedMaterial(null);
    setItemQuantity(1);
    onClose();
  };

  if (!invoice) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Chỉnh sửa hóa đơn #{invoice.invoiceNumber}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Thông tin khách hàng
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tên khách hàng *"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                error={!!errors.customerName}
                helperText={errors.customerName}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Số điện thoại *"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                error={!!errors.customerPhone}
                helperText={errors.customerPhone}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Địa chỉ *"
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                error={!!errors.customerAddress}
                helperText={errors.customerAddress}
                required
              />
            </Grid>

            {/* Add Items Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                Thêm Sản Phẩm
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <Autocomplete
                options={materials}
                getOptionLabel={(option) => `${option.name} - ${option.price.toLocaleString('vi-VN')}đ/${option.unit}`}
                value={selectedMaterial}
                onChange={(_, newValue) => setSelectedMaterial(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn Sản Phẩm"
                    placeholder="Tìm kiếm sản phẩm..."
                    error={!!errors.items}
                    helperText={errors.items}
                  />
                )}
                renderOption={(props, option) => {
                  const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === option._id)?.quantity || 0;
                  const availableQuantity = option.quantity + originalInvoiceQuantity;
                  const isLowStock = availableQuantity <= 10;
                  const isOutOfStock = availableQuantity === 0;
                  
                  return (
                    <Box component="li" {...props}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">{option.name}</Typography>
                          <Chip
                            label={isOutOfStock ? 'Hết hàng' : isLowStock ? 'Sắp hết' : 'Còn hàng'}
                            color={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {option.price.toLocaleString('vi-VN')}đ/{option.unit} - Khả dụng: {availableQuantity}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                getOptionDisabled={(option) => {
                  const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === option._id)?.quantity || 0;
                  const availableQuantity = option.quantity + originalInvoiceQuantity;
                  return availableQuantity === 0;
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Số Lượng"
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                inputProps={{ 
                  min: 1, 
                  max: selectedMaterial ? (() => {
                    const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === selectedMaterial._id)?.quantity || 0;
                    return selectedMaterial.quantity + originalInvoiceQuantity;
                  })() : undefined 
                }}
                helperText={selectedMaterial ? (() => {
                  const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === selectedMaterial._id)?.quantity || 0;
                  const availableQuantity = selectedMaterial.quantity + originalInvoiceQuantity;
                  return `Tối đa: ${availableQuantity}`;
                })() : ''}
                error={selectedMaterial && (() => {
                  const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === selectedMaterial._id)?.quantity || 0;
                  const availableQuantity = selectedMaterial.quantity + originalInvoiceQuantity;
                  return itemQuantity > availableQuantity;
                })()}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addItemToInvoice}
                disabled={!selectedMaterial || itemQuantity <= 0 || (selectedMaterial && (() => {
                  const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === selectedMaterial._id)?.quantity || 0;
                  const availableQuantity = selectedMaterial.quantity + originalInvoiceQuantity;
                  return itemQuantity > availableQuantity;
                })())}
                sx={{ height: '56px' }}
              >
                Thêm Vào Hoá Đơn
              </Button>
            </Grid>

            {/* Items Table */}
            {formData.items.length > 0 && (
              <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên sản phẩm</TableCell>
                        <TableCell align="center">Số lượng</TableCell>
                        <TableCell align="center">Đơn giá</TableCell>
                        <TableCell align="center">Thành tiền</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => {
                        const material = materials.find(m => m._id === item.materialId);
                        const originalInvoiceQuantity = invoice?.items.find(origItem => origItem.materialId === item.materialId)?.quantity || 0;
                        const availableQuantity = material ? material.quantity + originalInvoiceQuantity : 0;
                        const isLowStock = availableQuantity <= 10;
                        const isOutOfStock = availableQuantity === 0;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.materialName}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip 
                                    label={item.unit} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                  {material && (
                                    <Chip
                                      label={`Tồn kho khả dụng: ${availableQuantity}`}
                                      color={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                inputProps={{ 
                                  min: 1, 
                                  max: availableQuantity,
                                  style: { textAlign: 'center' } 
                                }}
                                size="small"
                                sx={{ width: 80 }}
                                error={item.quantity > availableQuantity}
                                helperText={item.quantity > availableQuantity ? 'Vượt quá tồn kho khả dụng' : ''}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {item.unitPrice.toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell align="center">
                              {item.totalPrice.toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() => removeItemFromInvoice(index)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {/* Calculation Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                Tính toán
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giảm giá (%)"
                type="number"
                value={formData.discountRate}
                onChange={(e) => handleInputChange('discountRate', parseFloat(e.target.value) || 0)}
                error={!!errors.discountRate}
                helperText={errors.discountRate}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  label="Phương thức thanh toán"
                >
                  <MenuItem value="cash">Tiền mặt</MenuItem>
                  <MenuItem value="online">Chuyển khoản</MenuItem>
                  <MenuItem value="debt">Công nợ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày giao hàng"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Nhập ghi chú cho hóa đơn..."
              />
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Tóm tắt hóa đơn
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography>{calculateSubtotal().toLocaleString('vi-VN')}đ</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Giảm giá ({formData.discountRate}%):</Typography>
                  <Typography>-{calculateDiscountAmount().toLocaleString('vi-VN')}đ</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h6" color="primary">
                    {calculateTotal().toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || formData.items.length === 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
        >
          {isLoading ? 'Đang cập nhật...' : 'Cập nhật hóa đơn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInvoiceModal;
