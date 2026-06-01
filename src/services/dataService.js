import {
  supabase,
  isSupabaseConfigured,
  getSupabaseConnectionSource,
  getConnectionHealth,
} from '../lib/supabase';
import { seedBrands, seedProducts, MIN_PRODUCT_PRICE } from '../data/seed';
import {
  getLocalOrders,
  normalizeOrder,
  saveOrderLocally,
  updateLocalOrderStatus,
} from '../utils/orderStorage';
import {
  validateCheckoutForm,
  validateEmail,
  validateOrderNumber,
  validateCartItems,
} from '../utils/validators';
import { checkRateLimit } from '../utils/rateLimiter';
import {
  SECURE_MESSAGES,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
  isSupabaseSchemaError,
  formatSupabaseError,
  isLocalTeamSession,
  isCatalogPolicyError,
} from '../utils/security';
import {
  authEmailForUsername,
  findTeamAccount,
  findTeamByUsername,
  TEAM_ACCOUNTS,
} from '../config/teamAccounts';
import {
  resolveCartFromCatalog,
  toSecureOrderPayload,
  isDisposableEmail,
} from '../utils/orderSecurity';
import {
  addLocalProduct,
  hideProductId,
  isLocalProductId,
  loadLocalProducts,
  mergeCatalog,
  removeLocalProduct,
  updateLocalProduct,
  saveLocalProductImage,
  LOCAL_IMAGE_PREFIX,
} from '../utils/localCatalog';
import {
  DEPLOY_AUTH_HELP,
  ensureTeamProfileInCloud,
  requireSupabaseAdminSession,
  resolveCloudProductImage,
  teamRoleForUser,
} from '../utils/supabaseAdmin';

/**
 * Reset a staff member's password (admin only)
 * @param {Object} param0 { username, new_password }
 */
export async function resetStaffPassword({ username, new_password }) {
  if (!username || !new_password) throw new Error('Missing username or new password');

  // Local/demo mode
  if (!isSupabaseConfigured() || isLocalTeamSession()) {
    const accounts = loadLocalStaffAccounts();
    const idx = accounts.findIndex((a) => a.email === username || a.username === username);
    if (idx === -1) throw new Error('Staff not found');
    accounts[idx].password = new_password;
    saveLocalStaffAccounts(accounts);
    return { success: true };
  }

  // Cloud: call backend API to reset password (requires admin rights)
  const resp = await fetch('/api/supabase/staff/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, new_password }),
  });
  const body = await resp.json();
  if (!resp.ok) throw new Error(body?.error || 'Failed to reset password');
  return { success: true };
}

const brandMap = Object.fromEntries(seedBrands.map((b) => [b.id, b.name]));

function normalizeImage(path) {
  if (!path) return '/images/iphone/iphone15.jpg';
  if (typeof path !== 'string') return '/images/iphone/iphone15.jpg';
  const trimmed = path.trim();
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith(LOCAL_IMAGE_PREFIX)) return trimmed;
  if (trimmed.startsWith(`/${LOCAL_IMAGE_PREFIX}`)) {
    return trimmed.slice(1);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const raw = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return encodeURI(raw);
}

function getMergedLocalCatalog(baseList) {
  return mergeCatalog(baseList, loadLocalProducts());
}

function mapProduct(row) {
  const brandName = row.brand_name || row.brands?.name || brandMap[row.brand_id] || '';
  return {
    ...row,
    brand_name: brandName,
    specs: row.description || row.specs || '',
    price: parseFloat(row.price),
    stock: parseInt(row.stock, 10) || 0,
    image: normalizeImage(row.image),
    featured: Boolean(row.featured),
  };
}

let offlineOrders = [];

/** Admin + customer: cloud orders merged with browser-saved checkout fallbacks. */
function mergeAllOrders(cloudRows = []) {
  const cloud = (cloudRows || []).map((o) => normalizeOrder(o));
  const local = getLocalOrders();
  const offline = offlineOrders.map((o) => normalizeOrder(o));
  const byKey = new Map();

  for (const order of [...cloud, ...local, ...offline]) {
    if (!order) continue;
    // Use order_number as primary dedup key, fall back to id
    const key = order.order_number || String(order.id || '');
    if (!key) continue;
    const existing = byKey.get(key);
    if (!existing || (order.id && !order.savedLocally)) {
      byKey.set(key, order);
    }
  }

  return [...byKey.values()].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
}

