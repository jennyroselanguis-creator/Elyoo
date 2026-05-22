import React from 'react';
import { FiLock, FiShield } from 'react-icons/fi';
import '../styles/forms.css';

export default function SecureBadge({ variant = 'checkout' }) {
  return (
    <div className={`secure-badge secure-badge--${variant}`}>
      <FiShield className="secure-badge-icon" aria-hidden="true" />
      <div className="secure-badge-text">
        <strong>
          <FiLock aria-hidden="true" /> Secure {variant === 'checkout' ? 'Checkout' : 'Connection'}
        </strong>
        <span>Your data is encrypted and validated before submission</span>
      </div>
    </div>
  );
}
