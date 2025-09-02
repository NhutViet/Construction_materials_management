import { Avatar, Box, Button, Modal, Typography, Chip, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchInvoices, setSelectedInvoice, selectFilteredInvoices, selectInvoicesLoading, selectInvoicesError, selectInvoicesFilters } from "../../../store/slices/invoiceSlice";
import OrderModal from "./OrderModal";
import OrderFilterBar from "./OrderFilterBar";

export default function OrderList() {
  const dispatch = useDispatch<AppDispatch>();
  const invoices = useSelector(selectFilteredInvoices);
  const isLoading = useSelector(selectInvoicesLoading);
  const error = useSelector(selectInvoicesError);
  const filters = useSelector(selectInvoicesFilters);
  
  console.log('OrderList: Current state:', { invoices, isLoading, error, filters });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log('OrderList: Dispatching fetchInvoices to load all data');
    // Only fetch once to load all data, then use client-side filtering
    dispatch(fetchInvoices({ page: 1, limit: 1000 })); // Load all invoices
  }, [dispatch]);

  const handleOrderDetail = (order) => {
    console.log("the order is : ", order);
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipped': return 'Đã giao hàng';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'error';
      case 'partial': return 'warning';
      case 'paid': return 'success';
      default: return 'default';
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

  const columns = [
    {
      field: "invoiceNumber",
      headerName: "Số hóa đơn",
      flex: 1,
      minWidth: 120,
      description: "Số hóa đơn",
    },
    {
      field: "customerName",
      headerName: "Tên khách hàng",
      flex: 1.5,
      minWidth: 180,
      description: "Tên khách hàng",
      renderCell: (params) => {
        return (
          <>
            <Avatar alt="name" sx={{ width: 30, height: 30 }}>
              {params.row.customerName?.charAt(0)?.toUpperCase() || 'C'}
            </Avatar>
            <Typography variant="subtitle2" sx={{ mx: 3, fontSize: '16px' }}>
              {params.row.customerName || 'N/A'}
            </Typography>
          </>
        );
      },
    },
    {
      field: "customerPhone",
      headerName: "Số điện thoại",
      flex: 1,
      minWidth: 120,
      description: "Số điện thoại khách hàng",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      minWidth: 120,
      description: "Trạng thái hóa đơn",
      renderCell: (params) => (
        <Chip 
          label={getStatusText(params.row.status)} 
          color={getStatusColor(params.row.status)}
          size="medium"
          sx={{ fontSize: '14px' }}
        />
      ),
    },
    {
      field: "paymentStatus",
      headerName: "Thanh toán",
      flex: 1,
      minWidth: 120,
      description: "Trạng thái thanh toán",
      renderCell: (params) => (
        <Chip 
          label={getPaymentStatusText(params.row.paymentStatus)} 
          color={getPaymentStatusColor(params.row.paymentStatus)}
          size="medium"
          sx={{ fontSize: '14px' }}
        />
      ),
    },
    {
      field: "totalAmount",
      headerName: "Tổng tiền",
      flex: 1,
      minWidth: 120,
      description: "Tổng số tiền hóa đơn",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
          {params.row.totalAmount?.toLocaleString() + ' VNĐ' || '0'}
        </Typography>
      ),
    },
    {
      field: "deliveryDate",
      headerName: "Giao hàng",
      flex: 1,
      minWidth: 120,
      description: "Ngày giao hàng",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '16px' }}>
          {params.row.deliveryDate ? new Date(params.row.deliveryDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 1,
      minWidth: 120,
      description: "Ngày tạo hóa đơn",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '16px' }}>
          {new Date(params.row.createdAt).toLocaleDateString('vi-VN')}
        </Typography>
      ),
    },

  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Lỗi khi tải hóa đơn: {error}</Typography>
      </Box>
    );
  }

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
      <OrderFilterBar />
      <DataGrid
        sx={{
          borderLeft: 0,
          borderRight: 0,
          borderRadius: 0,
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '& .MuiDataGrid-cell': {
            fontSize: '16px',
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: '16px',
            fontWeight: 'bold',
          },
        }}
        rows={invoices}
        columns={columns}
        getRowId={(row) => row._id}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 15 },
          },
        }}
        pageSizeOptions={[10, 15, 20, 30]}
        rowSelection={false}
        pagination
        paginationMode="client"
        onRowClick={(params) => handleOrderDetail(params.row)}
      />
      <Modal open={open} onClose={handleClose}>
        <Box>
          <OrderModal order={selectedOrder} onClose={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
}
