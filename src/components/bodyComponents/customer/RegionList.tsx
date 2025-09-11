import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Avatar, 
  Box, 
  Typography, 
  Chip,
  Tooltip,
  IconButton
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { RootState } from '../../../store';
import { LocationOn, People, AttachMoney, Receipt, TrendingUp } from '@mui/icons-material';

const RegionList: React.FC = () => {
  const { customerListByRegion, isCustomerListByRegionLoading } = useSelector((state: RootState) => ({
    customerListByRegion: state.analytics.customerListByRegion,
    isCustomerListByRegionLoading: state.analytics.isCustomerListByRegionLoading,
  }));

  if (!customerListByRegion) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu khu vực
        </Typography>
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "region",
      headerName: "Khu Vực",
      width: 200,
      description: "Tên khu vực",
      renderCell: (params) => {
        const initials = params.value
          .split(' ')
          .map((name: string) => name[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              alt={params.value}
              variant="rounded"
              sx={{ 
                borderRadius: 1, 
                width: 40, 
                height: 40,
                bgcolor: 'primary.main',
                color: 'white'
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "customerCount",
      headerName: "Số Khách Hàng",
      width: 150,
      description: "Tổng số khách hàng trong khu vực",
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People color="primary" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {params.value.toLocaleString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: "totalRevenue",
      headerName: "Tổng Doanh Thu",
      width: 200,
      description: "Tổng doanh thu từ khu vực",
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney color="success" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            {params.value.toLocaleString()} VNĐ
          </Typography>
        </Box>
      ),
    },
    {
      field: "totalOrders",
      headerName: "Tổng Đơn Hàng",
      width: 150,
      description: "Tổng số đơn hàng từ khu vực",
      renderCell: (params) => (
        <Chip 
          label={params.value.toLocaleString()} 
          color="primary" 
          size="small"
          icon={<Receipt />}
        />
      ),
    },
    {
      field: "avgOrderValue",
      headerName: "Giá Trị TB/Đơn",
      width: 180,
      description: "Giá trị trung bình mỗi đơn hàng",
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value.toLocaleString()} VNĐ
        </Typography>
      ),
    },
    {
      field: "totalPaid",
      headerName: "Đã Thanh Toán",
      width: 180,
      description: "Tổng số tiền đã thanh toán",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
          {params.value.toLocaleString()} VNĐ
        </Typography>
      ),
    },
    {
      field: "totalDebt",
      headerName: "Còn Nợ",
      width: 150,
      description: "Tổng số tiền còn nợ",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
          {params.value.toLocaleString()} VNĐ
        </Typography>
      ),
    },
    {
      field: "lastOrderDate",
      headerName: "Đơn Cuối",
      width: 150,
      description: "Ngày đơn hàng gần nhất",
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2">-</Typography>;
        
        const date = new Date(params.value);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let color: 'default' | 'warning' | 'error' = 'default';
        if (diffDays > 90) color = 'error';
        else if (diffDays > 30) color = 'warning';
        
        return (
          <Chip 
            label={`${diffDays} ngày trước`}
            color={color}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "firstOrderDate",
      headerName: "Đơn Đầu",
      width: 150,
      description: "Ngày đơn hàng đầu tiên",
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2">-</Typography>;
        
        const date = new Date(params.value);
        return (
          <Typography variant="body2">
            {date.toLocaleDateString('vi-VN')}
          </Typography>
        );
      },
    },
  ];

  // Transform data for DataGrid
  const rows = customerListByRegion.regions.map((region, index) => ({
    id: region.region,
    region: region.region,
    customerCount: region.customerCount,
    totalRevenue: region.totalRevenue,
    totalOrders: region.totalOrders,
    avgOrderValue: region.avgOrderValue,
    totalPaid: region.totalPaid,
    totalDebt: region.totalDebt,
    lastOrderDate: region.lastOrderDate,
    firstOrderDate: region.firstOrderDate
  }));

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "100%",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Danh Sách Khu Vực
      </Typography>
      
      <DataGrid
        sx={{
          borderLeft: 0,
          borderRight: 0,
          borderRadius: 0,
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 15, 20, 30]}
        rowSelection={false}
        loading={isCustomerListByRegionLoading}
        disableRowSelectionOnClick
        autoHeight
      />
    </Box>
  );
};

export default RegionList;
