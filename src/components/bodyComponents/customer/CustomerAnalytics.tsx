import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent
} from '@mui/material';
import { RootState } from '../../../store';
import Chart from 'react-apexcharts';

const CustomerAnalytics: React.FC = () => {
  const { customerAnalytics } = useSelector((state: RootState) => ({
    customerAnalytics: state.analytics.customerAnalytics,
  }));

  if (!customerAnalytics) {
    return null;
  }

  // Data for charts
  const customerSegmentsData = customerAnalytics.customerSegments.map(segment => ({
    name: segment._id,
    value: segment.count,
    avgSpent: segment.avgSpent,
    avgOrders: segment.avgOrders
  }));

  const newVsReturningData = [
    customerAnalytics.newVsReturningCustomers.newCustomers,
    customerAnalytics.newVsReturningCustomers.returningCustomers
  ];

  const topCustomersData = customerAnalytics.topCustomers.slice(0, 10).map(customer => ({
    name: customer._id.customerName,
    totalSpent: customer.totalSpent,
    invoiceCount: customer.invoiceCount,
    avgOrderValue: customer.avgOrderValue
  }));

  // Chart options
  const pieOptions = {
    chart: {
      type: 'pie' as const,
      height: 300
    },
    labels: ['Khách Hàng Mới', 'Khách Hàng Quay Lại'],
    colors: ['#8884d8', '#82ca9d'],
    legend: {
      position: 'bottom' as const
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom' as const
        }
      }
    }]
  };

  const segmentsPieOptions = {
    chart: {
      type: 'pie' as const,
      height: 300
    },
    labels: customerSegmentsData.map(segment => segment.name),
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'],
    legend: {
      position: 'bottom' as const
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom' as const
        }
      }
    }]
  };

  const barOptions = {
    chart: {
      type: 'bar' as const,
      height: 400
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: topCustomersData.map(customer => customer.name),
      labels: {
        rotate: -45
      }
    },
    yaxis: {
      title: {
        text: 'Giá trị'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toLocaleString() + " VNĐ"
        }
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Phân Tích Chi Tiết
      </Typography>

      <Grid container spacing={3}>
        {/* Customer Segments Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Phân Khúc Khách Hàng
              </Typography>
              <Chart
                options={segmentsPieOptions}
                series={customerSegmentsData.map(segment => segment.value)}
                type="pie"
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* New vs Returning Customers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Khách Hàng Mới vs Quay Lại
              </Typography>
              <Chart
                options={pieOptions}
                series={newVsReturningData}
                type="pie"
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers Bar Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top 10 Khách Hàng Chi Tiêu Cao Nhất
              </Typography>
              <Chart
                options={barOptions}
                series={[{
                  name: 'Tổng Chi Tiêu',
                  data: topCustomersData.map(customer => customer.totalSpent)
                }, {
                  name: 'Số Hóa Đơn',
                  data: topCustomersData.map(customer => customer.invoiceCount)
                }]}
                type="bar"
                height={400}
              />
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default CustomerAnalytics;
