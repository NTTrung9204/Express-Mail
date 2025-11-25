import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer} from 'react-toastify';
import MainLayout from "./pages/MainLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Shippers from "./pages/Shippers"; 
import Orders from "./pages/orders/Orders";
import ReceivedOrders from "./pages/orders/ReceivedOrders";
import FailedOrders from "./pages/orders/FailedOrders";
import RequestOrders from "./pages/orders/RequestOrders";
import InComingOrders from "./pages/orders/InComingOrders";
import OrderHistory from "./pages/orders/OrderHistory";
import ClassifiedOrders from "./pages/orders/ClassifiedOrders";
import DeliveryPlans from "./pages/orders/DeliveryPlans";
import Staffs from "./pages/Staffs";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import authAPI from "./api/authAPI";

export default function App() {
  const isAuthenticated = authAPI.isAuthenticated();

  return (
    <div>
      <ToastContainer/>
      <Routes>
        {/* If authenticated, redirect root to home */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/post-office/home" : "/post-office/login"} replace />} />

        {/* Protected routes - only accessible if logged in */}
        <Route 
          path="/post-office" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<Dashboard />} />
          <Route path="shippers" element={<Shippers />} />

          <Route path="orders" element={<Orders />}>
            <Route path="received" element={<ReceivedOrders />} />
            <Route path="failed" element={<FailedOrders />} />
            <Route path="request" element={<RequestOrders />} />
            <Route path="classified" element={<ClassifiedOrders />} />
            <Route path="incoming" element={<InComingOrders />} />
          </Route>

          <Route path="delivery-plans" element={<DeliveryPlans />} />
          <Route path="staffs" element={<Staffs />} />
        </Route>

        {/* Order History - standalone route outside MainLayout */}
        <Route 
          path="/post-office/orders/history" 
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } 
        />

        {/* Public route - redirect to home if already logged in */}
        <Route 
          path="/post-office/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Catch all - redirect to appropriate page */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/post-office/home" : "/post-office/login"} replace />} />
      </Routes>
    </div>
  );
}
