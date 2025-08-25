// Minimal, dependency-free validation used by both create & edit forms.

const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
const isInt = (n) => Number.isInteger(n);

export function validateProductForm({
  // common fields
  name,
  brand,
  description,
  categoryPath,          // create form uses this (array of ids)
  category,              // edit form uses this (single id)
  hasVariants,
  // default (no-variants) fields
  defaultImages = [],
  defaultPrice,
  compareAtPrice,
  defaultStock,
  // variants
  variants = [],
}) {
  const errors = {};

  // Basic text fields
  const _name = (name || "").trim();
  if (!_name) errors.name = "Product name is required";
  else if (_name.length > 120) errors.name = "Max 120 characters";

  const _brand = (brand || "").trim();
  if (!_brand) errors.brand = "Brand is required";

  const _desc = (description || "").trim();
  if (!_desc) errors.description = "Description is required";

  // Category validation: accept either a path (create) or a single id (edit)
  if (Array.isArray(categoryPath)) {
    if (categoryPath.length === 0) errors.categoryPath = "Select at least one category";
  } else if (!category) {
    errors.category = "Select a category";
  }

  // Default mode (no variants)
  const p = num(defaultPrice);
  const c = num(compareAtPrice);
  const s = num(defaultStock);

  if (!hasVariants) {
    if (p === null || Number.isNaN(p) || p <= 0) errors.defaultPrice = "Price must be greater than 0";
    if (c !== null && !Number.isNaN(c) && c > 0 && p !== null && !Number.isNaN(p) && c < p) {
      errors.compareAtPrice = "Compare-at price must be greater than price";
    }
    if (s === null || Number.isNaN(s) || s < 0 || !isInt(s)) errors.defaultStock = "Stock must be 0 or more";
    if (!defaultImages.length) errors.defaultImages = "Add at least one image";
  }

  // Variant mode
  if (hasVariants) {
    if (!variants.length) errors.variants = "Add at least one variant or disable variant mode";

    const seen = new Set();
    variants.forEach((v, i) => {
      const attrs = v.attributes || v.optionValues || {};
      const color = (attrs.Color || "").trim();
      const size = (attrs.Size || "").trim();
      const key = `${color}||${size}`;
      if (seen.has(key)) {
        errors[`variants.${i}.attributes`] = "Duplicate combination (Color + Size)";
      } else {
        seen.add(key);
      }

      const vp = num(v.price);
      const vs = num(v.stock);
      const vc = num(v.compareAtPrice);

      if (vp === null || Number.isNaN(vp) || vp <= 0) errors[`variants.${i}.price`] = "Price > 0 required";
      if (vs === null || Number.isNaN(vs) || vs < 0 || !isInt(vs)) errors[`variants.${i}.stock`] = "Stock must be an integer ≥ 0";
      if (vc !== null && !Number.isNaN(vc) && vc > 0 && vp !== null && !Number.isNaN(vp) && vc < vp) {
        errors[`variants.${i}.compareAtPrice`] = "Compare-at must be ≥ price";
      }
    });
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
