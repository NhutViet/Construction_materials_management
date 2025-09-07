import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { processPayment } from '../../../store/slices/invoiceSlice';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
  onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  onClose, 
  invoice, 
  onSuccess 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.invoice);
  
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePaymentAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setPaymentAmount(value);
    setError('');
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleSubmit = async () => {
    if (!invoice) return;

    // Validation
    if (paymentAmount <= 0) {
      setError('Số tiền thanh toán phải lớn hơn 0');
      return;
    }

    if (paymentAmount > (invoice.remainingAmount || invoice.totalAmount)) {
      setError('Số tiền thanh toán không được vượt quá số tiền còn lại');
      return;
    }

    try {
      await dispatch(processPayment({
        id: invoice._id,
        data: {
          amount: paymentAmount,
          notes: notes.trim() || undefined
        }
      })).unwrap();

      // Reset form
      setPaymentAmount(0);
      setNotes('');
      setError('');

      // Close modal and call success callback
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setError(error || 'Có lỗi xảy ra khi xử lý thanh toán');
    }
  };

  const handleClose = () => {
    setPaymentAmount(0);
    setNotes('');
    setError('');
    onClose();
  };

  if (!invoice) return null;

  const remainingAmount = invoice.remainingAmount || invoice.totalAmount;
  const paidAmount = invoice.paidAmount || 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaymentIcon color="primary" />
        <Typography variant="h6">
          Thanh toán hóa đơn
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Hóa đơn: {invoice.invoiceNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Khách hàng: {invoice.customerName}
          </Typography>
        </Box>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Thông tin thanh toán
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Tổng tiền hóa đơn:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {invoice.totalAmount?.toLocaleString()} VNĐ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Đã thanh toán:</Typography>
            <Typography variant="body2" color="success.main">
              {paidAmount?.toLocaleString()} VNĐ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" fontWeight="bold">Còn lại:</Typography>
            <Typography variant="body2" fontWeight="bold" color="error.main">
              {remainingAmount?.toLocaleString()} VNĐ
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Số tiền thanh toán"
          type="number"
          value={paymentAmount || ''}
          onChange={handlePaymentAmountChange}
          placeholder="Nhập số tiền thanh toán"
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: <Typography variant="body2" color="text.secondary">VNĐ</Typography>
          }}
          helperText={`Tối đa: ${remainingAmount?.toLocaleString()} VNĐ`}
        />

        <TextField
          fullWidth
          label="Ghi chú (tùy chọn)"
          multiline
          rows={3}
          value={notes}
          onChange={handleNotesChange}
          placeholder="Nhập ghi chú về thanh toán..."
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <PaymentIcon />}
          disabled={isLoading || paymentAmount <= 0}
          sx={{ 
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' }
          }}
        >
          {isLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
