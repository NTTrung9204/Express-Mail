import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/post-office/login" replace />} />
      <Route path="/post-office/login" element={<LoginPage />} />
      
      <Route path="/post-office" element={<MainLayout />}>
        <Route path="home" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/post-office/login" replace />} />
    </Routes>
  );
}