export async function fetchProducts() {
  if (!isSupabaseConfigured()) {
    return getMergedLocalCatalog(seedProducts).map((p) => mapProduct(p));
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, brands(name)')
    .order('name');

  if (error) {
    console.warn('Supabase products fetch failed, using seed:', error.message);
    return getMergedLocalCatalog(seedProducts).map((p) => mapProduct(p));
  }
  const base = data?.length
    ? data.map((p) => mapProduct({ ...p, brand_name: p.brands?.name }))
    : seedProducts.map((p) => mapProduct(p));
  return getMergedLocalCatalog(base).map((p) => mapProduct(p));
}

export async function fetchProductById(id) {
  const all = await fetchProducts();
  return all.find((p) => String(p.id) === String(id)) || null;
}

export async function fetchBrands() {
  if (!isSupabaseConfigured()) return seedBrands;

  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error || !data?.length) return seedBrands;
  return data;
}

function assertMinProductPrice(price) {
  const p = parseFloat(price);
  if (!Number.isFinite(p) || p < MIN_PRODUCT_PRICE) {
    throw new Error(`Price must be at least ₱${MIN_PRODUCT_PRICE.toLocaleString()}`);
  }
  return p;
}

async function resolveBrandName(brandId) {
  if (!isSupabaseConfigured()) {
    return seedBrands.find((b) => b.id === brandId)?.name || '';
  }
  const { data } = await supabase.from('brands').select('name').eq('id', brandId).single();
  return data?.name || seedBrands.find((b) => b.id === brandId)?.name || '';
}

function createProductLocally(body, payload, brandName) {
  const id = `local-prod-${Date.now()}`;
  const rawImage = payload.image || '';
  if (rawImage.startsWith('data:')) {
    saveLocalProductImage(id, rawImage);
  }
  const created = {
    id,
    ...body,
    description: body.description,
    specs: body.description,
    brand_name: brandName || '',
    image: rawImage.startsWith('data:')
      ? `${LOCAL_IMAGE_PREFIX}${id}`
      : normalizeImage(body.image),
    _savedLocally: true,
  };
  addLocalProduct(created);
  return mapProduct(created);
}

export async function createProduct(payload) {
  const price = assertMinProductPrice(payload.price);
  const rawImage = payload.image || '/images/iphone/iphone15.jpg';
  const body = {
    brand_id: parseInt(payload.brand_id, 10),
    name: payload.name,
    model: payload.model || '',
    description: payload.specs || payload.description || '',
    price,
    stock: parseInt(payload.stock, 10) || 0,
    image: rawImage.startsWith('data:')
      ? '/images/iphone/iphone15.jpg'
      : rawImage,
    featured: Boolean(payload.featured),
  };

  const brandName = await resolveBrandName(body.brand_id);

  if (!isSupabaseConfigured()) {
    return createProductLocally({ ...body, image: rawImage }, payload, brandName);
  }

  await requireSupabaseAdminSession();

  const { data: rpcRows, error: rpcError } = await supabase.rpc('admin_create_product', {
    p_brand_id: body.brand_id,
    p_name: body.name,
    p_model: body.model,
    p_description: body.description,
    p_price: body.price,
    p_stock: body.stock,
    p_image: body.image,
    p_featured: body.featured,
  });

  let row = null;
  if (!rpcError && rpcRows) {
    row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
  }

  const rpcMsg = String(rpcError?.message || '').toLowerCase();
  const rpcMissing =
    rpcMsg.includes('admin_create_product') &&
    (rpcMsg.includes('does not exist') || rpcMsg.includes('could not find'));

  if (!row) {
    const { data, error } = await supabase.from('products').insert(body).select().single();
    if (error) {
      if (isCatalogPolicyError(error) || rpcMissing) {
        throw new Error(
          `Cannot save to Supabase (database policies). Run supabase/fix_profiles_rls.sql in SQL Editor, sign out, sign in again. ${DEPLOY_AUTH_HELP}`
        );
      }
      throw new Error(formatSupabaseError(error));
    }
    row = data;
  } else if (rpcError && !rpcMissing) {
    throw new Error(formatSupabaseError(rpcError));
  }

  if (!row?.id) throw new Error('Product was not saved to Supabase.');

  const cloudImage = await resolveCloudProductImage(rawImage, row.id);
  if (cloudImage && cloudImage !== row.image) {
    await supabase.from('products').update({ image: cloudImage }).eq('id', row.id);
    row = { ...row, image: cloudImage };
  }

  if (rawImage.startsWith('data:')) {
    saveLocalProductImage(String(row.id), rawImage);
  }

  return mapProduct({ ...row, brand_name: brandName });
}

