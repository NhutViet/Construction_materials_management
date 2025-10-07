import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Search as SearchIcon, Receipt as ReceiptIcon, Home as HomeIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { searchPublicInvoices, clearPublicSearchResults } from '../store/slices/invoiceSlice';
import { Invoice } from '../store/slices/invoiceSlice';

const PublicInvoiceSearch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { publicSearchResults, publicSearchLoading, error } = useSelector((state: RootState) => state.invoice);
  
  const [searchData, setSearchData] = useState({
    invoiceNumber: '',
    customerPhone: '',
    customerName: ''
  });

  const handleSearch = async () => {
    if (!searchData.invoiceNumber && !searchData.customerPhone && !searchData.customerName) {
      return;
    }
    
    dispatch(clearPublicSearchResults());
    dispatch(searchPublicInvoices(searchData));
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'error';
      case 'partial': return 'warning';
      case 'paid': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <ReceiptIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Tra cứu hóa đơn
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ ml: 2 }}
          >
            Trang chủ
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" mb={4}>
          Nhập thông tin để tra cứu hóa đơn của bạn. Bạn có thể tìm kiếm bằng mã hóa đơn, số điện thoại hoặc tên khách hàng.
        </Typography>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Mã hóa đơn"
              value={searchData.invoiceNumber}
              onChange={handleInputChange('invoiceNumber')}
              placeholder="Nhập mã hóa đơn"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={searchData.customerPhone}
              onChange={handleInputChange('customerPhone')}
              placeholder="Nhập số điện thoại"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tên khách hàng"
              value={searchData.customerName}
              onChange={handleInputChange('customerName')}
              placeholder="Nhập tên khách hàng"
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          size="large"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={publicSearchLoading || (!searchData.invoiceNumber && !searchData.customerPhone && !searchData.customerName)}
          sx={{ mb: 3 }}
        >
          {publicSearchLoading ? <CircularProgress size={24} /> : 'Tìm kiếm'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {publicSearchResults.length > 0 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Kết quả tìm kiếm ({publicSearchResults.length} hóa đơn)
            </Typography>
            
            {publicSearchResults.map((invoice: Invoice) => (
              <Card key={invoice._id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center" mb={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight="bold">
                        Hóa đơn #{invoice.invoiceNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ngày tạo: {formatDate(invoice.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} textAlign="right">
                      <Chip
                        label={getStatusText(invoice.status)}
                        color={getStatusColor(invoice.status) as any}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={getPaymentStatusText(invoice.paymentStatus)}
                        color={getPaymentStatusColor(invoice.paymentStatus) as any}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        Thông tin khách hàng:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tên:</strong> {invoice.customerName}
                      </Typography>
                      {invoice.customerPhone && (
                        <Typography variant="body2">
                          <strong>SĐT:</strong> {invoice.customerPhone}
                        </Typography>
                      )}
                      {invoice.customerAddress && (
                        <Typography variant="body2">
                          <strong>Địa chỉ:</strong> {invoice.customerAddress}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        Thông tin thanh toán:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tổng tiền:</strong> {formatCurrency(invoice.totalAmount)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Đã thanh toán:</strong> {formatCurrency(invoice.paidAmount)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Còn lại:</strong> {formatCurrency(invoice.remainingAmount)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phương thức:</strong> {
                          invoice.paymentMethod === 'cash' ? 'Tiền mặt' :
                          invoice.paymentMethod === 'online' ? 'Chuyển khoản' : 'Công nợ'
                        }
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                    Chi tiết sản phẩm:
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Tên sản phẩm</strong></TableCell>
                          <TableCell align="right"><strong>Số lượng</strong></TableCell>
                          <TableCell align="right"><strong>Đơn giá</strong></TableCell>
                          <TableCell align="right"><strong>Thành tiền</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoice.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.materialName}
                              <Typography variant="caption" display="block" color="text.secondary">
                                Đơn vị: {item.unit}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {invoice.notes && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        Ghi chú:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoice.notes}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {publicSearchResults.length === 0 && !publicSearchLoading && !error && (
          <Box textAlign="center" py={4}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Chưa có kết quả tìm kiếm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng nhập thông tin để tìm kiếm hóa đơn
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Footer */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 3, 
          mt: 4,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Nếu quý khách có thắc mắc thì liên hệ: <strong>0833167767</strong>
        </Typography>
      </Box>
    </Container>
  );
};

export default PublicInvoiceSearch;
