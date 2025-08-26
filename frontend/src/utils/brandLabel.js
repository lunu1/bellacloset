// utils/brandLabel.js
export function brandLabel(product) {
  const b = product?.brand;
  if (!b) return "";
  if (typeof b === "string") return b;         // legacy just in case
  if (typeof b === "object") return b.name || "";
  return "";
}
