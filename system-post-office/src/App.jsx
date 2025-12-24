import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer} from 'react-toastify';
import MainLayout from "./pages/MainLayout";
import LoginPage from "./pages/LoginPage";
import Shippers from "./pages/Shippers"; 
import Orders from "./pages/orders/Orders";
import ReceivedOrders from "./pages/orders/ReceivedOrders";
import FailedOrders from "./pages/orders/FailedOrders";
import RequestOrders from "./pages/orders/RequestOrders";
import InComingOrders from "./pages/orders/InComingOrders";
import OrderHistory from "./pages/orders/OrderHistory";
import ClassifiedOrders from "./pages/orders/ClassifiedOrders";
import TransitingOrders from "./pages/orders/TransitingOrders";
import DeliveryPlans from "./pages/orders/DeliveryPlans";
import Staffs from "./pages/Staffs";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import authAPI from "./api/authAPI";
import { setupAuthInterceptor } from "./interceptor/authInterceptor";
import ChangePasswordPage from "./pages/ChangePasswordPage";

export default function App() {
   useEffect(() => {
    setupAuthInterceptor();
  }, []);
  const isAuthenticated = authAPI.isAuthenticated();

  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/post-office/shippers" : "/post-office/login"} replace />} />

        <Route 
          path="/post-office" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="shippers" element={<Shippers />} />
          <Route path="change-password" element={<ChangePasswordPage />} />

          <Route path="orders" element={<Orders />}>
            <Route path="received" element={<ReceivedOrders />} />
            <Route path="failed" element={<FailedOrders />} />
            <Route path="request" element={<RequestOrders />} />
            <Route path="classified" element={<ClassifiedOrders />} />
            <Route path="incoming" element={<InComingOrders />} />
            <Route path="transiting" element={<TransitingOrders />} />
          </Route>

          <Route path="delivery-plans" element={<DeliveryPlans />} />
          <Route path="staffs" element={<Staffs />} />
        </Route>

        <Route 
          path="/post-office/orders/history" 
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/post-office/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/post-office/home" : "/post-office/login"} replace />} />
      </Routes>
    </div>
  );
}
