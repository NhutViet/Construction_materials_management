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
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { createInvoice, clearError } from '../../../store/slices/invoiceSlice';
import { fetchMaterials } from '../../../store/slices/materialSlice';
import { CreateInvoiceDto, InvoiceItem } from '../../../store/slices/invoiceSlice';

interface CreateInvoiceFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
  paymentMethod: 'cash' | 'online' | 'debt';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
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

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.invoice);
  const { materials } = useSelector((state: RootState) => state.materials);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    taxRate: 10,
    discountRate: 0,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    notes: '',
    deliveryDate: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Fetch materials on component mount
  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

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

    if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = 'Thuế phải từ 0-100%';
    }

    if (formData.discountRate < 0 || formData.discountRate > 100) {
      newErrors.discountRate = 'Giảm giá phải từ 0-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const addItemToInvoice = () => {
    if (!selectedMaterial || itemQuantity <= 0) return;

    // Check if material already exists in invoice
    const existingItemIndex = formData.items.findIndex(
      item => item.materialId === selectedMaterial._id
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      updatedItems[existingItemIndex].totalPrice = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      // Add new item
      const newItem: InvoiceItem = {
        materialId: selectedMaterial._id,
        materialName: selectedMaterial.name,
        quantity: itemQuantity,
        unitPrice: selectedMaterial.price,
        totalPrice: selectedMaterial.price * itemQuantity,
        unit: selectedMaterial.unit
      };

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    // Reset selection
    setSelectedMaterial(null);
    setItemQuantity(1);
  };

  const removeItemFromInvoice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice = newQuantity * updatedItems[index].unitPrice;

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const discountAmount = (subtotal * formData.discountRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return { subtotal, taxAmount, discountAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { subtotal, taxAmount, discountAmount, totalAmount } = calculateTotals();

      const invoiceData: CreateInvoiceDto = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: formData.items.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity
        })),
        taxRate: formData.taxRate,
        discountRate: formData.discountRate,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
        deliveryDate: formData.deliveryDate || undefined
      };

      await dispatch(createInvoice(invoiceData)).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const { subtotal, taxAmount, discountAmount, totalAmount } = calculateTotals();

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tạo Hoá Đơn Mới
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Thông Tin Khách Hàng
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Tên Khách Hàng *"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            error={!!errors.customerName}
            helperText={errors.customerName}
            placeholder="Nhập tên khách hàng"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Số Điện Thoại *"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            error={!!errors.customerPhone}
            helperText={errors.customerPhone}
            placeholder="Nhập số điện thoại"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Địa Chỉ *"
            value={formData.customerAddress}
            onChange={(e) => handleInputChange('customerAddress', e.target.value)}
            error={!!errors.customerAddress}
            helperText={errors.customerAddress}
            placeholder="Nhập địa chỉ giao hàng"
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
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.price.toLocaleString('vi-VN')}đ/{option.unit} - Còn: {option.quantity}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Số Lượng"
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
            onClick={addItemToInvoice}
            disabled={!selectedMaterial || itemQuantity <= 0}
            sx={{ height: '56px' }}
          >
            Thêm Vào Hoá Đơn
          </Button>
        </Grid>

        {/* Items Table */}
        {formData.items.length > 0 && (
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản Phẩm</TableCell>
                    <TableCell align="center">Đơn Vị</TableCell>
                    <TableCell align="center">Số Lượng</TableCell>
                    <TableCell align="right">Đơn Giá</TableCell>
                    <TableCell align="right">Thành Tiền</TableCell>
                    <TableCell align="center">Thao Tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.materialName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.unit}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          size="small"
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {item.unitPrice.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {item.totalPrice.toLocaleString('vi-VN')}đ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeItemFromInvoice(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        {/* Invoice Settings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
            Cài Đặt Hoá Đơn
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Thuế (%)"
            type="number"
            value={formData.taxRate}
            onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
            error={!!errors.taxRate}
            helperText={errors.taxRate}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Giảm Giá (%)"
            type="number"
            value={formData.discountRate}
            onChange={(e) => handleInputChange('discountRate', parseFloat(e.target.value) || 0)}
            error={!!errors.discountRate}
            helperText={errors.discountRate}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Phương Thức Thanh Toán</InputLabel>
            <Select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              label="Phương Thức Thanh Toán"
            >
              <MenuItem value="cash">Tiền mặt</MenuItem>
              <MenuItem value="online">Chuyển khoản</MenuItem>
              <MenuItem value="debt">Nợ</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Trạng Thái Thanh Toán</InputLabel>
            <Select
              value={formData.paymentStatus}
              onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
              label="Trạng Thái Thanh Toán"
            >
              <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
              <MenuItem value="partial">Thanh toán một phần</MenuItem>
              <MenuItem value="paid">Đã thanh toán</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ghi Chú"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Ghi chú về hoá đơn (tùy chọn)"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ngày Giao Hàng"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Summary */}
        {formData.items.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Tóm Tắt Hoá Đơn
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tổng tiền hàng:</Typography>
                    <Typography>{subtotal.toLocaleString('vi-VN')}đ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Thuế ({formData.taxRate}%):</Typography>
                    <Typography>{taxAmount.toLocaleString('vi-VN')}đ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Giảm giá ({formData.discountRate}%):</Typography>
                    <Typography color="error.main">-{discountAmount.toLocaleString('vi-VN')}đ</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Tổng cộng:</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {totalAmount.toLocaleString('vi-VN')}đ
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                    <Chip 
                      label={`${formData.items.length} sản phẩm`}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Chip 
                      label={`Phương thức: ${formData.paymentMethod === 'cash' ? 'Tiền mặt' : 
                             formData.paymentMethod === 'online' ? 'Chuyển khoản' : 'Nợ'}`}
                      color="secondary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Chip 
                      label={`Trạng thái: ${formData.paymentStatus === 'unpaid' ? 'Chưa thanh toán' : 
                             formData.paymentStatus === 'partial' ? 'Thanh toán một phần' : 'Đã thanh toán'}`}
                      color={formData.paymentStatus === 'paid' ? 'success' : 
                             formData.paymentStatus === 'partial' ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || formData.items.length === 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
          sx={{ bgcolor: '#504099' }}
        >
          {isLoading ? 'Đang tạo...' : 'Tạo Hoá Đơn'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateInvoiceForm;
