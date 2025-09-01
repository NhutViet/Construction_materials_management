import {
  Box,
  Grid,
  AppBar,
  Container,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  NotificationsOutlined,
  Settings,
  Logout,
  AccountCircleOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { logout } from "../store/slices/authSlice";

const NavBarComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);
  
  const handleAvatarClicked = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationClicked = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const notificationHandleClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setAnchorEl(null);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.fullname) {
      return user.fullname.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.fullname) {
      return user.fullname;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  return (
    <Grid container>
      <Grid item md={12}>
        <Paper elevation={4}>
          <AppBar sx={{ padding: 2 }} position="static">
            <Container maxWidth="xl">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  component="a"
                  href="/dashboard"
                  sx={{
                    mx: 2,
                    display: { xs: "none", md: "flex" },
                    fontWeight: 700,
                    letterSpacing: ".2rem",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Quản lý vật liệu xây dựng
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "right",
                    alignItems: "center",
                  }}
                >
                  <IconButton color="inherit" onClick={handleNotificationClicked}>
                    <Badge variant="dot" color="error" invisible={false}>
                      <NotificationsOutlined
                        sx={{ width: 32, height: 32 }}
                      />
                    </Badge>
                  </IconButton>
                  <Menu
                    open={notificationOpen}
                    anchorEl={notificationAnchorEl}
                    onClick={notificationHandleClose}
                    onClose={notificationHandleClose}
                  >
                    <MenuItem>Notification number 1 </MenuItem>
                    <Divider />
                    <MenuItem>Notification number 2</MenuItem>
                    <MenuItem>Notification number 3</MenuItem>
                  </Menu>
                  <IconButton
                    onClick={handleAvatarClicked}
                    size="small"
                    sx={{ mx: 2 }}
                    aria-haspopup="true"
                  >
                    <Tooltip title="account settings">
                      <Avatar sx={{ width: 32, height: 32 }}>{getUserInitials()}</Avatar>
                    </Tooltip>
                  </IconButton>
                  <Typography fontFamily={"Inter"}>{getDisplayName()}</Typography>
                </Box>

                <Menu
                  open={open}
                  anchorEl={anchorEl}
                  onClick={handleClose}
                  onClose={handleClose}
                >
                  <MenuItem>
                    <ListItemIcon>
                      <AccountCircleOutlined fontSize="small" />
                    </ListItemIcon>
                    Hồ sơ
                  </MenuItem>
                  <Divider />

                  <MenuItem>
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>
                    Cài đặt
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            </Container>
          </AppBar>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default NavBarComponent;
