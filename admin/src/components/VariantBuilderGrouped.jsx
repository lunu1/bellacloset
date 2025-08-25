import { useEffect, useRef, useState } from "react";
import axios from "axios";

const VariantBuilderGrouped = ({
  onVariantsChange,
  defaultPrice,
  defaultStock,
  defaultCompareAtPrice,
  initialVariants = [],           // NEW
}) => {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [variantData, setVariantData] = useState({});
  const [expanded, setExpanded] = useState({});
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [defaultPriceLocal, setDefaultPriceLocal] = useState("");
  const [defaultCompareAtPriceLocal, setDefaultCompareAtPriceLocal] = useState("");
  const [defaultStockLocal, setDefaultStockLocal] = useState("");

  // guard so our auto-initializer doesn't blow away prefilled data
  const prefilledRef = useRef(false);

  // ---- PREFILL FROM SERVER VARIANTS ONCE ----
  useEffect(() => {
    if (!initialVariants || initialVariants.length === 0) return;
    // Build prefilled structure
    const cSet = new Set();
    const sSet = new Set();
    const pre = {}; // { [color]: { images: [], sizes: { [size|default]: { price, stock, compareAtPrice, _id } } } } OR size-only

    for (const v of initialVariants) {
      const attrs = v.optionValues || v.attributes || {};
      const color = attrs.Color || null;
      const size  = attrs.Size  || null;

      const price = v?.price ?? "";
      const stock = v?.stock ?? "";
      const compareAt = v?.compareAtPrice ?? "";

      if (color) {
        cSet.add(color);
        if (!pre[color]) {
          pre[color] = {
            images: Array.isArray(v.images) ? Array.from(new Set(v.images)).slice(0, 4) : [],
            sizes: {},
          };
        }
        const key = size || "default";
        pre[color].sizes[key] = {
          _id: v?._id,          // keep for upsert
          price,
          stock,
          compareAtPrice: compareAt,
        };
        // union images for that color
        if (Array.isArray(v.images) && v.images.length) {
          const set = new Set(pre[color].images);
          v.images.forEach((u) => set.add(u));
          pre[color].images = Array.from(set).slice(0, 4);
        }
        if (size) sSet.add(size);
      } else if (size) {
        // size-only
        sSet.add(size);
        pre[size] = {
          _id: v?._id,
          price,
          stock,
          compareAtPrice: compareAt,
        };
      }
    }

    // IMPORTANT: set data first, then colors/sizes, then mark prefilled
    setVariantData(pre);
    setColors(Array.from(cSet));
    setSizes(Array.from(sSet));
    prefilledRef.current = true;
  }, [initialVariants]);

  // ---- AUTO-INITIALIZER (only when NOT prefilled) ----
  useEffect(() => {
    if (prefilledRef.current) return; // don’t overwrite prefill

    const data = {};

    if (colors.length > 0) {
      colors.forEach((color) => {
        data[color] = {
          images: variantData[color]?.images || [],
          sizes: { ...(variantData[color]?.sizes || {}) },
        };

        if (sizes.length > 0) {
          sizes.forEach((size) => {
            if (!data[color].sizes[size]) {
              data[color].sizes[size] = {
                price: defaultPriceLocal,
                stock: defaultStockLocal,
                compareAtPrice: defaultCompareAtPriceLocal,
              };
            }
          });
        } else if (!data[color].sizes["default"]) {
          data[color].sizes["default"] = {
            price: defaultPriceLocal,
            stock: defaultStockLocal,
            compareAtPrice: defaultCompareAtPriceLocal,
          };
        }
      });
    } else if (sizes.length > 0) {
      sizes.forEach((size) => {
        data[size] = {
          ...(variantData[size] || {}),
          price: variantData[size]?.price ?? defaultPriceLocal,
          stock: variantData[size]?.stock ?? defaultStockLocal,
          compareAtPrice: variantData[size]?.compareAtPrice ?? defaultCompareAtPriceLocal,
        };
      });
    }

    // only set if we actually built something
    if (Object.keys(data).length > 0) setVariantData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, sizes, defaultPriceLocal, defaultStockLocal, defaultCompareAtPriceLocal]);

  // ---- FLATTEN TO PARENT ----
  useEffect(() => {
    const flattened = [];

    if (colors.length > 0) {
      for (const color of colors) {
        const colorBlock = variantData[color];
        if (!colorBlock) continue;

        const imgs = colorBlock.images || [];

        if (sizes.length > 0) {
          for (const size of sizes) {
            const row = colorBlock.sizes?.[size];
            if (!row) continue;
            flattened.push({
              _id: row._id, // keep id if present
              attributes: { Color: color, Size: size },
              price: row.price,
              stock: row.stock,
              compareAtPrice: row.compareAtPrice,
              images: imgs,
            });
          }
        } else {
          const row = colorBlock.sizes?.["default"];
          if (!row) continue;
          flattened.push({
            _id: row._id,
            attributes: { Color: color },
            price: row.price,
            stock: row.stock,
            compareAtPrice: row.compareAtPrice,
            images: imgs,
          });
        }
      }
    } else if (sizes.length > 0) {
      for (const size of sizes) {
        const row = variantData[size];
        if (!row) continue;
        flattened.push({
          _id: row._id,
          attributes: { Size: size },
          price: row.price,
          stock: row.stock,
          compareAtPrice: row.compareAtPrice,
          images: [],
        });
      }
    }

    onVariantsChange(flattened);
  }, [variantData, colors, sizes, onVariantsChange]);

  // ---- Handlers unchanged ----
  const handleImageUpload = async (e, color) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/upload/images`,
        formData
      );
      setVariantData((prev) => ({
        ...prev,
        [color]: {
          ...prev[color],
          images: [...(prev[color]?.images || []), ...(res.data?.urls || [])].slice(0, 4),
        },
      }));
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  const handleImageDelete = (color, url) => {
    setVariantData((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        images: (prev[color]?.images || []).filter((img) => img !== url),
      },
    }));
  };

  const handlePriceStockChange = (color, size, field, value) => {
    setVariantData((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: {
          ...(prev[color]?.sizes || {}),
          [size]: {
            ...(prev[color]?.sizes?.[size] || {}),
            [field]: value,
          },
        },
      },
    }));
  };

  // ---- UI (same as yours) ----
  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-semibold">Variants</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Default Price</label>
          <input type="number" className="border p-2 w-full"
            value={defaultPriceLocal} onChange={(e) => setDefaultPriceLocal(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Default Compare At Price</label>
          <input type="number" className="border p-2 w-full"
            value={defaultCompareAtPriceLocal} onChange={(e) => setDefaultCompareAtPriceLocal(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Default Stock</label>
          <input type="number" className="border p-2 w-full"
            value={defaultStockLocal} onChange={(e) => setDefaultStockLocal(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter colors (comma separated)"
            className="border p-2 w-full"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              const arr = colorInput.split(",").map((v) => v.trim()).filter(Boolean);
              setColors(arr);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Colors
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter sizes (comma separated)"
            className="border p-2 w-full"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              const arr = sizeInput.split(",").map((v) => v.trim()).filter(Boolean);
              setSizes(arr);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Sizes
          </button>
        </div>
      </div>

      {colors.map((color) => (
        <div key={color} className="border rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-800">Color: {color}</h4>
            <button
              type="button"
              className="text-blue-600 text-sm"
              onClick={() => setExpanded((prev) => ({ ...prev, [color]: !prev[color] }))}
            >
              {expanded[color] ? "Hide" : "Add Price & Stock"}
            </button>
          </div>

          <div className="border border-dashed p-3 rounded bg-white mb-4">
            <p className="text-sm font-medium mb-1">Upload images for {color}</p>
            <label className="text-blue-600 underline text-sm cursor-pointer">
              Upload Images
              <input type="file" hidden multiple onChange={(e) => handleImageUpload(e, color)} />
            </label>
            <div className="flex gap-2 mt-3 flex-wrap">
              {(variantData[color]?.images || []).map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="preview" className="w-16 h-16 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(color, img)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {expanded[color] && (
            <>
              {sizes.length > 0 ? (
                sizes.map((size) => (
                  <div key={size} className="flex gap-4 mb-2 items-center">
                    <span className="w-20 text-sm text-gray-700">Size: {size}</span>
                    <input
                      type="number" placeholder="Price" className="border p-1 w-24"
                      value={variantData[color]?.sizes?.[size]?.price || ""}
                      onChange={(e) => handlePriceStockChange(color, size, "price", e.target.value)}
                    />
                    <input
                      type="number" placeholder="Compare Price" className="border p-1 w-28"
                      value={variantData[color]?.sizes?.[size]?.compareAtPrice || ""}
                      onChange={(e) => handlePriceStockChange(color, size, "compareAtPrice", e.target.value)}
                    />
                    <input
                      type="number" placeholder="Stock" className="border p-1 w-24"
                      value={variantData[color]?.sizes?.[size]?.stock || ""}
                      onChange={(e) => handlePriceStockChange(color, size, "stock", e.target.value)}
                    />
                  </div>
                ))
              ) : (
                <div className="flex gap-4 mb-2 items-center">
                  <span className="w-20 text-sm text-gray-700">Price & Stock</span>
                  <input
                    type="number" placeholder="Price" className="border p-1 w-24"
                    value={variantData[color]?.sizes?.["default"]?.price || ""}
                    onChange={(e) => handlePriceStockChange(color, "default", "price", e.target.value)}
                  />
                  <input
                    type="number" placeholder="Compare Price" className="border p-1 w-28"
                    value={variantData[color]?.sizes?.["default"]?.compareAtPrice || ""}
                    onChange={(e) => handlePriceStockChange(color, "default", "compareAtPrice", e.target.value)}
                  />
                  <input
                    type="number" placeholder="Stock" className="border p-1 w-24"
                    value={variantData[color]?.sizes?.["default"]?.stock || ""}
                    onChange={(e) => handlePriceStockChange(color, "default", "stock", e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {colors.length === 0 && sizes.length > 0 && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h4 className="font-semibold mb-2 text-gray-800">Size Variants</h4>
          {sizes.map((size) => (
            <div key={size} className="flex gap-4 mb-2 items-center">
              <span className="w-20 text-sm text-gray-700">Size: {size}</span>
              <input
                type="number" placeholder="Price" className="border p-1 w-24"
                value={variantData[size]?.price || ""}
                onChange={(e) => setVariantData((prev) => ({
                  ...prev,
                  [size]: { ...(prev[size] || {}), price: e.target.value },
                }))}
              />
              <input
                type="number" placeholder="Compare Price" className="border p-1 w-28"
                value={variantData[size]?.compareAtPrice || ""}
                onChange={(e) => setVariantData((prev) => ({
                  ...prev,
                  [size]: { ...(prev[size] || {}), compareAtPrice: e.target.value },
                }))}
              />
              <input
                type="number" placeholder="Stock" className="border p-1 w-24"
                value={variantData[size]?.stock || ""}
                onChange={(e) => setVariantData((prev) => ({
                  ...prev,
                  [size]: { ...(prev[size] || {}), stock: e.target.value },
                }))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantBuilderGrouped;
