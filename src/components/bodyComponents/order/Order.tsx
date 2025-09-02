import React, { useState } from "react";
import OrderList from "./OrderList";
import CreateInvoiceModal from "./CreateInvoiceModal";
import { Box, Button, Typography } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export default function Order() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSuccess = () => {
    // Có thể thêm logic refresh danh sách hoá đơn ở đây
    console.log('Invoice created successfully');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          mx: 3,
          mt: 3,
          bgcolor: "white",
          borderRadius: 2,
          padding: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Hoá đơn
        </Typography>
        <Box>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          sx={{ fontSize: '1rem', py: 1.5 }}
        >
          Thêm Hoá Đơn
        </Button>
        </Box>

        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <OrderList />
        </Box>
      </Box>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
}
