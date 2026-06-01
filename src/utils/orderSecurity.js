/** Server-side cart resolution — prices & stock from catalog, not localStorage */

export const ORDER_TAX_RATE = 0.1;
export const MIN_ORDER_SUBTOTAL = 10000;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  '10minutemail.com',
  'throwaway.email',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
]);

export function isDisposableEmail(email) {
  const domain = String(email || '').split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

/**
 * Rebuild cart lines from live catalog (prevents price/stock tampering in localStorage).
 */
export async function resolveCartFromCatalog(cartItems, fetchProducts) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Your cart is empty');
  }
  if (cartItems.length > 50) {
    throw new Error('Cart exceeds maximum items');
  }

  const catalog = await fetchProducts();
  const byId = new Map(catalog.map((p) => [String(p.id), p]));
  const resolved = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const product = byId.get(String(item.id));
    if (!product) {
      throw new Error('A product in your cart is no longer available. Refresh and try again.');
    }

    const stock = Math.max(0, parseInt(product.stock, 10) || 0);
    const qty = Math.min(Math.max(1, parseInt(item.quantity, 10) || 1), 99);

    if (stock <= 0) {
      throw new Error(`${product.name} is out of stock`);
    }
    if (qty > stock) {
      throw new Error(`${product.name} only has ${stock} in stock`);
    }

    const price = parseFloat(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Invalid product pricing — contact support');
    }

    subtotal += price * qty;
    resolved.push({
      id: product.id,
      name: product.name,
      model: product.model,
      price,
      quantity: qty,
      image: product.image,
      stock,
    });
  }

  if (subtotal < MIN_ORDER_SUBTOTAL) {
    throw new Error(`Minimum order subtotal is ₱${MIN_ORDER_SUBTOTAL.toLocaleString()}`);
  }

  const tax = Math.round(subtotal * ORDER_TAX_RATE * 100) / 100;
  const total_amount = Math.round((subtotal + tax) * 100) / 100;

  return { items: resolved, subtotal, tax, total_amount };
}

export function toSecureOrderPayload(items) {
  return items.map((i) => ({
    product_id: i.id,
    quantity: i.quantity,
  }));
}
