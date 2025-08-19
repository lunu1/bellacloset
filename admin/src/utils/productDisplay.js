// Choose image/price from variants or fall back to product defaults
export function getDisplayFields(product = {}, variants = []) {
  const firstVariant = Array.isArray(variants) && variants.length > 0 ? variants[0] : null;
  const image = firstVariant?.images?.[0] || product?.images?.[0] || "";
  const price = firstVariant?.price ?? product?.defaultPrice ?? null;
  const compareAtPrice = firstVariant?.compareAtPrice ?? product?.compareAtPrice ?? null;
  const stock = firstVariant?.stock ?? product?.defaultStock ?? 0;
  return { image, price, compareAtPrice, stock };
}