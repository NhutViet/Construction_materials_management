import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Avatar, 
  Box, 
  Typography, 
  Chip,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { RootState } from '../../../store';
import { Person, Phone, Email, AttachMoney, Receipt } from '@mui/icons-material';

const CustomerList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { customerAnalytics, isCustomerLoading } = useSelector((state: RootState) => ({
    customerAnalytics: state.analytics.customerAnalytics,
    isCustomerLoading: state.analytics.isCustomerLoading,
  }));

  if (!customerAnalytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu khách hàng
        </Typography>
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "customerId",
      headerName: "ID",
      width: 90,
      description: "ID của khách hàng",
    },
    {
      field: "customerName",
      headerName: "Tên Khách Hàng",
      width: 250,
      description: "Tên đầy đủ của khách hàng",
      renderCell: (params) => {
        const initials = params.row.customerName
          .split(' ')
          .map((name: string) => name[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              alt={params.row.customerName}
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
              {params.row.customerName}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "totalSpent",
      headerName: "Tổng Chi Tiêu",
      width: 180,
      description: "Tổng số tiền khách hàng đã chi tiêu",
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
      field: "invoiceCount",
      headerName: "Số Hóa Đơn",
      width: 150,
      description: "Số lượng hóa đơn đã mua",
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color="primary" 
          size="small"
          icon={<Receipt />}
        />
      ),
    },
    {
      field: "avgOrderValue",
      headerName: "Giá Trị HĐ TB",
      width: 180,
      description: "Giá trị trung bình mỗi hóa đơn",
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value.toLocaleString()} VNĐ
        </Typography>
      ),
    },
    {
      field: "lastOrderDate",
      headerName: "Lần Cuối Mua",
      width: 150,
      description: "Ngày mua hàng gần nhất",
      renderCell: (params) => {
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
      field: "customerSegment",
      headerName: "Phân Khúc",
      width: 120,
      description: "Phân khúc khách hàng",
      renderCell: (params) => {
        const segment = params.row.customerSegment || 'VIP';
        const colors = {
          'VIP': 'error',
          'Premium': 'warning',
          'Standard': 'info',
          'Basic': 'default'
        } as const;
        
        return (
          <Chip 
            label={segment}
            color={colors[segment as keyof typeof colors] || 'default'}
            size="small"
          />
        );
      },
    },
  ];

  // Transform data for DataGrid
  const rows = customerAnalytics.topCustomers.map((customer, index) => ({
    id: customer._id.customerId,
    customerId: customer._id.customerId,
    customerName: customer._id.customerName,
    totalSpent: customer.totalSpent,
    invoiceCount: customer.invoiceCount,
    avgOrderValue: customer.avgOrderValue,
    lastOrderDate: customer.lastOrderDate,
    customerSegment: customer.totalSpent > 10000000 ? 'VIP' : 
                     customer.totalSpent > 5000000 ? 'Premium' : 
                     customer.totalSpent > 1000000 ? 'Standard' : 'Basic'
  }));

  return (
    <Box
      sx={{
        margin: { xs: 1.5, sm: 2, md: 3 },
        bgcolor: "white",
        borderRadius: 2,
        padding: { xs: 1.5, sm: 2, md: 3 },
        height: "100%",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Danh Sách Khách Hàng Chi Tiêu Cao
      </Typography>
      
      <DataGrid
        sx={{
          borderLeft: 0,
          borderRight: 0,
          borderRadius: 0,
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
            fontSize: { xs: '0.8rem', md: '0.875rem' },
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
        rows={rows}
        columns={columns}
        density={isMobile ? 'compact' : 'standard'}
        columnVisibilityModel={
          isMobile
            ? {
                customerId: false,
                invoiceCount: false,
                avgOrderValue: false,
                customerSegment: false,
              }
            : undefined
        }
        disableColumnMenu={isMobile}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 15, 20, 30]}
        rowSelection={false}
        loading={isCustomerLoading}
        disableRowSelectionOnClick
        autoHeight
      />
    </Box>
  );
};

export default CustomerList;
