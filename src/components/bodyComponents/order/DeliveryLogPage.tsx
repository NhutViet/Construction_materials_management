import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  LocalShipping as LocalShippingIcon,
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../../store';
import { fetchDeliveryLog } from '../../../store/slices/invoiceSlice';
import { invoiceColor } from '../../../utils/invoiceColor';

const pad = (value: number) => String(value).padStart(2, '0');

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—';

const formatCurrency = (value?: number) =>
  `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;

const formatQuantity = (value: number) => Number(value || 0).toLocaleString('vi-VN');

const invoiceStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý';
    case 'confirmed':
      return 'Đang giao một phần';
    case 'delivered':
      return 'Đã giao đủ';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status || '—';
  }
};

const invoiceStatusColor = (status: string): any => {
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

const DeliveryLogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { deliveryLog, deliveryLogLoading, deliveryLogError } = useSelector(
    (state: RootState) => state.invoice
  );

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(
      fetchDeliveryLog({
        search: search || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        page: page + 1,
        limit: rowsPerPage,
      })
    );
  }, [dispatch, search, fromDate, toDate, page, rowsPerPage]);

  const rows = deliveryLog?.deliveries || [];
  const summary = deliveryLog?.summary;
  const total = deliveryLog?.total || 0;
  const loadingFirstTime = deliveryLogLoading && !deliveryLog;

  const applyRange = (days: number | null) => {
    if (days === null) {
      setFromDate('');
      setToDate('');
    } else {
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - (days - 1));
      setFromDate(toDateInput(start));
      setToDate(toDateInput(today));
    }
    setPage(0);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  const toggleExpanded = (key: string) => {
    setExpanded((current) => (current === key ? null : key));
  };

  const summaryCards = [
    { label: 'Số đợt giao', value: summary?.totalBatches ?? 0, format: formatQuantity },
    { label: 'Tổng số lượng', value: summary?.totalQuantity ?? 0, format: formatQuantity },
    { label: 'Số hóa đơn', value: summary?.totalInvoices ?? 0, format: formatQuantity },
    { label: 'Giá trị đã giao', value: summary?.deliveredValue ?? 0, format: formatCurrency },
  ];

  const mobileBatchCards = rows.map((batch) => {
    const key = `${batch.invoiceId}:${batch.batchId}`;
    const isExpanded = expanded === key;
    const color = invoiceColor(batch.invoiceId || batch.invoiceNumber);

    return (
      <Paper key={key} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Box
              component="span"
              onClick={() => navigate(`/dashboard/orders/${batch.invoiceId}/deliveries`)}
              sx={{
                display: 'inline-block',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: color.background,
                color: color.text,
                border: `1px solid ${color.border}`,
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {batch.invoiceNumber || '—'}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
              {formatDateTime(batch.deliveredAt)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              {batch.customerName || '—'}
            </Typography>
            {batch.customerPhone && (
              <Typography variant="caption" color="text.secondary">
                {batch.customerPhone}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            {batch.invoiceStatus && (
              <Chip
                size="small"
                label={invoiceStatusLabel(batch.invoiceStatus)}
                color={invoiceStatusColor(batch.invoiceStatus)}
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            )}
            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.75 }}>
              {formatQuantity(batch.totalQuantity)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {formatCurrency(batch.deliveredValue)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {batch.items
            .slice(0, 2)
            .map((item) => `${item.materialName} ×${formatQuantity(item.quantity)}`)
            .join(', ')}
          {batch.items.length > 2 ? ` +${batch.items.length - 2} mặt hàng` : ''}
        </Typography>

        <Divider sx={{ my: 1.25 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Người giao: {batch.deliveredByName || '—'}
          </Typography>
          <Button size="small" onClick={() => toggleExpanded(key)}>
            {isExpanded ? 'Ẩn chi tiết' : 'Chi tiết'}
          </Button>
        </Box>

        {isExpanded && (
          <Box sx={{ mt: 1 }}>
            {batch.items.map((item) => (
              <Box
                key={item.recordId}
                sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.75, borderBottom: '1px solid #f0f0f0' }}
              >
                <Typography variant="body2" sx={{ minWidth: 0, wordBreak: 'break-word' }}>
                  {item.materialName}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
                  {formatQuantity(item.quantity)} {item.unit}
                </Typography>
              </Box>
            ))}
            {batch.notes && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Ghi chú: {batch.notes}
              </Typography>
            )}
            {batch.customerAddress && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Địa chỉ: {batch.customerAddress}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Lịch sử giao hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tất cả các đợt giao hàng của mọi hóa đơn
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<LocalShippingIcon />}
          onClick={() => navigate('/dashboard/orders')}
        >
          Quản lý đơn hàng
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.label}
            elevation={0}
            sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {card.format(card.value)}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'minmax(260px, 2fr) repeat(2, minmax(160px, 1fr)) auto auto',
            },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            label="Tìm mã hóa đơn, khách hàng, vật liệu..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            size="small"
            type="date"
            label="Từ ngày"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="Đến ngày"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="text" onClick={resetFilters}>
            Xóa lọc
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Nhanh:
          </Typography>
          <Chip size="small" label="Hôm nay" onClick={() => applyRange(1)} />
          <Chip size="small" label="7 ngày" onClick={() => applyRange(7)} />
          <Chip size="small" label="30 ngày" onClick={() => applyRange(30)} />
          <Chip
            size="small"
            label="Tất cả"
            onClick={() => applyRange(null)}
            variant={!fromDate && !toDate ? 'filled' : 'outlined'}
          />
        </Box>
      </Paper>

      {deliveryLogError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deliveryLogError}
        </Alert>
      )}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        {deliveryLogLoading && <LinearProgress />}
        {isMobile ? (
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {loadingFirstTime && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {!loadingFirstTime && rows.length === 0 && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Không có lần giao hàng nào khớp bộ lọc.
              </Typography>
            )}
            {mobileBatchCards}
          </Box>
        ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Hóa đơn</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mặt hàng</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Tổng SL
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Giá trị
                </TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Người giao</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingFirstTime && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}

              {!loadingFirstTime && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      Không có lần giao hàng nào khớp bộ lọc.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {rows.map((batch) => {
                const key = `${batch.invoiceId}:${batch.batchId}`;
                const isExpanded = expanded === key;
                const color = invoiceColor(batch.invoiceId || batch.invoiceNumber);
                return (
                  <React.Fragment key={key}>
                    <TableRow hover>
                      <TableCell padding="checkbox" sx={{ borderLeft: `4px solid ${color.border}` }}>
                        <IconButton size="small" onClick={() => toggleExpanded(key)}>
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(batch.deliveredAt)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Box
                          component="span"
                          onClick={() =>
                            navigate(`/dashboard/orders/${batch.invoiceId}/deliveries`)
                          }
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: color.background,
                            color: color.text,
                            border: `1px solid ${color.border}`,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {batch.invoiceNumber || '—'}
                        </Box>
                        {batch.invoiceStatus && (
                          <Chip
                            size="small"
                            label={invoiceStatusLabel(batch.invoiceStatus)}
                            color={invoiceStatusColor(batch.invoiceStatus)}
                            variant="outlined"
                            sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {batch.customerName || '—'}
                        </Typography>
                        {batch.customerPhone && (
                          <Typography variant="caption" color="text.secondary">
                            {batch.customerPhone}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {batch.items
                            .slice(0, 2)
                            .map((item) => `${item.materialName} ×${formatQuantity(item.quantity)}`)
                            .join(', ')}
                          {batch.items.length > 2
                            ? ` +${batch.items.length - 2} mặt hàng`
                            : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {batch.itemCount} dòng hàng
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatQuantity(batch.totalQuantity)}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(batch.deliveredValue)}</TableCell>
                      <TableCell>{batch.deliveredByName || '—'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Xem chi tiết hóa đơn">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/dashboard/orders/${batch.invoiceId}/deliveries`)
                            }
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ py: 0, bgcolor: 'grey.50' }}>
                          <Box sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                alignItems: 'center',
                                mb: 1,
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Chi tiết đợt giao
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDateTime(batch.deliveredAt)}
                              </Typography>
                              {batch.deliveredByName && (
                                <Typography variant="body2" color="text.secondary">
                                  · Người giao: {batch.deliveredByName}
                                </Typography>
                              )}
                            </Box>

                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700 }}>Mặt hàng</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    Đơn giá
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    Số lượng
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    Thành tiền
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {batch.items.map((item) => (
                                  <TableRow key={item.recordId}>
                                    <TableCell>{item.materialName}</TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(item.unitPrice)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatQuantity(item.quantity)} {item.unit}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(item.quantity * item.unitPrice)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            {batch.notes && (
                              <>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="body2">
                                  <strong>Ghi chú:</strong> {batch.notes}
                                </Typography>
                              </>
                            )}

                            {batch.customerAddress && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                <strong>Địa chỉ:</strong> {batch.customerAddress}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
          sx={{
            '& .MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              justifyContent: 'center',
              px: { xs: 1, sm: 2 },
            },
            '& .MuiTablePagination-selectLabel': {
              display: { xs: 'none', sm: 'block' },
            },
          }}
        />
      </Paper>
    </Container>
  );
};

export default DeliveryLogPage;
