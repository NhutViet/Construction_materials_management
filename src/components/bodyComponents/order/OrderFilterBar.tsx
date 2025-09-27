import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateFilters, clearFilters } from '../../../store/slices/invoiceSlice';

const OrderFilterBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.invoice.filters);
  const invoices = useSelector((state: RootState) => state.invoice.invoices);

  // Local state for text inputs with debouncing
  const [localFilters, setLocalFilters] = useState({
    invoiceNumber: filters.invoiceNumber || '',
    customerName: filters.customerName || ''
  });

  // State for filter visibility
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Get unique values from invoices for filter options
  const statuses = [...new Set(invoices.map(inv => inv.status).filter(Boolean))];
  const paymentStatuses = [...new Set(invoices.map(inv => inv.paymentStatus).filter(Boolean))];
  const paymentMethods = [...new Set(invoices.map(inv => inv.paymentMethod).filter(Boolean))];

  // Debounced effect for text inputs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localFilters.invoiceNumber !== filters.invoiceNumber || 
          localFilters.customerName !== filters.customerName) {
        dispatch(updateFilters({ 
          ...localFilters
        }));
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [localFilters, dispatch, filters.invoiceNumber, filters.customerName]);

  // Update local state when filters change from outside (like clear filters)
  useEffect(() => {
    setLocalFilters({
      invoiceNumber: filters.invoiceNumber || '',
      customerName: filters.customerName || ''
    });
  }, [filters.invoiceNumber, filters.customerName]);

  const handleTextFilterChange = (field: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (field: string, value: any) => {
    dispatch(updateFilters({ [field]: value })); // No need to reset page for client-side filtering
  };

  const handleClearFilters = () => {
    setLocalFilters({ invoiceNumber: '', customerName: '' });
    dispatch(clearFilters());
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const hasActiveFilters = filters.status || filters.paymentStatus || filters.paymentMethod || 
                          filters.customerName || filters.invoiceNumber || filters.startDate || filters.endDate;

  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            Bộ Lọc Hóa Đơn
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="Có bộ lọc"
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <IconButton
          onClick={toggleFilterExpansion}
          color="primary"
          sx={{ 
            transition: 'transform 0.2s ease-in-out',
            transform: isFilterExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          {isFilterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {isFilterExpanded && (
        <>
          <Grid container spacing={2} alignItems="center">
            {/* Search by Invoice Number */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Số hóa đơn"
                value={localFilters.invoiceNumber}
                onChange={(e) => handleTextFilterChange('invoiceNumber', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                placeholder="Nhập số hóa đơn..."
                size="small"
              />
            </Grid>

            {/* Search by Customer Name */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Tên khách hàng"
                value={localFilters.customerName}
                onChange={(e) => handleTextFilterChange('customerName', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                placeholder="Nhập tên khách hàng..."
                size="small"
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="pending">Chờ xử lý</MenuItem>
                  <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                  <MenuItem value="delivered">Đã giao</MenuItem>
                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Payment Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Thanh toán</InputLabel>
                <Select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  label="Thanh toán"
                >
                  <MenuItem value="">Tất cả thanh toán</MenuItem>
                  <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                  <MenuItem value="partial">Thanh toán một phần</MenuItem>
                  <MenuItem value="paid">Đã thanh toán</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Payment Method Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Phương thức</InputLabel>
                <Select
                  value={filters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  label="Phương thức"
                >
                  <MenuItem value="">Tất cả phương thức</MenuItem>
                  <MenuItem value="cash">Tiền mặt</MenuItem>
                  <MenuItem value="online">Chuyển khoản</MenuItem>
                  <MenuItem value="debt">Công nợ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Date Range Filters */}
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{ height: '40px' }}
              >
                Xóa tất cả bộ lọc
              </Button>
            </Grid>
          </Grid>
        </>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Bộ lọc đang áp dụng:
          </Typography>
          
          {filters.invoiceNumber && (
            <Chip
              label={`Số HĐ: "${filters.invoiceNumber}"`}
              onDelete={() => {
                handleTextFilterChange('invoiceNumber', '');
                handleFilterChange('invoiceNumber', '');
              }}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.customerName && (
            <Chip
              label={`Khách hàng: "${filters.customerName}"`}
              onDelete={() => {
                handleTextFilterChange('customerName', '');
                handleFilterChange('customerName', '');
              }}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.status && (
            <Chip
              label={`Trạng thái: ${filters.status === 'pending' ? 'Chờ xử lý' : 
                      filters.status === 'confirmed' ? 'Đã xác nhận' :
                      filters.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}`}
              onDelete={() => handleFilterChange('status', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.paymentStatus && (
            <Chip
              label={`Thanh toán: ${filters.paymentStatus === 'unpaid' ? 'Chưa thanh toán' : 
                      filters.paymentStatus === 'partial' ? 'Thanh toán một phần' : 'Đã thanh toán'}`}
              onDelete={() => handleFilterChange('paymentStatus', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.paymentMethod && (
            <Chip
              label={`Phương thức: ${filters.paymentMethod === 'cash' ? 'Tiền mặt' : 
                      filters.paymentMethod === 'online' ? 'Chuyển khoản' : 'Công nợ'}`}
              onDelete={() => handleFilterChange('paymentMethod', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}

          {filters.startDate && (
            <Chip
              label={`Từ: ${new Date(filters.startDate).toLocaleDateString()}`}
              onDelete={() => handleFilterChange('startDate', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}

          {filters.endDate && (
            <Chip
              label={`Đến: ${new Date(filters.endDate).toLocaleDateString()}`}
              onDelete={() => handleFilterChange('endDate', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default OrderFilterBar;
