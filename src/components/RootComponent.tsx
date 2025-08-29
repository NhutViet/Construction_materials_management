import React from "react";
import NavBarComponent from "./NavBarComponent";
import { Box, Grid } from "@mui/material";
import SideBarComponent from "./SideBarComponent";
import { Outlet } from "react-router-dom";

const RootComponent: React.FC = () => {
  return (
    <>
      <NavBarComponent />
      <Box
        sx={
          {
            // bgcolor: "#DEE3E9",
            // height: 899,
          }
        }
      >
        <Grid container spacing={0}>
          <Grid item md={2} sm={0}>
            <SideBarComponent />
          </Grid>
          <Grid item md={10}>
            <Outlet />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default RootComponent;
