export interface InvoiceColor {
  background: string;
  text: string;
  border: string;
}

/** FNV-1a 32-bit: băm ổn định, các mã gần nhau vẫn ra màu khác nhau. */
const hashKey = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/**
 * Sinh màu pastel theo từng hóa đơn.
 * Cùng một hóa đơn luôn ra cùng màu; các hóa đơn khác nhau gần như chắc chắn khác màu.
 */
export const invoiceColor = (key?: string | null): InvoiceColor => {
  const value = String(key || 'invoice');
  const hue = hashKey(value) % 360;
  return {
    background: `hsl(${hue}, 70%, 93%)`,
    text: `hsl(${hue}, 65%, 26%)`,
    border: `hsl(${hue}, 55%, 55%)`,
  };
};