function parseCloudProductId(id) {
  if (isLocalProductId(id)) return null;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function updateProduct(id, payload) {
  const price = assertMinProductPrice(payload.price);
  const brandId = parseInt(payload.brand_id, 10);
  const body = {
    brand_id: brandId,
    name: payload.name,
    model: payload.model || '',
    description: payload.specs || payload.description || '',
    price,
    stock: parseInt(payload.stock, 10) || 0,
  };

  if (isLocalProductId(id)) {
    const brandName = await resolveBrandName(brandId);
    if (
      !updateLocalProduct(id, {
        ...body,
        specs: body.description,
        brand_name: brandName,
      })
    ) {
      throw new Error('Local product not found');
    }
    return;
  }

  const cloudId = parseCloudProductId(id);
  if (cloudId == null) throw new Error('Invalid product id');

  if (!isSupabaseConfigured()) throw new Error('Supabase required');
  await requireSupabaseAdminSession();

  const { error } = await supabase
    .from('products')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cloudId);

  if (error) throw new Error(formatSupabaseError(error));
}

export async function deleteProduct(id) {
  const sid = String(id);

  if (isLocalProductId(sid)) {
    removeLocalProduct(sid);
    return;
  }

  const cloudId = parseCloudProductId(sid);
  if (cloudId == null) {
    hideProductId(sid);
    return;
  }

  if (!isSupabaseConfigured()) {
    hideProductId(sid);
    return;
  }

  await requireSupabaseAdminSession();

  const { error } = await supabase.from('products').delete().eq('id', cloudId);
  if (error) {
    if (isCatalogPolicyError(error)) {
      hideProductId(sid);
      return;
    }
    throw new Error(formatSupabaseError(error));
  }
}

