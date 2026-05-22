import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store/store';

/**
 * Blocks staff — only administrators can access wrapped routes.
 * Supports being used as a route guard (returns <Outlet />) or as a
 * wrapper component (renders children directly).
 */
export default function RequireAdmin({ children }) {
  const { isAdmin } = useStore();

  if (!isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }

  if (children) return <>{children}</>;
  return <Outlet />;
}
