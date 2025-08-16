import { useState, useEffect } from 'react';
import axios from 'axios';

const VariantBuilder = ({ options, onVariantsChange, defaultPrice, defaultStock }) => {
  // Limit to only Color and Size
  const allowedOptions = options.filter(opt => opt === 'Color' || opt === 'Size');

  const [optionValues, setOptionValues] = useState({});
  const [tempInputs, setTempInputs] = useState({});
  const [combinations, setCombinations] = useState([]);
  const [variantImages, setVariantImages] = useState({}); // Only for color-based variants

  const handleValueInput = (option, value) => {
    setTempInputs(prev => ({ ...prev, [option]: value }));
  };

  const applyOptionValues = (option) => {
    const raw = tempInputs[option] || '';
    const parsed = raw.split(',').map(v => v.trim()).filter(Boolean);
    setOptionValues(prev => ({ ...prev, [option]: parsed }));
  };

  const cartesianProduct = (arrays) => {
    if (arrays.length === 0) return [[]];
    return arrays.reduce((acc, curr) =>
      acc.flatMap(a => curr.map(b => [...a, b])), [[]]);
  };

  useEffect(() => {
    const valueArrays = allowedOptions.map(opt => optionValues[opt] || []);
    if (valueArrays.some(arr => arr.length === 0)) return;

    const rawCombos = cartesianProduct(valueArrays);
    const newVariants = rawCombos.map((combo, idx) => {
      const attributes = {};
      combo.forEach((val, i) => {
        attributes[allowedOptions[i]] = val;
      });

      // Use Color as the key for image mapping
      const colorKey = attributes.Color || '';
      return {
        attributes,
        price: defaultPrice,
        stock: defaultStock,
        images: variantImages[colorKey] || [],
      };
    });

    setCombinations(newVariants);
    onVariantsChange(newVariants);
  }, [optionValues, variantImages, defaultPrice, defaultStock]);

  const handleVariantUpdate = (index, key, value) => {
    const updated = [...combinations];
    updated[index][key] = value;
    setCombinations(updated);
    onVariantsChange(updated);
  };

  const handleImageUpload = async (e, colorKey) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    try {
      const res = await axios.post("http://localhost:4000/api/upload/images", formData);
      setVariantImages(prev => ({
        ...prev,
        [colorKey]: [...(prev[colorKey] || []), ...res.data.urls],
      }));
    } catch (err) {
      console.error("Variant image upload failed", err);
    }
  };

  const handleImageDelete = (colorKey, imgUrl) => {
    setVariantImages(prev => ({
      ...prev,
      [colorKey]: prev[colorKey].filter(img => img !== imgUrl),
    }));
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg">Variant Options</h3>

      {allowedOptions.map((option) => (
        <div key={option} className="mt-4">
          <label className="font-medium">{option} values</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              className="border p-2 w-full"
              placeholder={`Enter comma-separated ${option}s`}
              value={tempInputs[option] || ''}
              onChange={(e) => handleValueInput(option, e.target.value)}
            />
            <button
              type="button"
              onClick={() => applyOptionValues(option)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      ))}

      {/* 📦 Generated Variant List */}
      {combinations.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-md mb-2">Generated Variants</h4>
          {combinations.map((variant, idx) => {
            const colorKey = variant.attributes.Color || '';

            return (
              <div key={idx} className="border p-4 mb-4 rounded space-y-3 bg-gray-50">
                <p className="text-sm text-gray-800">
                  {Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                </p>

                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Price"
                    className="border p-2 w-32"
                    value={variant.price}
                    onChange={(e) => handleVariantUpdate(idx, 'price', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="border p-2 w-32"
                    value={variant.stock}
                    onChange={(e) => handleVariantUpdate(idx, 'stock', e.target.value)}
                  />
                </div>

                {/* 🖼 Image Upload Only for Color */}
                {allowedOptions.includes('Color') && variant.attributes.Color && (
                  <div className="border border-dashed p-3 rounded-md bg-white">
                    <p className="text-sm font-medium mb-2">Media for Color: {colorKey}</p>
                    <label className="cursor-pointer text-blue-600 underline text-sm">
                      Upload Images
                      <input type="file" multiple accept="image/*" hidden onChange={(e) => handleImageUpload(e, colorKey)} />
                    </label>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(variantImages[colorKey] || []).map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt="preview" className="w-16 h-16 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => handleImageDelete(colorKey, img)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VariantBuilder;
