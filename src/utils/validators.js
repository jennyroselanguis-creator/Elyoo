/** Input validation & sanitization */
import { serializeAddress, parseStoredAddress } from './addressUtils';
import { isDisposableEmail } from './orderSecurity';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const ORDER_NUMBER_REGEX = /^ELY-[A-Z0-9]{4,24}$/i;
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;
const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s.'-]{2,80}$/;

export function sanitizeText(value, maxLen = 500) {
  if (value == null) return '';
  let s = String(value).replace(/<[^>]*>/g, '');
  // eslint-disable-next-line no-control-regex -- strip control characters
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  return s.trim()
    .slice(0, maxLen);
}

export function sanitizeEmail(value) {
  return sanitizeText(value, 254).toLowerCase();
}

export function validateEmail(email) {
  const v = sanitizeEmail(email);
  if (!v) return { valid: false, error: 'Email is required' };
  if (v.length > 254) return { valid: false, error: 'Email is too long' };
  if (!EMAIL_REGEX.test(v)) return { valid: false, error: 'Enter a valid email address' };
  if (isDisposableEmail(v)) {
    return { valid: false, error: 'Please use a permanent email address for orders' };
  }
  return { valid: true, value: v };
}

export function validatePassword(password, options = {}) {
  const minLen = options.minLength ?? 8;
  const v = String(password || '');
  if (!v) return { valid: false, error: 'Password is required' };
  if (v.length < minLen) {
    return { valid: false, error: `Password must be at least ${minLen} characters` };
  }
  if (v.length > 128) return { valid: false, error: 'Password is too long' };
  return { valid: true, value: v };
}

