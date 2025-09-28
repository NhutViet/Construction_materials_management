import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Help as QuestionIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';

// Transition component for slide effect
const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Transition component for fade effect
const FadeTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question';
export type AlertVariant = 'alert' | 'confirmation';

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message: string;
  type?: AlertType;
  variant?: AlertVariant;
  confirmText?: string;
  cancelText?: string;
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  transition?: 'slide' | 'fade';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showIcon?: boolean;
  customIcon?: React.ReactNode;
}

const AlertModal: React.FC<AlertModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  variant = 'alert',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000,
  transition = 'slide',
  maxWidth = 'sm',
  fullWidth = true,
  showIcon = true,
  customIcon
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Auto close effect
  useEffect(() => {
    if (autoClose && open) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, open, autoCloseDelay, onClose]);

  // Get icon and colors based on type
  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: <SuccessIcon />,
          iconColor: theme.palette.success.main,
          titleColor: theme.palette.success.main,
          bgColor: theme.palette.success.light + '20'
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          iconColor: theme.palette.error.main,
          titleColor: theme.palette.error.main,
          bgColor: theme.palette.error.light + '20'
        };
      case 'warning':
        return {
          icon: <WarningIcon />,
          iconColor: theme.palette.warning.main,
          titleColor: theme.palette.warning.main,
          bgColor: theme.palette.warning.light + '20'
        };
      case 'question':
        return {
          icon: <QuestionIcon />,
          iconColor: theme.palette.primary.main,
          titleColor: theme.palette.primary.main,
          bgColor: theme.palette.primary.light + '20'
        };
      default: // info
        return {
          icon: <InfoIcon />,
          iconColor: theme.palette.info.main,
          titleColor: theme.palette.info.main,
          bgColor: theme.palette.info.light + '20'
        };
    }
  };

  const { icon, iconColor, titleColor, bgColor } = getIconAndColors();
  const TransitionComponent = transition === 'fade' ? FadeTransition : SlideTransition;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      TransitionComponent={TransitionComponent}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          boxShadow: theme.shadows[24],
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: bgColor,
          position: 'relative'
        }}
      >
        {showIcon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: iconColor + '20',
              color: iconColor,
              flexShrink: 0
            }}
          >
            {customIcon || icon}
          </Box>
        )}
        
        <Box sx={{ flex: 1 }}>
          {title && (
            <Typography
              variant="h6"
              sx={{
                color: titleColor,
                fontWeight: 600,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              {title}
            </Typography>
          )}
        </Box>

        {showCloseButton && (
          <IconButton
            onClick={handleClose}
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
        )}
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
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
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.primary,
            lineHeight: 1.6,
            fontSize: isMobile ? '0.95rem' : '1rem',
            whiteSpace: 'pre-line'
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      {variant === 'confirmation' && (
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            gap: 1,
            justifyContent: variant === 'confirmation' ? 'flex-end' : 'center'
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: iconColor,
              '&:hover': {
                bgcolor: iconColor,
                filter: 'brightness(0.9)'
              }
            }}
          >
            {confirmText}
          </Button>
        </DialogActions>
      )}

      {variant === 'alert' && (
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            justifyContent: 'center'
          }}
        >
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              minWidth: 120,
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: iconColor,
              '&:hover': {
                bgcolor: iconColor,
                filter: 'brightness(0.9)'
              }
            }}
          >
            {confirmText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AlertModal;
