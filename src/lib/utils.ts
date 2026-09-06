export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: string) {
  if (!price) return '';
  // Check if it already has a currency symbol (₹, $, €, £)
  if (/^[\u20B9$€£]/.test(price.trim())) return price.trim();
  return `₹${price.trim()}`;
}

export function toTitleCase(str: string) {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}
