import React, { useState, useEffect } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';

export type Column = {
  key: string;
  title: string | React.ReactNode;
  render?: (val: any, row?: any) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
};

type ReusableTableProps = {
  columns: Column[];
  data: any[];
  containerClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  itemsPerPage?: number;
  renderRowDetail?: (row: any) => React.ReactNode;
  expandable?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
};

export const Table: React.FC<ReusableTableProps> = ({
  columns,
  data,
  containerClassName = '',
  headerRowClassName = '',
  headerCellClassName = '',
  rowClassName = '',
  cellClassName = '',
  itemsPerPage = 10,
  renderRowDetail,
  expandable = false,
  stickyHeader = false,
  maxHeight = 'auto'
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    setExpandedRows(new Set()); // Close expanded rows when changing page
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setExpandedRows(new Set());
  };

  const handleRowExpand = (rowIndex: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const pageNumbers = [];
    const maxPagesToShow = isMobile ? 3 : 5;
    let startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < Math.ceil(data.length / rowsPerPage)) {
      setPage(pageNumber);
      setExpandedRows(new Set());
    }
  };

  return (
    <Box className={containerClassName} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: maxHeight,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          flex: 1,
          overflow: 'auto'
        }}
      >
        <MuiTable stickyHeader={stickyHeader} size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow className={headerRowClassName}>
              {expandable && (
                <TableCell 
                  padding="checkbox"
                  sx={{ 
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontWeight: 'bold'
                  }}
                />
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={headerCellClassName}
                  align={col.align || 'left'}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontWeight: 'bold',
                    width: col.width || 'auto',
                    minWidth: col.width || 'auto',
                    textAlign: col.align || 'left',
                    verticalAlign: 'middle'
                  }}
                >
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((row, rowIndex) => {
              const adjustedIndex = startIndex + rowIndex;
              const isExpanded = expandedRows.has(adjustedIndex);
              
              return (
                <React.Fragment key={adjustedIndex}>
                  <TableRow 
                    className={rowClassName}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      cursor: expandable ? 'pointer' : 'default'
                    }}
                    onClick={() => expandable && handleRowExpand(adjustedIndex)}
                  >
                    {expandable && (
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowExpand(adjustedIndex);
                          }}
                        >
                          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cellClassName}
                        align={col.align || 'left'}
                        sx={{
                          width: col.width || 'auto',
                          minWidth: col.width || 'auto',
                          textAlign: col.align || 'left',
                          verticalAlign: 'middle'
                        }}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Expandable row detail */}
                  {expandable && renderRowDetail && (
                    <TableRow>
                      <TableCell 
                        style={{ paddingBottom: 0, paddingTop: 0 }} 
                        colSpan={columns.length + (expandable ? 1 : 0)}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1, padding: 2, backgroundColor: theme.palette.grey[50] }}>
                            {renderRowDetail(row)}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {/* Custom Pagination */}
      {data.length > rowsPerPage && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: theme.palette.grey[100], 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            flexShrink: 0
          }}
        >
          {/* Navigation Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => goToPage(0)}
              disabled={page === 0}
              size="small"
            >
              <FirstPage />
            </IconButton>
            
            <IconButton
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              size="small"
            >
              <NavigateBefore />
            </IconButton>

            {/* Page Numbers */}
            {getPageNumbers().map((pageNum) => (
              <Chip
                key={pageNum}
                label={pageNum + 1}
                onClick={() => goToPage(pageNum)}
                color={page === pageNum ? 'primary' : 'default'}
                variant={page === pageNum ? 'filled' : 'outlined'}
                sx={{ mx: 0.5 }}
              />
            ))}

            <IconButton
              onClick={() => goToPage(page + 1)}
              disabled={page >= Math.ceil(data.length / rowsPerPage) - 1}
              size="small"
            >
              <NavigateNext />
            </IconButton>
            
            <IconButton
              onClick={() => goToPage(Math.ceil(data.length / rowsPerPage) - 1)}
              disabled={page >= Math.ceil(data.length / rowsPerPage) - 1}
              size="small"
            >
              <LastPage />
            </IconButton>
          </Box>

          {/* Status Text */}
          <Typography variant="body2" color="text.secondary">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, data.length)} / Tổng số {data.length}
          </Typography>

          {/* Rows per page selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Hiển thị:</Typography>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              {[10, 15, 25, 50, 100].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Typography variant="body2">dòng mỗi trang</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Table;
