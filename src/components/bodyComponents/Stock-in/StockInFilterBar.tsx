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
  Chip,
  Paper,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { 
  updateFilters, 
  clearFilters, 
  selectStockInsFilters,
  selectAllStockIns 
} from '../../../store/slices/stockInSlice';

const StockInFilterBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector(selectStockInsFilters);
  const allStockIns = useSelector(selectAllStockIns);
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    supplier: '',
    startDate: '',
    endDate: ''
  });

  // Get unique suppliers for dropdown
  const uniqueSuppliers = Array.from(
    new Set(allStockIns.map(stockIn => stockIn.supplier).filter(Boolean))
  );

  useEffect(() => {
    // Initialize local filters with current Redux filters
    setLocalFilters({
      search: filters.search || '',
      status: filters.status || '',
      paymentStatus: filters.paymentStatus || '',
      supplier: filters.supplier || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || ''
    });
  }, [filters]);

  const handleFilterChange = (field: string, value: string) => {
    const updatedFilters = {
      ...localFilters,
      [field]: value
    };
    
    setLocalFilters(updatedFilters);
    
    // Auto-apply filters immediately - include empty strings to allow clearing
    dispatch(updateFilters(updatedFilters));
  };

  const handleApplyFilters = () => {
    const newFilters: any = {};
    
    // Only include non-empty filters
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        newFilters[key] = value;
      }
    });

    dispatch(updateFilters(newFilters));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      paymentStatus: '',
      supplier: '',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(clearedFilters);
    dispatch(clearFilters());
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => value && value.trim() !== '').length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6">
            Bộ lọc
          </Typography>
          {hasActiveFilters && (
            <Chip 
              label={`${getActiveFiltersCount()} bộ lọc`} 
              color="primary" 
              size="small" 
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            color="error"
          >
            Xóa bộ lọc
          </Button>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            color="primary"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              placeholder="Số phiếu, nhà cung cấp, ghi chú..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="pending">Chờ xử lý</MenuItem>
                <MenuItem value="approved">Đã duyệt</MenuItem>
                <MenuItem value="rejected">Đã từ chối</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Payment Status */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Thanh toán</InputLabel>
              <Select
                value={localFilters.paymentStatus}
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

          {/* Supplier */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Nhà cung cấp</InputLabel>
              <Select
                value={localFilters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
                label="Nhà cung cấp"
              >
                <MenuItem value="">Tất cả nhà cung cấp</MenuItem>
                {uniqueSuppliers.map((supplier, index) => (
                  <MenuItem key={index} value={supplier}>
                    {supplier}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Từ ngày"
              type="date"
              value={localFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Đến ngày"
              type="date"
              value={localFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Bộ lọc đang áp dụng:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {localFilters.search && (
                <Chip
                  label={`Tìm kiếm: "${localFilters.search}"`}
                  onDelete={() => handleFilterChange('search', '')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {localFilters.status && (
                <Chip
                  label={`Trạng thái: ${getStatusText(localFilters.status)}`}
                  onDelete={() => handleFilterChange('status', '')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {localFilters.paymentStatus && (
                <Chip
                  label={`Thanh toán: ${getPaymentStatusText(localFilters.paymentStatus)}`}
                  onDelete={() => handleFilterChange('paymentStatus', '')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {localFilters.supplier && (
                <Chip
                  label={`Nhà cung cấp: ${localFilters.supplier}`}
                  onDelete={() => handleFilterChange('supplier', '')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {localFilters.startDate && (
                <Chip
                  label={`Từ: ${new Date(localFilters.startDate).toLocaleDateString('vi-VN')}`}
                  onDelete={() => handleFilterChange('startDate', '')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {localFilters.endDate && (
                <Chip
                  label={`Đến: ${new Date(localFilters.endDate).toLocaleDateString('vi-VN')}`}
                  onDelete={() => handleFilterChange('endDate', '')}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'approved': return 'Đã duyệt';
    case 'rejected': return 'Đã từ chối';
    default: return status;
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'unpaid': return 'Chưa thanh toán';
    case 'partial': return 'Thanh toán một phần';
    case 'paid': return 'Đã thanh toán';
    default: return status;
  }
};

export default StockInFilterBar;
