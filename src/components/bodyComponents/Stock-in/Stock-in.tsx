import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, CircularProgress, Alert, Snackbar, Grid, Card, CardContent, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Toolbar, TextField, TablePagination } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckIcon, Payment as PaymentIcon, FileDownload as ExportIcon, Print as PrintIcon, SelectAll as SelectAllIcon, Clear as ClearIcon, Add as AddIcon, FirstPage as FirstPageIcon, LastPage as LastPageIcon, KeyboardArrowLeft as KeyboardArrowLeftIcon, KeyboardArrowRight as KeyboardArrowRightIcon } from "@mui/icons-material";
import { AppDispatch, RootState } from "../../../store";
import { 
  fetchStockIns, 
  fetchStockInStatistics,
  selectStockIns, 
  selectStockInsLoading, 
  selectStockInsError,
  selectFilteredStockIns,
  selectStockInStatistics,
  selectStockInsStats,
  selectStockInsPagination,
  selectStockInsFilters,
  setPage,
  setLimit,
  deleteStockIn,
  updateStockInStatus,
  updatePaymentStatus
} from "../../../store/slices/stockInSlice";
import { Table, Column } from "../components/Table";
import StockInFilterBar from "./StockInFilterBar";
import StockInModal from "./StockInModal";

export default function StockIn() {
  const dispatch = useDispatch<AppDispatch>();
  const stockIns = useSelector(selectStockIns); // Use server-side paginated data
  const isLoading = useSelector(selectStockInsLoading);
  const error = useSelector(selectStockInsError);
  const statistics = useSelector(selectStockInStatistics);
  const pagination = useSelector(selectStockInsPagination);
  const filters = useSelector(selectStockInsFilters);
  
  const [editingStockIn, setEditingStockIn] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockInToDelete, setStockInToDelete] = useState<any>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedStockIn, setSelectedStockIn] = useState<any>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'status' | 'payment' | 'delete'>('status');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Use server-side pagination
  const currentPage = (pagination.page || 1) - 1; // Convert 1-based to 0-based for TablePagination
  const pageSize = pagination.limit || 15;
  const totalItems = pagination.total || 0;
  const paginatedStockIns = stockIns; // Data already paginated from server

  // Initial load and when filters change
  useEffect(() => {
    const fetchParams = {
      page: filters.page || 1,
      limit: filters.limit || 15,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.supplier && { supplier: filters.supplier }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    };
    
    dispatch(fetchStockIns(fetchParams));
    dispatch(fetchStockInStatistics({}));
  }, [dispatch, filters.page, filters.limit, filters.search, filters.status, filters.paymentStatus, filters.supplier, filters.startDate, filters.endDate]);

  const handleEditStockIn = (stockIn: any) => {
    setEditingStockIn(stockIn);
  };

  const handleCloseModal = () => {
    setEditingStockIn(null);
  };

  const handleStockInSuccess = () => {
    const fetchParams = {
      page: filters.page || 1,
      limit: filters.limit || 15,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.supplier && { supplier: filters.supplier }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    };
    dispatch(fetchStockIns(fetchParams));
    dispatch(fetchStockInStatistics({}));
    setSuccessMessage('Cập nhật phiếu nhập kho thành công!');
  };

  const handleCreateStockIn = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // Reset to first page after creating
    dispatch(setPage(1));
    const fetchParams = {
      page: 1,
      limit: filters.limit || 15,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.supplier && { supplier: filters.supplier }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    };
    dispatch(fetchStockIns(fetchParams));
    dispatch(fetchStockInStatistics({}));
    setSuccessMessage('Tạo phiếu nhập kho thành công!');
  };

  const handleDeleteClick = (stockIn: any) => {
    setStockInToDelete(stockIn);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (stockInToDelete) {
      try {
        await dispatch(deleteStockIn(stockInToDelete._id)).unwrap();
        setSuccessMessage('Xóa phiếu nhập kho thành công!');
        setDeleteDialogOpen(false);
        setStockInToDelete(null);
        
        // Reload current page data
        const fetchParams = {
          page: filters.page || 1,
          limit: filters.limit || 15,
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
          ...(filters.supplier && { supplier: filters.supplier }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        };
        dispatch(fetchStockIns(fetchParams));
        dispatch(fetchStockInStatistics({}));
      } catch (error) {
        console.error('Error deleting stock-in:', error);
        setSuccessMessage('Lỗi khi xóa phiếu nhập kho!');
      }
    }
  };

  const handleStatusUpdate = (stockIn: any) => {
    setSelectedStockIn(stockIn);
    setStatusDialogOpen(true);
  };

  const handlePaymentUpdate = (stockIn: any) => {
    setSelectedStockIn(stockIn);
    // Set payment amount to remaining amount if partial payment, otherwise total amount
    const remainingAmount = (stockIn.totalAmount || 0) - (stockIn.paidAmount || 0);
    setPaymentAmount(remainingAmount > 0 ? remainingAmount : 0);
    setPaymentDialogOpen(true);
  };

  const handleStatusConfirm = async (status: string, notes?: string) => {
    if (selectedStockIn) {
      try {
        await dispatch(updateStockInStatus({ 
          id: selectedStockIn._id, 
          data: { status: status as any } 
        })).unwrap();
        setSuccessMessage('Cập nhật trạng thái thành công!');
        setStatusDialogOpen(false);
        setSelectedStockIn(null);
        
        // Reload current page data
        const fetchParams = {
          page: filters.page || 1,
          limit: filters.limit || 15,
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
          ...(filters.supplier && { supplier: filters.supplier }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        };
        dispatch(fetchStockIns(fetchParams));
        dispatch(fetchStockInStatistics({}));
      } catch (error) {
        console.error('Error updating status:', error);
        setSuccessMessage('Lỗi khi cập nhật trạng thái!');
      }
    }
  };

  const handlePaymentConfirm = async () => {
    if (selectedStockIn) {
      try {
        let finalPaymentStatus: 'unpaid' | 'partial' | 'paid';
        const currentPaidAmount = selectedStockIn.paidAmount || 0;
        const totalAmount = selectedStockIn.totalAmount || 0;
        const newPaymentAmount = paymentAmount;
        const totalPaidAmount = currentPaidAmount + newPaymentAmount;

        // Validate payment amount
        if (newPaymentAmount < 0) {
          setSuccessMessage('Số tiền thanh toán không được âm!');
          return;
        }

        if (newPaymentAmount > (totalAmount - currentPaidAmount)) {
          setSuccessMessage('Số tiền thanh toán không được vượt quá số tiền còn lại!');
          return;
        }

        // Determine payment status based on total paid amount
        if (totalPaidAmount === 0) {
          finalPaymentStatus = 'unpaid';
        } else if (totalPaidAmount >= totalAmount) {
          finalPaymentStatus = 'paid';
        } else {
          finalPaymentStatus = 'partial';
        }

        await dispatch(updatePaymentStatus({ 
          id: selectedStockIn._id, 
          data: { 
            paymentStatus: finalPaymentStatus, 
            paidAmount: totalPaidAmount
          } 
        })).unwrap();
        
        const statusText = finalPaymentStatus === 'paid' ? 'Đã thanh toán' : 
                          finalPaymentStatus === 'partial' ? 'Thanh toán một phần' : 'Chưa thanh toán';
        setSuccessMessage(`Cập nhật thanh toán thành công: ${statusText}`);
        setPaymentDialogOpen(false);
        setSelectedStockIn(null);
        setPaymentAmount(0);
        
        // Reload current page data
        const fetchParams = {
          page: filters.page || 1,
          limit: filters.limit || 15,
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
          ...(filters.supplier && { supplier: filters.supplier }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        };
        dispatch(fetchStockIns(fetchParams));
        dispatch(fetchStockInStatistics({}));
      } catch (error) {
        console.error('Error updating payment status:', error);
        setSuccessMessage('Lỗi khi cập nhật thanh toán!');
      }
    }
  };

  const handleExportData = () => {
    setExportDialogOpen(true);
  };

  const handleExportConfirm = async () => {
    setIsExporting(true);
    try {
      // Fetch all data for export (without pagination)
      const allDataResponse = await dispatch(fetchStockIns({ 
        limit: 10000, // Large limit to get all data
        page: 1,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.supplier && { supplier: filters.supplier }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })).unwrap();
      
      const allData = allDataResponse.data || [];
      
      // Export all data, not just current page
      const dataToExport = allData.map((stockIn: any) => ({
      'Số phiếu nhập': stockIn.stockInNumber,
      'Nhà cung cấp': stockIn.supplier,
      'Số lượng mặt hàng': stockIn.items?.length || 0,
      'Tổng tiền': stockIn.totalAmount,
      'Trạng thái': getStatusText(stockIn.status),
      'Thanh toán': getPaymentStatusText(stockIn.paymentStatus),
      'Ngày tạo': new Date(stockIn.createdAt).toLocaleDateString('vi-VN'),
      'Ghi chú': stockIn.notes || ''
    }));

    if (exportFormat === 'csv') {
      exportToCSV(dataToExport, 'stock-in-report.csv');
    } else if (exportFormat === 'excel') {
      exportToExcel(dataToExport, 'stock-in-report.xlsx');
    } else if (exportFormat === 'pdf') {
      exportToPDF(dataToExport, 'stock-in-report.pdf');
    }
    
    // Reload current page data after export
    const fetchParams = {
      page: filters.page || 1,
      limit: filters.limit || 15,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.supplier && { supplier: filters.supplier }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    };
    dispatch(fetchStockIns(fetchParams));
    
    setExportDialogOpen(false);
    setIsExporting(false);
    setSuccessMessage('Xuất báo cáo thành công!');
  } catch (error) {
    console.error('Error exporting data:', error);
    setSuccessMessage('Lỗi khi xuất báo cáo!');
    setIsExporting(false);
  }
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportToExcel = (data: any[], filename: string) => {
    // Simple Excel export using HTML table
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Headers
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Data rows
    data.forEach(row => {
      const tr = document.createElement('tr');
      Object.values(row).forEach(value => {
        const td = document.createElement('td');
        td.textContent = String(value);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    // Create and download
    const wb = {
      SheetNames: ['Báo cáo nhập kho'],
      Sheets: {
        'Báo cáo nhập kho': {
          '!ref': 'A1:H' + (data.length + 1),
          A1: { v: 'Số phiếu nhập' },
          B1: { v: 'Nhà cung cấp' },
          C1: { v: 'Số lượng mặt hàng' },
          D1: { v: 'Tổng tiền' },
          E1: { v: 'Trạng thái' },
          F1: { v: 'Thanh toán' },
          G1: { v: 'Ngày tạo' },
          H1: { v: 'Ghi chú' },
          ...data.reduce((acc, row, index) => {
            const rowNum = index + 2;
            acc[`A${rowNum}`] = { v: row['Số phiếu nhập'] };
            acc[`B${rowNum}`] = { v: row['Nhà cung cấp'] };
            acc[`C${rowNum}`] = { v: row['Số lượng mặt hàng'] };
            acc[`D${rowNum}`] = { v: row['Tổng tiền'] };
            acc[`E${rowNum}`] = { v: row['Trạng thái'] };
            acc[`F${rowNum}`] = { v: row['Thanh toán'] };
            acc[`G${rowNum}`] = { v: row['Ngày tạo'] };
            acc[`H${rowNum}`] = { v: row['Ghi chú'] };
            return acc;
          }, {})
        }
      }
    };
    
    // For now, export as CSV with .xlsx extension
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
  };

  const exportToPDF = (data: any[], filename: string) => {
    // Simple PDF export using window.print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>Báo cáo nhập kho</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { text-align: center; color: #333; }
            </style>
          </head>
          <body>
            <h1>Báo cáo nhập kho</h1>
            <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => 
                  `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSelectAll = () => {
    const selectableItems = paginatedStockIns.filter(item => item.status !== 'approved' && item.paymentStatus === 'unpaid');
    const selectableIds = selectableItems.map(item => item._id);
    
    if (selectableIds.every(id => selectedItems.includes(id))) {
      // If all items on current page are selected, deselect them
      setSelectedItems(prev => prev.filter(id => !selectableIds.includes(id)));
    } else {
      // Select all items on current page
      setSelectedItems(prev => [...new Set([...prev, ...selectableIds])]);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = () => {
    if (selectedItems.length === 0) {
      setSuccessMessage('Vui lòng chọn ít nhất một phiếu nhập kho!');
      return;
    }
    setBulkActionDialogOpen(true);
  };

  const handleBulkActionConfirm = async () => {
    if (selectedItems.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        // Bulk delete
        for (const id of selectedItems) {
          await dispatch(deleteStockIn(id)).unwrap();
        }
        setSuccessMessage(`Đã xóa ${selectedItems.length} phiếu nhập kho!`);
      } else if (bulkAction === 'status') {
        // Bulk status update - you can customize this
        setSuccessMessage(`Tính năng cập nhật trạng thái hàng loạt sẽ được phát triển!`);
      } else if (bulkAction === 'payment') {
        // Bulk payment update - you can customize this
        setSuccessMessage(`Tính năng cập nhật thanh toán hàng loạt sẽ được phát triển!`);
      }
      
      setSelectedItems([]);
      setBulkActionDialogOpen(false);
      
      // Reload current page data
      const fetchParams = {
        page: filters.page || 1,
        limit: filters.limit || 15,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.supplier && { supplier: filters.supplier }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };
      dispatch(fetchStockIns(fetchParams));
      dispatch(fetchStockInStatistics({}));
    } catch (error) {
      console.error('Error in bulk action:', error);
      setSuccessMessage('Lỗi khi thực hiện thao tác hàng loạt!');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    // newPage is 0-based, but server uses 1-based
    const serverPage = newPage + 1;
    dispatch(setPage(serverPage));
    // The useEffect will automatically fetch new data when filters.page changes
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    dispatch(setLimit(newPageSize));
    dispatch(setPage(1)); // Reset to first page when changing page size
    // The useEffect will automatically fetch new data when filters change
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'error';
      case 'partial': return 'warning';
      case 'paid': return 'success';
      default: return 'default';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'unpaid': return 'Chưa thanh toán';
      case 'partial': return 'Thanh toán một phần';
      case 'paid': return 'Đã thanh toán';
      default: return status;
    }
  };

  const columns: Column[] = [
    {
      key: "select",
      title: (
        <Checkbox
          checked={(() => {
            const selectableItems = paginatedStockIns.filter(item => item.status !== 'approved' && item.paymentStatus === 'unpaid');
            const selectableIds = selectableItems.map(item => item._id);
            return selectableIds.length > 0 && selectableIds.every(id => selectedItems.includes(id));
          })()}
          indeterminate={(() => {
            const selectableItems = paginatedStockIns.filter(item => item.status !== 'approved' && item.paymentStatus === 'unpaid');
            const selectableIds = selectableItems.map(item => item._id);
            const selectedOnPage = selectableIds.filter(id => selectedItems.includes(id));
            return selectedOnPage.length > 0 && selectedOnPage.length < selectableIds.length;
          })()}
          onChange={handleSelectAll}
        />
      ),
      width: 50,
      align: "center",
      render: (val, row) => (
        <Checkbox
          checked={selectedItems.includes(row._id)}
          onChange={() => handleSelectItem(row._id)}
          disabled={row.status === 'approved' || row.paymentStatus !== 'unpaid'}
        />
      ),
    },
    {
      key: "stockInNumber",
      title: "Số phiếu nhập",
      width: 150,
      render: (val) => (
        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 'bold' }}>
          {val || 'N/A'}
        </Typography>
      ),
    },
    {
      key: "supplier",
      title: "Nhà cung cấp",
      width: 200,
      render: (val) => (
        <Typography variant="body1" sx={{ fontSize: '1rem' }}>
          {val || 'N/A'}
        </Typography>
      ),
    },
    {
      key: "items",
      title: "Số lượng mặt hàng",
      width: 150,
      align: "center",
      render: (val) => (
        <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
          {val?.length || 0}
        </Typography>
      ),
    },
    {
      key: "totalAmount",
      title: "Tổng tiền",
      width: 150,
      align: "right",
      render: (val) => (
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1rem' }}>
          {val ? `${val.toLocaleString()} VND` : '0 VND'}
        </Typography>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      width: 120,
      align: "center",
      render: (val) => (
        <Chip 
          label={getStatusText(val)} 
          color={getStatusColor(val)}
          size="small"
        />
      ),
    },
    {
      key: "paymentStatus",
      title: "Thanh toán",
      width: 150,
      align: "center",
      render: (val, row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Chip 
            label={getPaymentStatusText(val)} 
            color={getPaymentStatusColor(val)}
            size="small"
          />
          {row.paidAmount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {row.paidAmount?.toLocaleString()} VND
            </Typography>
          )}
          {val === 'partial' && row.totalAmount && (
            <Typography variant="caption" color="error.main">
              Còn lại: {(row.totalAmount - (row.paidAmount || 0)).toLocaleString()} VND
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      width: 120,
      render: (val) => (
        <Typography variant="body2" sx={{ fontSize: '1rem' }}>
          {val ? new Date(val).toLocaleDateString('vi-VN') : 'N/A'}
        </Typography>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 200,
      align: "center",
      render: (val, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          {row.status !== 'approved' && row.paymentStatus === 'unpaid' && (
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditStockIn(row);
              }}
              title="Chỉnh sửa"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {row.status !== 'approved' && (
            <IconButton 
              size="small" 
              color="info"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(row);
              }}
              title="Cập nhật trạng thái"
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          )}
          {row.paymentStatus !== 'paid' && (
            <IconButton 
              size="small" 
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                handlePaymentUpdate(row);
              }}
              title="Cập nhật thanh toán"
            >
              <PaymentIcon fontSize="small" />
            </IconButton>
          )}
          {row.status !== 'approved' && row.paymentStatus === 'unpaid' && (
            <IconButton 
              size="small" 
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              title="Xóa"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const renderRowDetail = (row: any) => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem' }}>
        Chi tiết phiếu nhập kho
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Nhà cung cấp: {row.supplier}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Số điện thoại: {row.supplierPhone || 'N/A'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Địa chỉ: {row.supplierAddress || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Thuế: {row.taxRate || 0}%
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Giảm giá: {row.discountRate || 0}%
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Ghi chú: {row.notes || 'Không có'}
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Thông tin thanh toán:
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Trạng thái: <Chip 
              label={getPaymentStatusText(row.paymentStatus)} 
              color={getPaymentStatusColor(row.paymentStatus)}
              size="small"
            />
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Tổng tiền: <strong>{row.totalAmount?.toLocaleString()} VND</strong>
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Đã thanh toán: <strong>{row.paidAmount?.toLocaleString() || 0} VND</strong>
          </Typography>
          {row.paymentStatus === 'partial' && (
            <Typography variant="subtitle2" color="error.main">
              Còn lại: <strong>{(row.totalAmount - (row.paidAmount || 0)).toLocaleString()} VND</strong>
            </Typography>
          )}
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
        Danh sách mặt hàng:
      </Typography>
      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
        {row.items?.map((item: any, index: number) => (
          <Card key={index} sx={{ mb: 1, p: 1 }}>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="body2">
                <strong>{item.materialName}</strong> - {item.quantity} {item.unit} - {item.unitPrice.toLocaleString()} VND
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, fontSize: '1.2rem' }}>
          Đang tải dữ liệu phiếu nhập kho...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Lỗi khi tải dữ liệu: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'grey.50'
    }}>
      <Box
        sx={{
          mx: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 1, sm: 2, md: 3 },
          bgcolor: "white",
          borderRadius: 2,
          padding: { xs: 2, sm: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 1
        }}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Quản lý nhập kho
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateStockIn}
              sx={{ 
                fontSize: '1rem', 
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Tạo phiếu nhập kho
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              startIcon={<ExportIcon />}
              onClick={handleExportData}
              sx={{ 
                fontSize: '1rem', 
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Xuất báo cáo
            </Button>
          </Box>
        </Box>


        {/* Filter Bar */}
        <StockInFilterBar />
        
        {/* Bulk Actions Toolbar */}
        {selectedItems.length > 0 && (
          <Toolbar sx={{ 
            bgcolor: 'primary.light', 
            borderRadius: 1, 
            mb: 2,
            minHeight: '48px !important'
          }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1, color: 'primary.contrastText' }}>
              Đã chọn {selectedItems.length} phiếu nhập kho
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setBulkAction('delete');
                setBulkActionDialogOpen(true);
              }}
              sx={{ mr: 1 }}
            >
              Xóa hàng loạt
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => setSelectedItems([])}
            >
              Bỏ chọn
            </Button>
          </Toolbar>
        )}
        
        {/* Data Table */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden', 
          mt: 2,
          '& .MuiTableContainer-root': {
            maxHeight: { xs: '60vh', sm: '70vh', md: '75vh' }
          }
        }}>
          <Table
            columns={columns}
            data={paginatedStockIns}
            itemsPerPage={15}
            expandable={true}
            renderRowDetail={renderRowDetail}
            stickyHeader={true}
            maxHeight="100%"
          />
        </Box>

        {/* Pagination Control */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mt: 2,
          py: 2,
          borderTop: '1px solid #e0e0e0',
          bgcolor: '#f5f5f5'
        }}>
          <TablePagination
            component="div"
            count={totalItems}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 15, 25, 50]}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
            showFirstButton
            showLastButton
            getItemAriaLabel={(type) => {
              if (type === 'first') {
                return 'Trang đầu tiên';
              }
              if (type === 'last') {
                return 'Trang cuối cùng';
              }
              if (type === 'next') {
                return 'Trang tiếp theo';
              }
              return 'Trang trước';
            }}
            ActionsComponent={({ onPageChange, page, count, rowsPerPage }) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={(e) => onPageChange(e, 0)}
                  disabled={page === 0}
                  aria-label="Trang đầu tiên"
                  size="small"
                >
                  <FirstPageIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => onPageChange(e, page - 1)}
                  disabled={page === 0}
                  aria-label="Trang trước"
                  size="small"
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => onPageChange(e, page + 1)}
                  disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                  aria-label="Trang tiếp theo"
                  size="small"
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1))}
                  disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                  aria-label="Trang cuối cùng"
                  size="small"
                >
                  <LastPageIcon />
                </IconButton>
              </Box>
            )}
            sx={{
              '& .MuiTablePagination-root': {
                fontSize: '14px',
                minHeight: '52px',
                justifyContent: 'center',
                width: '100%',
              },
              '& .MuiTablePagination-toolbar': {
                minHeight: '52px',
                justifyContent: 'center',
                width: '100%',
              },
              '& .MuiTablePagination-selectLabel': {
                fontSize: '14px',
              },
              '& .MuiTablePagination-displayedRows': {
                fontSize: '14px',
              },
            }}
          />
        </Box>
      </Box>


      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Cập nhật trạng thái</DialogTitle>
        <DialogContent>
          <Typography>Chọn trạng thái mới cho phiếu nhập kho:</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button 
              variant="outlined" 
              color="warning"
              onClick={() => handleStatusConfirm('pending')}
            >
              Chờ xử lý
            </Button>
            <Button 
              variant="outlined" 
              color="success"
              onClick={() => handleStatusConfirm('approved')}
            >
              Đã duyệt
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => handleStatusConfirm('rejected')}
            >
              Từ chối
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Hủy</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật thanh toán</DialogTitle>
        <DialogContent>
          {selectedStockIn && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Phiếu nhập kho: {selectedStockIn.stockInNumber}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Tổng tiền: <strong>{selectedStockIn.totalAmount?.toLocaleString()} VND</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Đã thanh toán: <strong>{(selectedStockIn.paidAmount || 0).toLocaleString()} VND</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'error.main' }}>
                Còn lại: <strong>{((selectedStockIn.totalAmount || 0) - (selectedStockIn.paidAmount || 0)).toLocaleString()} VND</strong>
              </Typography>
              
              <Typography sx={{ mb: 1, fontWeight: 'bold' }}>
                Số tiền thanh toán:
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                placeholder="Nhập số tiền thanh toán"
                sx={{ mb: 2 }}
                inputProps={{ 
                  min: 0, 
                  max: (selectedStockIn.totalAmount || 0) - (selectedStockIn.paidAmount || 0) 
                }}
                helperText={`Tối đa: ${((selectedStockIn.totalAmount || 0) - (selectedStockIn.paidAmount || 0)).toLocaleString()} VND`}
              />


              {paymentAmount > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Số tiền còn lại sau thanh toán:</strong> {((selectedStockIn.totalAmount || 0) - (selectedStockIn.paidAmount || 0) - paymentAmount).toLocaleString()} VND
                  </Typography>
                  {((selectedStockIn.paidAmount || 0) + paymentAmount) >= (selectedStockIn.totalAmount || 0) && (
                    <Typography variant="body2" color="success.main">
                      Số tiền thanh toán đã đủ hoặc vượt quá tổng tiền. Trạng thái sẽ được cập nhật thành "Đã thanh toán".
                    </Typography>
                  )}
                  {((selectedStockIn.paidAmount || 0) + paymentAmount) > 0 && ((selectedStockIn.paidAmount || 0) + paymentAmount) < (selectedStockIn.totalAmount || 0) && (
                    <Typography variant="body2" color="warning.main">
                      Trạng thái sẽ được cập nhật thành "Thanh toán một phần".
                    </Typography>
                  )}
                  {paymentAmount === 0 && (
                    <Typography variant="body2" color="error.main">
                      Trạng thái sẽ được cập nhật thành "Chưa thanh toán".
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPaymentDialogOpen(false);
            setPaymentAmount(0);
            setSelectedStockIn(null);
          }}>Hủy</Button>
          <Button 
            onClick={handlePaymentConfirm} 
            variant="contained" 
            color="primary"
          >
            Cập nhật thanh toán
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa phiếu nhập kho</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa phiếu nhập kho "{stockInToDelete?.stockInNumber}" không? 
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Xuất báo cáo</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Chọn định dạng file để xuất báo cáo:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant={exportFormat === 'excel' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('excel')}
              startIcon={<ExportIcon />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Excel (.xlsx)
            </Button>
            <Button
              variant={exportFormat === 'csv' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('csv')}
              startIcon={<ExportIcon />}
              sx={{ justifyContent: 'flex-start' }}
            >
              CSV (.csv)
            </Button>
            <Button
              variant={exportFormat === 'pdf' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('pdf')}
              startIcon={<PrintIcon />}
              sx={{ justifyContent: 'flex-start' }}
            >
              PDF (.pdf)
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Sẽ xuất dữ liệu theo bộ lọc hiện tại (tổng: {totalItems} phiếu nhập kho)
            {isExporting && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={isExporting}>Hủy</Button>
          <Button onClick={handleExportConfirm} variant="contained" disabled={isExporting}>
            {isExporting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Xuất báo cáo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onClose={() => setBulkActionDialogOpen(false)}>
        <DialogTitle>Thao tác hàng loạt</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Bạn đã chọn {selectedItems.length} phiếu nhập kho. Chọn thao tác muốn thực hiện:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant={bulkAction === 'status' ? 'contained' : 'outlined'}
              onClick={() => setBulkAction('status')}
              startIcon={<CheckIcon />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Cập nhật trạng thái
            </Button>
            <Button
              variant={bulkAction === 'payment' ? 'contained' : 'outlined'}
              onClick={() => setBulkAction('payment')}
              startIcon={<PaymentIcon />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Cập nhật thanh toán
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'contained' : 'outlined'}
              onClick={() => setBulkAction('delete')}
              startIcon={<DeleteIcon />}
              color="error"
              sx={{ justifyContent: 'flex-start' }}
            >
              Xóa hàng loạt
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={handleBulkActionConfirm} 
            variant="contained"
            color={bulkAction === 'delete' ? 'error' : 'primary'}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create StockIn Modal */}
      <StockInModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit StockIn Modal */}
      {editingStockIn && (
        <StockInModal
          open={!!editingStockIn}
          onClose={handleCloseModal}
          stockIn={editingStockIn}
          onSuccess={handleStockInSuccess}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
