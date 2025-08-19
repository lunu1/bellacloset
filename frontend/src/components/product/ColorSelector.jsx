// src/components/product/ColorSelector.jsx
export default function ColorSelector({ product, colors, selectedVariant, onSelect }) {
  return (
    <div className="flex flex-col gap-3 my-6">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          Color:{" "}
          <span className="font-normal text-gray-600">
            {selectedVariant?.optionValues?.Color || "Select a color"}
          </span>
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {colors.map((variant) => {
          const vColor = variant.optionValues.Color;
          const isSelected = selectedVariant?._id === variant._id;
          const previewImage = variant.images?.[0] || product.images?.[0];

          return (
            <button
              key={variant._id}
              className={`w-14 h-14 rounded overflow-hidden border-2 relative ${
                isSelected ? "border-orange-500 scale-110 shadow-lg" : "border-gray-300"
              } transition-all hover:border-gray-500 hover:scale-105`}
              onClick={() => onSelect(variant)}
              title={`Select ${vColor}`}
            >
              <img src={previewImage} alt={`${product.name} in ${vColor}`} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>

      {selectedVariant?.images?.length > 0 && (
        <p className="text-sm text-gray-500">
          {selectedVariant.images.length} image
          {selectedVariant.images.length !== 1 ? "s" : ""} available for {selectedVariant.optionValues.Color}
        </p>
      )}
    </div>
  );
}
