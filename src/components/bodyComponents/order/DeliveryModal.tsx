import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LocalShipping as LocalShippingIcon } from '@mui/icons-material';
import { AppDispatch } from '../../../store';
import { createDelivery, Invoice } from '../../../store/slices/invoiceSlice';

interface DeliveryModalProps {
  invoice: Invoice | null;
  open: boolean;
  mode: 'partial' | 'all';
  initialItemIndex?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const nowLocalInput = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatQuantity = (value: number) => Number(value || 0).toLocaleString('vi-VN');

const DeliveryModal: React.FC<DeliveryModalProps> = ({
  invoice,
  open,
  mode,
  initialItemIndex = null,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState('');
  const [deliveredAt, setDeliveredAt] = useState(nowLocalInput());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!invoice) return [];
    return invoice.items
      .map((item, index) => {
        const ordered = Number(item.quantity || 0);
        const delivered = Number(item.deliveredQuantity || 0);
        return {
          item,
          index,
          ordered,
          delivered,
          remaining: Math.max(0, ordered - delivered),
        };
      })
      .filter((row) => row.remaining > 0)
      .filter((row) => (mode === 'partial' && initialItemIndex !== null ? row.index === initialItemIndex : true));
  }, [invoice, mode, initialItemIndex]);

  useEffect(() => {
    if (!open) return;
    const next: Record<number, string> = {};
    rows.forEach((row) => {
      next[row.index] = mode === 'all' ? String(row.remaining) : '';
    });
    setQuantities(next);
    setNotes('');
    setDeliveredAt(nowLocalInput());
    setError(null);
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?._id, mode, initialItemIndex]);

  const totalToDeliver = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const value = Number(quantities[row.index] || 0);
        return acc + (Number.isFinite(value) && value > 0 ? Math.min(value, row.remaining) : 0);
      }, 0),
    [rows, quantities]
  );

  const handleQuantityChange = (index: number, value: string, max: number) => {
    if (value === '') {
      setQuantities((prev) => ({ ...prev, [index]: '' }));
      return;
    }
    const next = Math.max(0, Math.min(max, Number(value)));
    setQuantities((prev) => ({ ...prev, [index]: String(Number.isFinite(next) ? next : 0) }));
  };

  const handleSubmit = async () => {
    if (!invoice) return;
    setError(null);

    const items = rows
      .map((row) => ({
        itemIndex: row.index,
        quantity: Math.min(row.remaining, Number(quantities[row.index] || 0)),
      }))
      .filter((entry) => entry.quantity > 0);

    if (!items.length) {
      setError('Vui lòng nhập số lượng giao cho ít nhất một mặt hàng.');
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        createDelivery({
          id: invoice._id,
          data: {
            items,
            notes: notes.trim() || undefined,
            deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : undefined,
          },
        })
      ).unwrap();
      onSuccess();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Không thể ghi nhận giao hàng.');
    } finally {
      setSaving(false);
    }
  };

  const isAllMode = mode === 'all';
  const title = isAllMode ? 'Xác nhận giao toàn bộ phần còn lại' : 'Ghi nhận giao hàng một phần';

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalShippingIcon color="primary" />
        {title}
      </DialogTitle>

      <DialogContent dividers>
        {invoice && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hóa đơn <strong>{invoice.invoiceNumber}</strong>
            {invoice.customerName ? ` · ${invoice.customerName}` : ''}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {rows.length === 0 ? (
          <Alert severity="success">Hóa đơn này đã giao đủ số lượng.</Alert>
        ) : (
          <>
            {isAllMode && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Hệ thống sẽ ghi nhận giao toàn bộ số lượng còn lại của {rows.length} mặt hàng.
              </Alert>
            )}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Mặt hàng</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Đặt</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Đã giao</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Còn lại</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>
                      Giao lần này
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.index}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.item.materialName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatQuantity(row.ordered)}</TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatQuantity(row.delivered)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={`${formatQuantity(row.remaining)} ${row.item.unit || ''}`}
                          color="warning"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {isAllMode ? (
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatQuantity(row.remaining)} {row.item.unit || ''}
                          </Typography>
                        ) : (
                          <TextField
                            size="small"
                            type="number"
                            value={quantities[row.index] ?? ''}
                            onChange={(event) =>
                              handleQuantityChange(row.index, event.target.value, row.remaining)
                            }
                            disabled={saving}
                            placeholder="0"
                            inputProps={{ min: 0, max: row.remaining }}
                            sx={{ width: 120 }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
                onChange={(event) => setDeliveredAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={saving}
              />
              <TextField
                label="Ghi chú (không bắt buộc)"
                size="small"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={saving}
                placeholder="VD: giao đợt 1, xe 29C-12345..."
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: { xs: 0, sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
          Tổng giao lần này: <strong>{formatQuantity(totalToDeliver)}</strong>
        </Typography>
        <Button onClick={onClose} disabled={saving}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || rows.length === 0 || totalToDeliver <= 0}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <LocalShippingIcon />}
        >
          {saving ? 'Đang lưu...' : isAllMode ? 'Xác nhận giao hết' : 'Xác nhận giao'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryModal;
