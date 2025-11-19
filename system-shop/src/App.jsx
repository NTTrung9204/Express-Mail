import CreateOrderPage from "./pages/CreateOrderPage";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainLayout from "./pages/MainLayout";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrdersLayoutPage from "./pages/OrdersLayoutPage";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="orders">
            <Route path="create-order" element={<CreateOrderPage />} />
            <Route path=":tabId" element={<OrdersLayoutPage />} />
          </Route>

          <Route path="order-history" element={<OrderHistoryPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
