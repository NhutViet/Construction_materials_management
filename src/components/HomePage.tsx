import React from 'react';
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Login as LoginIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSearch = () => {
    navigate('/search-invoice');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Hệ thống quản lý vật liệu xây dựng
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Quản lý kho hàng, đơn hàng và tra cứu hóa đơn một cách hiệu quả
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <LoginIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Đăng nhập hệ thống
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Truy cập đầy đủ các tính năng quản lý kho hàng, đơn hàng, khách hàng và báo cáo doanh thu.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={handleLogin}
                sx={{ px: 4, py: 1.5 }}
              >
                Đăng nhập
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Tra cứu hóa đơn
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Tìm kiếm và xem thông tin hóa đơn bằng mã hóa đơn, số điện thoại hoặc tên khách hàng.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{ px: 4, py: 1.5 }}
              >
                Tra cứu ngay
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box mt={6} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © 2024 Hệ thống quản lý vật liệu xây dựng. Tất cả quyền được bảo lưu.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
