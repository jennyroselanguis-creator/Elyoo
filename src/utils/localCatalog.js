const LOCAL_PRODUCTS_KEY = 'elyoo-local-products';
const HIDDEN_PRODUCTS_KEY = 'elyoo-hidden-product-ids';
export const LOCAL_IMAGE_PREFIX = 'local-img:';

export function saveLocalProductImage(productId, dataUrl) {
  try {
    localStorage.setItem(`elyoo-img-${productId}`, dataUrl);
  } catch {
    throw new Error('Image is too large for browser storage. Use a smaller file (under 2 MB).');
  }
}

export function getLocalProductImage(productId) {
  try {
    return localStorage.getItem(`elyoo-img-${productId}`);
  } catch {
    return null;
  }
}

export function deleteLocalProductImage(productId) {
  localStorage.removeItem(`elyoo-img-${productId}`);
}

function fixImageRef(image, productId) {
  if (!image || typeof image !== 'string') return image;
  if (image.startsWith(`/${LOCAL_IMAGE_PREFIX}`)) {
    return `${LOCAL_IMAGE_PREFIX}${productId}`;
  }
  if (image.startsWith(LOCAL_IMAGE_PREFIX)) return image;
  if (image.startsWith('data:')) {
    saveLocalProductImage(productId, image);
    return `${LOCAL_IMAGE_PREFIX}${productId}`;
  }
  return image;
}

function normalizeProductImageRef(product) {
  if (!product?.id) return product;
  const image = fixImageRef(product.image, product.id);
  if (image === product.image) return product;
  return { ...product, image };
}

export function loadLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    let migrated = false;
    const cleaned = list.map((item) => {
      const next = normalizeProductImageRef(item);
      if (next.image !== item.image) migrated = true;
      return next;
    });

    if (migrated) saveLocalProducts(cleaned);
    return cleaned;
  } catch (err) {
    console.warn('Local catalog reset:', err.message);
    try {
      localStorage.removeItem(LOCAL_PRODUCTS_KEY);
    } catch {
      /* ignore */
    }
    return [];
  }
}

export function saveLocalProducts(products) {
  const slim = products.map((p) => {
    if (p.image?.startsWith('data:')) {
      return normalizeProductImageRef(p);
    }
    return p;
  });
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(slim));
}

export function addLocalProduct(product) {
  const normalized = normalizeProductImageRef(product);
  const list = loadLocalProducts();
  list.push(normalized);
  saveLocalProducts(list);
  return normalized;
}

export function removeLocalProduct(id) {
  deleteLocalProductImage(id);
  const list = loadLocalProducts().filter((p) => String(p.id) !== String(id));
  saveLocalProducts(list);
}

export function updateLocalProduct(id, patch) {
  const list = loadLocalProducts();
  const idx = list.findIndex((p) => String(p.id) === String(id));
  if (idx < 0) return false;
  list[idx] = normalizeProductImageRef({ ...list[idx], ...patch });
  saveLocalProducts(list);
  return true;
}

export function isLocalProductId(id) {
  return String(id).startsWith('local-prod-');
}

export function getHiddenProductIds() {
  try {
    const raw = localStorage.getItem(HIDDEN_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hideProductId(id) {
  const hidden = getHiddenProductIds();
  const sid = String(id);
  if (!hidden.includes(sid)) {
    hidden.push(sid);
    localStorage.setItem(HIDDEN_PRODUCTS_KEY, JSON.stringify(hidden));
  }
}

export function mergeCatalog(seedList, extraList = []) {
  const hidden = new Set(getHiddenProductIds().map(String));
  const seen = new Set();
  const merged = [];

  for (const item of [...seedList, ...extraList]) {
    const id = String(item.id);
    if (hidden.has(id) || seen.has(id)) continue;
    seen.add(id);
    merged.push(item);
  }

  return merged;
}
