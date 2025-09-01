import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Typography,
  Grid,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { updateFilters, clearFilters, selectMaterialsFilters } from '../../../store/slices/materialSlice';

const FilterBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector(selectMaterialsFilters);
  const materials = useSelector((state: RootState) => state.materials.materials);

  // Get unique categories and suppliers from materials
  const categories = [...new Set(materials.map(m => m.category).filter(Boolean))];
  const suppliers = [...new Set(materials.map(m => m.supplier).filter(Boolean))];

  const handleFilterChange = (field: string, value: any) => {
    dispatch(updateFilters({ [field]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const hasActiveFilters = filters.searchTerm || filters.category || filters.supplier || filters.lowStockOnly;

  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" color="primary">
          Bộ Lọc
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

      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Tìm kiếm sản phẩm"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            placeholder="Nhập tên hoặc mô tả sản phẩm (hỗ trợ tìm kiếm không dấu)..."
            size="small"
          />
        </Grid>

        {/* Category Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Danh mục"
            >
              <MenuItem value="">Tất cả danh mục</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Supplier Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Nhà cung cấp</InputLabel>
            <Select
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              label="Nhà cung cấp"
            >
              <MenuItem value="">Tất cả nhà cung cấp</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier} value={supplier}>
                  {supplier}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Low Stock Filter */}
        <Grid item xs={12} md={2}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.lowStockOnly}
                onChange={(e) => handleFilterChange('lowStockOnly', e.target.checked)}
                color="warning"
              />
            }
            label="Tồn kho thấp"
          />
        </Grid>
      </Grid>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Bộ lọc đang áp dụng:
          </Typography>
          
          {filters.searchTerm && (
            <Chip
              label={`Tìm kiếm: "${filters.searchTerm}"`}
              onDelete={() => handleFilterChange('searchTerm', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.category && (
            <Chip
              label={`Danh mục: ${filters.category}`}
              onDelete={() => handleFilterChange('category', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.supplier && (
            <Chip
              label={`Nhà cung cấp: ${filters.supplier}`}
              onDelete={() => handleFilterChange('supplier', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.lowStockOnly && (
            <Chip
              label="Tồn kho thấp"
              onDelete={() => handleFilterChange('lowStockOnly', false)}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}

          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{ ml: 'auto' }}
          >
            Xóa tất cả
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FilterBar;
