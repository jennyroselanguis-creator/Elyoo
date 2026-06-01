import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';
import { useStore } from '../store/store';
import { cartAPI, productAPI } from '../api/client';
import FormField from '../components/FormField';
import DeliveryAddressForm from '../components/DeliveryAddressForm';
import SecureBadge from '../components/SecureBadge';
import CheckoutTrustNotice from '../components/CheckoutTrustNotice';
import { ORDER_TAX_RATE, MIN_ORDER_SUBTOTAL } from '../utils/orderSecurity';
import { SECURE_MESSAGES } from '../utils/security';
import { EMPTY_ADDRESS } from '../utils/addressUtils';
import {
  validateCheckoutForm,
  validateName,
  validateEmail,
  validatePhone,
  validateDeliveryAddress,
} from '../utils/validators';
import '../styles/cart.css';
import '../styles/address-form.css';

const EMPTY_FORM = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  address: { ...EMPTY_ADDRESS },
  website: '',
};

const ADDRESS_KEYS = ['line1', 'line2', 'city', 'province', 'postal_code', 'country'];

function clearAddressErrors(errors) {
  const next = { ...errors };
  ADDRESS_KEYS.forEach((k) => delete next[k]);
  return next;
}

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, clearCart, setProducts } = useStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const tax = Math.round(cartTotal * ORDER_TAX_RATE * 100) / 100;
  const grandTotal = Math.round((cartTotal + tax) * 100) / 100;
  const belowMinimum = cartTotal > 0 && cartTotal < MIN_ORDER_SUBTOTAL;

  const flatFormForValidation = () => ({
    customer_name: form.customer_name,
    customer_email: form.customer_email,
    customer_phone: form.customer_phone,
    address_line1: form.address.line1,
    address_line2: form.address.line2,
    address_city: form.address.city,
    address_province: form.address.province,
    address_postal: form.address.postal_code,
    address_country: form.address.country,
  });

  const handleAddressChange = (address) => {
    setForm((prev) => ({ ...prev, address }));
    const addrResult = validateDeliveryAddress(address);
    setErrors((e) => {
      const next = clearAddressErrors(e);
      if (!addrResult.valid) Object.assign(next, addrResult.errors);
      return next;
    });
  };

  const validateField = (name, value) => {
    let result = { valid: true };
    switch (name) {
      case 'customer_name':
        result = validateName(value);
        break;
      case 'customer_email':
        result = validateEmail(value);
        break;
      case 'customer_phone':
        result = validatePhone(value, true);
        break;
      default:
        break;
    }
    setErrors((e) => ({
      ...e,
      [name]: result.valid ? undefined : result.error,
    }));
    return result.valid;
  };

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    if (name === 'customer_name' || name === 'customer_email' || name === 'customer_phone') {
      validateField(name, form[name]);
    }
  };

  const handleAddressBlur = (field, latestAddress) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const addr = latestAddress || form.address;
    const addrResult = validateDeliveryAddress(addr);
    setForm((prev) => ({ ...prev, address: { ...prev.address, ...addr } }));
    setErrors((e) => {
      const next = clearAddressErrors(e);
      if (!addrResult.valid) Object.assign(next, addrResult.errors);
      return next;
    });
  };

  const handleQuantityChange = (productId, quantity, maxStock) => {
    const q = Math.min(Math.max(1, quantity || 1), maxStock || 99);
    updateCartQuantity(productId, q);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (form.website) return;

    setTouched({
      customer_name: true,
      customer_email: true,
      customer_phone: true,
      address: true,
      ...ADDRESS_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    });

    const validation = validateCheckoutForm(flatFormForValidation());
    setErrors(validation.errors);

    if (!validation.valid) {
      toast.error('Please correct the errors above.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await cartAPI.checkout(cart, {
        ...validation.values,
        _hp: form.website,
      });
      const order = res.data.data;
      clearCart();
      setCheckoutOpen(false);
      setForm(EMPTY_FORM);
      setErrors({});
      setTouched({});
      if (order?.savedLocally) {
        toast.success('Order saved locally.');
        toast(SECURE_MESSAGES.DATABASE_SETUP, { duration: 9000, icon: 'ℹ️' });
      } else {
        toast.success('Order placed successfully!');
      }
      const productsRes = await productAPI.getAll();
      setProducts(productsRes.data.data || []);
      if (validation.values.customer_email) {
        navigate(`/orders?email=${encodeURIComponent(validation.values.customer_email)}`);
      }
    } catch (error) {
      toast.error(error.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container empty-cart form-page-shell">
        <div className="form-card empty-cart-card">
          <h2>Your Cart is Empty</h2>
          <p>Discover premium smartphones and add your favorites.</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="cart-page-header">
        <h1>Shopping Cart</h1>
        <span className="cart-item-count">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={`cart-layout ${checkoutOpen ? 'cart-layout--checkout' : ''}`}>
        <div className="cart-main">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image || '/images/iphone/iphone15.jpg'} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>
                    <Link to={`/product/${item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="item-model">Model: {item.model}</p>
                  <p className="item-price">{formatPeso(item.price)}</p>
                </div>
                <div className="item-quantity">
                  <label htmlFor={`qty-${item.id}`}>Qty</label>
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    max={item.stock || 99}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value, 10), item.stock)
                    }
                    className="qty-input"
                  />
                </div>
                <div className="item-total">
                  <p>{formatPeso(parseFloat(item.price) * item.quantity)}</p>
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove"
                  aria-label={`Remove ${item.name}`}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="cart-sidebar">
          <div className="cart-summary form-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPeso(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="text-success">Free</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>{formatPeso(tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPeso(grandTotal)}</span>
            </div>
            {belowMinimum && (
              <p className="cart-minimum-notice">
                Add {formatPeso(MIN_ORDER_SUBTOTAL - cartTotal)} more to reach the ₱
                {MIN_ORDER_SUBTOTAL.toLocaleString()} minimum (before tax).
              </p>
            )}

            {!checkoutOpen && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-checkout"
                  onClick={() => setCheckoutOpen(true)}
                  disabled={belowMinimum}
                >
                  Proceed to Secure Checkout
                </button>
                <Link to="/" className="btn btn-secondary btn-continue">
                  Continue Shopping
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>

      {checkoutOpen && (
        <section className="cart-checkout-section form-card" aria-labelledby="checkout-heading">
          <div className="cart-checkout-header">
            <div>
              <h2 id="checkout-heading">Secure checkout</h2>
              <p>Complete your details below — your cart is saved on the left.</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-checkout-close"
              onClick={() => setCheckoutOpen(false)}
              disabled={submitting}
            >
              Back to cart
            </button>
          </div>

          <CheckoutTrustNotice />
          <div className="checkout-steps">
            <span className="checkout-step done">Cart</span>
            <span className="checkout-step active">Details</span>
            <span className="checkout-step">Confirm</span>
          </div>
          <SecureBadge variant="checkout" />

          <form className="checkout-form-validated checkout-form-grid" onSubmit={handleCheckout} noValidate>
            <div className="hp-field" aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div className="checkout-block checkout-block--contact">
              <p className="checkout-section-label">Contact information</p>
              <div className="checkout-contact-block">
                <FormField
                  label="Full name"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  onBlur={() => handleBlur('customer_name')}
                  error={touched.customer_name ? errors.customer_name : undefined}
                  required
                  maxLength={80}
                  placeholder="Juan Dela Cruz"
                  autoComplete="name"
                  icon={FiUser}
                />
                <FormField
                  label="Email"
                  name="customer_email"
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  onBlur={() => handleBlur('customer_email')}
                  error={touched.customer_email ? errors.customer_email : undefined}
                  required
                  maxLength={254}
                  placeholder="you@email.com"
                  autoComplete="email"
                  icon={FiMail}
                />
                <FormField
                  label="Mobile number"
                  name="customer_phone"
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  onBlur={() => handleBlur('customer_phone')}
                  error={touched.customer_phone ? errors.customer_phone : undefined}
                  hint="Required for delivery updates and rider contact"
                  required
                  maxLength={20}
                  placeholder="+63 9XX XXX XXXX"
                  autoComplete="tel"
                  icon={FiPhone}
                />
              </div>
            </div>

            <div className="checkout-block checkout-block--address">
              <DeliveryAddressForm
                value={form.address}
                onChange={handleAddressChange}
                errors={errors}
                touched={touched}
                onBlurField={handleAddressBlur}
              />
            </div>

            <div className="checkout-block checkout-block--summary">
              <div className="checkout-summary-sticky">
                <h4>Order total</h4>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPeso(cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>{formatPeso(tax)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPeso(grandTotal)}</span>
                </div>
                <div className="form-actions checkout-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting || belowMinimum}>
                    {submitting ? 'Placing order...' : 'Place Order Securely'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
