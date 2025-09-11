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

const SideBarComponent: React.FC = () => {
  const navigate = useNavigate();
  const navigateTo = (to: string) => {
    navigate(to);
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
      title: "Tăng trưởng",
      path: "growth",
      component: <TrendingUpOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Nhập hàng",
      path: "stock-in",
      component: <DescriptionOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Thống kê nhập hàng",
      path: "stock-in-analytics",
      component: <AnalyticsOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Cài đặt",
      path: "settings",
      component: <SettingsOutlined fontSize="medium" color="primary" />,
    },
  ];
  
  const [selected, setSelected] = useState<number>(0);
  
  const handleSelectedComponent = (_event: React.MouseEvent, index: number) => {
    setSelected(index);
  };
  
  return (
    <>
      <List>
        {sideBarComponent.map((comp, index) => (
          <ListItem disablePadding dense={true} key={index}>
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
                  mb: 3,
                  borderLeft: 0,
                  borderColor: "primary.main",
                  ml: 1,
                }}
              >
                <ListItemIcon>
                  <IconButton>{comp.component}</IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={comp.title}
                  primaryTypographyProps={{
                    fontSize: "medium",
                    fontWeight: selected === index ? "bold" : "",
                    color: selected === index ? "primary.main" : "inherit",
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
