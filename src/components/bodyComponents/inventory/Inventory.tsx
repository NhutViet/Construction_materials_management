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
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        p: { xs: 1, sm: 2, md: 3 }
      }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            padding: { xs: 2, sm: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 1
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: { xs: 2, sm: 3 }, 
              fontWeight: "bold",
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
            }}
          >
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
