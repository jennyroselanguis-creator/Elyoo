import React from 'react';
import { FiCheck, FiPackage, FiTruck, FiClock, FiX } from 'react-icons/fi';
import '../styles/order-tracking.css';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: FiClock },
  { key: 'processing', label: 'Processing', icon: FiPackage },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiCheck },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderStatusTimeline({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  const isCancelled = normalized === 'cancelled';

  if (isCancelled) {
    return (
      <div className="order-timeline cancelled">
        <div className="timeline-step active cancelled-step">
          <span className="step-icon"><FiX /></span>
          <span className="step-label">Order Cancelled</span>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(normalized);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="order-timeline">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        const state = isComplete ? 'complete' : isActive ? 'active' : 'upcoming';
        return (
          <div key={step.key} className={`timeline-step ${state}`}>
            <div className="step-marker">
              <span className="step-icon"><Icon /></span>
            </div>
            <span className="step-label">{step.label}</span>
            {index < STEPS.length - 1 && <div className="step-connector" />}
          </div>
        );
      })}
    </div>
  );
}
