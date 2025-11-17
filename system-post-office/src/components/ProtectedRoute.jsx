import React from 'react';
import { Navigate } from 'react-router-dom';
import authAPI from '../api/authAPI';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/post-office/login" replace />;
  }
  
  return children;
};

export const PublicRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/post-office/home" replace />;
  }
  
  return children;
};
