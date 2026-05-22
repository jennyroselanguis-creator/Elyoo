import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import AdminDashboard from '../../pages/admin/Dashboard';

export default function AdminRoot() {
  const { isAdmin } = useStore();

  if (!isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }

  return <AdminDashboard />;
}
