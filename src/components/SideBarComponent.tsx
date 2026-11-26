import React from "react";
import "../../public/styles/links.css";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import {
  HomeOutlined,
  Inventory2Outlined,
  SettingsOutlined,
  DescriptionOutlined,
  MonetizationOnOutlined,
  CardTravelOutlined,
  TrendingUpOutlined,
  PeopleAltOutlined,
  AnalyticsOutlined,
  LocalShippingOutlined,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

interface SideBarItem {
  title: string;
  path: string;
  component: React.ReactElement;
}

interface SideBarComponentProps {
  onItemClick?: () => void;
}

const SideBarComponent: React.FC<SideBarComponentProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const navigateTo = (to: string) => {
    navigate(to);
    if (onItemClick) {
      onItemClick();
    }
  };
  const location = useLocation();
  const currentPage = location.pathname;

  const sideBarComponent: SideBarItem[] = [
    {
      title: "Trang chủ",
      path: "home",
      component: <HomeOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Hàng hoá",
      path: "inventory",
      component: <Inventory2Outlined fontSize="medium" color="primary" />,
    },
    {
      title: "Đơn hàng",
      path: "orders",
      component: <CardTravelOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Lịch sử giao hàng",
      path: "deliveries",
      component: <LocalShippingOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Nhập hàng",
      path: "stock-in",
      component: <DescriptionOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Khách hàng",
      path: "customers",
      component: <PeopleAltOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Doanh thu",
      path: "revenue",
      component: <MonetizationOnOutlined fontSize="medium" color="primary" />,
    },

    {
      title: "Thống kê nhập hàng",
      path: "stock-in-analytics",
      component: <AnalyticsOutlined fontSize="medium" color="primary" />,
    },
  ];
  
  return (
    <>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Menu
        </Typography>
        {onItemClick && (
          <IconButton onClick={onItemClick} aria-label="Đóng menu" size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <List sx={{ px: 1, py: 1.5 }}>
        {sideBarComponent.map((comp, index) => {
          const isSelected = currentPage === "/dashboard/" + comp.path;
          return (
          <ListItem disablePadding key={index} sx={{ mb: 0.5 }}>
            <Box width="100%">
              <ListItemButton
                onClick={() => navigateTo("/dashboard/" + comp.path)}
                selected={isSelected}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  px: 1.5,
                  borderLeft: isSelected ? 4 : 0,
                  borderColor: "primary.main",
                  backgroundColor: isSelected ? 'primary.light' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {comp.component}
                </ListItemIcon>
                <ListItemText
                  primary={comp.title}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: isSelected ? "bold" : "normal",
                    color: isSelected ? "primary.main" : "text.primary",
                  }}
                />
              </ListItemButton>
            </Box>
          </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default SideBarComponent;
