// src/components/product/QuantitySelector.jsx
export default function QuantitySelector({ stock = 0, quantity, setQuantity, onStockLimit,children }) {
  return (
    <div className="mb-6">
    <div className="flex items-center gap-4 ">
      <p className="font-medium">Quantity:</p>
      <div className="flex items-center border border-gray-300 rounded">
        <button
          onClick={() => {
            setQuantity((q) => {
              const nxt = Math.max(1, q - 1);
              onStockLimit?.(false);
              return nxt;
            });
          }}
          className="px-3 py-2 hover:bg-gray-100 transition-colors"
        >
          -
        </button>
        <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">{quantity}</span>
        <button
          onClick={() => {
            setQuantity((q) => {
              const nxt = Math.min(stock || 0, q + 1);
              onStockLimit?.(nxt === stock);
              return nxt;
            });
          }}
          className="px-3 py-2 hover:bg-gray-100 transition-colors"
          disabled={quantity >= stock}
        >
          +
        </button>
      </div>
   
    </div>
    {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
