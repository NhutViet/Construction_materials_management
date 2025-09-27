import React, { Component } from "react";
import { Box, Grid } from "@mui/material";

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
          margin: 0,
          padding: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Dashboard Summary Cards */}
        <DashboardSummary />

        {/* Revenue Analysis Section */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <RevenueChart />
          </Grid>
          <Grid item xs={12} md={4}>
            <RevenueByCategory />
          </Grid>
        </Grid>

        {/* Material Analysis Section */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 2 }}>
          {/* <Grid item xs={12} md={6}>
            <MaterialUsageChart />
          </Grid> */}
          <Grid item xs={12} md={6}>
            <TopSellingMaterials />
          </Grid>
        </Grid>

        {/* Responsive Test Section - Uncomment to test */}
        {/* <ResponsiveTest /> */}
      
      </Box>
    );
  }
}
