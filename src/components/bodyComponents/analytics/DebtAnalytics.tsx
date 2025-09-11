import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { fetchDebtAnalytics, fetchOverdueDebtReport } from "../../../store/slices/analyticsSlice";
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
  Chip
} from "@mui/material";
import ApexCharts from "react-apexcharts";

const DebtAnalytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    debtAnalytics, 
    overdueDebtReport,
    isDebtLoading,
    isOverdueDebtLoading,
    error 
  } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    dispatch(fetchDebtAnalytics({}));
    dispatch(fetchOverdueDebtReport({}));
  }, [dispatch]);

  if (error) {
    return (
      <Box sx={{ p: 3, mx: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isDebtLoading || isOverdueDebtLoading) {
    return (
      <Box sx={{ p: 3, mx: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Debt overview cards
  const getDebtCards = () => {
    if (!debtAnalytics?.debtOverview) {
      return [
        { title: "Tổng nợ", value: "0 VNĐ", color: "error" },
        { title: "Số hóa đơn nợ", value: "0", color: "warning" },
        { title: "Nợ trung bình", value: "0 VNĐ", color: "info" },
        { title: "Nợ cao nhất", value: "0 VNĐ", color: "error" },
      ];
    }

    const { debtOverview } = debtAnalytics;
    return [
      { 
        title: "Tổng nợ", 
        value: `${debtOverview.totalDebt.toLocaleString('vi-VN')} VNĐ`, 
        color: "error" 
      },
      { 
        title: "Số hóa đơn nợ", 
        value: debtOverview.totalInvoices.toString(), 
        color: "warning" 
      },
      { 
        title: "Nợ trung bình", 
        value: `${debtOverview.avgDebtPerInvoice.toLocaleString('vi-VN')} VNĐ`, 
        color: "info" 
      },
      { 
        title: "Nợ cao nhất", 
        value: `${debtOverview.maxDebt.toLocaleString('vi-VN')} VNĐ`, 
        color: "error" 
      },
    ];
  };

  // Debt by status chart data
  const getDebtByStatusData = () => {
    if (!debtAnalytics?.debtByStatus) {
      return {
        series: [0, 0, 0],
        labels: ["Chưa thanh toán", "Thanh toán một phần", "Đã thanh toán"]
      };
    }

    const series = debtAnalytics.debtByStatus.map(item => item.totalDebt);
    const labels = debtAnalytics.debtByStatus.map(item => {
      switch(item._id) {
        case 'unpaid': return 'Chưa thanh toán';
        case 'partial': return 'Thanh toán một phần';
        case 'paid': return 'Đã thanh toán';
        default: return item._id;
      }
    });

    return { series, labels };
  };

  // Debt by time range chart data
  const getDebtByTimeRangeData = () => {
    if (!debtAnalytics?.debtByTimeRange) {
      return {
        series: [{ name: "Nợ", data: [] }],
        categories: []
      };
    }

    const data = debtAnalytics.debtByTimeRange.map(item => item.totalDebt);
    const categories = debtAnalytics.debtByTimeRange.map(item => 
      `T${item._id.month}/${item._id.year}`
    );

    return {
      series: [{ name: "Nợ", data }],
      categories
    };
  };

  const debtCards = getDebtCards();
  const debtByStatusData = getDebtByStatusData();
  const debtByTimeRangeData = getDebtByTimeRangeData();

  return (
    <Box sx={{ p: 3, mx: 3 }}>
      {/* Debt Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {debtCards.map((card, index) => (
          <Grid item md={3} key={index}>
            <Card elevation={3}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  {card.title}
                </Typography>
                <Typography variant="h4" color={card.color}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Debt by Status Pie Chart */}
        <Grid item md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Phân bố nợ theo trạng thái
            </Typography>
            <ApexCharts
              options={{
                chart: {
                  type: 'pie',
                },
                labels: debtByStatusData.labels,
                colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
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
              series={debtByStatusData.series}
              type="pie"
              width="100%"
              height={300}
            />
          </Paper>
        </Grid>

        {/* Debt by Time Range Line Chart */}
        <Grid item md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Xu hướng nợ theo thời gian
            </Typography>
            <ApexCharts
              options={{
                chart: {
                  type: 'line',
                },
                xaxis: {
                  categories: debtByTimeRangeData.categories,
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
                }
              }}
              series={debtByTimeRangeData.series}
              type="line"
              width="100%"
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Top Debt Customers Table */}
      <Grid container spacing={3}>
        <Grid item md={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Khách hàng có nợ cao nhất
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên khách hàng</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell align="right">Tổng nợ</TableCell>
                    <TableCell align="right">Số hóa đơn</TableCell>
                    <TableCell align="right">Nợ trung bình</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {debtAnalytics?.debtByCustomer?.slice(0, 10).map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer._id.customerName}</TableCell>
                      <TableCell>{customer._id.customerPhone}</TableCell>
                      <TableCell align="right">
                        {customer.totalDebt.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="right">{customer.invoiceCount}</TableCell>
                      <TableCell align="right">
                        {customer.avgDebt.toLocaleString('vi-VN')} VNĐ
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={customer.totalDebt > 10000000 ? "Cao" : "Trung bình"} 
                          color={customer.totalDebt > 10000000 ? "error" : "warning"}
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

      {/* Overdue Debt Section */}
      {overdueDebtReport && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item md={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="error">
                Hóa đơn quá hạn thanh toán
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Số hóa đơn</TableCell>
                      <TableCell>Tên khách hàng</TableCell>
                      <TableCell align="right">Tổng tiền</TableCell>
                      <TableCell align="right">Còn lại</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overdueDebtReport.criticalOverdue?.slice(0, 10).map((invoice, index) => (
                      <TableRow key={index}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell align="right">
                          {invoice.totalAmount.toLocaleString('vi-VN')} VNĐ
                        </TableCell>
                        <TableCell align="right">
                          {invoice.remainingAmount.toLocaleString('vi-VN')} VNĐ
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label="Quá hạn" 
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    )) || []}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DebtAnalytics;
