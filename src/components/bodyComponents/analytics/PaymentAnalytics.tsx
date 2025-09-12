import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { fetchPaymentAnalytics, fetchPaymentHistoryAnalytics } from "../../../store/slices/analyticsSlice";
import { fetchInvoices } from "../../../store/slices/invoiceSlice";
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from "@mui/material";
import ApexCharts from "react-apexcharts";

const PaymentAnalytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    paymentAnalytics, 
    paymentHistoryAnalytics,
    isPaymentLoading,
    isPaymentHistoryLoading,
    error 
  } = useSelector((state: RootState) => state.analytics);

  const { invoices, isLoading: isInvoicesLoading } = useSelector((state: RootState) => state.invoice);

  useEffect(() => {
    dispatch(fetchPaymentAnalytics({}));
    dispatch(fetchPaymentHistoryAnalytics({}));
    dispatch(fetchInvoices({ page: 1, limit: 1000 })); // Fetch all invoices to filter cancelled ones
  }, [dispatch]);

  // Calculate total debt excluding cancelled orders
  const calculateAdjustedTotalDebt = () => {
    if (!invoices || invoices.length === 0) {
      return paymentAnalytics?.summary?.totalDebt || 0;
    }

    // Filter out cancelled invoices and calculate remaining amount
    const activeInvoices = invoices.filter(invoice => invoice.status !== 'cancelled');
    const totalDebtFromActiveInvoices = activeInvoices.reduce((sum, invoice) => {
      return sum + (invoice.remainingAmount || 0);
    }, 0);

    return totalDebtFromActiveInvoices;
  };

  if (error) {
    return (
      <Box sx={{ p: 3, mx: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isPaymentLoading || isPaymentHistoryLoading || isInvoicesLoading) {
    return (
      <Box sx={{ p: 3, mx: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Payment overview cards
  const getPaymentCards = () => {
    if (!paymentAnalytics?.summary) {
      return [
        { title: "Tổng doanh thu", value: "0 VNĐ", color: "success" },
        { title: "Đã thanh toán", value: "0 VNĐ", color: "info" },
        { title: "Còn nợ", value: "0 VNĐ", color: "error" },
        { title: "Tỷ lệ thanh toán", value: "0%", color: "warning" },
      ];
    }

    const { summary } = paymentAnalytics;
    const adjustedTotalDebt = calculateAdjustedTotalDebt();
    
    return [
      { 
        title: "Tổng doanh thu", 
        value: `${summary.totalRevenue.toLocaleString('vi-VN')} VNĐ`, 
        color: "success" 
      },
      { 
        title: "Đã thanh toán", 
        value: `${summary.totalPaid.toLocaleString('vi-VN')} VNĐ`, 
        color: "info" 
      },
      { 
        title: "Còn nợ", 
        value: `${adjustedTotalDebt.toLocaleString('vi-VN')} VNĐ`, 
        color: "error" 
      },
      { 
        title: "Tỷ lệ thanh toán", 
        value: `${(summary.paymentRate || 0).toFixed(1)}%`, 
        color: "warning" 
      },
    ];
  };

  // Payment method chart data
  const getPaymentMethodData = () => {
    if (!paymentAnalytics?.paymentMethodStats) {
      return {
        series: [],
        labels: []
      };
    }

    const series = paymentAnalytics.paymentMethodStats.map(item => item.totalAmount);
    const labels = paymentAnalytics.paymentMethodStats.map(item => {
      switch(item._id) {
        case 'cash': return 'Tiền mặt';
        case 'bank_transfer': return 'Chuyển khoản';
        case 'credit_card': return 'Thẻ tín dụng';
        case 'other': return 'Khác';
        default: return item._id;
      }
    });

    return { series, labels };
  };

  // Payment status chart data
  const getPaymentStatusData = () => {
    if (!paymentAnalytics?.paymentStatusStats) {
      return {
        series: [],
        labels: []
      };
    }

    const series = paymentAnalytics.paymentStatusStats.map(item => item.count);
    const labels = paymentAnalytics.paymentStatusStats.map(item => {
      switch(item._id) {
        case 'paid': return 'Đã thanh toán';
        case 'partial': return 'Thanh toán một phần';
        case 'unpaid': return 'Chưa thanh toán';
        default: return item._id;
      }
    });

    return { series, labels };
  };

  // Payment by time range chart data
  const getPaymentByTimeRangeData = () => {
    if (!paymentHistoryAnalytics?.paymentByTimeRange) {
      return {
        series: [
          { name: "Doanh thu", data: [] },
          { name: "Đã thanh toán", data: [] },
          { name: "Còn nợ", data: [] }
        ],
        categories: []
      };
    }

    const revenueData = paymentHistoryAnalytics.paymentByTimeRange.map(item => item.totalRevenue);
    const paidData = paymentHistoryAnalytics.paymentByTimeRange.map(item => item.totalPaid);
    const remainingData = paymentHistoryAnalytics.paymentByTimeRange.map(item => item.totalRemaining);
    const categories = paymentHistoryAnalytics.paymentByTimeRange.map(item => 
      `T${item._id.month}/${item._id.year}`
    );

    return {
      series: [
        { name: "Doanh thu", data: revenueData },
        { name: "Đã thanh toán", data: paidData },
        { name: "Còn nợ", data: remainingData }
      ],
      categories
    };
  };

  const paymentCards = getPaymentCards();
  const paymentMethodData = getPaymentMethodData();
  const paymentStatusData = getPaymentStatusData();
  const paymentByTimeRangeData = getPaymentByTimeRangeData();

  return (
    <Box sx={{ p: 3, mx: 3 }}>
      {/* Info about cancelled orders exclusion */}
      <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
        <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
          ℹ️ Lưu ý: Tổng nợ đã được tính toán loại trừ các đơn hàng đã bị hủy để đảm bảo tính chính xác.
        </Typography>
      </Box>
      
      {/* Payment Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {paymentCards.map((card, index) => (
          <Grid item md={3} key={index}>
            <Card elevation={3}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  {card.title}
                </Typography>
                <Typography variant="h4" color={card.color}>
                  {card.value}
                </Typography>
                {card.title === "Tỷ lệ thanh toán" && paymentAnalytics?.summary && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={paymentAnalytics.summary.paymentRate} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Payment Method Pie Chart */}
        <Grid item md={4}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Phương thức thanh toán
            </Typography>
            <ApexCharts
              options={{
                chart: {
                  type: 'pie',
                },
                labels: paymentMethodData.labels,
                colors: ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  y: {
                    formatter: function (value: number) {
                      return value.toLocaleString('vi-VN') + ' VNĐ';
                    }
                  }
                }
              }}
              series={paymentMethodData.series}
              type="pie"
              width="100%"
              height={300}
            />
          </Paper>
        </Grid>

        {/* Payment Status Donut Chart */}
        <Grid item md={4}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái thanh toán
            </Typography>
            <ApexCharts
              options={{
                chart: {
                  type: 'donut',
                },
                labels: paymentStatusData.labels,
                colors: ['#4ECDC4', '#FFE66D', '#FF6B6B'],
                legend: {
                  position: 'bottom',
                },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '70%'
                    }
                  }
                },
                tooltip: {
                  y: {
                    formatter: function (value: number) {
                      return value + ' hóa đơn';
                    }
                  }
                }
              }}
              series={paymentStatusData.series}
              type="donut"
              width="100%"
              height={300}
            />
          </Paper>
        </Grid>

        {/* Payment by Time Range Line Chart */}
        <Grid item md={4}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Xu hướng thanh toán
            </Typography>
            <ApexCharts
              options={{
                chart: {
                  type: 'line',
                },
                xaxis: {
                  categories: paymentByTimeRangeData.categories,
                },
                yaxis: {
                  labels: {
                    formatter: function (value: number) {
                      return value.toLocaleString('vi-VN') + ' VNĐ';
                    }
                  }
                },
                tooltip: {
                  y: {
                    formatter: function (value: number) {
                      return value.toLocaleString('vi-VN') + ' VNĐ';
                    }
                  }
                },
                colors: ['#4ECDC4', '#45B7D1', '#FF6B6B']
              }}
              series={paymentByTimeRangeData.series}
              type="line"
              width="100%"
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Payment by Customer Table */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thanh toán theo khách hàng
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên khách hàng</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell align="right">Tổng doanh thu</TableCell>
                    <TableCell align="right">Đã thanh toán</TableCell>
                    <TableCell align="right">Còn nợ</TableCell>
                    <TableCell align="right">Tỷ lệ thanh toán</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistoryAnalytics?.paymentByCustomer?.slice(0, 10).map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer._id.customerName}</TableCell>
                      <TableCell>{customer._id.customerPhone}</TableCell>
                      <TableCell align="right">
                        {customer.totalRevenue.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="right">
                        {customer.totalPaid.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="right">
                        {customer.totalRemaining.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="right">
                        {(customer.avgPaymentRate || 0).toFixed(1)}%
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={(customer.avgPaymentRate || 0) > 80 ? "Tốt" : (customer.avgPaymentRate || 0) > 50 ? "Trung bình" : "Kém"} 
                          color={(customer.avgPaymentRate || 0) > 80 ? "success" : (customer.avgPaymentRate || 0) > 50 ? "warning" : "error"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Payments Table */}
      <Grid container spacing={3}>
        <Grid item md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Giao dịch thanh toán gần đây
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Số hóa đơn</TableCell>
                    <TableCell>Tên khách hàng</TableCell>
                    <TableCell align="right">Tổng tiền</TableCell>
                    <TableCell align="right">Đã thanh toán</TableCell>
                    <TableCell align="right">Còn lại</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistoryAnalytics?.recentPayments?.slice(0, 10).map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{payment.invoiceNumber}</TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell align="right">
                        {payment.totalAmount.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="right">
                        {payment.paidAmount.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="right">
                        {payment.remainingAmount.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={
                            payment.paymentStatus === 'paid' ? 'Đã thanh toán' :
                            payment.paymentStatus === 'partial' ? 'Một phần' : 'Chưa thanh toán'
                          } 
                          color={
                            payment.paymentStatus === 'paid' ? 'success' :
                            payment.paymentStatus === 'partial' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentAnalytics;
