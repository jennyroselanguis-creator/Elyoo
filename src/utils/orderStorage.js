const ORDERS_KEY = 'elyoo-my-orders';
const EMAIL_KEY = 'elyoo-tracker-email';

export function normalizeOrder(order) {
  if (!order) return null;
  return {
    ...order,
    items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [],
    total_amount: parseFloat(order.total_amount),
  };
}

export function saveOrderLocally(order) {
  const normalized = normalizeOrder(order);
  if (!normalized?.order_number) return;
  const existing = getLocalOrders();
  const filtered = existing.filter(
    (o) => o.order_number !== normalized.order_number
  );
  const updated = [normalized, ...filtered].slice(0, 20);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  if (normalized.customer_email) {
    localStorage.setItem(EMAIL_KEY, normalized.customer_email);
  }
}

export function getLocalOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw).map(normalizeOrder) : [];
  } catch {
    return [];
  }
}

export function getSavedTrackerEmail() {
  return localStorage.getItem(EMAIL_KEY) || '';
}

export function setSavedTrackerEmail(email) {
  if (email) localStorage.setItem(EMAIL_KEY, email);
}

export function updateLocalOrderStatus(id, status) {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => String(o.id) === String(id));
  if (idx < 0) return false;
  orders[idx] = { ...orders[idx], status, updated_at: new Date().toISOString() };
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return true;
}
