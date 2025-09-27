import React, { useState } from "react";
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
  console.log(currentPage);

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
  
  const [selected, setSelected] = useState<number>(0);
  
  const handleSelectedComponent = (_event: React.MouseEvent, index: number) => {
    setSelected(index);
  };
  
  return (
    <>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Menu
        </Typography>
      </Box>
      <List sx={{ px: 1, py: 2 }}>
        {sideBarComponent.map((comp, index) => (
          <ListItem disablePadding key={index} sx={{ mb: 1 }}>
            <Box width="100%">
              <ListItemButton
                onClick={(event) => {
                  handleSelectedComponent(event, index);
                  navigateTo("/dashboard/" + comp.path);
                }}
                selected={
                  index === selected &&
                  currentPage === "/dashboard/" + comp.path
                }
                sx={{
                  borderRadius: 2,
                  borderLeft: selected === index && currentPage === "/dashboard/" + comp.path ? 4 : 0,
                  borderColor: "primary.main",
                  backgroundColor: selected === index && currentPage === "/dashboard/" + comp.path ? 'primary.light' : 'transparent',
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
                    fontWeight: selected === index ? "bold" : "normal",
                    color: selected === index ? "primary.main" : "text.primary",
                  }}
                />
              </ListItemButton>
            </Box>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default SideBarComponent;
