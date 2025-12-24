import React from 'react';
import { Navigate } from 'react-router-dom';
import authAPI from '../api/authAPI';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  const API_URL = import.meta.env.VITE_API_URL;
  
  if (!isAuthenticated) {
      window.location.href = `${API_URL}/admin/login`;
  }
  
  return children;
};

export const PublicRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/post-office/shippers" replace />;
  }
  
  return children;
};
