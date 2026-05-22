/** Delivery address serialization & display */

export const EMPTY_ADDRESS = {
  line1: '',
  line2: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'Philippines',
};

const ADDRESS_VERSION = 1;

export function buildFormattedAddress(fields) {
  const parts = [
    fields.line1,
    fields.line2,
    [fields.city, fields.province].filter(Boolean).join(', '),
    fields.postal_code,
    fields.country,
  ].filter((p) => p && String(p).trim());
  return parts.join('\n');
}

/** Store as versioned JSON in customer_address column */
export function serializeAddress(fields) {
  const formatted = buildFormattedAddress(fields);
  return JSON.stringify({
    v: ADDRESS_VERSION,
    line1: fields.line1,
    line2: fields.line2 || '',
    city: fields.city,
    province: fields.province,
    postal_code: fields.postal_code,
    country: fields.country,
    formatted,
  });
}

export function parseStoredAddress(raw) {
  if (!raw) return { legacy: true, formatted: '', lines: [] };
  try {
    const data = JSON.parse(raw);
    if (data?.v === ADDRESS_VERSION) {
      return {
        legacy: false,
        formatted: data.formatted || buildFormattedAddress(data),
        lines: [
          data.line1,
          data.line2,
          `${data.city}, ${data.province}`,
          data.postal_code,
          data.country,
        ].filter(Boolean),
        fields: data,
      };
    }
  } catch {
    /* legacy plain text */
  }
  return {
    legacy: true,
    formatted: String(raw),
    lines: String(raw).split('\n').filter(Boolean),
  };
}

/** Partial mask for lists (privacy) */
export function maskAddressLine(line) {
  if (!line || line.length < 8) return '••••••••';
  return line.slice(0, 4) + '•••' + line.slice(-3);
}
