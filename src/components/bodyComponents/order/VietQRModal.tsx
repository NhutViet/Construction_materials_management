import React, { useState, useEffect } from 'react';
import {
  Box,
  Modal,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { Invoice, processPayment, updatePaymentStatus } from '../../../store/slices/invoiceSlice';
import VIETQR_CONFIG, { getBankInfoFromUser } from '../../../config/vietqrConfig';

interface VietQRModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
}

const VietQRModal: React.FC<VietQRModalProps> = ({ open, onClose, invoice, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get bank information from user profile or fallback to default config
  const bankInfo = getBankInfoFromUser(user || {});

  // Clear data when modal closes
  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccessMessage(null);
      setShowConfirmDialog(false);
      setPaymentAmount(0);
      setIsGeneratingQR(false);
      setIsConfirmingPayment(false);
    } else if (invoice) {
      // Initialize payment amount to remaining amount when modal opens
      setPaymentAmount(invoice.remainingAmount || invoice.totalAmount);
    }
  }, [open, invoice]);

  const handleGenerateQR = async () => {
    if (!invoice) return;

    // Validate payment amount
    if (paymentAmount <= 0) {
      setError('Vui lòng nhập số tiền thanh toán hợp lệ');
      return;
    }

    if (paymentAmount > (invoice.remainingAmount || invoice.totalAmount)) {
      setError('Số tiền thanh toán không được vượt quá số tiền còn lại');
      return;
    }

    // Clear any previous errors
    setError(null);
    setIsGeneratingQR(true);

    try {
      // Create a new window/tab for payment page
      const paymentWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      
      if (!paymentWindow) {
        throw new Error('Không thể mở tab mới. Vui lòng cho phép popup.');
      }

      // Generate QR code URL using VietQR service
      const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNo}-compact.jpg?amount=${paymentAmount}&addInfo=${encodeURIComponent('Thanh toan HD ' + invoice.invoiceNumber)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

      // Write the payment page HTML to the new window
      const paymentHTML = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thanh toán hóa đơn ${invoice.invoiceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              margin-bottom: 20px;
            }
            .card {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              margin-bottom: 20px;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
            }
            .qr-code {
              max-width: 300px;
              width: 100%;
              height: auto;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .info-label {
              color: #666;
              font-weight: 500;
            }
            .info-value {
              font-weight: 600;
              color: #333;
            }
            .amount {
              font-size: 24px;
              color: #1976d2;
              font-weight: 700;
            }
            .copy-btn {
              background: #1976d2;
              color: white;
              border: none;
              padding: 5px 10px;
              border-radius: 4px;
              cursor: pointer;
              margin-left: 10px;
            }
            .copy-btn:hover {
              background: #1565c0;
            }
            .confirm-btn {
              background: #4caf50;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              margin-top: 20px;
            }
            .confirm-btn:hover {
              background: #45a049;
            }
            .timer {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 20px;
            }
            .timer-value {
              font-size: 18px;
              font-weight: 600;
              color: #1976d2;
            }
            .status-chip {
              background: #ff9800;
              color: white;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 500;
            }
            .instructions {
              background: #e3f2fd;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
            }
            .instructions h4 {
              margin: 0 0 10px 0;
              color: #1976d2;
            }
            .instructions ol {
              margin: 0;
              padding-left: 20px;
            }
            .instructions li {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #1976d2; display: flex; align-items: center; gap: 10px;">
                💳 Thanh toán hóa đơn
              </h1>
              <div class="timer">
                <span>⏱️ Thời gian thanh toán:</span>
                <span class="timer-value" id="timer">00:00</span>
                <span class="status-chip">Đang chờ thanh toán</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div class="card">
                <h3 style="margin-top: 0; color: #1976d2;">📄 Thông tin hóa đơn</h3>
                <div class="info-row">
                  <span class="info-label">Số hóa đơn:</span>
                  <span class="info-value">${invoice.invoiceNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Khách hàng:</span>
                  <span class="info-value">${invoice.customerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Số tiền thanh toán:</span>
                  <span class="info-value amount">${paymentAmount?.toLocaleString()} VNĐ</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Tổng tiền hóa đơn:</span>
                  <span class="info-value">${invoice.totalAmount?.toLocaleString()} VNĐ</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Đã thanh toán:</span>
                  <span class="info-value">${(invoice.paidAmount || 0).toLocaleString()} VNĐ</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Còn lại:</span>
                  <span class="info-value">${(invoice.remainingAmount || invoice.totalAmount).toLocaleString()} VNĐ</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Thời gian tạo:</span>
                  <span class="info-value">${new Date().toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div class="card">
                <h3 style="margin-top: 0; color: #1976d2;">🏦 Thông tin tài khoản nhận tiền</h3>
                <div class="info-row">
                  <span class="info-label">Tên tài khoản:</span>
                  <span class="info-value">${bankInfo.accountName}</span>
                  <button class="copy-btn" onclick="copyToClipboard(\`${bankInfo.accountName}\`, 'accountName')">Copy</button>
                </div>
                <div class="info-row">
                  <span class="info-label">Số tài khoản:</span>
                  <span class="info-value" style="font-family: monospace;">${bankInfo.accountNo}</span>
                  <button class="copy-btn" onclick="copyToClipboard('${bankInfo.accountNo}', 'accountNo')">Copy</button>
                </div>
                <div class="info-row">
                  <span class="info-label">Ngân hàng:</span>
                  <span class="info-value">${bankInfo.bankName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Nội dung chuyển khoản:</span>
                  <span class="info-value" style="font-family: monospace;">Thanh toan HD ${invoice.invoiceNumber}</span>
                  <button class="copy-btn" onclick="copyToClipboard(\`Thanh toan HD ${invoice.invoiceNumber}\`, 'addInfo')">Copy</button>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="qr-container">
                <h3 style="margin-top: 0; color: #1976d2;">📱 Quét mã QR để thanh toán</h3>
                <img src="${qrCodeUrl}" 
                     alt="VietQR Payment Code" class="qr-code">
                
                <div class="instructions">
                  <h4>Hướng dẫn thanh toán:</h4>
                  <ol>
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Chọn chức năng "Quét mã QR" hoặc "Chuyển khoản"</li>
                    <li>Quét mã QR bên trên hoặc nhập thông tin tài khoản</li>
                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                    <li>Nhấn nút "Xác nhận đã thanh toán" bên dưới</li>
                  </ol>
                </div>

                <button class="confirm-btn" onclick="confirmPayment()">
                  ✅ Xác nhận đã thanh toán
                </button>
              </div>
            </div>
          </div>

          <script>
            let startTime = new Date();
            let timerInterval;

            function updateTimer() {
              const now = new Date();
              const elapsed = Math.floor((now - startTime) / 1000);
              const mins = Math.floor(elapsed / 60);
              const secs = elapsed % 60;
              document.getElementById('timer').textContent = 
                mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
            }

            function copyToClipboard(text, field) {
              navigator.clipboard.writeText(text).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = 'Đã copy!';
                btn.style.background = '#4caf50';
                setTimeout(() => {
                  btn.textContent = originalText;
                  btn.style.background = '#1976d2';
                }, 2000);
              }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Không thể sao chép. Vui lòng copy thủ công.');
              });
            }

            function confirmPayment() {
              const transactionId = 'TXN' + Date.now();
              if (window.opener && window.opener.handlePaymentConfirmed) {
                window.opener.handlePaymentConfirmed(transactionId);
                window.close();
              } else {
                alert('Thanh toán đã được xác nhận! Mã giao dịch: ' + transactionId);
              }
            }

            // Start timer
            timerInterval = setInterval(updateTimer, 1000);
            updateTimer();

            // Clean up on page unload
            window.addEventListener('beforeunload', () => {
              if (timerInterval) {
                clearInterval(timerInterval);
              }
            });
          </script>
        </body>
        </html>
      `;
      
      paymentWindow.document.write(paymentHTML);
      paymentWindow.document.close();
      
      // Store reference to handle payment confirmation
      (paymentWindow as any).handlePaymentConfirmed = handlePaymentConfirmed;
      
      setIsGeneratingQR(false);
    } catch (error) {
      console.error('Failed to open payment page:', error);
      setError('Không thể mở tab mới. Vui lòng cho phép popup.');
      setIsGeneratingQR(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!invoice) return;

    setIsConfirmingPayment(true);
    try {
      // Calculate new payment amounts
      const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount;
      const newRemainingAmount = invoice.totalAmount - newPaidAmount;
      
      // Determine payment status based on remaining amount
      let newPaymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
      if (newRemainingAmount <= 0) {
        newPaymentStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newPaymentStatus = 'partial';
      }

      // Process the payment
      await dispatch(processPayment({
        id: invoice._id,
        data: {
          amount: paymentAmount,
          notes: `Thanh toán QR Code`,
          paymentMethod: 'online'
        }
      })).unwrap();

      // Update payment status if needed
      if (newPaymentStatus !== invoice.paymentStatus) {
        await dispatch(updatePaymentStatus({
          id: invoice._id,
          data: {
            paymentStatus: newPaymentStatus,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            notes: `Cập nhật trạng thái thanh toán`
          }
        })).unwrap();
      }
      
      console.log('Payment confirmed successfully:', {
        invoiceId: invoice._id,
        paymentAmount: paymentAmount,
        newPaidAmount,
        newRemainingAmount,
        newPaymentStatus
      });
      
      // Show success message
      setSuccessMessage(`Thanh toán thành công! Đã thanh toán ${paymentAmount.toLocaleString()} VNĐ cho hóa đơn ${invoice.invoiceNumber}`);
      
      setShowConfirmDialog(false);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        // Call onSuccess callback to close parent modal
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      setError('Không thể xác nhận thanh toán. Vui lòng thử lại.');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handlePaymentConfirmed = (transactionId: string) => {
    setShowConfirmDialog(true);
  };

  const handleOpenConfirmDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  if (!invoice) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="vietqr-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '90%',
            maxWidth: 500,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            outline: 'none',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" id="vietqr-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeIcon color="primary" />
              Thanh toán QR Code
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Invoice Info */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin hóa đơn
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Số hóa đơn:</strong> {invoice.invoiceNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Khách hàng:</strong> {invoice.customerName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Tổng tiền:</strong> {invoice.totalAmount?.toLocaleString()} VNĐ
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Đã thanh toán:</strong> {(invoice.paidAmount || 0).toLocaleString()} VNĐ
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
              <strong>Còn lại:</strong> {(invoice.remainingAmount || invoice.totalAmount).toLocaleString()} VNĐ
            </Typography>
          </Paper>

          {/* Payment Amount Input */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'blue.50' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Số tiền thanh toán
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                type="number"
                label="Số tiền thanh toán (VNĐ)"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                disabled={isGeneratingQR}
                fullWidth
                size="small"
                inputProps={{ min: 0, max: invoice.remainingAmount || invoice.totalAmount }}
                helperText={`Tối đa: ${(invoice.remainingAmount || invoice.totalAmount).toLocaleString()} VNĐ`}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPaymentAmount(invoice.remainingAmount || invoice.totalAmount)}
                disabled={isGeneratingQR}
              >
                Tất cả
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              💡 Nhập số tiền bạn muốn thanh toán. Có thể thanh toán một phần hoặc toàn bộ số tiền còn lại.
            </Typography>
          </Paper>

          {/* Bank Account Info */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'blue.50' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin tài khoản nhận tiền
              {user?.bankNumber && user?.bankName && (
                <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                  (Từ thông tin cá nhân)
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Tên tài khoản:</strong> {bankInfo.accountName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Số tài khoản:</strong> {bankInfo.accountNo}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Ngân hàng:</strong> {bankInfo.bankName}
            </Typography>
            {!user?.bankNumber && !user?.bankName && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                💡 Để sử dụng thông tin ngân hàng cá nhân, vui lòng cập nhật trong trang Profile
              </Typography>
            )}
          </Paper>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Lỗi:
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Thành công:
              </Typography>
              <Typography variant="body2">
                {successMessage}
              </Typography>
            </Alert>
          )}

          {/* Payment Actions */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {isGeneratingQR ? (
              <Box>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Đang tạo trang thanh toán...
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Vui lòng chờ trong giây lát
                </Typography>
              </Box>
            ) : (
              <Box>
                <QrCodeIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Nhấn nút bên dưới để mở trang thanh toán với mã QR
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  onClick={handleGenerateQR}
                  disabled={isGeneratingQR}
                  size="large"
                  sx={{ mb: 2 }}
                >
                  Tạo mã QR thanh toán
                </Button>
                {error && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleGenerateQR}
                    disabled={isGeneratingQR}
                    size="small"
                    sx={{ ml: 2 }}
                  >
                    Thử lại
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Confirm Payment Section */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Sau khi thanh toán thành công, hãy xác nhận giao dịch
            </Typography>
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleOpenConfirmDialog}
              disabled={isConfirmingPayment}
            >
              Xác nhận đã thanh toán
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirm Payment Dialog */}
      <Dialog open={showConfirmDialog} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Xác nhận thanh toán</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xác nhận thanh toán này không?
          </Typography>
          
          {/* Payment Summary */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin thanh toán
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Số tiền thanh toán:</strong> {paymentAmount.toLocaleString()} VNĐ
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Hóa đơn:</strong> {invoice.invoiceNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Khách hàng:</strong> {invoice.customerName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Đã thanh toán:</strong> {(invoice.paidAmount || 0).toLocaleString()} VNĐ
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Sau thanh toán sẽ còn lại:</strong> {((invoice.remainingAmount || invoice.totalAmount) - paymentAmount).toLocaleString()} VNĐ
            </Typography>
            <Typography variant="body2" sx={{ 
              color: ((invoice.remainingAmount || invoice.totalAmount) - paymentAmount) <= 0 ? 'success.main' : 'warning.main',
              fontWeight: 'bold'
            }}>
              <strong>Trạng thái sau thanh toán:</strong> {
                ((invoice.remainingAmount || invoice.totalAmount) - paymentAmount) <= 0 ? 'Đã thanh toán đủ' : 'Còn nợ một phần'
              }
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={isConfirmingPayment}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmPayment}
            variant="contained"
            disabled={isConfirmingPayment}
            startIcon={isConfirmingPayment ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            {isConfirmingPayment ? 'Đang xác nhận...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VietQRModal;
