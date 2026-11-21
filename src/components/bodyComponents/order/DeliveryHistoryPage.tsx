import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as LocalShippingIcon,
  History as HistoryIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../../store';
import {
  createDelivery,
  fetchDeliveryHistory,
  fetchInvoiceById,
} from '../../../store/slices/invoiceSlice';

const nowLocalInput = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—';

const formatCurrency = (value?: number) =>
  `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;

const statusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý';
    case 'confirmed':
      return 'Đang xử lý / giao một phần';
    case 'delivered':
      return 'Đã giao đủ';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const statusColor = (status: string): any => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'confirmed':
      return 'info';
    case 'cancelled':
      return 'error';
    default:
      return 'warning';
  }
};

const DeliveryHistoryPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    selectedInvoice,
    deliveryHistory,
    deliveryHistoryLoading,
    deliverySaving,
    error,
  } = useSelector((state: RootState) => state.invoice);

  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState('');
  const [deliveredAt, setDeliveredAt] = useState(nowLocalInput());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const loadData = () => {
    if (!invoiceId) return;
    dispatch(fetchInvoiceById(invoiceId));
    dispatch(fetchDeliveryHistory(invoiceId));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, dispatch]);

  const historyItems = deliveryHistory?.items || [];
  const summary = deliveryHistory?.summary;
  const activeInvoice =
    selectedInvoice && selectedInvoice._id === invoiceId ? selectedInvoice : null;
  const headerInvoiceNumber = deliveryHistory?.invoiceNumber || activeInvoice?.invoiceNumber || '';
  const headerCustomerName = deliveryHistory?.customerName || activeInvoice?.customerName || '';
  const headerCustomerPhone = deliveryHistory?.customerPhone || activeInvoice?.customerPhone || '';

  const totalToDeliver = useMemo(
    () =>
      Object.values(quantities).reduce((acc, value) => {
        const n = Number(value);
        return acc + (Number.isFinite(n) && n > 0 ? n : 0);
      }, 0),
    [quantities]
  );

  const handleQuantityChange = (itemIndex: number, value: string, max: number) => {
    if (value === '') {
      setQuantities((prev) => ({ ...prev, [itemIndex]: '' }));
      return;
    }
    const n = Math.max(0, Math.min(max, Number(value)));
    setQuantities((prev) => ({ ...prev, [itemIndex]: String(Number.isFinite(n) ? n : 0) }));
  };

  const handleSubmit = async () => {
    if (!invoiceId) return;
    setLocalError(null);
    setSuccessMessage(null);

    const items = Object.entries(quantities)
      .map(([index, value]) => ({ itemIndex: Number(index), quantity: Number(value) }))
      .filter((entry) => entry.quantity > 0);

    if (!items.length) {
      setLocalError('Vui lòng nhập số lượng giao cho ít nhất một mặt hàng.');
      return;
    }

    try {
      await dispatch(
        createDelivery({
          id: invoiceId,
          data: {
            items,
            notes: notes.trim() || undefined,
            deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : undefined,
          },
        })
      ).unwrap();
      setQuantities({});
      setNotes('');
      setDeliveredAt(nowLocalInput());
      setSuccessMessage(`Đã ghi nhận giao ${totalToDeliver} đơn vị.`);
      loadData();
    } catch (err: any) {
      setLocalError(typeof err === 'string' ? err : 'Không thể ghi nhận giao hàng.');
    }
  };

  if (deliveryHistoryLoading && !deliveryHistory) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard/orders')}>
          Quay lại
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Giao hàng & lịch sử giao hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {headerInvoiceNumber || '—'}
            {headerCustomerName ? ` · ${headerCustomerName}` : ''}
            {headerCustomerPhone ? ` · ${headerCustomerPhone}` : ''}
          </Typography>
        </Box>
        {activeInvoice && (
          <Chip
            label={statusLabel(activeInvoice.status)}
            color={statusColor(activeInvoice.status)}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {localError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
          {localError}
        </Alert>
      )}
      {error && !localError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: 'Tổng số lượng', value: summary?.totalQuantity ?? 0, suffix: '' },
          { label: 'Đã giao', value: summary?.deliveredQuantity ?? 0, suffix: '' },
          { label: 'Còn lại', value: summary?.remainingQuantity ?? 0, suffix: '' },
          { label: 'Số lần giao', value: summary?.totalBatches ?? 0, suffix: '' },
        ].map((card) => (
          <Paper key={card.label} elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {card.value.toLocaleString('vi-VN')}
              {card.suffix}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocalShippingIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Ghi nhận giao hàng hôm nay
          </Typography>
        </Box>

        {historyItems.length === 0 ? (
          <Alert severity="info">Hóa đơn này chưa có mặt hàng.</Alert>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Mặt hàng</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Đặt</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Đã giao</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Còn lại</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, minWidth: 140 }}>
                      Giao lần này
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyItems.map((item) => {
                    const progress = item.orderedQuantity
                      ? Math.min(100, (item.deliveredQuantity / item.orderedQuantity) * 100)
                      : 0;
                    const remaining = Math.max(0, item.remainingQuantity);
                    return (
                      <TableRow key={item.itemIndex}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.materialName}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            color={progress >= 100 ? 'success' : 'primary'}
                            sx={{ height: 6, borderRadius: 3, mt: 0.75, maxWidth: 220 }}
                          />
                        </TableCell>
                        <TableCell align="right">{item.orderedQuantity.toLocaleString('vi-VN')}</TableCell>
                        <TableCell align="right">{item.deliveredQuantity.toLocaleString('vi-VN')}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={`${remaining.toLocaleString('vi-VN')} ${item.unit}`}
                            color={remaining === 0 ? 'success' : 'warning'}
                            variant={remaining === 0 ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={quantities[item.itemIndex] ?? ''}
                            onChange={(e) => handleQuantityChange(item.itemIndex, e.target.value, remaining)}
                            disabled={remaining === 0 || deliverySaving}
                            placeholder="0"
                            inputProps={{ min: 0, max: remaining }}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mt: 2,
              }}
            >
              <TextField
                label="Thời điểm giao"
                type="datetime-local"
                size="small"
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={deliverySaving}
              />
              <TextField
                label="Ghi chú (không bắt buộc)"
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={deliverySaving}
                placeholder="VD: giao đợt 1, xe 29C-12345..."
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Tổng giao lần này: <strong>{totalToDeliver.toLocaleString('vi-VN')}</strong>
              </Typography>
              <Button
                variant="contained"
                startIcon={deliverySaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={deliverySaving || totalToDeliver <= 0}
              >
                {deliverySaving ? 'Đang lưu...' : 'Xác nhận giao'}
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Lịch sử giao hàng
          </Typography>
        </Box>

        {!deliveryHistory?.batches?.length ? (
          <Alert severity="info">Chưa có lần giao hàng nào được ghi nhận.</Alert>
        ) : (
          deliveryHistory.batches.map((batch, batchIndex) => (
            <Box key={batch.batchId} sx={{ mb: batchIndex === deliveryHistory.batches.length - 1 ? 0 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip size="small" color="primary" label={`Đợt ${deliveryHistory.batches.length - batchIndex}`} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {formatDateTime(batch.deliveredAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  · {batch.totalQuantity.toLocaleString('vi-VN')} đơn vị
                </Typography>
                {batch.deliveredByName && (
                  <Typography variant="body2" color="text.secondary">
                    · {batch.deliveredByName}
                  </Typography>
                )}
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Mặt hàng</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Số lượng giao</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ghi chú</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batch.items.map((item) => (
                      <TableRow key={item.recordId}>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell align="right">
                          {item.quantity.toLocaleString('vi-VN')} {item.unit}
                        </TableCell>
                        <TableCell>{batch.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {batchIndex !== deliveryHistory.batches.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))
        )}

        {activeInvoice && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Tổng giá trị hóa đơn: <strong>{formatCurrency(activeInvoice.totalAmount)}</strong>
              {' · '}Đã thanh toán: <strong>{formatCurrency(activeInvoice.paidAmount)}</strong>
              {' · '}Còn lại: <strong>{formatCurrency(activeInvoice.remainingAmount)}</strong>
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DeliveryHistoryPage;
