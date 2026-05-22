import { LOCAL_IMAGE_PREFIX, getLocalProductImage } from './localCatalog';

const DEFAULT_IMAGE = '/images/iphone/iphone15.jpg';

/** Resolve product image path for Create React App public folder */
function extractLocalImageId(image) {
  const idx = image.indexOf(LOCAL_IMAGE_PREFIX);
  if (idx === -1) return null;
  return image.slice(idx + LOCAL_IMAGE_PREFIX.length);
}

export function getProductImageSrc(image) {
  if (!image || typeof image !== 'string') return DEFAULT_IMAGE;
  const trimmed = image.trim();

  const localId = extractLocalImageId(trimmed);
  if (localId) {
    const dataUrl = getLocalProductImage(localId);
    if (dataUrl) return dataUrl;
    return DEFAULT_IMAGE;
  }
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return encodeURI(path);
}

export const PRODUCT_IMAGE_PLACEHOLDER = DEFAULT_IMAGE;