export async function createBrand(payload) {
  if (!isSupabaseConfigured()) throw new Error('Supabase required');
  await requireSupabaseAdminSession();
  const { data, error } = await supabase
    .from('brands')
    .insert({ name: payload.name, description: payload.description || '' })
    .select()
    .single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function updateBrand(id, payload) {
  if (!isSupabaseConfigured()) throw new Error('Supabase required');
  await requireSupabaseAdminSession();
  const { error } = await supabase
    .from('brands')
    .update({ name: payload.name, description: payload.description })
    .eq('id', id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function deleteBrand(id) {
  if (!isSupabaseConfigured()) throw new Error('Supabase required');
  await requireSupabaseAdminSession();
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function fetchOrders() {
  if (!isSupabaseConfigured()) {
    return mergeAllOrders([]);
  }

  // Try the SECURITY DEFINER RPC first — it bypasses RLS so local-session
  // admin/staff (where auth.uid() is null) can still read all orders.
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_orders');

  if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
    return mergeAllOrders(rpcData);
  }

  // Fallback: direct table query (works when authenticated with Supabase session)
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] orders fetch:', error.message);
    return mergeAllOrders([]);
  }

  // If Supabase returned empty due to RLS (0 rows but no error),
  // log a warning so it's visible in the console.
  if (!data || data.length === 0) {
    console.warn(
      '[Orders] Supabase returned 0 orders — RLS may be blocking reads. ' +
      'Run supabase/fix_orders_rls.sql in your Supabase SQL Editor to fix this.'
    );
  }

  return mergeAllOrders(data || []);
}

function persistLocalOrder(orderPayload) {
  const order = {
    id: offlineOrders.length + 1,
    ...orderPayload,
    created_at: new Date().toISOString(),
    savedLocally: true,
  };
  offlineOrders.unshift(order);
  saveOrderLocally(order);
  return order;
}

async function applyOfflineStockDecrement(resolvedItems) {
  for (const item of resolvedItems) {
    if (isLocalProductId(item.id)) continue;
    if (!isSupabaseConfigured()) continue;
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single();
    if (product) {
      const nextStock = Math.max(0, (parseInt(product.stock, 10) || 0) - item.quantity);
      await supabase.from('products').update({ stock: nextStock }).eq('id', item.id);
    }
  }
}

export async function createOrder({ customer_name, customer_email, customer_phone, customer_address, items, _hp }) {
  if (_hp) throw new Error(SECURE_MESSAGES.ORDER_FAILED);

  const cartCheck = validateCartItems(items);
  if (!cartCheck.valid) throw new Error(cartCheck.error);

  const formCheck = validateCheckoutForm({
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
  });
  if (!formCheck.valid) {
    const first = Object.values(formCheck.errors)[0];
    throw new Error(first || SECURE_MESSAGES.ORDER_FAILED);
  }

  if (isDisposableEmail(formCheck.values.customer_email)) {
    throw new Error('Please use a permanent email address for orders');
  }

  const limit = checkRateLimit('checkout', 3, 120_000);
  if (!limit.allowed) throw new Error(limit.message);

  const { items: resolvedItems, total_amount } = await resolveCartFromCatalog(items, fetchProducts);

  const order_number = `ELY-${Date.now().toString(36).toUpperCase()}`;
  const orderPayload = {
    order_number,
    customer_name: formCheck.values.customer_name,
    customer_email: formCheck.values.customer_email,
    customer_phone: formCheck.values.customer_phone,
    customer_address: formCheck.values.customer_address,
    total_amount,
    items: resolvedItems.map((i) => ({
      id: i.id,
      name: i.name,
      model: i.model,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    status: 'pending',
  };

  if (!isSupabaseConfigured()) {
    return persistLocalOrder(orderPayload);
  }

  const rpcPayload = {
    p_customer_name: orderPayload.customer_name,
    p_customer_email: orderPayload.customer_email,
    p_customer_phone: orderPayload.customer_phone,
    p_customer_address: orderPayload.customer_address,
    p_items: toSecureOrderPayload(resolvedItems),
  };

  const { data: rpcData, error: rpcError } = await supabase.rpc('place_secure_order', rpcPayload);

  if (!rpcError && rpcData) {
    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (row) {
      const normalized = {
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      };
      saveOrderLocally(normalized);
      return normalized;
    }
  }

  if (rpcError) {
    if (isSupabaseSchemaError(rpcError)) {
      return persistLocalOrder(orderPayload);
    }
    const msg = rpcError.message || '';
    if (/place_secure_order|function/i.test(msg)) {
      // RPC not installed — try direct insert below
    } else if (/stock|minimum|maximum|invalid|empty/i.test(msg)) {
      throw new Error(msg);
    } else {
      throw new Error(SECURE_MESSAGES.ORDER_FAILED);
    }
  }

  const { data, error } = await supabase.from('orders').insert(orderPayload).select().single();
  if (error) {
    if (isSupabaseSchemaError(error) || isCatalogPolicyError(error)) {
      return persistLocalOrder(orderPayload);
    }
    throw new Error(error.message || SECURE_MESSAGES.ORDER_FAILED);
  }
  saveOrderLocally(data);
  await applyOfflineStockDecrement(resolvedItems);
  return data;
}

export async function updateOrderStatus(id, status) {
  const sid = String(id);

  // 1. Try updating locally-saved orders first (browser localStorage)
  if (updateLocalOrderStatus(sid, status)) {
    const offline = offlineOrders.find((o) => String(o.id) === sid);
    if (offline) offline.status = status;
    return;
  }

  // 2. Also update the in-memory offline array if present
  const offlineMatch = offlineOrders.find((o) => String(o.id) === sid);
  if (offlineMatch) {
    offlineMatch.status = status;
    saveOrderLocally(offlineMatch);
  }

  // 3. No Supabase configured — purely local/offline mode
  if (!isSupabaseConfigured()) {
    if (!offlineMatch) {
      // Try to find in local orders list by order_number as well
      const localOrders = getLocalOrders();
      const found = localOrders.find((o) => String(o.id) === sid);
      if (found) {
        found.status = status;
        found.updated_at = new Date().toISOString();
        saveOrderLocally(found);
      }
    }
    return;
  }

  // 4. Local team session (staff/admin logged in with local credentials)
  //    — update locally but also attempt cloud update if possible
  if (isLocalTeamSession()) {
    if (!offlineMatch) {
      // Save the status change locally so it persists for this browser
      const localOrders = getLocalOrders();
      const found = localOrders.find((o) => String(o.id) === sid);
      if (found) {
        found.status = status;
        found.updated_at = new Date().toISOString();
        saveOrderLocally(found);
      }
    }
    // Still try to update in Supabase (service-level, no auth required for SECURITY DEFINER)
    const cloudId = Number(id);
    if (Number.isInteger(cloudId) && cloudId > 0) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', cloudId);
        if (error) {
          // Silently ignore RLS errors for local sessions — the local update already succeeded
          console.warn('[Orders] Local session cloud sync failed (OK):', error.message);
        }
      } catch (err) {
        console.warn('[Orders] Cloud sync error (OK):', err.message);
      }
    }
    return;
  }

  // 5. Cloud session — any authenticated admin or staff can update any order
  const cloudId = Number(id);
  if (!Number.isInteger(cloudId) || cloudId <= 0) {
    throw new Error('Invalid order id');
  }

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', cloudId);
  if (error) throw new Error(formatSupabaseError(error));
}

function parseOrderRows(data) {
  return (data || []).map((o) => normalizeOrder(o));
}

export async function trackOrder(orderNumber, email) {
  const limit = checkRateLimit('track-order', 8, 60_000);
  if (!limit.allowed) throw new Error(limit.message);

  const orderVal = validateOrderNumber(orderNumber);
  const mailVal = validateEmail(email);
  if (!orderVal.valid || !mailVal.valid) {
    throw new Error(SECURE_MESSAGES.TRACK_NOT_FOUND);
  }
  const num = orderVal.value;
  const mail = mailVal.value;

  if (!isSupabaseConfigured()) {
    const found =
      offlineOrders.find(
        (o) =>
          o.order_number?.toUpperCase() === num.toUpperCase() &&
          o.customer_email?.toLowerCase() === mail
      ) ||
      getLocalOrders().find(
        (o) =>
          o.order_number?.toUpperCase() === num.toUpperCase() &&
          o.customer_email?.toLowerCase() === mail
      );
    if (!found) throw new Error(SECURE_MESSAGES.TRACK_NOT_FOUND);
    return normalizeOrder(found);
  }

  const { data, error } = await supabase.rpc('track_order', {
    p_order_number: num,
    p_email: mail,
  });

  if (error) {
    const { data: fallback, error: fbErr } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', num)
      .ilike('customer_email', mail)
      .maybeSingle();
    if (fbErr || !fallback) throw new Error(SECURE_MESSAGES.TRACK_NOT_FOUND);
    return normalizeOrder(fallback);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error(SECURE_MESSAGES.TRACK_NOT_FOUND);
  return normalizeOrder(row);
}

export async function fetchOrdersByEmail(email) {
  const limit = checkRateLimit('my-orders', 6, 60_000);
  if (!limit.allowed) throw new Error(limit.message);

  const mailVal = validateEmail(email);
  if (!mailVal.valid) throw new Error(mailVal.error);
  const mail = mailVal.value;

  const localMatches = getLocalOrders().filter(
    (o) => o.customer_email?.toLowerCase() === mail
  );

  if (!isSupabaseConfigured()) {
    const remote = offlineOrders.filter((o) => o.customer_email?.toLowerCase() === mail);
    const merged = [...remote, ...localMatches];
    const unique = merged.filter(
      (o, i, arr) => arr.findIndex((x) => x.order_number === o.order_number) === i
    );
    return unique.map(normalizeOrder).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase.rpc('get_orders_by_email', { p_email: mail });

  if (error) {
    const { data: fallback, error: fbErr } = await supabase
      .from('orders')
      .select('*')
      .ilike('customer_email', mail)
      .order('created_at', { ascending: false });
    if (fbErr) return localMatches;
    const remote = parseOrderRows(fallback);
    const merged = [...remote, ...localMatches];
    const unique = merged.filter(
      (o, i, arr) => arr.findIndex((x) => x.order_number === o.order_number) === i
    );
    return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const remote = parseOrderRows(data);
  const merged = [...remote, ...localMatches];
  const unique = merged.filter(
    (o, i, arr) => arr.findIndex((x) => x.order_number === o.order_number) === i
  );
  return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function subscribeNewsletter(email) {
  const limit = checkRateLimit('newsletter', 3, 300_000);
  if (!limit.allowed) throw new Error(limit.message);

  const mailVal = validateEmail(email);
  if (!mailVal.valid) throw new Error(mailVal.error);

  if (!isSupabaseConfigured()) {
    localStorage.setItem('newsletter_' + mailVal.value, '1');
    return { success: true };
  }
  const { error } = await supabase.from('newsletter_subscribers').insert({ email: mailVal.value });
  if (error && error.code !== '23505') throw error;
  return { success: true };
}

const LOCAL_STAFF_KEY = 'elyoo-staff-accounts';

function loadLocalStaffAccounts() {
  try {
    const saved = localStorage.getItem(LOCAL_STAFF_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return TEAM_ACCOUNTS.filter((a) => a.role === 'staff').map((a) => ({
    id: `local-staff-${a.username}`,
    email: a.email,
    password: a.password,
    full_name: a.full_name,
    role: 'staff',
    created_at: new Date().toISOString(),
  }));
}

function saveLocalStaffAccounts(accounts) {
  localStorage.setItem(LOCAL_STAFF_KEY, JSON.stringify(accounts));
}

function buildLocalStaffList() {
  const admin = TEAM_ACCOUNTS.find((a) => a.role === 'admin');
  const adminRow = {
    id: 'local-admin',
    email: admin?.email || 'jireh@elyoo.com',
    full_name: admin?.full_name || 'Administrator',
    role: 'admin',
    created_at: new Date().toISOString(),
  };
  return [
    adminRow,
    ...loadLocalStaffAccounts().map(({ password, ...rest }) => rest),
  ];
}

function tryTeamLocalSignIn(username, password) {
  const team = findTeamAccount(username, password);
  if (team) {
    const token =
      team.role === 'admin' ? 'local-demo-token' : `local-staff-token-${team.username}`;
    return {
      user: {
        id: team.role === 'admin' ? 'local-admin' : `local-staff-${team.username}`,
        email: team.email,
        role: team.role,
        full_name: team.full_name,
      },
      session: { access_token: token },
    };
  }
  const teamUser = findTeamByUsername(username);
  const account = loadLocalStaffAccounts().find(
    (a) =>
      (teamUser && a.email.toLowerCase() === teamUser.email.toLowerCase() && a.password === password) ||
      (a.email.toLowerCase() === String(username).toLowerCase() && a.password === password)
  );
  if (!account) return null;
  return {
    user: {
      id: account.id,
      email: account.email,
      role: 'staff',
      full_name: account.full_name,
    },
    session: { access_token: `local-staff-token-${account.id}` },
  };
}

export async function fetchStaffMembers() {
  if (!isSupabaseConfigured()) {
    return buildLocalStaffList();
  }

  // Even in local-session mode, try to fetch from Supabase so cloud staff appear
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .in('role', ['admin', 'staff'])
    .order('created_at', { ascending: false });

  if (error) {
    if (isCatalogPolicyError(error) || isSupabaseSchemaError(error)) {
      return buildLocalStaffList();
    }
    // On local sessions, RLS may block — silently fall back to local list
    if (isLocalTeamSession()) {
      return buildLocalStaffList();
    }
    throw new Error(formatSupabaseError(error));
  }

  const rows = data || [];
  if (rows.length === 0) {
    return buildLocalStaffList();
  }

  // Merge in any locally-saved staff that Supabase doesn't know about yet
  const localAccounts = loadLocalStaffAccounts();
  const cloudEmails = new Set(rows.map((r) => r.email?.toLowerCase()));
  const localOnly = localAccounts.filter(
    (a) => !cloudEmails.has(a.email?.toLowerCase())
  );
  const extraRows = localOnly.map(({ password: _, ...rest }) => rest);
  return [...rows, ...extraRows];
}

export async function createStaffMember({ username, email, password, full_name }) {
  const userIdentifier = String(username || email || '').trim().toLowerCase();
  const resolvedEmail = userIdentifier.includes('@') ? userIdentifier : `${userIdentifier}@elyoo.com`;

  const mailVal = validateEmail(resolvedEmail);
  if (!mailVal.valid) throw new Error(mailVal.error);
  const pwd = String(password || '');
  if (pwd.length < 2 || pwd.length > 128) throw new Error('Password must be 2–128 characters');

  const adminEmail = TEAM_ACCOUNTS.find((a) => a.role === 'admin')?.email?.toLowerCase();
  if (adminEmail && mailVal.value.toLowerCase() === adminEmail) {
    throw new Error('Cannot create staff with the administrator email');
  }

  const resolvedFullName = full_name?.trim() || 'Staff Member';

  // Helper: save to local storage as backup so login works in local-fallback mode
  function saveToLocal() {
    const accounts = loadLocalStaffAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === mailVal.value.toLowerCase())) return;
    saveLocalStaffAccounts([
      ...accounts,
      {
        id: `local-staff-${Date.now()}`,
        email: mailVal.value,
        password: pwd,
        full_name: resolvedFullName,
        role: 'staff',
        created_at: new Date().toISOString(),
      },
    ]);
  }

  // Supabase not configured — purely local mode
  if (!isSupabaseConfigured()) {
    const accounts = loadLocalStaffAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === mailVal.value.toLowerCase())) {
      throw new Error('This username is already registered');
    }
    const created = {
      id: `local-staff-${Date.now()}`,
      email: mailVal.value,
      password: pwd,
      full_name: resolvedFullName,
      role: 'staff',
      created_at: new Date().toISOString(),
    };
    saveLocalStaffAccounts([...accounts, created]);
    const { password: _, ...safe } = created;
    return safe;
  }

  // ── STEP 1: Try backend server API (uses service-role key, handles short passwords & RLS) ──
  try {
    const resp = await fetch('/api/supabase/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: mailVal.value,
        password: pwd,
        full_name: resolvedFullName,
        role: 'staff',
      }),
    });
    const body = await resp.json();

    if (resp.ok && body?.success) {
      // Also save locally so this staff can log in even if Supabase is slow
      saveToLocal();
      return {
        id: body.user?.id || body.profile?.id,
        email: mailVal.value,
        full_name: resolvedFullName,
        role: 'staff',
        created_at: new Date().toISOString(),
      };
    }

    // If backend says already registered, surface that error
    const errMsg = body?.error || body?.message || '';
    if (/already registered|already exists|duplicate|unique/i.test(errMsg)) {
      throw new Error('This username is already registered');
    }
    console.warn('[Backend staff API] non-ok response:', body);
    // Fall through to direct Supabase attempt below
  } catch (fetchErr) {
    // Network error or backend not running — fall through to direct Supabase
    if (fetchErr.message?.includes('already registered')) throw fetchErr;
    console.warn('[Backend staff API] unreachable, trying direct Supabase:', fetchErr.message);
  }

  // ── STEP 2: Direct Supabase signUp (works when backend is not running) ──
  // Supabase requires min 6-char passwords; pad short ones transparently
  const supabasePwd = pwd.length < 6 ? pwd.padEnd(6, '0') : pwd;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: mailVal.value,
    password: supabasePwd,
    options: {
      data: { 
        full_name: resolvedFullName,
        role: 'staff'
      },
    },
  });

  if (signUpError) {
    console.warn('[Supabase] signUp error:', signUpError.message);
    // Last resort: save locally so login still works in fallback mode
    const accounts = loadLocalStaffAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === mailVal.value.toLowerCase())) {
      throw new Error('This username is already registered');
    }
    saveToLocal();
    return {
      id: `local-staff-${Date.now()}`,
      email: mailVal.value,
      full_name: resolvedFullName,
      role: 'staff',
      created_at: new Date().toISOString(),
    };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    saveToLocal();
    return {
      id: `local-staff-${Date.now()}`,
      email: mailVal.value,
      full_name: resolvedFullName,
      role: 'staff',
      created_at: new Date().toISOString(),
    };
  }

  // ── STEP 3: Set role = 'staff' in profiles (use ensure_team_profile RPC to bypass RLS) ──
  const { error: profileError } = await supabase.rpc('ensure_team_profile', {
    p_role: 'staff',
    p_full_name: resolvedFullName,
    p_email: mailVal.value
  });

  if (profileError) {
    console.warn('[Supabase] ensure_team_profile RPC error:', profileError.message);
    // Try standard upsert as fallback in case RPC doesn't exist
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, email: mailVal.value, full_name: resolvedFullName, role: 'staff' },
        { onConflict: 'id' }
      );
    if (upsertError) {
      console.warn('[Supabase] profile upsert fallback error:', upsertError.message);
      await supabase
        .from('profiles')
        .update({ role: 'staff', full_name: resolvedFullName, email: mailVal.value })
        .eq('id', userId);
    }
  }

  // Also keep locally so login works without confirming email
  saveToLocal();

  return {
    id: userId,
    email: mailVal.value,
    full_name: resolvedFullName,
    role: 'staff',
    created_at: new Date().toISOString(),
  };
}

