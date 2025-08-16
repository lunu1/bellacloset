import { useState, useEffect } from "react";
import axios from "axios";

const VariantBuilderGrouped = ({
  onVariantsChange,
  defaultPrice,
  defaultStock,
  defaultCompareAtPrice,
}) => {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [variantData, setVariantData] = useState({});
  const [expanded, setExpanded] = useState({});
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [defaultPriceLocal, setDefaultPriceLocal] = useState("");
  const [defaultCompareAtPriceLocal, setDefaultCompareAtPriceLocal] =
    useState("");
  const [defaultStockLocal, setDefaultStockLocal] = useState("");

  useEffect(() => {
    const data = {};

    if (colors.length > 0) {
      colors.forEach((color) => {
        if (!variantData[color]) {
          data[color] = { images: [], sizes: {} };
        } else {
          data[color] = {
            images: variantData[color].images || [],
            sizes: { ...variantData[color].sizes },
          };
        }

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
        }

        if (sizes.length === 0 && !data[color].sizes["default"]) {
          data[color].sizes["default"] = {
            price: defaultPriceLocal,
            stock: defaultStockLocal,
            compareAtPrice: defaultCompareAtPriceLocal,
          };
        }
      });
    } else if (sizes.length > 0) {
      sizes.forEach((size) => {
        if (!variantData[size]) {
          data[size] = {
            price: defaultPriceLocal,
            stock: defaultStockLocal,
            compareAtPrice: defaultCompareAtPriceLocal,
          };
        }
      });
    }

    setVariantData(data);
  }, [colors, sizes, defaultPrice, defaultStock, defaultCompareAtPrice]);

  useEffect(() => {
    const flattened = [];

    if (colors.length > 0) {
      for (let color of colors) {
        if (!variantData[color]) continue;

        if (sizes.length > 0) {
          for (let size of sizes) {
            if (!variantData[color].sizes[size]) continue;
            flattened.push({
              attributes: { Color: color, Size: size },
              price: variantData[color].sizes[size].price,
              stock: variantData[color].sizes[size].stock,
              compareAtPrice: variantData[color].sizes[size].compareAtPrice,
              images: variantData[color].images || [],
            });
          }
        } else {
          if (!variantData[color].sizes["default"]) continue;
          flattened.push({
            attributes: { Color: color },
            price: variantData[color].sizes["default"].price,
            stock: variantData[color].sizes["default"].stock,
            compareAtPrice: variantData[color].sizes["default"].compareAtPrice,
            images: variantData[color].images || [],
          });
        }
      }
    } else if (sizes.length > 0) {
      for (let size of sizes) {
        if (!variantData[size]) continue;
        flattened.push({
          attributes: { Size: size },
          price: variantData[size].price,
          stock: variantData[size].stock,
          compareAtPrice: variantData[size].compareAtPrice,
          images: [],
        });
      }
    }

    onVariantsChange(flattened);
  }, [variantData, colors, sizes]);

  const handleImageUpload = async (e, color) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    try {
      const res = await axios.post(
        "http://localhost:4000/api/upload/images",
        formData
      );
      setVariantData((prev) => ({
        ...prev,
        [color]: {
          ...prev[color],
          images: [...(prev[color].images || []), ...res.data.urls],
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
        images: prev[color].images.filter((img) => img !== url),
      },
    }));
  };

  const handlePriceStockChange = (color, size, field, value) => {
    setVariantData((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        sizes: {
          ...prev[color].sizes,
          [size]: {
            ...prev[color].sizes[size],
            [field]: value,
          },
        },
      },
    }));
  };

  return (
    
    <div className="mt-6 space-y-6">

      <h3 className="text-lg font-semibold">Variants</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <label className="text-sm font-medium">Default Price</label>
    <input
      type="number"
      className="border p-2 w-full"
      value={defaultPriceLocal}
      onChange={e => setDefaultPriceLocal(e.target.value)}
    />
  </div>
  <div>
    <label className="text-sm font-medium">Default Compare At Price</label>
    <input
      type="number"
      className="border p-2 w-full"
      value={defaultCompareAtPriceLocal}
      onChange={e => setDefaultCompareAtPriceLocal(e.target.value)}
    />
  </div>
  <div>
    <label className="text-sm font-medium">Default Stock</label>
    <input
      type="number"
      className="border p-2 w-full"
      value={defaultStockLocal}
      onChange={e => setDefaultStockLocal(e.target.value)}
    />
  </div>
</div>

      {/* Color and Size Inputs */}
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
              const arr = colorInput
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
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
              const arr = sizeInput
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
              setSizes(arr);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Sizes
          </button>
        </div>
      </div>

      {/* Per-Color Group */}
      {colors.map((color) => (
        <div key={color} className="border rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-800">Color: {color}</h4>
            <button
              type="button"
              className="text-blue-600 text-sm"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [color]: !prev[color] }))
              }
            >
              {expanded[color] ? "Hide" : "Add Price & Stock"}
            </button>
          </div>

          {/* Image Upload */}
          <div className="border border-dashed p-3 rounded bg-white mb-4">
            <p className="text-sm font-medium mb-1">
              Upload images for {color}
            </p>
            <label className="text-blue-600 underline text-sm cursor-pointer">
              Upload Images
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => handleImageUpload(e, color)}
              />
            </label>
            <div className="flex gap-2 mt-3 flex-wrap">
              {(variantData[color]?.images || []).map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded"
                  />
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

          {/* Prices & Stocks */}
          {expanded[color] && (
            <>
              {sizes.length > 0 ? (
                sizes.map((size) => (
                  <div key={size} className="flex gap-4 mb-2 items-center">
                    <span className="w-20 text-sm text-gray-700">
                      Size: {size}
                    </span>
                    <input
                      type="number"
                      placeholder="Price"
                      className="border p-1 w-24"
                      value={variantData[color]?.sizes[size]?.price || ""}
                      onChange={(e) =>
                        handlePriceStockChange(
                          color,
                          size,
                          "price",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder="Compare Price"
                      className="border p-1 w-28"
                      value={
                        variantData[color]?.sizes[size]?.compareAtPrice || ""
                      }
                      onChange={(e) =>
                        handlePriceStockChange(
                          color,
                          size,
                          "compareAtPrice",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      className="border p-1 w-24"
                      value={variantData[color]?.sizes[size]?.stock || ""}
                      onChange={(e) =>
                        handlePriceStockChange(
                          color,
                          size,
                          "stock",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="flex gap-4 mb-2 items-center">
                  <span className="w-20 text-sm text-gray-700">
                    Price & Stock
                  </span>
                  <input
                    type="number"
                    placeholder="Price"
                    className="border p-1 w-24"
                    value={variantData[color]?.sizes["default"]?.price || ""}
                    onChange={(e) =>
                      handlePriceStockChange(
                        color,
                        "default",
                        "price",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Compare Price"
                    className="border p-1 w-28"
                    value={
                      variantData[color]?.sizes["default"]?.compareAtPrice || ""
                    }
                    onChange={(e) =>
                      handlePriceStockChange(
                        color,
                        "default",
                        "compareAtPrice",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="border p-1 w-24"
                    value={variantData[color]?.sizes["default"]?.stock || ""}
                    onChange={(e) =>
                      handlePriceStockChange(
                        color,
                        "default",
                        "stock",
                        e.target.value
                      )
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Only Size Variants */}
      {colors.length === 0 && sizes.length > 0 && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h4 className="font-semibold mb-2 text-gray-800">Size Variants</h4>
          {sizes.map((size) => (
            <div key={size} className="flex gap-4 mb-2 items-center">
              <span className="w-20 text-sm text-gray-700">Size: {size}</span>
              <input
                type="number"
                placeholder="Price"
                className="border p-1 w-24"
                value={variantData[size]?.price || ""}
                onChange={(e) =>
                  setVariantData((prev) => ({
                    ...prev,
                    [size]: {
                      ...prev[size],
                      price: e.target.value,
                    },
                  }))
                }
              />
              <input
                type="number"
                placeholder="Compare Price"
                className="border p-1 w-28"
                value={variantData[size]?.compareAtPrice || ""}
                onChange={(e) =>
                  setVariantData((prev) => ({
                    ...prev,
                    [size]: {
                      ...prev[size],
                      compareAtPrice: e.target.value,
                    },
                  }))
                }
              />
              <input
                type="number"
                placeholder="Stock"
                className="border p-1 w-24"
                value={variantData[size]?.stock || ""}
                onChange={(e) =>
                  setVariantData((prev) => ({
                    ...prev,
                    [size]: {
                      ...prev[size],
                      stock: e.target.value,
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantBuilderGrouped;
