import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Warehouses from "./pages/Warehouses";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";


function App() {
  return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-orange-50 min-h-screen">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/warehouses" element={<Warehouses />} />
          </Routes>
        </div>
      </div>
  );
}

export default App;