export async function removeStaffMember(staffId) {
  if (!staffId || staffId === 'local-admin') {
    throw new Error('Cannot remove this account');
  }

  if (!isSupabaseConfigured() || isLocalTeamSession() || String(staffId).startsWith('local-staff-')) {
    const accounts = loadLocalStaffAccounts().filter((a) => a.id !== staffId);
    saveLocalStaffAccounts(accounts);
    return { success: true };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'customer' })
    .eq('id', staffId)
    .eq('role', 'staff');

  if (error) {
    if (isCatalogPolicyError(error)) {
      const accounts = loadLocalStaffAccounts().filter((a) => a.id !== staffId);
      saveLocalStaffAccounts(accounts);
      return { success: true };
    }
    throw new Error(formatSupabaseError(error));
  }
  return { success: true };
}

export async function signIn(username, password) {
  const limit = checkRateLimit('login', 5, 300_000);
  if (!limit.allowed) throw new Error(limit.message);

  let team = findTeamByUsername(username);
  if (!team) {
    // If Supabase is configured, allow dynamic staff usernames
    if (isSupabaseConfigured()) {
      const u = String(username || '').trim().toLowerCase();
      team = {
        username: u,
        email: `${u}@elyoo.com`,
        role: 'staff',
        full_name: u.charAt(0).toUpperCase() + u.slice(1),
      };
    } else {
      throw new Error(SECURE_MESSAGES.LOGIN_FAILED);
    }
  }

  const authEmail = authEmailForUsername(username);
  const pwd = String(password || '');
  if (pwd.length < 2 || pwd.length > 128) throw new Error(SECURE_MESSAGES.LOGIN_FAILED);

  // Supabase requires minimum 6-char passwords; pad transparently if shorter
  const supabasePwd = pwd.length < 6 ? pwd.padEnd(6, '0') : pwd;

  if (isSupabaseConfigured()) {
    try {
      // Try with padded password first (matches how staff accounts are created)
      let { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: supabasePwd,
      });

      // If padded didn't work, try original (for pre-existing accounts with 6+ char passwords)
      if (error && supabasePwd !== pwd) {
        const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: pwd,
        });
        if (!error2) { data = data2; error = null; }
      }

      if (error && /invalid login|invalid credentials|not found/i.test(String(error.message))) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: supabasePwd,
          options: { data: { full_name: team.full_name } },
        });
        if (!signUpError && signUpData.user) {
          ({ data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: supabasePwd,
          }));
        }
      }

      if (!error && data?.user) {
        await ensureTeamProfileInCloud(team, data.user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        let role = teamRoleForUser(data.user, profile);
        if (role === 'customer' && team) role = team.role;

        if (role === 'admin' || role === 'staff') {
          if (data.session?.access_token) {
            setAuthToken(data.session.access_token);
          }

          return {
            user: {
              id: data.user.id,
              email: data.user.email,
              role,
              full_name: profile?.full_name || team.full_name || '',
            },
            session: data.session,
          };
        }
      }
    } catch (err) {
      console.warn('[Supabase Auth] Failed, trying local fallback:', err);
    }
  }

  // Local/demo mode or cloud fallback to local credentials
  const session = tryTeamLocalSignIn(username, pwd);
  if (session) return session;

  throw new Error(SECURE_MESSAGES.LOGIN_FAILED);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
  clearAuthToken();
}

