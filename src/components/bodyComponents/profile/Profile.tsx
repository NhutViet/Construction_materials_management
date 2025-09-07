import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Person,
  Email,
  Phone,
  AccountBalance,
  CreditCard,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { getUserProfile, updateUserProfile } from '../../../store/slices/authSlice';
import { useBanks, Bank } from '../../../hooks/useBanks';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isProfileLoading, error } = useSelector((state: RootState) => state.auth);
  const { banks, loading: banksLoading, error: banksError } = useBanks();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    bankNumber: '',
    bankName: '',
  });
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData({
        fullname: user.fullname || '',
        phoneNumber: user.phoneNumber || '',
        bankNumber: user.bankNumber || '',
        bankName: user.bankName || '',
      });
      
      // Tìm ngân hàng đã chọn từ danh sách
      if (user.bankName && banks.length > 0) {
        const foundBank = banks.find(bank => 
          bank.name === user.bankName || 
          bank.shortName === user.bankName ||
          bank.code === user.bankName
        );
        setSelectedBank(foundBank || null);
      }
    }
  }, [user, banks]);

  const handleEditClick = () => {
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const dataToUpdate = {
        ...editData,
        bankName: selectedBank?.name || editData.bankName,
      };
      await dispatch(updateUserProfile(dataToUpdate)).unwrap();
      setIsEditMode(false);
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      fullname: user?.fullname || '',
      phoneNumber: user?.phoneNumber || '',
      bankNumber: user?.bankNumber || '',
      bankName: user?.bankName || '',
    });
    
    // Reset selected bank
    if (user?.bankName && banks.length > 0) {
      const foundBank = banks.find(bank => 
        bank.name === user.bankName || 
        bank.shortName === user.bankName ||
        bank.code === user.bankName
      );
      setSelectedBank(foundBank || null);
    } else {
      setSelectedBank(null);
    }
    
    setIsEditMode(false);
    setOpenDialog(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUserInitials = () => {
    if (user?.fullname) {
      return user.fullname.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (isProfileLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Đang tải thông tin...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Không tìm thấy thông tin người dùng</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Thông tin cá nhân
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                {user.fullname || user.username}
              </Typography>
        
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEditClick}
                fullWidth
              >
                Chỉnh sửa thông tin
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Information Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Chi tiết thông tin
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tên đăng nhập
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.username}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.fullname || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {user.email && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {user.phoneNumber && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.phoneNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {user.bankName && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ngân hàng
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.bankName}
                        </Typography>
                        {selectedBank && selectedBank.shortName && selectedBank.shortName !== user.bankName && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            ({selectedBank.shortName})
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                )}

                {user.bankNumber && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CreditCard sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Số tài khoản
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.bankNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={editData.fullname}
                onChange={(e) => handleInputChange('fullname', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={editData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={banks}
                getOptionLabel={(option) => option.name}
                value={selectedBank}
                onChange={(event, newValue) => {
                  setSelectedBank(newValue);
                  if (newValue) {
                    handleInputChange('bankName', newValue.name);
                  } else {
                    handleInputChange('bankName', '');
                  }
                }}
                loading={banksLoading}
                filterOptions={(options, { inputValue }) => {
                  const filtered = options.filter((option) => {
                    const searchTerm = inputValue.toLowerCase();
                    return (
                      option.name.toLowerCase().includes(searchTerm) ||
                      option.shortName.toLowerCase().includes(searchTerm) ||
                      option.code.toLowerCase().includes(searchTerm) ||
                      option.bin.includes(searchTerm)
                    );
                  });
                  return filtered;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn ngân hàng"
                    placeholder="Tìm kiếm theo tên, mã ngân hàng, BIN..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {banksLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      loading="lazy"
                      width="20"
                      src={option.logo}
                      alt={option.name}
                      style={{ marginRight: 8 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.code} - {option.shortName} - BIN: {option.bin}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      {option.transferSupported === 1 && (
                        <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem' }}>
                          ✓ Chuyển tiền
                        </Typography>
                      )}
                      {option.lookupSupported === 1 && (
                        <Typography variant="caption" color="info.main" sx={{ fontSize: '0.7rem' }}>
                          ✓ Tra cứu
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                noOptionsText="Không tìm thấy ngân hàng phù hợp"
                loadingText="Đang tải danh sách ngân hàng..."
                clearOnEscape
                selectOnFocus
                handleHomeEndKeys
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số tài khoản"
                value={editData.bankNumber}
                onChange={(e) => handleInputChange('bankNumber', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
