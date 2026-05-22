/** Philippine Peso formatting */
export const PESO_SYMBOL = '₱';

export function formatPeso(amount, options = {}) {
  const value = parseFloat(amount) || 0;

  let minDigits = options.decimals ?? options.minimumFractionDigits ?? 2;
  let maxDigits = options.maximumFractionDigits ?? minDigits;

  if (options.decimals === undefined && options.maximumFractionDigits !== undefined) {
    minDigits = options.maximumFractionDigits;
  }

  minDigits = Math.max(0, Math.min(20, minDigits));
  maxDigits = Math.max(0, Math.min(20, maxDigits));
  if (minDigits > maxDigits) {
    minDigits = maxDigits;
  }

  const formatted = value.toLocaleString('en-PH', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  return `${PESO_SYMBOL}${formatted}`;
}
