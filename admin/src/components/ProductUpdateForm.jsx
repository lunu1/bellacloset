// src/components/admin/ProductUpdateForm.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../redux/categorySlice";
import { toast } from "react-toastify";

import VariantBuilderGrouped from "../components/VariantBuilderGrouped";
import BrandSelect from "../components/brand/BrandSelect";
import { validateProductForm } from "../utils/validateProductForm";

const API_BASE = import.meta.env.VITE_API_URL || "https://bellaluxurycloset.com";

const ProductUpdateForm = ({
  initialProduct,
  initialVariants = [],
  onSubmit,
  submitting,
}) => {
  const dispatch = useDispatch();
  const { items: categories = [] } = useSelector((s) => s.category);

  // derive hasVariants from server data
  const initialHasVariants = initialVariants.length > 0;

  // core product state (excluding brand id which we handle separately)
  const [product, setProduct] = useState({
    name: "",
    category: "",
    tags: "",
    description: "",
    options: [], // e.g. ["Color", "Size"]
  });

  // BRAND state
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandId, setBrandId] = useState(null);
  const [detailedDescription, setDetailedDescription] = useState("");

  // NON-VARIANT (simple product) pricing & media
  const [defaultImages, setDefaultImages] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [defaultStock, setDefaultStock] = useState("");
  const [uploadingDefault, setUploadingDefault] = useState(false);

  // VARIANTS
  const [variants, setVariants] = useState([]); // flattened list from VariantBuilderGrouped
  const [hasVariants, setHasVariants] = useState(initialHasVariants);

  // UI errors from validation
  const [errors, setErrors] = useState({});

  // preload categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // preload brands
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBrandsLoading(true);
        const { data } = await axios.get(`${API_BASE}/api/brands`);
        const arr = Array.isArray(data) ? data : data?.brands || [];
        if (mounted) {
          setBrands(arr.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setBrandsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // seed form from initial product
  useEffect(() => {
    if (!initialProduct) return;

    setProduct({
      name: initialProduct.name || "",
      category: initialProduct.category || "",
      tags: Array.isArray(initialProduct.tags)
        ? initialProduct.tags.join(", ")
        : initialProduct.tags || "",
      description: initialProduct.description || "",
      options: initialProduct.options || [],
    });

    // brand can be populated object or ID
    const initBrandId =
      initialProduct.brand && typeof initialProduct.brand === "object"
        ? initialProduct.brand._id
        : initialProduct.brand || null;
    setBrandId(initBrandId || null);

    // default fields for simple product
    setDefaultImages(initialProduct.images || []);
    setDefaultPrice(
      initialProduct.defaultPrice !== undefined
        ? String(initialProduct.defaultPrice)
        : ""
    );
    setCompareAtPrice(
      initialProduct.compareAtPrice !== undefined
        ? String(initialProduct.compareAtPrice)
        : ""
    );
    setDefaultStock(
      initialProduct.defaultStock !== undefined
        ? String(initialProduct.defaultStock)
        : ""
    );

    // variants presence is controlled by prop + toggle
    setHasVariants(initialVariants.length > 0);
    setDetailedDescription(initialProduct.detailedDescription || "")
  }, [initialProduct, initialVariants]);

  const handleChange = (e) =>
    setProduct((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleDefaultImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).slice(
      0,
      Math.max(0, 14 - defaultImages.length)
    );
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    setUploadingDefault(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/upload/images`, formData);
      const urls = data?.urls || [];
      setDefaultImages((prev) => [...prev, ...urls].slice(0, 14));
      toast.success("Images uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload images");
    } finally {
      setUploadingDefault(false);
    }
  };

  // BrandSelect helper to create a brand
  async function createBrand(name) {
    const { data } = await axios.post(`${API_BASE}/api/brands`, { name });
    const created = Array.isArray(data) ? data[0] : data;
    setBrands((prev) => {
      const exists = prev.some((b) => String(b._id) === String(created._id));
      const next = exists ? prev : [...prev, created];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    return created;
  }

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const tagsArray = product.tags
      ? product.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Build patch body
    const productPatch = {
      name: product.name,
      ...(brandId ? { brand: brandId } : { brand: null }),
      category: product.category,
      description: product.description,
       detailedDescription,
      tags: tagsArray,
      options: hasVariants ? ["Color", "Size"] : [],
      isActive: initialProduct?.isActive ?? true,
      isFeatured: initialProduct?.isFeatured ?? false,
      seo: initialProduct?.seo || {},
    };

    if (!hasVariants) {
      productPatch.images = defaultImages.slice(0, 14);
      productPatch.defaultPrice = Number(defaultPrice || 0);
      productPatch.compareAtPrice = Number(compareAtPrice || 0);
      productPatch.defaultStock = Number(defaultStock || 0);
    } else {
      // keep product-level images as-is; backend may derive from variants/colors
      productPatch.images = initialProduct?.images || [];
    }

    // Prepare variants payload (flattened from VariantBuilderGrouped)
    const variantsPayload = hasVariants
      ? variants.map((v) => ({
          _id: v._id, // allow backend upsert
          attributes: v.attributes, // { Color, Size }
          price: Number(v.price || 0),
          compareAtPrice: Number(v.compareAtPrice || 0),
          stock: Number(v.stock || 0),
          images: Array.isArray(v.images) ? v.images.slice(0, 14) : [],
        }))
      : [];

    // Validate before submit
    const { isValid, errors: err } = validateProductForm({
      name: product.name,
      // NOTE: validateProductForm expected brand string earlier; we pass label for clarity,
      // but also keep ID on patch. Adjust if your validator expects brandId.
      brand: brandId,
      description: product.description,
      category: product.category,
      hasVariants,
      defaultImages,
      defaultPrice,
      compareAtPrice,
      defaultStock,
      variants: variantsPayload,
    });

    if (!isValid) {
      setErrors(err || {});
      return;
    }

    await onSubmit({ productPatch, variantsPayload });
  };

  const selectedBrand = useMemo(
    () => brands.find((b) => String(b._id) === String(brandId)) || null,
    [brands, brandId]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header + variants toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasVariants"
          checked={hasVariants}
          onChange={() => setHasVariants((s) => !s)}
        />
        <label htmlFor="hasVariants" className="text-sm font-medium">
          This product has variants
        </label>
      </div>

      <h2 className="text-xl font-semibold">Update Product</h2>

      {/* NAME */}
      <div>
        <input
          name="name"
          placeholder="Product Name"
          className={`border p-2 w-full rounded ${
            errors.name ? "border-red-600" : "border-gray-300"
          }`}
          value={product.name}
          onChange={handleChange}
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      {/* BRAND */}
      <div>
        <p className="text-sm font-medium mb-1">Brand</p>
        {brandsLoading ? (
          <div className="text-sm text-gray-500">Loading brands…</div>
        ) : (
          <BrandSelect
            brands={brands}
            valueId={brandId}
            onChange={setBrandId}
            onCreate={createBrand}
            placeholder="Select a brand"
          />
        )}
        <p className="text-xs text-gray-500 mt-1">
          {selectedBrand
            ? `Selected: ${selectedBrand.name}`
            : "Pick an existing brand or create a new one."}
        </p>
        {errors.brand && (
          <p className="text-xs text-red-600 mt-1">{errors.brand}</p>
        )}
      </div>

      {/* CATEGORY */}
      <div>
        <select
          name="category"
          className={`border p-2 w-full rounded ${
            errors.category ? "border-red-600" : "border-gray-300"
          }`}
          value={product.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.label || cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-red-600 mt-1">{errors.category}</p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div>
        <textarea
          name="description"
          placeholder="Description"
          className={`border p-2 w-full rounded min-h-[120px] ${
            errors.description ? "border-red-600" : "border-gray-300"
          }`}
          value={product.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* DETAILED DESCRIPTION */}
<div>
  <label className="block text-sm font-medium mb-1">Detailed Description</label>
  <textarea
    name="detailedDescription"
    placeholder={`Paste long-form details (line breaks preserved).`}
    className={`border p-2 w-full rounded min-h-[220px] ${
      errors.detailedDescription ? "border-red-600" : "border-gray-300"
    }`}
    value={detailedDescription}
    onChange={(e) => setDetailedDescription(e.target.value)}
  />
  {errors.detailedDescription && (
    <p className="text-xs text-red-600 mt-1">{errors.detailedDescription}</p>
  )}
</div>


      {/* TAGS */}
      <div>
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          className="border p-2 w-full rounded border-gray-300"
          value={product.tags}
          onChange={handleChange}
        />
      </div>

      {/* SIMPLE PRODUCT FIELDS (no variants) */}
      {!hasVariants && (
        <>
          <div>
            <input
              type="number"
              placeholder="Price"
              className={`border p-2 w-full rounded ${
                errors.defaultPrice ? "border-red-600" : "border-gray-300"
              }`}
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
            />
            {errors.defaultPrice && (
              <p className="text-xs text-red-600 mt-1">
                {errors.defaultPrice}
              </p>
            )}
          </div>

          <div>
            <input
              type="number"
              placeholder="Comparison Price"
              className={`border p-2 w-full rounded ${
                errors.compareAtPrice ? "border-red-600" : "border-gray-300"
              }`}
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
            {errors.compareAtPrice && (
              <p className="text-xs text-red-600 mt-1">
                {errors.compareAtPrice}
              </p>
            )}
          </div>

          <div>
            <input
              type="number"
              placeholder="Stock"
              className={`border p-2 w-full rounded ${
                errors.defaultStock ? "border-red-600" : "border-gray-300"
              }`}
              value={defaultStock}
              onChange={(e) => setDefaultStock(e.target.value)}
            />
            {errors.defaultStock && (
              <p className="text-xs text-red-600 mt-1">{errors.defaultStock}</p>
            )}
          </div>

          <div className="border border-dashed border-gray-300 p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Images</p>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2 border rounded-md bg-white shadow text-sm font-medium">
                Add files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleDefaultImageUpload}
                />
              </label>
              {uploadingDefault && (
                <span className="text-sm text-gray-500">Uploading…</span>
              )}
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {defaultImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    className="w-16 h-16 object-cover rounded"
                    alt="preview"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                    onClick={() =>
                      setDefaultImages((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {errors.defaultImages && (
              <p className="text-xs text-red-600 mt-2">{errors.defaultImages}</p>
            )}
          </div>
        </>
      )}

      {/* VARIANTS EDITOR */}
      {hasVariants && (
        <>
         <VariantBuilderGrouped
          // NEW props we’ll add in the small patch below
          initialVariants={initialVariants}
          onVariantsChange={setVariants}
           variantErrors={errors}
        />
        {errors.variants && <p className="text-xs text-red-600 mt-2">{errors.variants}</p>}

        </>
      )}

      <button
        type="submit"
        className={`px-6 py-2 text-white rounded ${
          submitting ? "bg-gray-400 cursor-not-allowed" : "bg-black"
        }`}
        disabled={submitting}
      >
        {submitting ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
};

export default ProductUpdateForm;