export function validateName(name) {
  const v = sanitizeText(name, 80);
  if (!v) return { valid: false, error: 'Full name is required' };
  if (v.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
  if (!NAME_REGEX.test(v)) return { valid: false, error: 'Name contains invalid characters' };
  return { valid: true, value: v };
}

export function validatePhone(phone, required = false) {
  const v = sanitizeText(phone, 20);
  if (!v) {
    return required
      ? { valid: false, error: 'Phone number is required' }
      : { valid: true, value: '' };
  }
  if (!PHONE_REGEX.test(v)) return { valid: false, error: 'Enter a valid phone number' };
  return { valid: true, value: v };
}

const POSTAL_REGEX = /^[A-Za-z0-9\s-]{3,12}$/;
const CITY_REGEX = /^[a-zA-Z\u00C0-\u024F0-9\s.'-]{2,60}$/;
const SUSPICIOUS_ADDRESS = /(https?:\/\/|www\.|@|<script|javascript:|\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b)/i;

function hasSuspiciousContent(value) {
  return SUSPICIOUS_ADDRESS.test(value);
}

export function validateAddressLine1(line1) {
  const v = sanitizeText(line1, 120);
  if (!v) return { valid: false, error: 'Street / building address is required' };
  if (v.length < 3) return { valid: false, error: 'Enter a bit more detail (min. 3 characters)' };
  if (hasSuspiciousContent(v)) return { valid: false, error: 'Address contains invalid content' };
  if (!/[a-zA-Z0-9]/.test(v)) return { valid: false, error: 'Enter a valid street address' };
  return { valid: true, value: v };
}

export function validateAddressLine2(line2) {
  const v = sanitizeText(line2, 80);
  if (!v) return { valid: true, value: '' };
  if (hasSuspiciousContent(v)) return { valid: false, error: 'Landmark contains invalid content' };
  return { valid: true, value: v };
}

export function validateCity(city) {
  const v = sanitizeText(city, 60);
  if (!v) return { valid: false, error: 'City / municipality is required' };
  if (!CITY_REGEX.test(v)) return { valid: false, error: 'Enter a valid city name' };
  return { valid: true, value: v };
}

export function validateProvince(province) {
  const v = sanitizeText(province, 60);
  if (!v) return { valid: false, error: 'Province / region is required' };
  if (!CITY_REGEX.test(v)) return { valid: false, error: 'Enter a valid province or region' };
  return { valid: true, value: v };
}

export function validatePostalCode(postal, country = 'Philippines') {
  const v = sanitizeText(postal, 12).toUpperCase();
  if (!v) return { valid: false, error: 'Postal / ZIP code is required' };
  if (!POSTAL_REGEX.test(v)) return { valid: false, error: 'Enter a valid postal code' };
  if (country === 'Philippines' && !/^\d{4}$/.test(v)) {
    return { valid: false, error: 'Philippine postal code must be 4 digits (e.g. 1000)' };
  }
  return { valid: true, value: v };
}

export function validateCountry(country) {
  const v = sanitizeText(country, 56);
  if (!v) return { valid: false, error: 'Country is required' };
  if (!CITY_REGEX.test(v)) return { valid: false, error: 'Enter a valid country' };
  return { valid: true, value: v };
}

export function validateDeliveryAddress(addr = {}) {
  const errors = {};
  const line1 = validateAddressLine1(addr.line1);
  const line2 = validateAddressLine2(addr.line2);
  const city = validateCity(addr.city);
  const province = validateProvince(addr.province);
  const country = validateCountry(addr.country || 'Philippines');
  const postal = validatePostalCode(addr.postal_code, country.valid ? country.value : 'Philippines');

  if (!line1.valid) errors.line1 = line1.error;
  if (!line2.valid) errors.line2 = line2.error;
  if (!city.valid) errors.city = city.error;
  if (!province.valid) errors.province = province.error;
  if (!postal.valid) errors.postal_code = postal.error;
  if (!country.valid) errors.country = country.error;

  const values = {
    line1: line1.valid ? line1.value : '',
    line2: line2.valid ? line2.value : '',
    city: city.valid ? city.value : '',
    province: province.valid ? province.value : '',
    postal_code: postal.valid ? postal.value : '',
    country: country.valid ? country.value : 'Philippines',
  };

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values,
  };
}

/** @deprecated — use validateDeliveryAddress */
export function validateAddress(address) {
  const v = sanitizeText(address, 500);
  if (!v) return { valid: false, error: 'Delivery address is required' };
  if (v.length < 10) return { valid: false, error: 'Please enter a complete address (min. 10 characters)' };
  if (hasSuspiciousContent(v)) return { valid: false, error: 'Address contains invalid content' };
  return { valid: true, value: v };
}

export function validateOrderNumber(orderNumber) {
  const v = sanitizeText(orderNumber, 32).toUpperCase();
  if (!v) return { valid: false, error: 'Order number is required' };
  if (!ORDER_NUMBER_REGEX.test(v)) {
    return { valid: false, error: 'Invalid format. Example: ELY-ABC123' };
  }
  return { valid: true, value: v };
}

function resolveAddressInput(form) {
  const fromFields = {
    line1: form.address_line1,
    line2: form.address_line2,
    city: form.address_city,
    province: form.address_province,
    postal_code: form.address_postal,
    country: form.address_country,
  };

  const hasStructured = ['line1', 'city', 'province', 'postal_code'].some(
    (key) => fromFields[key] != null && String(fromFields[key]).trim() !== ''
  );

  if (hasStructured) return { input: fromFields, preserveSerialized: false };

  if (form.customer_address) {
    const parsed = parseStoredAddress(form.customer_address);
    if (parsed.fields?.line1) {
      return {
        input: {
          line1: parsed.fields.line1,
          line2: parsed.fields.line2 || '',
          city: parsed.fields.city,
          province: parsed.fields.province,
          postal_code: parsed.fields.postal_code,
          country: parsed.fields.country || 'Philippines',
        },
        preserveSerialized: true,
      };
    }
  }

  return { input: fromFields, preserveSerialized: false };
}

export function validateCheckoutForm(form) {
  const errors = {};
  const name = validateName(form.customer_name);
  const email = validateEmail(form.customer_email);
  const phone = validatePhone(form.customer_phone, true);
  const { input: addressInput, preserveSerialized } = resolveAddressInput(form);
  const addressFields = validateDeliveryAddress(addressInput);

  if (!name.valid) errors.customer_name = name.error;
  if (!email.valid) errors.customer_email = email.error;
  if (!phone.valid) errors.customer_phone = phone.error;
  Object.assign(errors, addressFields.errors);

  let customer_address = '';
  if (addressFields.valid) {
    customer_address =
      preserveSerialized && form.customer_address
        ? form.customer_address
        : serializeAddress(addressFields.values);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      customer_name: name.valid ? name.value : '',
      customer_email: email.valid ? email.value : '',
      customer_phone: phone.valid ? phone.value : '',
      customer_address,
      address: addressFields.valid ? addressFields.values : null,
    },
  };
}

export function validateTrackForm(orderNumber, email) {
  const errors = {};
  const order = validateOrderNumber(orderNumber);
  const mail = validateEmail(email);

  if (!order.valid) errors.orderNumber = order.error;
  if (!mail.valid) errors.email = mail.error;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      orderNumber: order.valid ? order.value : '',
      email: mail.valid ? mail.value : '',
    },
  };
}

export function validateCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Your cart is empty' };
  }
  if (items.length > 50) {
    return { valid: false, error: 'Cart exceeds maximum items' };
  }
  for (const item of items) {
    const qty = parseInt(item.quantity, 10);
    if (!item.id || qty < 1 || qty > 99) {
      return { valid: false, error: 'Invalid cart item quantity' };
    }
    if (item.stock != null && qty > item.stock) {
      return { valid: false, error: `${item.name} only has ${item.stock} in stock` };
    }
  }
  return { valid: true };
}

/** Safe URL query params */
export function parseTrackQueryParams(searchParams) {
  const rawOrder = searchParams.get('order') || '';
  const rawEmail = searchParams.get('email') || '';
  const order = validateOrderNumber(rawOrder);
  const mail = validateEmail(rawEmail);
  return {
    orderNumber: order.valid ? order.value : sanitizeText(rawOrder, 32),
    email: mail.valid ? mail.value : sanitizeEmail(rawEmail),
    valid: order.valid && mail.valid,
  };
}
