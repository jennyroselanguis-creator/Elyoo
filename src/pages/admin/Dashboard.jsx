import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTag, FiClipboard, FiUsers } from 'react-icons/fi';
import { useStore } from '../../store/store';
import { orderAPI } from '../../api/client';
import { formatPeso } from '../../utils/currency';

export default function AdminDashboard() {
  const { products, brands, isAdmin } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderAPI.getAll();
        setOrders(res.data.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const pending = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your Elyoo Mobile store</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Products</h3>
          <p className="stat-number">{products.length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Brands</h3>
          <p className="stat-number">{brands.length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Orders</h3>
          <p className="stat-number">{loading ? '…' : orders.length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Revenue</h3>
          <p className="stat-number">{formatPeso(revenue, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="dashboard-card">
          <h3>Pending orders</h3>
          <p className="stat-number">{loading ? '…' : pending}</p>
        </div>
      </div>

      <h2 className="admin-section-title">Quick actions</h2>
      <div className="dashboard-quick-links">
        <Link to="/admin/products" className="quick-link-card">
          <strong><FiPackage /> Manage products</strong>
          <span>Add, update, or remove devices</span>
        </Link>
        <Link to="/admin/brands" className="quick-link-card">
          <strong><FiTag /> Manage brands</strong>
          <span>Organize catalog by manufacturer</span>
        </Link>
        <Link to="/admin/orders" className="quick-link-card">
          <strong><FiClipboard /> View orders</strong>
          <span>Update status and fulfill shipments</span>
        </Link>
        {isAdmin && (
          <Link to="/admin/staff" className="quick-link-card">
            <strong><FiUsers /> Staff accounts</strong>
            <span>Add team members with store access</span>
          </Link>
        )}
      </div>
    </div>
  );
}
