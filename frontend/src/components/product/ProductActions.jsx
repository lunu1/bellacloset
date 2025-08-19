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


// components/product/ProductActions.jsx
// export default function ProductActions({ onAddToCart, onBuyNow, disabled = false }) {
//   const baseBtn = "flex-1 py-3 rounded transition-colors";
//   const primary  = disabled ? "bg-gray-300 cursor-not-allowed text-white"
//                             : "bg-black hover:bg-gray-800 text-white";
//   const outline  = disabled ? "border border-gray-300 text-gray-400 cursor-not-allowed"
//                             : "border border-black hover:bg-gray-50";

//   return (
//     <div className="flex gap-3 mb-6">
//       <button
//         type="button"
//         className={`${baseBtn} ${primary}`}
//         disabled={disabled}
//         onClick={!disabled ? onAddToCart : undefined}
//       >
//         Add to Cart
//       </button>

//       <button
//         type="button"
//         className={`${baseBtn} ${outline}`}
//         disabled={disabled}
//         onClick={!disabled ? onBuyNow : undefined}
//       >
//         Buy Now
//       </button>
//     </div>
//   );
// }
