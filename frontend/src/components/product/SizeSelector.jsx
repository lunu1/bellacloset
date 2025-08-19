// src/components/product/SizeSelector.jsx
export default function SizeSelector({ sizes = [], value, onChange }) {
  return (
    <div className="flex flex-col gap-3 my-6">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          Size: <span className="font-normal text-gray-600">{value || "Select a size"}</span>
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {sizes.map((s) => (
          <button
            key={s}
            className={`border py-2 px-4 min-w-[3rem] transition-all ${
              s === value ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
