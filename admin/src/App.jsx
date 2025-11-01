import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Warehouses from "./pages/Warehouses";
import MainLayout from "./pages/MainLayout";
import LoginPage from "./pages/LoginPage";
import { ToastContainer } from "react-toastify";
import ShippingRate from "./pages/ShippingRate";

function App() {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<MainLayout />}>
          <Route path="home" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="shipping-rate" element={<ShippingRate/>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
