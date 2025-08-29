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
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

interface SideBarItem {
  title: string;
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
      title: "Home",
      component: <HomeOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Inventory",
      component: <Inventory2Outlined fontSize="medium" color="primary" />,
    },
    {
      title: "Orders",
      component: <CardTravelOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Customers",
      component: <PeopleAltOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Revenue",
      component: <MonetizationOnOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Growth",
      component: <TrendingUpOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Reports",
      component: <DescriptionOutlined fontSize="medium" color="primary" />,
    },
    {
      title: "Settings",
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
                  navigateTo("/dashboard/" + comp.title.toLowerCase());
                }}
                selected={
                  index === selected &&
                  currentPage === "/dashboard/" + comp.title.toLowerCase()
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
