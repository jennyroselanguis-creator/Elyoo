import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import { parseStoredAddress } from '../utils/addressUtils';
import '../styles/address-form.css';

export default function AddressDisplay({ address, variant = 'full' }) {
  const parsed = parseStoredAddress(address);

  if (!parsed.formatted && !parsed.lines?.length) {
    return <p className="order-address">—</p>;
  }

  if (variant === 'compact') {
    return (
      <p className="order-address order-address-compact">
        <FiMapPin aria-hidden="true" /> {parsed.lines[0] || parsed.formatted}
      </p>
    );
  }

  return (
    <div className="address-display-block">
      <div className="address-display-label">
        <FiMapPin aria-hidden="true" /> Shipping to
      </div>
      <address className="address-display-lines">
        {parsed.lines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </address>
      {!parsed.legacy && (
        <span className="address-verified-tag">Verified format</span>
      )}
    </div>
  );
}
