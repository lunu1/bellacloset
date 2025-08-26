import { useEffect, useRef, useState } from "react";
import axios from "axios";

const VariantBuilderGrouped = ({
  onVariantsChange,
  defaultPrice,
  defaultStock,
  defaultCompareAtPrice,
  initialVariants = [],
  variantErrors = {}, // <-- parent passes validator errors here
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

  // local visual warning for missing per-color images
  const [localErrors, setLocalErrors] = useState({ colorImages: {} });

  // avoid auto-initializer overwriting prefill
  const prefilledRef = useRef(false);

  // ---------- helpers ----------
  // (color, size) -> flattened index (same order as we push variants to parent)
  const getFlatIndex = (color, size) => {
    if (colors.length > 0) {
      if (sizes.length > 0) {
        return colors.indexOf(color) * sizes.length + sizes.indexOf(size);
      }
      return colors.indexOf(color); // color-only, "default"
    } else if (sizes.length > 0) {
      return sizes.indexOf(size); // size-only
    }
    return -1;
  };

  // Read an error regardless of shape:
  //  - flat dot:   errors["variants.3.price"]
  //  - flat brack: errors["variants[3].price"]
  //  - nested:     errors.variants?.[3]?.price
  const getVariantErr = (idx, field) => {
    if (idx < 0 || !variantErrors) return null;
    const dot = variantErrors[`variants.${idx}.${field}`];
    if (dot) return dot;
    const bracket = variantErrors[`variants[${idx}].${field}`];
    if (bracket) return bracket;
    const nested = variantErrors.variants?.[idx]?.[field];
    if (nested) return nested;
    return null;
  };

  // ---------- prefill defaults from props ----------
  useEffect(() => {
    setDefaultPriceLocal(defaultPrice ?? "");
    setDefaultStockLocal(defaultStock ?? "");
    setDefaultCompareAtPriceLocal(defaultCompareAtPrice ?? "");
  }, [defaultPrice, defaultStock, defaultCompareAtPrice]);

  // ---------- PREFILL FROM SERVER VARIANTS ONCE ----------
  useEffect(() => {
    if (!initialVariants || initialVariants.length === 0) return;

    const cSet = new Set();
    const sSet = new Set();
    const pre = {};

    for (const v of initialVariants) {
      const attrs = v.optionValues || v.attributes || {};
      const color = attrs.Color || null;
      const size = attrs.Size || null;

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
          _id: v?._id,
          price,
          stock,
          compareAtPrice: compareAt,
        };
        if (Array.isArray(v.images) && v.images.length) {
          const s = new Set(pre[color].images);
          v.images.forEach((u) => s.add(u));
          pre[color].images = Array.from(s).slice(0, 4);
        }
        if (size) sSet.add(size);
      } else if (size) {
        sSet.add(size);
        pre[size] = {
          _id: v?._id,
          price,
          stock,
          compareAtPrice: compareAt,
        };
      }
    }

    setVariantData(pre);
    const cArr = Array.from(cSet);
    const sArr = Array.from(sSet);
    setColors(cArr);
    setSizes(sArr);
    setColorInput(cArr.join(", "));
    setSizeInput(sArr.join(", "));
    prefilledRef.current = true;
  }, [initialVariants]);

  // ---------- AUTO-INITIALIZER (only when NOT prefilled) ----------
  useEffect(() => {
    if (prefilledRef.current) return;

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

    if (Object.keys(data).length > 0) setVariantData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, sizes, defaultPriceLocal, defaultStockLocal, defaultCompareAtPriceLocal]);

  // ---------- FLATTEN TO PARENT ----------
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
              _id: row._id,
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

  // ---------- local per-color image warnings ----------
  useEffect(() => {
    const colorImages = {};
    if (colors.length > 0) {
      for (const c of colors) {
        const imgs = variantData[c]?.images || [];
        if (imgs.length === 0) colorImages[c] = "Add at least one image for this color.";
      }
    }
    setLocalErrors({ colorImages });
  }, [colors, variantData]);

  // ---------- handlers ----------
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
            onChange={(e) => setDefaultPriceLocal(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Default Compare At Price</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={defaultCompareAtPriceLocal}
            onChange={(e) => setDefaultCompareAtPriceLocal(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Default Stock</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={defaultStockLocal}
            onChange={(e) => setDefaultStockLocal(e.target.value)}
          />
        </div>
      </div>

      {/* Color & Size entry */}
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
              setColors((prev) => {
                const norm = new Set(prev.map((x) => x.toLowerCase()));
                const toAdd = arr.filter((c) => !norm.has(c.toLowerCase()));
                if (toAdd.length) {
                  setVariantData((prevVD) => {
                    const next = { ...prevVD };
                    for (const c of toAdd) {
                      if (!next[c]) {
                        if (sizes.length > 0) {
                          next[c] = {
                            images: [],
                            sizes: Object.fromEntries(
                              sizes.map((s) => [
                                s,
                                {
                                  price: defaultPriceLocal,
                                  stock: defaultStockLocal,
                                  compareAtPrice: defaultCompareAtPriceLocal,
                                },
                              ])
                            ),
                          };
                        } else {
                          next[c] = {
                            images: [],
                            sizes: {
                              default: {
                                price: defaultPriceLocal,
                                stock: defaultStockLocal,
                                compareAtPrice: defaultCompareAtPriceLocal,
                              },
                            },
                          };
                        }
                      }
                    }
                    return next;
                  });
                }
                return [...prev, ...toAdd];
              });
            }}
            className="bg-black text-white px-4 py-2 rounded"
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
              setSizes((prev) => {
                const norm = new Set(prev.map((x) => x.toLowerCase()));
                const toAdd = arr.filter((s) => !norm.has(s.toLowerCase()));
                if (toAdd.length) {
                  setVariantData((prevVD) => {
                    const next = { ...prevVD };
                    if (colors.length > 0) {
                      for (const color of colors) {
                        const block = next[color] || { images: [], sizes: {} };
                        block.sizes = { ...(block.sizes || {}) };
                        for (const s of toAdd) {
                          if (!block.sizes[s]) {
                            block.sizes[s] = {
                              price: defaultPriceLocal,
                              stock: defaultStockLocal,
                              compareAtPrice: defaultCompareAtPriceLocal,
                            };
                          }
                        }
                        next[color] = block;
                      }
                    } else {
                      for (const s of toAdd) {
                        if (!next[s]) {
                          next[s] = {
                            price: defaultPriceLocal,
                            stock: defaultStockLocal,
                            compareAtPrice: defaultCompareAtPriceLocal,
                          };
                        }
                      }
                    }
                    return next;
                  });
                }
                return [...prev, ...toAdd];
              });
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Sizes
          </button>
        </div>
      </div>

      {/* Per-Color groups */}
      {colors.map((color) => {
        const idxForColor = getFlatIndex(color, sizes.length > 0 ? sizes[0] : "default");
        const eImg = getVariantErr(idxForColor, "images");

        return (
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

            <div
              className={`border border-dashed p-3 rounded bg-white mb-1 ${
                localErrors.colorImages?.[color] || eImg ? "border-red-500" : "border-gray-300"
              }`}
            >
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
            {eImg && <p className="text-xs text-red-600 mb-3">{eImg}</p>}

            {expanded[color] && (
              <>
                {sizes.length > 0
                  ? sizes.map((size) => {
                      const idx = getFlatIndex(color, size);
                      const ePrice = getVariantErr(idx, "price");
                      const eCompare = getVariantErr(idx, "compareAtPrice");
                      const eStock = getVariantErr(idx, "stock");

                      return (
                        <div key={size} className="flex gap-4 mb-2 items-center">
                          <span className="w-20 text-sm text-gray-700">Size: {size}</span>

                          <div>
                            <input
                              type="number"
                              placeholder="Price"
                              className={`border p-1 w-24 ${ePrice ? "border-red-500" : ""}`}
                              value={variantData[color]?.sizes?.[size]?.price || ""}
                              onChange={(e) => handlePriceStockChange(color, size, "price", e.target.value)}
                            />
                            {ePrice && <p className="text-[10px] text-red-600 mt-1">{ePrice}</p>}
                          </div>

                          <div>
                            <input
                              type="number"
                              placeholder="Compare Price"
                              className={`border p-1 w-28 ${eCompare ? "border-red-500" : ""}`}
                              value={variantData[color]?.sizes?.[size]?.compareAtPrice || ""}
                              onChange={(e) =>
                                handlePriceStockChange(color, size, "compareAtPrice", e.target.value)
                              }
                            />
                            {eCompare && <p className="text-[10px] text-red-600 mt-1">{eCompare}</p>}
                          </div>

                          <div>
                            <input
                              type="number"
                              placeholder="Stock"
                              className={`border p-1 w-24 ${eStock ? "border-red-500" : ""}`}
                              value={variantData[color]?.sizes?.[size]?.stock || ""}
                              onChange={(e) => handlePriceStockChange(color, size, "stock", e.target.value)}
                            />
                            {eStock && <p className="text-[10px] text-red-600 mt-1">{eStock}</p>}
                          </div>
                        </div>
                      );
                    })
                  : (() => {
                      const idx = getFlatIndex(color, "default");
                      const ePrice = getVariantErr(idx, "price");
                      const eCompare = getVariantErr(idx, "compareAtPrice");
                      const eStock = getVariantErr(idx, "stock");

                      return (
                        <div className="flex gap-4 mb-2 items-center">
                          <span className="w-20 text-sm text-gray-700">Price & Stock</span>

                          <div>
                            <input
                              type="number"
                              placeholder="Price"
                              className={`border p-1 w-24 ${ePrice ? "border-red-500" : ""}`}
                              value={variantData[color]?.sizes?.["default"]?.price || ""}
                              onChange={(e) => handlePriceStockChange(color, "default", "price", e.target.value)}
                            />
                            {ePrice && <p className="text-[10px] text-red-600 mt-1">{ePrice}</p>}
                          </div>

                          <div>
                            <input
                              type="number"
                              placeholder="Compare Price"
                              className={`border p-1 w-28 ${eCompare ? "border-red-500" : ""}`}
                              value={variantData[color]?.sizes?.["default"]?.compareAtPrice || ""}
                              onChange={(e) =>
                                handlePriceStockChange(color, "default", "compareAtPrice", e.target.value)
                              }
                            />
                            {eCompare && <p className="text-[10px] text-red-600 mt-1">{eCompare}</p>}
                          </div>

                          <div>
                            <input
                              type="number"
                              placeholder="Stock"
                              className={`border p-1 w-24 ${eStock ? "border-red-500" : ""}`}
                              value={variantData[color]?.sizes?.["default"]?.stock || ""}
                              onChange={(e) => handlePriceStockChange(color, "default", "stock", e.target.value)}
                            />
                            {eStock && <p className="text-[10px] text-red-600 mt-1">{eStock}</p>}
                          </div>
                        </div>
                      );
                    })()}
              </>
            )}
          </div>
        );
      })}

      {/* Size-only mode */}
      {colors.length === 0 && sizes.length > 0 && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h4 className="font-semibold mb-2 text-gray-800">Size Variants</h4>
          {sizes.map((size) => {
            const idx = getFlatIndex(null, size);
            const ePrice = getVariantErr(idx, "price");
            const eCompare = getVariantErr(idx, "compareAtPrice");
            const eStock = getVariantErr(idx, "stock");

            return (
              <div key={size} className="flex gap-4 mb-2 items-center">
                <span className="w-20 text-sm text-gray-700">Size: {size}</span>

                <div>
                  <input
                    type="number"
                    placeholder="Price"
                    className={`border p-1 w-24 ${ePrice ? "border-red-500" : ""}`}
                    value={variantData[size]?.price || ""}
                    onChange={(e) =>
                      setVariantData((prev) => ({
                        ...prev,
                        [size]: { ...(prev[size] || {}), price: e.target.value },
                      }))
                    }
                  />
                  {ePrice && <p className="text-[10px] text-red-600 mt-1">{ePrice}</p>}
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Compare Price"
                    className={`border p-1 w-28 ${eCompare ? "border-red-500" : ""}`}
                    value={variantData[size]?.compareAtPrice || ""}
                    onChange={(e) =>
                      setVariantData((prev) => ({
                        ...prev,
                        [size]: { ...(prev[size] || {}), compareAtPrice: e.target.value },
                      }))
                    }
                  />
                  {eCompare && <p className="text-[10px] text-red-600 mt-1">{eCompare}</p>}
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Stock"
                    className={`border p-1 w-24 ${eStock ? "border-red-500" : ""}`}
                    value={variantData[size]?.stock || ""}
                    onChange={(e) =>
                      setVariantData((prev) => ({
                        ...prev,
                        [size]: { ...(prev[size] || {}), stock: e.target.value },
                      }))
                    }
                  />
                  {eStock && <p className="text-[10px] text-red-600 mt-1">{eStock}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VariantBuilderGrouped;
