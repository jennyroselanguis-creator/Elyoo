import React from 'react';
import { FiShield } from 'react-icons/fi';
import '../styles/checkout-trust.css';

export default function CheckoutTrustNotice() {
  return (
    <div className="checkout-trust" role="note">
      <FiShield aria-hidden />
      <div>
        <strong>Verified checkout</strong>
        <p>
          Prices and stock are confirmed from our catalog at checkout. Orders below ₱10,000
          (before tax) cannot be placed. Temporary email addresses are not accepted.
        </p>
      </div>
    </div>
  );
}
