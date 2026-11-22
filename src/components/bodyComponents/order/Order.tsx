import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderList from "./OrderList";
import CreateInvoiceModal from "./CreateInvoiceModal";
import { Box, Button, Typography } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LocalShippingOutlined } from "@mui/icons-material";

export default function Order() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

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
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      p: { xs: 1, sm: 2, md: 3 }
    }}>
      <Box
        sx={{
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
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          mb: { xs: 2, sm: 3 }
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: "bold",
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
            }}
          >
            Hoá đơn
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<LocalShippingOutlined />}
              onClick={() => navigate('/dashboard/deliveries')}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, py: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 } }}
            >
              Lịch sử giao hàng
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' }, 
                py: { xs: 1, sm: 1.5 },
                px: { xs: 2, sm: 3 }
              }}
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
