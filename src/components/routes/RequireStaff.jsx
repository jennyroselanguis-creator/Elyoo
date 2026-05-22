import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../../store/store';

export default function RequireStaff() {
  const { isStaff } = useStore();
  const location = useLocation();

  if (!isStaff) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
