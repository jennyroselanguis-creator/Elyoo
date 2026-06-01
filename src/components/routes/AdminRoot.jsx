import React from 'react';
import { useStore } from '../../store/store';
import AdminDashboard from '../../pages/admin/Dashboard';

import AdminOrders from '../../pages/admin/Orders';

export default function AdminRoot() {
  const { isAdmin } = useStore();

  if (!isAdmin) {
    return <AdminOrders />;
  }

  return <AdminDashboard />;
}
