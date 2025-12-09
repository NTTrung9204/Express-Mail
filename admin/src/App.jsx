import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Users from "./pages/Users";
import Warehouses from "./pages/Warehouses";
import MainLayout from "./pages/MainLayout";
import LoginPage from "./pages/LoginPage";
import { ToastContainer } from "react-toastify";
import ShippingRate from "./pages/ShippingRate";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ShopRegisterPage from "./pages/ShopRegisterPage";
import ProtectedRoute from "./components/common/ProtectedRoute"; 

function App() {
  return (
    <div>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />
        <Route path="/shop-register" element={<ShopRegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="users" element={<Users />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="shipping-rate" element={<ShippingRate />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
