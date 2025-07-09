// components/VariantBuilder.jsx
import  { useEffect, useState } from 'react';
import axios from 'axios';

const VariantBuilder = ({ options, onVariantsChange, defaultPrice, defaultStock }) => {
  const [optionValues, setOptionValues] = useState({});
  const [combinations, setCombinations] = useState([]);
  const [variantImages, setVariantImages] = useState({});

  const handleOptionValueChange = (option, value) => {
    setOptionValues(prev => ({ ...prev, [option]: value.split(',').map(v => v.trim()) }));
  };

  const handleImageUpload = async (e, index) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    try {
      const res = await axios.post("http://localhost:4000/api/upload/images", formData);
      setVariantImages(prev => ({ ...prev, [index]: [...(prev[index] || []), ...res.data.urls] }));
     } catch (err) {
      console.error("Variant image upload failed", err);
    }
  };

  const cartesianProduct = (arrays) => {
    if (arrays.length === 0) return [[]];
    return arrays.reduce((acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])));
  };

  useEffect(() => {
    const valueArrays = options.map(opt => Array.isArray(optionValues[opt]) ? optionValues[opt] : []);
    if (valueArrays.some(arr => arr.length === 0)) return;
    const rawCombos = cartesianProduct(valueArrays);
    const finalVariants = rawCombos.map((combo, idx) => {
      const attributes = {};
      if (Array.isArray(combo)) {
        combo.forEach((val, i) => attributes[options[i]] = val);
      }
      return {
        attributes,
        price: defaultPrice,
        stock: defaultStock,
        images: variantImages[idx] || []
        
      };
    });
    setCombinations(finalVariants);
    onVariantsChange(finalVariants);
  }, [optionValues, variantImages, options, defaultPrice, defaultStock]);

  const handleVariantUpdate = (index, key, value) => {
    const updated = [...combinations];
    updated[index][key] = value;
    setCombinations(updated);
    onVariantsChange(updated);
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold">Variant Options</h3>
      {options.map(option => (
        <div key={option} className="mt-2">
          <label>{option} values:</label>
          <input placeholder={`Enter ${option}s (comma separated)`} className="border p-2 w-full" onChange={e => handleOptionValueChange(option, e.target.value)} />
        </div>
      ))}

      {combinations.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Generated Variants:</h4>
          {combinations.map((variant, idx) => (
            <div key={idx} className="border p-3 mb-4 rounded space-y-2">
              <p className="text-sm text-gray-700">{Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
              <div className="flex items-center gap-4">
                <input type="number" placeholder="Price" className="border p-1" value={variant.price} onChange={e => handleVariantUpdate(idx, 'price', e.target.value)} />
                <input type="number" placeholder="Stock" className="border p-1" value={variant.stock} onChange={e => handleVariantUpdate(idx, 'stock', e.target.value)} />
              </div>
              <div className="border border-dashed border-gray-300 p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Variant Media</p>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 border rounded-md bg-white shadow text-sm font-medium">
                    Add files
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, idx)} />
                  </label>
                  <button type="button" className="text-blue-600 text-sm">Add from URL</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Accepts images, videos, or 3D models</p>
                <div className="flex gap-2 mt-4">
                  {(variantImages[idx] || []).map((img, i) => (
                    <img key={i} src={img} className="w-16 h-16 object-cover rounded" alt="Variant preview" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantBuilder;
