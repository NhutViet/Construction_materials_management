import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MaterialForm from './MaterialForm';

interface MaterialModalProps {
  open: boolean;
  onClose: () => void;
  material?: any; // Material object for editing, undefined for creating new
  onSuccess?: () => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({
  open,
  onClose,
  material,
  onSuccess
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <span>
          {material ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </span>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          // Responsive padding for different screen sizes
          '& .MuiBox-root': {
            p: { xs: 2, sm: 2.5, md: 3 }, // Responsive padding
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[100],
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: theme.palette.grey[600],
            },
          },
        }}
      >
        <MaterialForm
          material={material}
          onClose={onClose}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MaterialModal;
