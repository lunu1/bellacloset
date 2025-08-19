// src/components/checkout/OrderItemsSummary.jsx
import { PiPencilSimpleLineDuotone } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

export default function OrderItemsSummary({ items }) {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-200 rounded p-4 mb-6 shadow-sm bg-white">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-4 mb-3">
          <img src={it.thumbnail} alt="product" className="w-20 h-28 object-cover rounded" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{it.name}</h2>
            {it.size && <p className="text-sm">Size: {it.size}</p>}
            {it.color && <p className="text-sm">Color: {it.color}</p>}
            <p className="text-sm">Quantity: {it.quantity}</p>
          </div>
          <button
            className="text-gray-500 hover:text-black"
            onClick={() => navigate(`/product/${it.productId}`)}
            title="Edit"
          >
            <PiPencilSimpleLineDuotone size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
