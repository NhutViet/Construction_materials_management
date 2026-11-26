import { ThemeProvider, CssBaseline, createTheme, responsiveFontSizes } from "@mui/material";
import RootComponent from "./components/RootComponent";
import RootPage from "./components/RootPage";
import "../public/app.css";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Home from "./components/bodyComponents/home/Home";
import Inventory from "./components/bodyComponents/inventory/Inventory";
import Customer from "./components/bodyComponents/customer/Customer";
import Revenue from "./components/bodyComponents/revenue/Revenue";
import Growth from "./components/bodyComponents/growth/Growth";
import StockIn from "./components/bodyComponents/Stock-in/Stock-in";
import Setting from "./components/bodyComponents/Settings/Setting";
import Order from "./components/bodyComponents/order/Order";
import DeliveryHistoryPage from "./components/bodyComponents/order/DeliveryHistoryPage";
import DeliveryLogPage from "./components/bodyComponents/order/DeliveryLogPage";
import Profile from "./components/bodyComponents/profile/Profile";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicInvoiceSearch from "./components/PublicInvoiceSearch";
import HomePage from "./components/HomePage";
import { StockInAnalytics } from "./components/bodyComponents/analytics";

const App: React.FC = () => {
  const theme = responsiveFontSizes(
    createTheme({
      spacing: 4,
      palette: {
        mode: "light",
      },
      shape: {
        borderRadius: 10,
      },
      typography: {
        fontFamily: "Inter",
        button: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            html: {
              WebkitTextSizeAdjust: "100%",
            },
            body: {
              overflowX: "hidden",
              WebkitTapHighlightColor: "transparent",
            },
            "img, svg": {
              maxWidth: "100%",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              minHeight: 40,
            },
            sizeSmall: {
              minHeight: 32,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              touchAction: "manipulation",
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 12,
            },
          },
        },
        MuiTooltip: {
          defaultProps: {
            enterTouchDelay: 0,
          },
        },
      },
    }),
    { factor: 2.2 }
  );
  
  const basePath = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/$/, '');
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search-invoice" element={<PublicInvoiceSearch />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <RootComponent />
            </ProtectedRoute>
          }
        >
          <Route index element={<RootPage />} />
          <Route path="/dashboard/home" element={<Home />}></Route>
          <Route path="/dashboard/inventory" element={<Inventory />}></Route>
          <Route path="/dashboard/orders" element={<Order />}></Route>
          <Route path="/dashboard/orders/:invoiceId/deliveries" element={<DeliveryHistoryPage />}></Route>
          <Route path="/dashboard/deliveries" element={<DeliveryLogPage />}></Route>
          <Route path="/dashboard/customers" element={<Customer />}></Route>
          <Route path="/dashboard/revenue" element={<Revenue />}></Route>
          <Route path="/dashboard/growth" element={<Growth />}></Route>
          <Route path="/dashboard/stock-in" element={<StockIn />}></Route>
          <Route path="/dashboard/stock-in-analytics" element={<StockInAnalytics />}></Route>
          <Route path="/dashboard/settings" element={<Setting />}></Route>
          <Route path="/dashboard/profile" element={<Profile />}></Route>
        </Route>
      </>
    ),
    { basename: basePath }
  );

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
      <CssBaseline />
    </ThemeProvider>
  );
};

export default App;
