import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Pending as PendingIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface StockInStatsProps {
  stats: {
    total: number;
    totalAmount: number;
    pending: number;
    approved: number;
    rejected: number;
    unpaid: number;
    partial: number;
    paid: number;
    averageAmount: number;
  };
}

const StockInStats: React.FC<StockInStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'unpaid': return 'error';
      case 'partial': return 'warning';
      case 'paid': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'total': return <InventoryIcon />;
      case 'amount': return <MoneyIcon />;
      case 'pending': return <PendingIcon />;
      case 'approved': return <CheckIcon />;
      case 'rejected': return <CancelIcon />;
      case 'unpaid': return <PaymentIcon />;
      case 'partial': return <PaymentIcon />;
      case 'paid': return <CheckIcon />;
      case 'average': return <TrendingUpIcon />;
      default: return <InventoryIcon />;
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    color = 'primary', 
    icon, 
    progress 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    icon: React.ReactNode;
    progress?: number;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={color}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const totalStatus = stats.pending + stats.approved + stats.rejected;
  const totalPayment = stats.unpaid + stats.partial + stats.paid;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Total Stock-ins */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tổng phiếu nhập"
          value={stats.total}
          subtitle="Tất cả phiếu nhập kho"
          color="primary"
          icon={getStatusIcon('total')}
        />
      </Grid>

      {/* Total Amount */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tổng giá trị"
          value={formatCurrency(stats.totalAmount)}
          subtitle="Tổng giá trị nhập kho"
          color="success"
          icon={getStatusIcon('amount')}
        />
      </Grid>

      {/* Average Amount */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Giá trị trung bình"
          value={formatCurrency(stats.averageAmount)}
          subtitle="Mỗi phiếu nhập"
          color="info"
          icon={getStatusIcon('average')}
        />
      </Grid>

      {/* Status Overview */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  mr: 2
                }}
              >
                <CheckIcon />
              </Box>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Trạng thái
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label="Chờ xử lý" 
                  color="warning" 
                  size="small" 
                  icon={<PendingIcon />}
                />
                <Typography variant="h6">{stats.pending}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label="Đã duyệt" 
                  color="success" 
                  size="small" 
                  icon={<CheckIcon />}
                />
                <Typography variant="h6">{stats.approved}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label="Đã từ chối" 
                  color="error" 
                  size="small" 
                  icon={<CancelIcon />}
                />
                <Typography variant="h6">{stats.rejected}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Status Overview */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'secondary.light',
                  color: 'secondary.main',
                  mr: 2
                }}
              >
                <PaymentIcon />
              </Box>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Thanh toán
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label="Chưa thanh toán" 
                  color="error" 
                  size="small" 
                  icon={<PaymentIcon />}
                />
                <Typography variant="h6">{stats.unpaid}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label="Thanh toán một phần" 
                  color="warning" 
                  size="small" 
                  icon={<PaymentIcon />}
                />
                <Typography variant="h6">{stats.partial}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label="Đã thanh toán" 
                  color="success" 
                  size="small" 
                  icon={<CheckIcon />}
                />
                <Typography variant="h6">{stats.paid}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Status Progress */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tỷ lệ duyệt"
          value={`${totalStatus > 0 ? ((stats.approved / totalStatus) * 100).toFixed(1) : 0}%`}
          subtitle={`${stats.approved}/${totalStatus} phiếu đã duyệt`}
          color="success"
          icon={getStatusIcon('approved')}
          progress={totalStatus > 0 ? (stats.approved / totalStatus) * 100 : 0}
        />
      </Grid>

      {/* Payment Progress */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tỷ lệ thanh toán"
          value={`${totalPayment > 0 ? ((stats.paid / totalPayment) * 100).toFixed(1) : 0}%`}
          subtitle={`${stats.paid}/${totalPayment} phiếu đã thanh toán`}
          color="info"
          icon={getStatusIcon('paid')}
          progress={totalPayment > 0 ? (stats.paid / totalPayment) * 100 : 0}
        />
      </Grid>
    </Grid>
  );
};

export default StockInStats;
