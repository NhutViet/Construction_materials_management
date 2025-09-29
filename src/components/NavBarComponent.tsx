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
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  NotificationsOutlined,
  Settings,
  Logout,
  AccountCircleOutlined,
  MarkAsUnread,
  Delete,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import { 
  fetchNotifications, 
  loadMoreNotifications,
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsLoadingMore,
  selectNotificationsHasMore,
  selectNotificationsDeleting,
  selectNotificationsError,
  Notification,
  NotificationStatus,
  NotificationPriority,
  NotificationType
} from "../store/slices/notificationSlice";
import { useNotificationPolling } from "../hooks/useNotificationPolling";

interface NavBarComponentProps {
  onMenuClick?: () => void;
}

const NavBarComponent: React.FC<NavBarComponentProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Notification state
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const isLoading = useSelector(selectNotificationsLoading);
  const isLoadingMore = useSelector(selectNotificationsLoadingMore);
  const hasMore = useSelector(selectNotificationsHasMore);
  const isDeleting = useSelector(selectNotificationsDeleting);
  const error = useSelector(selectNotificationsError);
  
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
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

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    setAnchorEl(null);
  };

  // Fetch notifications and unread count on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications({ limit: '10', sortBy: 'createdAt', sortOrder: 'desc' }));
      dispatch(getUnreadCount());
    }
  }, [dispatch, user]);

  // Start polling for unread count updates
  useNotificationPolling({ 
    enabled: !!user, // Only poll when user is logged in
    interval: 30000 // Poll every 30 seconds
  });

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === NotificationStatus.UNREAD) {
      try {
        console.log('Marking notification as read:', notification._id, notification);
        
        // Validate ID before making API call
        if (!notification._id || notification._id.trim() === '') {
          console.error('Invalid notification ID:', notification._id);
          setSnackbarMessage('ID thông báo không hợp lệ');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
        
        await dispatch(markAsRead(notification._id)).unwrap();
        console.log('Successfully marked notification as read');
        // Optionally show success message
        // setSnackbarMessage('Đã đánh dấu thông báo là đã đọc');
        // setSnackbarSeverity('success');
        // setSnackbarOpen(true);
      } catch (error: any) {
        console.error('Failed to mark notification as read:', error);
        console.error('Notification ID:', notification._id);
        console.error('Full notification object:', notification);
        
        // Show user-friendly error message
        setSnackbarMessage('Có lỗi xảy ra khi đánh dấu thông báo: ' + error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  // Handle delete notification with confirmation
  const handleDeleteNotification = (notification: Notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };

  // Confirm delete notification
  const confirmDeleteNotification = async () => {
    if (notificationToDelete) {
      try {
        await dispatch(deleteNotification(notificationToDelete._id)).unwrap();
        setSnackbarMessage('Xóa thông báo thành công');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error: any) {
        setSnackbarMessage(error || 'Có lỗi xảy ra khi xóa thông báo');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };

  // Cancel delete notification
  const cancelDeleteNotification = () => {
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle load more notifications
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      dispatch(loadMoreNotifications({ 
        limit: '10', 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      }));
    }
  };

  // Handle scroll in notification list
  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (isNearBottom && hasMore && !isLoadingMore) {
      handleLoadMore();
    }
  };

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'error';
      case NotificationPriority.HIGH:
        return 'warning';
      case NotificationPriority.MEDIUM:
        return 'info';
      case NotificationPriority.LOW:
        return 'default';
      default:
        return 'default';
    }
  };

  // Get type color
  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return 'primary';
      case NotificationType.INVOICE:
        return 'success';
      case NotificationType.MATERIAL:
        return 'info';
      case NotificationType.STOCK_IN:
        return 'warning';
      case NotificationType.USER:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get priority text in Vietnamese
  const getPriorityText = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'Khẩn cấp';
      case NotificationPriority.HIGH:
        return 'Cao';
      case NotificationPriority.MEDIUM:
        return 'Trung bình';
      case NotificationPriority.LOW:
        return 'Thấp';
      default:
        return priority;
    }
  };

  // Get type text in Vietnamese
  const getTypeText = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return 'Hệ thống';
      case NotificationType.INVOICE:
        return 'Hóa đơn';
      case NotificationType.MATERIAL:
        return 'Vật liệu';
      case NotificationType.STOCK_IN:
        return 'Nhập kho';
      case NotificationType.USER:
        return 'Người dùng';
      default:
        return type;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
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
    return 'Người dùng';
  };

  return (
    <Grid container>
      <Grid item md={12}>
        <Paper elevation={4}>
          <AppBar 
            sx={{ 
              padding: { xs: 1, sm: 2 },
              height: '64px',
              display: 'flex',
              justifyContent: 'center'
            }} 
            position="static"
          >
            <Container maxWidth="xl">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Mobile Menu Button */}
                {isMobile && (
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}

                <Typography
                  variant="h6"
                  component="a"
                  href="/dashboard"
                  sx={{
                    mx: 2,
                    display: { xs: isMobile ? "block" : "none", md: "flex" },
                    fontWeight: 700,
                    letterSpacing: ".2rem",
                    color: "inherit",
                    textDecoration: "none",
                    fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                    flex: 1,
                    textAlign: { xs: "center", md: "left" }
                  }}
                >
                  {isMobile ? "QL Vật liệu" : "Hệ thống quản lý vật liệu xây dựng"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "right",
                    alignItems: "center",
                  }}
                >
                  <IconButton color="inherit" onClick={handleNotificationClicked}>
                    <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                      <NotificationsOutlined
                        sx={{ width: 32, height: 32 }}
                      />
                    </Badge>
                  </IconButton>
                  <Menu
                    open={notificationOpen}
                    anchorEl={notificationAnchorEl}
                    onClose={notificationHandleClose}
                    PaperProps={{
                      sx: { width: 400, maxHeight: 500 }
                    }}
                  >
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Thông báo</Typography>
                        {unreadCount > 0 && (
                          <Button 
                            size="small" 
                            onClick={handleMarkAllAsRead}
                            startIcon={<MarkAsUnread />}
                          >
                            Đọc tất cả
                          </Button>
                        )}
                      </Box>
                    </Box>
                    
                    {isLoading ? (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography>Đang tải...</Typography>
                      </Box>
                    ) : notifications.length === 0 ? (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">Không có thông báo nào</Typography>
                      </Box>
                    ) : (
                      <List 
                        sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}
                        onScroll={handleScroll}
                      >
                        {notifications.map((notification) => (
                          <ListItem
                            key={notification._id}
                            sx={{
                              borderBottom: 1,
                              borderColor: 'divider',
                              backgroundColor: notification.status === NotificationStatus.UNREAD ? 'action.hover' : 'transparent',
                              '&:hover': {
                                backgroundColor: 'action.selected',
                              },
                              cursor: 'pointer'
                            }}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                      fontWeight: notification.status === NotificationStatus.UNREAD ? 'bold' : 'normal',
                                      flex: 1
                                    }}
                                  >
                                    {notification.title}
                                  </Typography>
                                  <Chip
                                    label={getPriorityText(notification.priority)}
                                    size="small"
                                    color={getPriorityColor(notification.priority) as any}
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                  >
                                    {notification.message}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <Chip
                                        label={getTypeText(notification.type)}
                                        size="small"
                                        color={getTypeColor(notification.type) as any}
                                        variant="filled"
                                      />
                                      {notification.isAutoGenerated && (
                                        <Chip
                                          label="Tự động"
                                          size="small"
                                          color="default"
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(notification.createdAt)}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification);
                              }}
                              sx={{ ml: 1 }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Delete color="error" fontSize="small" />
                              )}
                            </IconButton>
                          </ListItem>
                        ))}
                        {isLoadingMore && (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography color="text.secondary">Đang tải thêm...</Typography>
                          </Box>
                        )}
                        {!hasMore && notifications.length > 0 && (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography color="text.secondary">Đã hiển thị tất cả thông báo</Typography>
                          </Box>
                        )}
                      </List>
                    )}
                  </Menu>
                  <IconButton
                    onClick={handleAvatarClicked}
                    size="small"
                    sx={{ mx: 2 }}
                    aria-haspopup="true"
                  >
                    <Tooltip title="Cài đặt tài khoản">
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
                  <MenuItem onClick={handleProfileClick}>
                    <ListItemIcon>
                      <AccountCircleOutlined fontSize="small" />
                    </ListItemIcon>
                    Thông tin cá nhân
                  </MenuItem>
                  <Divider />            
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteNotification}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa thông báo
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa thông báo "{notificationToDelete?.title}" không? 
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteNotification} disabled={isDeleting}>
            Hủy
          </Button>
          <Button 
            onClick={confirmDeleteNotification} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default NavBarComponent;
