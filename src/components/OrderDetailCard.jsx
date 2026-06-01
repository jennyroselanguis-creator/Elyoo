import React from 'react';
import { format } from 'date-fns';
import { formatPeso } from '../utils/currency';
import OrderStatusTimeline from './OrderStatusTimeline';
import AddressDisplay from './AddressDisplay';
import '../styles/order-tracking.css';
import '../styles/address-form.css';

export default function OrderDetailCard({ order, onCancel }) {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const total = parseFloat(order.total_amount) || 0;
  const subtotal = Math.round((total / 1.1) * 100) / 100;
  const tax = Math.round((total - subtotal) * 100) / 100;

  return (
    <div className="order-detail-card">
      <div className="order-detail-header">
        <div>
          <h2>{order.order_number}</h2>
          <p className="order-date">
            Placed{' '}
            {order.created_at
              ? format(new Date(order.created_at), 'MMMM d, yyyy · h:mm a')
              : '—'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span className={`order-status-pill status-${(order.status || 'pending').toLowerCase()}`}>
            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
          </span>
          {(order.status || 'pending').toLowerCase() === 'pending' && onCancel && (
            <button
              type="button"
              className="cancel-link-btn"
              style={{
                background: 'none',
                border: 'none',
                color: '#b83c3c',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '4px 0',
              }}
              onClick={() => onCancel(order.id)}
            >
              Cancel order
            </button>
          )}
        </div>
      </div>

      <OrderStatusTimeline status={order.status} />

      <div className="order-detail-grid">
        <div className="order-info-block order-delivery-block">
          <h4>Delivery</h4>
          <p><strong>{order.customer_name}</strong></p>
          <p className="delivery-contact-line">{order.customer_email}</p>
          {order.customer_phone && (
            <p className="delivery-contact-line">{order.customer_phone}</p>
          )}
          <AddressDisplay address={order.customer_address} />
        </div>
        <div className="order-info-block">
          <h4>Summary</h4>
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{formatPeso(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>Tax (10%)</span>
            <span>{formatPeso(tax)}</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span>{formatPeso(total)}</span>
          </div>
        </div>
      </div>

      <div className="order-items-list">
        <h4>Items ({items.length})</h4>
        {items.map((item, idx) => (
          <div key={idx} className="order-item-row">
            {item.image && (
              <img src={item.image} alt={item.name} className="order-item-thumb" />
            )}
            <div className="order-item-info">
              <span className="order-item-name">{item.name}</span>
              <span className="order-item-qty">Qty: {item.quantity}</span>
            </div>
            <span className="order-item-price">
              {formatPeso(parseFloat(item.price) * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
