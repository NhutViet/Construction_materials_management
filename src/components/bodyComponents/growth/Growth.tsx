import React, { Component } from "react";
import { Box, Grid, Paper } from "@mui/material";
import RevenueCard from "../revenue/RevenueCard";
import VisitorsGrowthCharts from "./VisitorsGrowthCharts";
import ProductsGrowthCharts from "./ProductsGrowthCharts";
import CustomersGrowthCharts from "./CustomersGrowthCharts";
import SalesGrowthCharts from "./SalesGrowthCharts";
export default class Growth extends Component {
  render() {
    const revenuCards: React.ComponentProps<typeof RevenueCard>['card'][] = [
      {
        isMoney: false,
        number: "330",
        percentage: 11,
        upOrDown: "down",
        color: "red",
        title: "Orders Per Month",
        subTitle: "vs prev month",
      },
      {
        isMoney: false,
        number: "109",
        percentage: 35,
        upOrDown: "up",
        color: "green",
        title: "Total Customer",
        subTitle: "vs prev year",
      },
      {
        isMoney: false,
        number: "607",
        percentage: 10,
        upOrDown: "up",
        color: "green",
        title: "Total Product",
        subTitle: "vs prev month",
      },
      {
        isMoney: false,
        number: "1200",
        percentage: 30,
        upOrDown: "up",
        title: "Total Visitors",
        color: "green",
        subTitle: "vs prev week",
      },
    ];
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mx: { xs: 0, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mx: { xs: 0, sm: 2, md: 4 } }}>
          {revenuCards.map((card) => (
            <Grid item xs={6} sm={6} md={3} key={card.title}>
              <Box m={{ xs: 0.5, sm: 1, md: 2 }}>
                <RevenueCard card={card} />
              </Box>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mx: { xs: 0, sm: 2, md: 4 }, mt: 1 }}>
          <Grid item xs={12} md={6}>
            <SalesGrowthCharts />
          </Grid>
          <Grid item xs={12} md={6}>
            <VisitorsGrowthCharts />
          </Grid>
        </Grid>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mx: { xs: 0, sm: 2, md: 4 }, mt: 1 }}>
          <Grid item xs={12} md={6}>
            <ProductsGrowthCharts />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomersGrowthCharts />
          </Grid>
        </Grid>
      </Box>
    );
  }
}
