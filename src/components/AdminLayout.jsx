import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiPackage,
  FiTag,
  FiClipboard,
  FiUsers,
  FiLogOut,
} from 'react-icons/fi';
import { useStore } from '../store/store';
import * as dataService from '../services/dataService';
import { roleLabel } from '../utils/roles';
import '../styles/admin.css';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/brands', label: 'Brands', icon: FiTag },
  { to: '/admin/orders', label: 'Orders', icon: FiClipboard },
];

const staffNavItems = [
  { to: '/admin/orders', label: 'Orders', icon: FiClipboard, end: true },
];

export default function AdminLayout() {
  const { user, isAdmin, logout, supabaseConnected, supabaseSource } = useStore();
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNavItems : staffNavItems;

  const handleLogout = async () => {
    await dataService.signOut();
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-brand-icon" aria-hidden="true">
            E
          </span>
          <div>
            <strong>{isAdmin ? 'Elyoo Admin' : 'Elyoo Orders'}</strong>
            <span>{isAdmin ? 'Store management' : 'Order fulfillment'}</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin/staff"
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <FiUsers aria-hidden="true" />
              Staff
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <span className="admin-user-name">{user?.full_name || user?.email}</span>
            <span className="admin-user-role">{roleLabel(user?.role)}</span>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <FiLogOut aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
