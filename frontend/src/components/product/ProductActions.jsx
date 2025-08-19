// src/components/product/ProductActions.jsx
export default function ProductActions({ onAddToCart, onBuyNow }) {
  return (
    <div className="flex sm:flex-row gap-3 mb-6">
      <button
        className="flex-1 bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
        onClick={onAddToCart}
      >
        Add to Cart
      </button>

      <button
        className="flex-1 border border-black py-3 rounded transition-colors"
        onClick={onBuyNow}
      >
        Buy Now
      </button>
    </div>
  );
}
