import React from 'react';
import { FiMapPin, FiHome, FiNavigation, FiGlobe, FiLock } from 'react-icons/fi';
import FormField from './FormField';
import { buildFormattedAddress } from '../utils/addressUtils';
import '../styles/address-form.css';

const COUNTRIES = ['Philippines', 'United States', 'Singapore', 'Malaysia', 'Other'];

export default function DeliveryAddressForm({
  value,
  onChange,
  errors = {},
  touched = {},
  onBlurField,
}) {
  const update = (field, val) => {
    onChange({ ...value, [field]: val });
  };

  const blurWithValue = (field, val) => {
    onBlurField?.(field, { ...value, [field]: val });
  };

  const preview = value.line1 || value.city ? buildFormattedAddress(value) : null;
  const fieldTouched = (key) => Boolean(touched[key]);

  return (
    <section className="delivery-address-section" aria-labelledby="delivery-address-heading">
      <div className="delivery-address-header">
        <div className="delivery-address-title">
          <FiMapPin className="delivery-icon" aria-hidden="true" />
          <div>
            <h4 id="delivery-address-heading">Secure Delivery Address</h4>
            <p>Structured fields help couriers deliver safely and reduce errors</p>
          </div>
        </div>
        <div className="address-privacy-badge" title="Address is encrypted in transit">
          <FiLock aria-hidden="true" />
          <span>Private</span>
        </div>
      </div>

      <div className="delivery-address-grid">
        <FormField
          label="Street / unit / building"
          name="line1"
          value={value.line1}
          onChange={(e) => update('line1', e.target.value)}
          onBlur={(e) => blurWithValue('line1', e.target.value)}
          error={fieldTouched('line1') ? errors.line1 : undefined}
          hint="House no., street name, subdivision, tower/unit"
          required
          maxLength={120}
          placeholder="123 Rizal St., Unit 4B, Green Residences"
          autoComplete="address-line1"
          icon={FiHome}
        />

        <FormField
          label="Barangay / landmark (optional)"
          name="line2"
          value={value.line2}
          onChange={(e) => update('line2', e.target.value)}
          onBlur={(e) => blurWithValue('line2', e.target.value)}
          error={fieldTouched('line2') ? errors.line2 : undefined}
          hint="Helps riders find you faster"
          maxLength={80}
          placeholder="Near SM Mall, Brgy. San Antonio"
          autoComplete="address-line2"
          icon={FiNavigation}
        />

        <div className="address-row-2">
          <FormField
            label="City / municipality"
            name="city"
            value={value.city}
            onChange={(e) => update('city', e.target.value)}
            onBlur={(e) => blurWithValue('city', e.target.value)}
            error={fieldTouched('city') ? errors.city : undefined}
            required
            maxLength={60}
            placeholder="Quezon City"
            autoComplete="address-level2"
          />
          <FormField
            label="Province / region"
            name="province"
            value={value.province}
            onChange={(e) => update('province', e.target.value)}
            onBlur={(e) => blurWithValue('province', e.target.value)}
            error={fieldTouched('province') ? errors.province : undefined}
            required
            maxLength={60}
            placeholder="Metro Manila"
            autoComplete="address-level1"
          />
        </div>

        <div className="address-row-2">
          <FormField
            label="Postal / ZIP code"
            name="postal_code"
            value={value.postal_code}
            onChange={(e) =>
              update('postal_code', e.target.value.replace(/[^\dA-Za-z\s-]/g, ''))
            }
            onBlur={(e) =>
              blurWithValue('postal_code', e.target.value.replace(/[^\dA-Za-z\s-]/g, ''))
            }
            error={fieldTouched('postal_code') ? errors.postal_code : undefined}
            required
            maxLength={12}
            placeholder={value.country === 'Philippines' ? '1100' : 'ZIP code'}
            autoComplete="postal-code"
          />
          <div className="form-field">
            <label htmlFor="address_country" className="form-label">
              Country<span className="required-mark">*</span>
            </label>
            <div className="form-input-wrap">
              <FiGlobe className="form-field-icon" aria-hidden="true" />
              <select
                id="address_country"
                name="country"
                className="form-control form-select"
                value={value.country}
                onChange={(e) => update('country', e.target.value)}
                onBlur={(e) => blurWithValue('country', e.target.value)}
                autoComplete="country-name"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {fieldTouched('country') && errors.country && (
              <p className="form-error" role="alert">
                {errors.country}
              </p>
            )}
          </div>
        </div>
      </div>

      {preview && (
        <div className="address-preview-card" aria-live="polite">
          <div className="address-preview-label">
            <FiMapPin aria-hidden="true" /> Delivery preview
          </div>
          <pre className="address-preview-text">{preview}</pre>
        </div>
      )}

      <p className="address-security-note">
        <FiLock aria-hidden="true" />
        Your full address is only shared with our delivery team and stored securely. We never
        publish or sell location data.
      </p>
    </section>
  );
}
