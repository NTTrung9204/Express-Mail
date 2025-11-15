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
import ClassifiedOrders from "./pages/orders/ClassifiedOrders";
import Staffs from "./pages/Staffs";

export default function App() {
  return (
    <div>
      <ToastContainer/>
      <Routes>


        <Route path="/" element={<MainLayout />}>
          <Route path="home" element={<Dashboard />} />
          <Route path="shippers" element={<Shippers />} />

          <Route path="orders" element={<Orders />}>
            <Route path="received" element={<ReceivedOrders />} />
            <Route path="failed" element={<FailedOrders />} />
            <Route path="requests" element={<RequestOrders />} />
            <Route path="classified" element={<ClassifiedOrders />} />
          </Route>

          <Route path="staffs" element={<Staffs />} />

        </Route>

        <Route path="*" element={<Navigate to="/post-office/login" replace />} />
      </Routes>
    </div>
  );
}
