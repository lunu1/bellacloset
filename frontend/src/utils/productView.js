// src/utils/productView.js

export const getAvailableColors = (variants = []) =>
  variants
    .filter((v) => v?.optionValues?.Color)
    .reduce((acc, v) => {
      const exists = acc.some((u) => u.optionValues.Color === v.optionValues.Color);
      return exists ? acc : [...acc, v];
    }, []);

export const getAvailableSizes = (variants = []) => {
  const sizes = variants.map((v) => v?.optionValues?.Size).filter(Boolean);
  return Array.from(new Set(sizes));
};

export const findMatchedVariant = (variants = [], { color, size }) =>
  variants.find(
    (v) =>
      (!color || v.optionValues?.Color === color) &&
      (!size || v.optionValues?.Size === size)
  );

export const getDisplayImages = (selectedVariant, product) => {
  if (selectedVariant?.images?.length) return selectedVariant.images;
  return product?.images || [];
};

export const calcDiscount = (variant) => {
  const originalPrice = variant?.originalPrice || variant?.compareAtPrice || variant?.price || null;
  const currentPrice = variant?.price ?? null;

  const discountPercent =
    originalPrice && currentPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return { originalPrice, currentPrice, discountPercent };
};
