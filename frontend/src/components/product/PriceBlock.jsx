// src/components/product/PriceBlock.jsx
export default function PriceBlock({ currency, currentPrice, originalPrice, discountPercent }) {
  return (
    <div className="mt-5 flex items-center gap-3">
      <p className="text-3xl font-bold ">
        {currency} {currentPrice ?? "N/A"}
      </p>
      {discountPercent > 0 && originalPrice && (
        <>
          <p className="text-xl text-gray-500 line-through">
            {currency} {originalPrice}
          </p>
          <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
