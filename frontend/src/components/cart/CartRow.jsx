// src/components/cart/CartRow.jsx
import React from "react";
import { assets } from "../../assets/assets";
import { useCurrency } from "../../context/CurrencyContext";

const StockBadge = ({ stock, quantity }) => {
  const effectiveStock = stock ?? 0;
  const qtyExceeds = quantity > effectiveStock;
  const lowStock = effectiveStock > 0 && effectiveStock <= 5 && !qtyExceeds;

  if (effectiveStock === 0) {
    return <span className="text-xs text-red-600">❌ Out of stock</span>;
  }
  if (qtyExceeds) {
    return (
      <span className="text-xs text-red-600">
        ⚠️ Only {effectiveStock} left — reduce quantity
      </span>
    );
  }
  if (lowStock) {
    return (
      <span className="text-xs text-amber-600">
        ⚠️ Low stock ({effectiveStock} left)
      </span>
    );
  }
  return <span className="text-xs text-green-600">✅ In stock</span>;
};

export default function CartRow({ line, onQtyChange, onAskRemove }) {
  const { format } = useCurrency();

  const { item, productData, price, stock } = line;
  if (!productData) return null;

  return (
    <div
      className="grid py-4 text-gray-500 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
      key={`${item.productId}-${item.size || ""}-${item.color || ""}`}
    >
      {/* Product info */}
      <div className="flex items-start gap-6">
        <img
          src={productData.product.images?.[0]}
          className="w-16 sm:w-20 object-cover rounded"
          alt=""
        />
        <div>
          <p className="text-xs font-medium sm:text-lg">
            {productData.product.name}
          </p>

          <div className="flex items-center gap-5 mt-2">
            <p>
              {typeof price === "number" ? format(price) : "N/A"}
            </p>

            {(item.size || item.color) && (
              <p className="px-2 border sm:px-3 sm:py-1 bg-slate-50">
                {[item.color, item.size].filter(Boolean).join(" / ")}
              </p>
            )}
          </div>

          <div className="mt-2">
            <StockBadge stock={stock} quantity={item.quantity} />
          </div>
        </div>
      </div>

      {/* Quantity */}
      <input
        type="number"
        min={1}
        value={item.quantity}
        className="px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2"
        onChange={(e) => onQtyChange?.(Number(e.target.value) || 1)}
      />

      {/* Remove */}
      <div className="ml-auto">
        <button
          title="Delete / Move to wishlist"
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => onAskRemove?.()}
        >
          <img
            src={assets.bin_icon}
            className="w-4 h-4 sm:w-5 sm:h-5"
            alt="Remove"
          />
        </button>
      </div>
    </div>
  );
}
