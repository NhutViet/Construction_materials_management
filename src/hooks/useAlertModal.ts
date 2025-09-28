import { useState, useCallback } from 'react';
import { AlertType, AlertVariant } from '../components/bodyComponents/components/AlertModal';

interface AlertModalState {
  open: boolean;
  title?: string;
  message: string;
  type: AlertType;
  variant: AlertVariant;
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
  onConfirm?: () => void;
}

const initialState: AlertModalState = {
  open: false,
  message: '',
  type: 'info',
  variant: 'alert',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  showCloseButton: true,
  autoClose: false,
  autoCloseDelay: 3000,
  transition: 'slide',
  maxWidth: 'sm',
  fullWidth: true,
  showIcon: true,
};

export const useAlertModal = () => {
  const [state, setState] = useState<AlertModalState>(initialState);

  const showAlert = useCallback((config: Partial<AlertModalState>) => {
    setState(prev => ({
      ...prev,
      ...config,
      open: true,
    }));
  }, []);

  const hideAlert = useCallback(() => {
    setState(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  // Convenience methods for different alert types
  const showSuccess = useCallback((message: string, title?: string, config?: Partial<AlertModalState>) => {
    showAlert({
      message,
      title,
      type: 'success',
      variant: 'alert',
      ...config,
    });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string, config?: Partial<AlertModalState>) => {
    showAlert({
      message,
      title,
      type: 'error',
      variant: 'alert',
      ...config,
    });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string, config?: Partial<AlertModalState>) => {
    showAlert({
      message,
      title,
      type: 'warning',
      variant: 'alert',
      ...config,
    });
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string, config?: Partial<AlertModalState>) => {
    showAlert({
      message,
      title,
      type: 'info',
      variant: 'alert',
      ...config,
    });
  }, [showAlert]);

  const showQuestion = useCallback((message: string, title?: string, config?: Partial<AlertModalState>) => {
    showAlert({
      message,
      title,
      type: 'question',
      variant: 'alert',
      ...config,
    });
  }, [showAlert]);

  // Confirmation methods
  const showConfirm = useCallback((
    message: string, 
    onConfirm: () => void, 
    title?: string, 
    config?: Partial<AlertModalState>
  ) => {
    showAlert({
      message,
      title,
      type: 'question',
      variant: 'confirmation',
      onConfirm,
      ...config,
    });
  }, [showAlert]);

  const showConfirmDelete = useCallback((
    message: string, 
    onConfirm: () => void, 
    title?: string, 
    config?: Partial<AlertModalState>
  ) => {
    showAlert({
      message,
      title: title || 'Xác nhận xóa',
      type: 'error',
      variant: 'confirmation',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm,
      ...config,
    });
  }, [showAlert]);

  const showConfirmSave = useCallback((
    message: string, 
    onConfirm: () => void, 
    title?: string, 
    config?: Partial<AlertModalState>
  ) => {
    showAlert({
      message,
      title: title || 'Xác nhận lưu',
      type: 'question',
      variant: 'confirmation',
      confirmText: 'Lưu',
      cancelText: 'Hủy',
      onConfirm,
      ...config,
    });
  }, [showAlert]);

  // Auto-close methods
  const showSuccessAuto = useCallback((
    message: string, 
    title?: string, 
    delay: number = 3000,
    config?: Partial<AlertModalState>
  ) => {
    showAlert({
      message,
      title,
      type: 'success',
      variant: 'alert',
      autoClose: true,
      autoCloseDelay: delay,
      ...config,
    });
  }, [showAlert]);

  const showErrorAuto = useCallback((
    message: string, 
    title?: string, 
    delay: number = 5000,
    config?: Partial<AlertModalState>
  ) => {
    showAlert({
      message,
      title,
      type: 'error',
      variant: 'alert',
      autoClose: true,
      autoCloseDelay: delay,
      ...config,
    });
  }, [showAlert]);

  const showInfoAuto = useCallback((
    message: string, 
    title?: string, 
    delay: number = 3000,
    config?: Partial<AlertModalState>
  ) => {
    showAlert({
      message,
      title,
      type: 'info',
      variant: 'alert',
      autoClose: true,
      autoCloseDelay: delay,
      ...config,
    });
  }, [showAlert]);

  return {
    // State
    ...state,
    
    // Actions
    showAlert,
    hideAlert,
    
    // Alert methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showQuestion,
    
    // Confirmation methods
    showConfirm,
    showConfirmDelete,
    showConfirmSave,
    
    // Auto-close methods
    showSuccessAuto,
    showErrorAuto,
    showInfoAuto,
  };
};

export default useAlertModal;
