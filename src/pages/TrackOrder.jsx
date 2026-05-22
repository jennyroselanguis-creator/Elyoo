import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiList, FiMail, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { orderAPI } from '../api/client';
import OrderDetailCard from '../components/OrderDetailCard';
import FormField from '../components/FormField';
import SecureBadge from '../components/SecureBadge';
import {
  getLocalOrders,
  getSavedTrackerEmail,
  setSavedTrackerEmail,
} from '../utils/orderStorage';
import { validateEmail } from '../utils/validators';
import { formatPeso } from '../utils/currency';
import '../styles/order-tracking.css';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [myOrdersEmail, setMyOrdersEmail] = useState(getSavedTrackerEmail());
  const [myOrders, setMyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [myOrdersError, setMyOrdersError] = useState(undefined);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      const mailR = validateEmail(emailParam);
      if (mailR.valid) {
        setMyOrdersEmail(mailR.value);
        loadOrders(mailR.value);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const local = getLocalOrders();
    if (local.length > 0 && myOrders.length === 0 && !searchParams.get('email')) {
      setMyOrders(local);
      if (local[0]) setSelectedOrder(local[0]);
    }
  }, [myOrders.length, searchParams]);

  const loadOrders = async (email) => {
    setMyOrdersError(undefined);
    const mailR = validateEmail(email);
    if (!mailR.valid) {
      setMyOrdersError(mailR.error);
      return;
    }

    setLoadingList(true);
    setSelectedOrder(null);
    try {
      const res = await orderAPI.getByEmail(mailR.value);
      const list = res.data.data || [];
      setMyOrders(list);
      setSavedTrackerEmail(mailR.value);
      if (list.length > 0) {
        setSelectedOrder(list[0]);
      } else {
        toast('No orders found for this email.', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error('Unable to load orders. Please try again.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleLoadMyOrders = async (e) => {
    e?.preventDefault();
    await loadOrders(myOrdersEmail);
  };

  return (
    <div className="container orders-page">
      <div className="orders-hero">
        <h1>My Orders</h1>
        <p>View orders placed with your email — select any order to see status and delivery details.</p>
      </div>

      <SecureBadge variant="track" />

      <div className="orders-layout">
        <aside className="orders-sidebar form-card">
          <div className="form-card-header">
            <h3>Find your orders</h3>
            <p>Enter the email you used at checkout</p>
          </div>
          <form className="orders-email-form" onSubmit={handleLoadMyOrders} noValidate>
            <FormField
              label="Your email"
              name="myOrdersEmail"
              type="email"
              value={myOrdersEmail}
              onChange={(e) => {
                setMyOrdersEmail(e.target.value);
                setMyOrdersError(undefined);
              }}
              error={myOrdersError}
              required
              maxLength={254}
              placeholder="you@email.com"
              autoComplete="email"
              icon={FiMail}
            />
            <button type="submit" className="btn btn-primary" disabled={loadingList}>
              {loadingList ? 'Loading...' : 'View Orders'}
            </button>
          </form>

          {myOrders.length > 0 ? (
            <div className="my-orders-list">
              <p className="orders-list-label">
                <FiList aria-hidden /> {myOrders.length} order{myOrders.length !== 1 ? 's' : ''}
              </p>
              {myOrders.map((order) => (
                <button
                  key={order.order_number || order.id}
                  type="button"
                  className={`my-order-card ${selectedOrder?.order_number === order.order_number ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="my-order-main">
                    <strong>{order.order_number}</strong>
                    <span
                      className={`order-status-pill small status-${(order.status || 'pending').toLowerCase()}`}
                    >
                      {order.status || 'pending'}
                    </span>
                  </div>
                  <div className="my-order-meta">
                    <span>{formatPeso(order.total_amount)}</span>
                    <span>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="orders-empty-hint">
              <FiShield aria-hidden /> No orders yet. Place an order from the shop, then return here with your email.
            </p>
          )}
        </aside>

        <section className="orders-detail-panel">
          {selectedOrder ? (
            <div className="form-card orders-detail-card">
              <OrderDetailCard order={selectedOrder} />
            </div>
          ) : (
            <div className="orders-detail-placeholder form-card">
              <FiList className="placeholder-icon" aria-hidden />
              <h3>Select an order</h3>
              <p>Enter your email and choose an order from the list to view full details.</p>
            </div>
          )}
        </section>
      </div>

      <p className="orders-footer-note">
        Need help? <Link to="/about">Contact support</Link> with your order number.
      </p>
    </div>
  );
}
