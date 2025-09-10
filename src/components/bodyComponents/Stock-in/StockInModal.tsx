import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { 
  createStockIn, 
  updateStockIn, 
  selectStockInsLoading 
} from '../../../store/slices/stockInSlice';
import { fetchMaterials, selectMaterials } from '../../../store/slices/materialSlice';

interface StockInModalProps {
  open: boolean;
  onClose: () => void;
  stockIn?: any;
  onSuccess: () => void;
}

interface StockInItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  supplier?: string;
}

const StockInModal: React.FC<StockInModalProps> = ({ open, onClose, stockIn, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectStockInsLoading);
  const materials = useSelector(selectMaterials);
  const [formData, setFormData] = useState({
    supplier: '',
    supplierPhone: '',
    supplierAddress: '',
    notes: '',
    receivedDate: new Date().toISOString().split('T')[0],
    taxRate: 0,
    discountRate: 0,
  });
  const [items, setItems] = useState<StockInItem[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  useEffect(() => {
    if (open) {
      // Fetch materials for selection
      dispatch(fetchMaterials());

      if (stockIn) {
        // Edit mode - populate form with existing data
        setFormData({
          supplier: stockIn.supplier || '',
          supplierPhone: stockIn.supplierPhone || '',
          supplierAddress: stockIn.supplierAddress || '',
          notes: stockIn.notes || '',
          receivedDate: stockIn.receivedDate ? new Date(stockIn.receivedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          taxRate: stockIn.taxRate || 0,
          discountRate: stockIn.discountRate || 0,
        });
        setItems(stockIn.items || []);
      } else {
        // Create mode - reset form
        setFormData({
          supplier: '',
          supplierPhone: '',
          supplierAddress: '',
          notes: '',
          receivedDate: new Date().toISOString().split('T')[0],
          taxRate: 0,
          discountRate: 0,
        });
        setItems([]);
      }
      setSelectedMaterial(null);
      setItemQuantity(1);
      setErrors({});
    }
  }, [open, stockIn, dispatch]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addItemToStockIn = () => {
    if (!selectedMaterial || itemQuantity <= 0) return;

    // Check if material already exists in stock-in
    const existingItemIndex = items.findIndex(
      item => item.materialId === selectedMaterial._id
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity - this is the only way to modify quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      updatedItems[existingItemIndex].totalPrice = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      
      setItems(updatedItems);
    } else {
      // Add new item - once added, only quantity can be increased by adding more
      const newItem: StockInItem = {
        materialId: selectedMaterial._id,
        materialName: selectedMaterial.name,
        quantity: itemQuantity,
        unitPrice: selectedMaterial.price || 0,
        totalPrice: (selectedMaterial.price || 0) * itemQuantity,
        unit: selectedMaterial.unit || 'cái',
        supplier: formData.supplier
      };

      setItems(prev => [...prev, newItem]);
    }

    // Clear any previous errors
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

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Removed updateItem and updateItemQuantity functions as items cannot be edited once added

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const discountAmount = (subtotal * formData.discountRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount
    };
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Nhà cung cấp là bắt buộc';
    }

    if (items.length === 0) {
      newErrors.items = 'Phải có ít nhất một mặt hàng';
    }

    // Items validation is simplified since items cannot be edited once added
    items.forEach((item, index) => {
      if (!item.materialName.trim()) {
        newErrors[`item_${index}_materialName`] = 'Tên mặt hàng là bắt buộc';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const totals = calculateTotals();
      const stockInData = {
        ...formData,
        items: items.map(item => ({
          ...item,
          materialId: item.materialId || `temp_${Date.now()}_${Math.random()}`
        })),
        ...totals
      };

      if (stockIn) {
        // Update existing stock-in
        await dispatch(updateStockIn({ 
          id: stockIn._id, 
          data: stockInData 
        })).unwrap();
      } else {
        // Create new stock-in
        await dispatch(createStockIn(stockInData)).unwrap();
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving stock-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {stockIn ? 'Chỉnh sửa phiếu nhập kho' : 'Tạo phiếu nhập kho mới'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Supplier Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thông tin nhà cung cấp
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nhà cung cấp *"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  error={!!errors.supplier}
                  helperText={errors.supplier}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={formData.supplierPhone}
                  onChange={(e) => handleInputChange('supplierPhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={formData.supplierAddress}
                  onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ width: '100%', my: 2 }} />

          {/* Add Items Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thêm sản phẩm
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={materials || []}
                  getOptionLabel={(option) => `${option.name} - ${option.price?.toLocaleString('vi-VN') || 0}đ/${option.unit || 'cái'}`}
                  value={selectedMaterial}
                  onChange={(_, newValue) => setSelectedMaterial(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn sản phẩm"
                      placeholder="Tìm kiếm sản phẩm..."
                      error={!!errors.items}
                      helperText={typeof errors.items === 'string' ? errors.items : ''}
                    />
                  )}
                  renderOption={(props, option) => {
                    const isLowStock = option.quantity <= 10;
                    const isOutOfStock = option.quantity === 0;
                    
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
                            {option.price?.toLocaleString('vi-VN') || 0}đ/{option.unit || 'cái'} - Tồn kho: {option.quantity || 0}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Số lượng"
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addItemToStockIn}
                  disabled={!selectedMaterial || itemQuantity <= 0}
                  sx={{ height: '56px' }}
                >
                  Thêm vào danh sách
                </Button>
              </Grid>
            </Grid>

            {errors.items && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.items}
              </Alert>
            )}

            {/* Items Table */}
            {items.length > 0 && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Lưu ý:</strong> Khi đã thêm sản phẩm vào danh sách, bạn chỉ có thể xóa item đó. 
                    Để thay đổi số lượng, hãy xóa item cũ và thêm lại với số lượng mới.
                  </Typography>
                </Alert>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên mặt hàng</TableCell>
                      <TableCell align="center">Đơn vị</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="right">Đơn giá (VND)</TableCell>
                      <TableCell align="right">Thành tiền (VND)</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => {
                      const material = materials?.find(m => m._id === item.materialId);
                      const isLowStock = material && material.quantity <= 10;
                      const isOutOfStock = material && material.quantity === 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.materialName}
                              </Typography>
                              {material && (
                                <Chip
                                  label={`Tồn kho: ${material.quantity}`}
                                  color={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item.unit}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {item.unitPrice.toLocaleString('vi-VN')}đ
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {item.totalPrice.toLocaleString('vi-VN')}đ
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeItem(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </TableContainer>
              </Box>
            )}
          </Grid>

          <Divider sx={{ width: '100%', my: 2 }} />

          {/* Additional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thông tin bổ sung
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Ngày nhập hàng"
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => handleInputChange('receivedDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Thuế (%)"
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Giảm giá (%)"
                  type="number"
                  value={formData.discountRate}
                  onChange={(e) => handleInputChange('discountRate', Number(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chú"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Totals */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tổng kết
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">Tạm tính:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {totals.subtotal.toLocaleString()} VND
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">Thuế ({formData.taxRate}%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    {totals.taxAmount.toLocaleString()} VND
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">Giảm giá ({formData.discountRate}%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right" color="success.main">
                    -{totals.discountAmount.toLocaleString()} VND
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right" color="primary.main">
                    {totals.totalAmount.toLocaleString()} VND
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || items.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Đang lưu...' : (stockIn ? 'Cập nhật' : 'Tạo phiếu')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockInModal;
