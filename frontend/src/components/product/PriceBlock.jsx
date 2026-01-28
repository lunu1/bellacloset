// src/components/product/PriceBlock.jsx
import { useCurrency } from "../../context/CurrencyContext";

export default function PriceBlock({ currentPrice, originalPrice, discountPercent }) {
  const { format } = useCurrency();

  return (
    <div className="mt-5 flex items-center gap-3">
      <p className="text-3xl">
        {currentPrice != null ? format(currentPrice) : "N/A"}
      </p>

      {discountPercent > 0 && originalPrice != null && (
        <>
          <p className="text-xl text-gray-500 line-through">
            {format(originalPrice)}
          </p>
          <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
