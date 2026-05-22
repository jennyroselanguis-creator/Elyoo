const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function readProductImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Please choose an image file'));
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      reject(new Error('Use JPG, PNG, WebP, or GIF'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('Image must be 2 MB or smaller'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}
