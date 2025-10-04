import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Warehouses from "./pages/Warehouses";
import MainLayout from "./pages/MainLayout";

function App() {
  return (
      <Routes>
        <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route path="/users" element={
            <MainLayout>
              <Users />
            </MainLayout>
          }
        />
        <Route path="/warehouses" element={
            <MainLayout>
              <Warehouses />
            </MainLayout>
          }
        />
        <Route
        path="/warehouses"
        element={
          <MainLayout>
            <Warehouses />
          </MainLayout>
        }
      />
      </Routes>
  );
}

export default App;