export async function restoreSession() {
  if (!isSupabaseConfigured()) {
    const token = getAuthToken();
    if (token === 'local-demo-token') {
      const admin = TEAM_ACCOUNTS.find((a) => a.role === 'admin');
      return {
        id: 'local-admin',
        email: admin?.email || 'jireh@elyoo.com',
        role: 'admin',
        full_name: admin?.full_name || 'Administrator',
      };
    }
    if (token?.startsWith('local-staff-token-')) {
      const staffId = token.replace('local-staff-token-', '');
      const account = loadLocalStaffAccounts().find(
        (a) => a.id === staffId || a.id === `local-staff-${staffId}`
      );
      if (account) {
        return {
          id: account.id,
          email: account.email,
          role: 'staff',
          full_name: account.full_name,
        };
      }
    }
    return null;
  }

  if (isLocalTeamSession()) {
    clearAuthToken();
    return null;
  }

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  if (data.session.access_token) {
    setAuthToken(data.session.access_token);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.session.user.id)
    .single();

  const role = teamRoleForUser(data.session.user, profile);
  if (role !== 'admin' && role !== 'staff') {
    return null;
  }

  return {
    id: data.session.user.id,
    email: data.session.user.email,
    role,
    full_name: profile?.full_name || data.session.user.user_metadata?.full_name || '',
  };
}

export function getConnectionStatus() {
  const health = getConnectionHealth();
  return {
    supabase: health.configured || isSupabaseConfigured(),
    verified: health.verified,
    error: health.error,
    source: health.source || getSupabaseConnectionSource(),
    mode: health.verified ? 'cloud' : health.configured ? 'configured' : 'local',
  };
}
