import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
        {user.fullname || user.username}
      </Typography>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {user.fullname ? user.fullname.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">Hồ sơ</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">Cài đặt</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Typography variant="body2" color="error">
            Đăng xuất
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;
