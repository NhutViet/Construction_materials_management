import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
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
import Profile from "./components/bodyComponents/profile/Profile";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  const theme = createTheme({
    spacing: 4,
    palette: {
      mode: "light",

      // primary: {
      //   main: "#573BFE",
      // },
      // text: {
      //   primary: "#202635",
      //   secondary: "#A0AEC0",
      // },
      // secondary: {
      //   main: "#01C0F6",
      // },
      // error: {
      //   main: "#E03137",
      // },
    },

    typography: {
      fontFamily: "Inter",
    },
    //here we customize our typographi and in the variant prop we can use out myVar value
  });
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
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
          <Route path="/dashboard/customers" element={<Customer />}></Route>
          <Route path="/dashboard/revenue" element={<Revenue />}></Route>
          <Route path="/dashboard/growth" element={<Growth />}></Route>
          <Route path="/dashboard/stock-in" element={<StockIn />}></Route>
          <Route path="/dashboard/settings" element={<Setting />}></Route>
          <Route path="/dashboard/profile" element={<Profile />}></Route>
        </Route>
      </>
    )
  );

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
      <CssBaseline />
    </ThemeProvider>
  );
};

export default App;
