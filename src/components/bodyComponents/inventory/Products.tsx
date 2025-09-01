import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Chip, CircularProgress, Alert, Button, Snackbar, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { AppDispatch, RootState } from "../../../store";
import { 
  fetchMaterials, 
  selectMaterials, 
  selectMaterialsLoading, 
  selectMaterialsError,
  selectFilteredMaterials,
  deleteMaterial
} from "../../../store/slices/materialSlice";
import { Table, Column } from "./Table";
import Product from "./Product";
import MaterialModal from "./MaterialModal";
import FilterBar from "./FilterBar";

const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const materials = useSelector(selectFilteredMaterials);
  const isLoading = useSelector(selectMaterialsLoading);
  const error = useSelector(selectMaterialsError);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleEditMaterial = (material: any) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  const handleMaterialSuccess = () => {
    // Refresh the materials list after successful creation/update
    dispatch(fetchMaterials());
    setSuccessMessage(editingMaterial ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
  };

  const handleDeleteClick = (material: any) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (materialToDelete) {
      try {
        await dispatch(deleteMaterial(materialToDelete._id)).unwrap();
        setSuccessMessage('Xóa sản phẩm thành công!');
        setDeleteDialogOpen(false);
        setMaterialToDelete(null);
      } catch (error) {
        console.error('Error deleting material:', error);
        setSuccessMessage('Lỗi khi xóa sản phẩm!');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMaterialToDelete(null);
  };

  const columns: Column[] = [
    {
      key: "_id",
      title: "ID",
      width: 100,
      align: "center",
      render: (val) => (
        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
          {val?.slice(-6) || 'N/A'}
        </Typography>
      ),
    },
    {
      key: "name",
      title: "Tên Sản Phẩm",
      width: 300,
      render: (val, row) => <Product productName={val} />,
    },
    {
      key: "category",
      title: "Danh Mục",
      width: 150,
      render: (val) => (
        <Chip 
          label={val} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      ),
    },
    {
      key: "price",
      title: "Giá",
      width: 120,
      align: "right",
      render: (val) => (
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1rem' }}>
          {val ? `${val.toLocaleString()} VND` : 'N/A'}
        </Typography>
      ),
    },
    {
      key: "quantity",
      title: "Số Lượng",
      width: 120,
      align: "center",
      render: (val, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ fontSize: '1rem' }}>
            {val || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
            {row?.unit || 'pcs'}
          </Typography>
        </Box>
      ),
    },
    {
      key: "supplier",
      title: "Nhà Cung Cấp",
      width: 150,
      render: (val) => (
        <Typography variant="body1" noWrap sx={{ fontSize: '1rem' }}>
          {val || 'N/A'}
        </Typography>
      ),
    },
    {
      key: "isActive",
      title: "Trạng Thái",
      width: 120,
      align: "center",
      render: (val) => (
        <Chip 
          label={val ? 'Hoạt Động' : 'Không Hoạt Động'} 
          color={val ? 'success' : 'error'}
          size="small"
        />
      ),
    },
  ];

  const renderRowDetail = (row: any) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
          Chi Tiết Sản Phẩm
        </Typography>
   
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 1}}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Mô Tả:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1rem' }}>
            {row.description || 'Không có mô tả'}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 1}}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Tồn Kho Tối Thiểu:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1rem' }}>
            {row.minStock || 'N/A'}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 1}}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Tồn Kho Tối Đa:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1rem' }}>
            {row.maxStock || 'N/A'}
          </Typography>
        </Box>

      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button sx={{width: '30%', height: '40px'}}  variant="contained" color="primary" onClick={(e) => {
          e.stopPropagation();
          handleEditMaterial(row);
        }}>
          Sửa
        </Button>
       <Button sx={{width: '30%', height: '40px'}} variant="contained" color="error" onClick={(e) => {
          e.stopPropagation();
          handleDeleteClick(row);
        }}>
          Dừng hoạt động
        </Button>
        </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, fontSize: '1.2rem' }}>
          Đang tải dữ liệu sản phẩm...
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Add Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ fontSize: '1.3rem' }}>
          Tổng số sản phẩm: {materials.length}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddMaterial}
          sx={{ fontSize: '1rem', py: 1.5 }}
        >
          Thêm Sản Phẩm
        </Button>
      </Box>

      {/* Filter Bar */}
      <FilterBar />
      
      {/* Data Table */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={materials}
          itemsPerPage={15}
          expandable={true}
          renderRowDetail={renderRowDetail}
          stickyHeader={true}
          maxHeight="100%"
        />
      </Box>

      {/* Material Modal */}
      <MaterialModal
        open={isModalOpen}
        onClose={handleCloseModal}
        material={editingMaterial}
        onSuccess={handleMaterialSuccess}
      />

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontSize: '1.3rem' }}>
          Xác nhận xóa sản phẩm
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ fontSize: '1rem' }}>
            Bạn có chắc chắn muốn xóa sản phẩm "{materialToDelete?.name}" không? 
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary" sx={{ fontSize: '1rem' }}>
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ fontSize: '1rem' }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
