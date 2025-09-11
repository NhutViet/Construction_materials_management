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
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { createMaterial, updateMaterial, clearError } from '../../../store/slices/materialSlice';

interface MaterialFormProps {
  material?: any; // Material object for editing, undefined for creating new
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  supplier: string;
  description: string;
  isActive: boolean;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ material, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.materials);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    unit: '',
    supplier: '',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Predefined categories and units
  const categories = [
    'Vật liệu xây dựng',
    'Thiết bị điện',
    'Thiết bị nước',
    'Vật liệu trang trí',
    'Công cụ',
    'An toàn lao động',
    'Vật liệu nội thất',
    'Khác'
  ];

  const units = [
    'viên', 'kg', 'm', 'm²', 'm³', 'lít', 'thùng', 'cuộn', 'tấm', 'bộ',"bao","cái"
  ];

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        category: material.category || '',
        price: material.price || 0,
        quantity: material.quantity || 0,
        unit: material.unit || 'pcs',
        supplier: material.supplier || '',
        description: material.description || '',
        isActive: material.isActive !== undefined ? material.isActive : true,
      });
    }
  }, [material]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if (!formData.category) {
      newErrors.category = 'Danh mục là bắt buộc';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Số lượng không được âm';
    }

    if (!formData.unit) {
      newErrors.unit = 'Đơn vị là bắt buộc';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Nhà cung cấp là bắt buộc';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (material) {
        // Update existing material
        await dispatch(updateMaterial({
          id: material._id,
          materialData: formData
        })).unwrap();
      } else {
        // Create new material
        await dispatch(createMaterial(formData)).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving material:', error);
      // Error will be handled by the Redux state
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {material ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Thông Tin Cơ Bản
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tên Sản Phẩm *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Nhập tên sản phẩm"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Danh Mục *</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              label="Danh Mục *"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Mô Tả"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Nhập mô tả sản phẩm (tùy chọn)"
          />
        </Grid>

        {/* Pricing and Quantity */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
            Giá Cả và Số Lượng
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Giá *"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Số Lượng *"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
            error={!!errors.quantity}
            helperText={errors.quantity}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!errors.unit}>
            <InputLabel>Đơn Vị *</InputLabel>
            <Select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              label="Đơn Vị *"
            >
              {units.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>


        {/* Supplier and Status */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
            Thông Tin Khác
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nhà Cung Cấp *"
            value={formData.supplier}
            onChange={(e) => handleInputChange('supplier', e.target.value)}
            error={!!errors.supplier}
            helperText={errors.supplier}
            placeholder="Tên nhà cung cấp"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  color="primary"
                />
              }
              label="Trạng thái hoạt động"
            />
          </Box>
        </Grid>
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
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Đang lưu...' : (material ? 'Cập Nhật' : 'Thêm Sản Phẩm')}
        </Button>
      </Box>
    </Box>
  );
};

export default MaterialForm;
