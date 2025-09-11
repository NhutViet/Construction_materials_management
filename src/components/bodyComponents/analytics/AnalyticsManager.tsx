import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import Revenue from "../revenue/Revenue";
import DebtAnalytics from "./DebtAnalytics";
import PaymentAnalytics from "./PaymentAnalytics";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

const AnalyticsManager: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const analyticsTabs = [
    {
      label: "Doanh thu",
      component: <Revenue />,
      description: "Thống kê doanh thu và chi phí",
      color: "success" as const
    },
    {
      label: "Nợ phải thu",
      component: <DebtAnalytics />,
      description: "Phân tích nợ và khách hàng quá hạn",
      color: "error" as const
    },
    {
      label: "Thanh toán",
      component: <PaymentAnalytics />,
      description: "Thống kê thanh toán và phương thức",
      color: "info" as const
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Báo cáo & Thống kê
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Phân tích toàn diện về doanh thu, nợ và thanh toán
            </Typography>
          </Box>
          <Chip 
            label="Tự động cập nhật" 
            color="secondary" 
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="analytics tabs"
            variant="fullWidth"
          >
            {analyticsTabs.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                    <Typography variant="h6">{tab.label}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {tab.description}
                    </Typography>
                  </Box>
                }
                {...a11yProps(index)}
                sx={{ 
                  minHeight: 80,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: `${tab.color}.main`,
                    fontWeight: 'bold'
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        {analyticsTabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            {tab.component}
          </TabPanel>
        ))}

        {/* Footer Info */}
        <Box sx={{ 
          bgcolor: 'grey.50', 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="textSecondary">
            Dữ liệu được cập nhật tự động từ hệ thống
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AnalyticsManager;
