import React, { useEffect } from "react";
import NavBarComponent from "./NavBarComponent";
import { Box, Grid } from "@mui/material";
import SideBarComponent from "./SideBarComponent";
import { Outlet, useNavigate } from "react-router-dom";

export default function RootComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

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
}
