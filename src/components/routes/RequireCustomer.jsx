import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store/store';

export default function RequireCustomer() {
  const { isStaff } = useStore();

  if (isStaff) {
    return <Navigate to="/admin/orders" replace />;
  }

  return <Outlet />;
}
