// src/components/product/ProductActions.jsx
export default function ProductActions({ onAddToCart, onBuyNow, productName }) {
  const msg =
    productName
      ? `Hi, I'm interested in ${productName}. I need to know about this product.`
      : `Hi, I need to know about this product.`;
  const whatsappUrl = `https://wa.me/971556055777?text=${encodeURIComponent(msg)}`;

  return (
    <div className="mb-6">
      {/* first row: Add to Cart / Buy Now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
          onClick={onAddToCart}
        >
          Add to Cart
        </button>

        <button
          className="w-full border border-black py-3 rounded hover:bg-gray-50 transition-colors"
          onClick={onBuyNow}
        >
          Buy Now
        </button>
      </div>

      {/* second row: Discuss & Order */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center rounded border bg-black py-3 text-white hover:bg-gray-800 hover:text-white transition-colors"
      >
        Discuss &amp; Order it now
      </a>

      {/* pricing note + number (clickable WhatsApp link) */}
      <p className="mt-2 text-xs text-black">
        *Price is an estimate. Please contact us for final pricing.{" "}
     
      </p>
    </div>
  );
}
