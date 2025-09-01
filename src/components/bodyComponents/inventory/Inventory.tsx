import { Grid, Box, Typography } from "@mui/material";
import React, { Component } from "react";
import Products from "./Products";

export default class Inventory extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            mx: 3,
            mt: 3,
            bgcolor: "white",
            borderRadius: 2,
            padding: 3,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Hàng Hoá
          </Typography>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Products />
          </Box>
        </Box>
      </Box>
    );
  }
}
