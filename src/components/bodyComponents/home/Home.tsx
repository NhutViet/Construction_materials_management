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
          padding: 3,
        }}
      >
        {/* Dashboard Summary Cards */}
        <DashboardSummary />

        {/* Revenue Analysis Section */}
        <Grid container sx={{ marginX: 3 }}>
          <Grid item md={8}>
            <RevenueChart />
          </Grid>
          <Grid item md={4}>
            <RevenueByCategory />
          </Grid>
        </Grid>

        {/* Material Analysis Section */}
        <Grid container sx={{ margin: 3 }}>
          <Grid item md={6}>
            <MaterialUsageChart />
          </Grid>
          <Grid item md={6}>
            <TopSellingMaterials />
          </Grid>
        </Grid>

      
      </Box>
    );
  }
}
