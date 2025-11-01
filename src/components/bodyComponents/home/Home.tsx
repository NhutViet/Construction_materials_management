import React, { Component } from "react";
import { Box, Grid, Container, Typography } from "@mui/material";

import DashboardSummary from "./DashboardSummary";
import RevenueChart from "./RevenueChart";
import RevenueByCategory from "./RevenueByCategory";
import MaterialUsageChart from "./MaterialUsageChart";
import TopSellingMaterials from "./TopSellingMaterials";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          padding: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="xl" sx={{ px: 0 }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 1,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Bảng Điều Khiển
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: "1.1rem",
              }}
            >
              Tổng quan về hoạt động kinh doanh và quản lý vật liệu
            </Typography>
          </Box>

          {/* Dashboard Summary Cards */}
          <Box sx={{ mb: 4 }}>
            <DashboardSummary />
          </Box>

          {/* Revenue Analysis Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 3,
                display: "flex",
                alignItems: "center",
              }}
            >
              📊 Phân Tích Doanh Thu
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={8}>
                <RevenueChart />
              </Grid>
              <Grid item xs={12} md={4}>
                <RevenueByCategory />
              </Grid>
            </Grid>
          </Box>

          {/* Material Analysis Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 3,
                display: "flex",
                alignItems: "center",
              }}
            >
              📈 Phân Tích Vật Liệu
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={6}>
                <MaterialUsageChart />
              </Grid>
              <Grid item xs={12} md={6}>
                <TopSellingMaterials />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    );
  }
}
