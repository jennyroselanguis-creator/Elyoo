import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../api/client';
import { format } from 'date-fns';
import { formatPeso } from '../../utils/currency';

const STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderAPI.getAll();
        setOrders(res.data.data || []);
      } catch {
        toast.error('Unable to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success('Order status updated.');
    } catch (error) {
      toast.error('Could not update order. Please try again.');
    }
  };

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total · manage fulfillment status</p>
        </div>
        <div className="admin-page-actions">
          <select
            className="status-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <p className="admin-loading">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p className="empty-admin">No orders match this filter.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_number || `#${order.id}`}</strong>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_email}</td>
                  <td>{formatPeso(order.total_amount || 0)}</td>
                  <td>{Array.isArray(order.items) ? order.items.length : 0}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="status-select"
                      disabled={(order.status || '').toLowerCase() === 'cancelled'}
                    >
                      {STATUS_OPTIONS.filter((s) => s !== 'cancelled' || (order.status || '').toLowerCase() === 'cancelled').map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {order.created_at
                      ? format(new Date(order.created_at), 'MMM d, yyyy')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
