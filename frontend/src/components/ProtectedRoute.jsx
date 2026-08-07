import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Route guard component protecting private views
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem('sms_token');
  const user = authService.getCurrentUser();

  // If no auth token, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user role isn't allowed, redirect to main dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render matching child routes
  return <Outlet />;
};

export default ProtectedRoute;
