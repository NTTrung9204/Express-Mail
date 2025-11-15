import CreateOrderPage from "./pages/CreateOrderPage";
import OrderDeliverPage from "./pages/OrderDeliverPage";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainLayout from "./pages/MainLayout";
import OrderDraftPage from "./pages/OrderDraftPage";
import { Navigate } from "react-router-dom";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="orders/order-draft" replace />} />
          <Route path="orders">
            <Route path="create-order" element={<CreateOrderPage />} />
            <Route path="order-delivery" element={<OrderDeliverPage />} />
            <Route path="order-draft" element={<OrderDraftPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
