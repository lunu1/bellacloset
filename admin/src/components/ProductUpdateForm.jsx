// src/components/admin/ProductUpdateForm.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../redux/categorySlice";
import { toast } from "react-toastify";
import VariantBuilderGrouped from "../components/VariantBuilderGrouped"; // we’ll patch it to accept initialVariants
import { validateProductForm } from "../utils/validateProductForm";

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

  // core product state
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    tags: "",
    description: "",
    options: [], // ["Color","Size"] etc.
  });

  // non-variant pricing/media (when NO variants)
  const [defaultImages, setDefaultImages] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [defaultStock, setDefaultStock] = useState("");
  const [uploadingDefault, setUploadingDefault] = useState(false);

  // variants
  const [variants, setVariants] = useState([]); // flattened from VariantBuilderGrouped
  const [hasVariants, setHasVariants] = useState(initialHasVariants);

  const [errors, setErrors] = useState({});

  // preload
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!initialProduct) return;
    setProduct({
      name: initialProduct.name || "",
      brand: initialProduct.brand || "",
      category: initialProduct.category || "",
      tags: Array.isArray(initialProduct.tags)
        ? initialProduct.tags.join(", ")
        : initialProduct.tags || "",
      description: initialProduct.description || "",
      options: initialProduct.options || [],
    });

    // default fields
    setDefaultImages(initialProduct.images || []);
    setDefaultPrice(initialProduct.defaultPrice ?? "");
    setCompareAtPrice(initialProduct.compareAtPrice ?? "");
    setDefaultStock(initialProduct.defaultStock ?? "");

    // variants come from parent prop; VariantBuilderGrouped will prefill them via the patch below
    setHasVariants(initialVariants.length > 0);
  }, [initialProduct, initialVariants]);

  const handleChange = (e) =>
    setProduct((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleDefaultImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - defaultImages.length);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    setUploadingDefault(true);
    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:4000/api"
        }/upload/images`,
        formData
      );
      setDefaultImages((prev) => [...prev, ...(res.data?.urls || [])]);
      toast.success("Images uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload images");
    } finally {
      setUploadingDefault(false);
    }
  };

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

    const productPatch = {
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      tags: tagsArray,
      options: hasVariants
        ? ["Color", "Size"].filter((o) => product.options.includes(o))
        : [], // keep your options logic
      isActive: initialProduct?.isActive ?? true,
      isFeatured: initialProduct?.isFeatured ?? false,
      seo: initialProduct?.seo || {},
    };

    if (!hasVariants) {
      // keep default fields when there are no variants
      productPatch.images = defaultImages.slice(0, 4);
      productPatch.defaultPrice = Number(defaultPrice || 0);
      productPatch.compareAtPrice = Number(compareAtPrice || 0);
      productPatch.defaultStock = Number(defaultStock || 0);
    } else {
      // if variants exist, let images be set from a variant color (your create logic does this); here we just keep current product.images
      productPatch.images = initialProduct?.images || [];
    }

    const { isValid, errors: err } = validateProductForm({
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: product.category,
      hasVariants: hasVariants,
      defaultImages: defaultImages,
      defaultPrice: defaultPrice,
      compareAtPrice: compareAtPrice,
      defaultStock: defaultStock,
      variants: variants,
    });
    if (!isValid) {
      setErrors(err);
      return;
    }

    // variantsPayload is produced by VariantBuilderGrouped (flattened)
    const variantsPayload = hasVariants
      ? variants.map((v) => ({
          // keep existing _id if present so backend can upsert
          _id: v._id,
          attributes: v.attributes, // { Color, Size? }
          price: Number(v.price || 0),
          compareAtPrice: Number(v.compareAtPrice || 0),
          stock: Number(v.stock || 0),
          images: Array.isArray(v.images) ? v.images.slice(0, 4) : [],
        }))
      : [];

    await onSubmit({ productPatch, variantsPayload });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <input
        name="name"
        placeholder="Product Name"
        className={`border p-2 w-full ${errors.name ? "border-red-600" : ""}`}
        value={product.name}
        onChange={handleChange}
      />
      {errors.name && (
        <p className="text-xs text-red-600 mt-1">{errors.name}</p>
      )}
      <input
        name="brand"
        placeholder="Brand"
        className={`border p-2 w-full ${errors.brand ? "border-red-600" : ""}`}
        value={product.brand}
        onChange={handleChange}
      />
      {errors.brand && (
        <p className="text-xs text-red-600 mt-1">{errors.brand}</p>
      )}

      <select
        name="category"
        className={`border p-2 w-full ${
          errors.category ? "border-red-500" : ""
        }`}
        value={product.category}
        onChange={handleChange}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.label}
          </option>
        ))}
      </select>
      {errors.category && (
        <p className="text-xs text-red-600 mt-1">{errors.category}</p>
      )}

      <textarea
        name="description"
        placeholder="Description"
        className={`border p-2 w-full ${
          errors.description ? "border-red-600" : ""
        }`}
        value={product.description}
        onChange={handleChange}
      />
      {errors.description && (
        <p className="text-xs text-red-600 mt-1">{errors.description}</p>
      )}
      <input
        name="tags"
        placeholder="Tags (comma separated)"
        className="border p-2 w-full"
        value={product.tags}
        onChange={handleChange}
      />

      {/* Default fields when no variants */}
      {!hasVariants && (
        <>
          <input
            type="number"
            placeholder="Price"
            className={`border p-2 w-full ${
              errors.defaultPrice ? "border-red-500" : ""
            }`}
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
          />
          {errors.defaultPrice && (
            <p className="test-xs text-red-600 mt-1">{errors.defaultPrice}</p>
          )}
          <input
            type="number"
            placeholder="Comparison Price"
            className={`border-2 w-full p-2 ${
              errors.compareAtPrice ? "border-red-500" : ""
            }`}
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
          />
          {errors.compareAtPrice && (
            <p className="test-xs text-red-600 mt-1">{errors.compareAtPrice}</p>
          )}

        <input
            type="number"
            placeholder="Stock"
            className={`border p-2 w-full ${errors.defaultStock ? 'border-red-500': ''}`}
            value={defaultStock}
            onChange={e => setDefaultStock(e.target.value)}
          />
          {errors.defaultStock && <p className='test-xs text-red-600 mt-1'>{errors.defaultStock}</p>}

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
          </div>
        </>
      )}
     {errors.defaultImages && <p className="text-xs text-red-600 mt-1">{errors.defaultImages}</p>}


      {/* Variants editor when variants exist */}
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
