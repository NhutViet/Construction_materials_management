import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Chip
} from '@mui/material';
import { RootState } from '../../../store';
import Chart from 'react-apexcharts';

const RegionAnalytics: React.FC = () => {
  const { regionAnalytics } = useSelector((state: RootState) => ({
    regionAnalytics: state.analytics.regionAnalytics,
  }));

  if (!regionAnalytics) {
    return null;
  }

  // Data for charts
  const regionStatsData = regionAnalytics.regionStats.map(region => ({
    name: region.region,
    customerCount: region.customerCount,
    totalRevenue: region.totalRevenue,
    totalOrders: region.totalOrders,
    avgOrderValue: region.avgOrderValue,
    totalPaid: region.totalPaid,
    totalDebt: region.totalDebt
  }));

  const topRegionsData = regionAnalytics.topRegions.map(region => ({
    name: region.region,
    customerCount: region.customerCount
  }));

  const regionRevenueData = regionAnalytics.regionRevenue.map(region => ({
    name: region.region,
    totalRevenue: region.totalRevenue,
    totalOrders: region.totalOrders,
    avgOrderValue: region.avgOrderValue
  }));

  const regionGrowthData = regionAnalytics.regionGrowth.map(region => ({
    name: region.region,
    customerGrowth: region.customerGrowth,
    revenueGrowth: region.revenueGrowth
  }));

  // Chart options
  const regionRevenueOptions = {
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
      categories: regionRevenueData.map(region => region.name),
      labels: {
        rotate: -45
      }
    },
    yaxis: {
      title: {
        text: 'Doanh thu (VNĐ)'
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
    },
    colors: ['#8884d8', '#82ca9d', '#ffc658']
  };

  const customerCountOptions = {
    chart: {
      type: 'pie' as const,
      height: 300
    },
    labels: topRegionsData.map(region => region.name),
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'],
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

  const growthOptions = {
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
      categories: regionGrowthData.map(region => region.name),
      labels: {
        rotate: -45
      }
    },
    yaxis: {
      title: {
        text: 'Tỷ lệ tăng trưởng (%)'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(1) + "%"
        }
      }
    },
    colors: ['#ff7300', '#82ca9d']
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Thống Kê Theo Khu Vực
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Tổng Khu Vực
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {regionAnalytics.summary.totalRegions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Tổng Khách Hàng
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {regionAnalytics.summary.totalCustomers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Tổng Doanh Thu
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {regionAnalytics.summary.totalRevenue.toLocaleString()} VNĐ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                TB KH/Khu Vực
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {regionAnalytics.summary.avgCustomersPerRegion.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Region Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Doanh Thu Theo Khu Vực
              </Typography>
              <Chart
                options={regionRevenueOptions}
                series={[{
                  name: 'Tổng Doanh Thu',
                  data: regionRevenueData.map(region => region.totalRevenue)
                }, {
                  name: 'Số Đơn Hàng',
                  data: regionRevenueData.map(region => region.totalOrders)
                }]}
                type="bar"
                height={400}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Phân Bố Khách Hàng
              </Typography>
              <Chart
                options={customerCountOptions}
                series={topRegionsData.map(region => region.customerCount)}
                type="pie"
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Growth Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tăng Trưởng Theo Khu Vực
              </Typography>
              <Chart
                options={growthOptions}
                series={[{
                  name: 'Tăng Trưởng Khách Hàng (%)',
                  data: regionGrowthData.map(region => region.customerGrowth)
                }, {
                  name: 'Tăng Trưởng Doanh Thu (%)',
                  data: regionGrowthData.map(region => region.revenueGrowth)
                }]}
                type="bar"
                height={400}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Region Stats Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chi Tiết Theo Khu Vực
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Khu Vực</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Khách Hàng</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Doanh Thu</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Đơn Hàng</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>TB/Đơn</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Đã Trả</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Còn Nợ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionStatsData.map((region, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px' }}>
                          <Chip 
                            label={region.name} 
                            color="primary" 
                            size="small"
                            variant="outlined"
                          />
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {region.customerCount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#2e7d32', fontWeight: 'bold' }}>
                          {region.totalRevenue.toLocaleString()} VNĐ
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {region.totalOrders.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {region.avgOrderValue.toLocaleString()} VNĐ
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#2e7d32' }}>
                          {region.totalPaid.toLocaleString()} VNĐ
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#d32f2f' }}>
                          {region.totalDebt.toLocaleString()} VNĐ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegionAnalytics;
