// components/ProductForm.jsx
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/categorySlice';
import { toast } from 'react-toastify';

import VariantBuilderGrouped from './VariantBuilderGrouped';
import CategoryTreeSelect from '../components/category/CategoryTreeSelect';
import Spinner from './Spinner';
import BrandSelect from './brand/BrandSelect';
import { backendURL } from '../config';
import { validateProductForm } from '../utils/validateProductForm';

const ProductForm = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const { items: categories = [], loading } = useSelector((state) => state.category);

  // Core product text fields
  const [product, setProduct] = useState({
    name: '',
    tags: '',
    description: '',
    options: [], // set if you want to explicitly store ["Color","Size"]
  });

  // Media & pricing (simple product)
  const [defaultImages, setDefaultImages] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [detailedDescription, setDetailedDescription] = useState("");


  // Variants
  const [variants, setVariants] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);

  // Brand
  const [brandId, setBrandId] = useState(null);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  // Category path: root -> ... -> leaf
  const [categoryPath, setCategoryPath] = useState([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Load brands
  useEffect(() => {
    (async () => {
      try {
        setBrandsLoading(true);
        const { data } = await axios.get(`${backendURL}/api/brands`);
        const arr = Array.isArray(data) ? data : data?.brands || [];
        setBrands(arr.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
        console.error(e);
      } finally {
        setBrandsLoading(false);
      }
    })();
  }, []);

  // Brand create helper (BrandSelect uses this)
  async function createBrand(name) {
    const { data } = await axios.post(`${backendURL}/api/brands`, { name });
    const created = Array.isArray(data) ? data[0] : data;
    setBrands((prev) => {
      const exists = prev.some((b) => String(b._id) === String(created._id));
      const next = exists ? prev : [...prev, created];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    return created;
  }

  const handleChange = (e) =>
    setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDefaultImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).slice(
      0,
      Math.max(0, 14 - defaultImages.length)
    );
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    setIsUploadingImages(true);
    try {
      const { data } = await axios.post(`${backendURL}/api/upload/images`, formData);
      const urls = data?.urls || [];
      setDefaultImages((prev) => [...prev, ...urls].slice(0, 14));
      toast.success('Images uploaded successfully!');
    } catch (err) {
      console.error('Image upload failed', err);
      toast.error('Failed to upload images.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Build ID → node map for readable path
  const idToNode = useMemo(() => {
    const map = new Map();
    const visit = (node) => {
      map.set(node._id, node);
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    (categories || []).forEach(visit);
    return map;
  }, [categories]);

  const readablePath = useMemo(
    () =>
      categoryPath
        .map((id) => idToNode.get(id)?.label || idToNode.get(id)?.name)
        .filter(Boolean)
        .join(' › '),
    [categoryPath, idToNode]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const tagsArray = product.tags
      ? product.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Finalize variants: fallback to top-level defaults where empty
    const finalVariants = (variants || []).map((v) => ({
      ...v,
      price: v.price || defaultPrice,
      stock: v.stock || defaultStock,
      compareAtPrice: v.compareAtPrice || compareAtPrice,
    }));

    // Determine category + subcategory from path
    const rootCategoryId = categoryPath[0] || null;
    const leafCategoryId = categoryPath.length
      ? categoryPath[categoryPath.length - 1]
      : null;

    // ----- Validation -----
    const { isValid, errors: err } = validateProductForm({
      name: product.name,
      // send brandId to validator if it expects brand presence
      brand: brandId,
      description: product.description,
      categoryPath,
      hasVariants,
      defaultImages,
      defaultPrice,
      compareAtPrice,
      defaultStock,
      variants: finalVariants,
    });

    if (!isValid) {
      setErrors(err || {});
      setIsSubmitting(false);
      return;
    }

    // Build payload for backend
    const payload = {
      name: product.name,
      description: product.description,
      detailedDescription: detailedDescription,
      tags: tagsArray,

      // Brand (selected or created)
      ...(brandId ? { brand: brandId } : {}),

      // Categories
      category: rootCategoryId,
      subcategory:
        leafCategoryId && leafCategoryId !== rootCategoryId ? leafCategoryId : null,
      categoryPath, // optional lineage

      // Product options (if you want to enforce Color/Size when variants are on)
      options: hasVariants ? ['Color', 'Size'] : [],

      // Media & prices (simple product)
      defaultImages,
      defaultPrice,
      compareAtPrice,
      defaultStock,

      // Variants (if any)
      variants: finalVariants,
    };

    try {
      await onSubmit(payload);
      toast.success('✅ Product created successfully!');

      // Reset form
      setProduct({ name: '', tags: '', description: '', options: [] });
      setDefaultImages([]);
      setDetailedDescription("");
      setDefaultPrice('');
      setCompareAtPrice('');
      setDefaultStock('');
      setVariants([]);
      setHasVariants(false);
      setCategoryPath([]);
      setBrandId(null);
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Variants toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasVariants"
          checked={hasVariants}
          onChange={() => setHasVariants((prev) => !prev)}
        />
        <label htmlFor="hasVariants" className="text-sm font-medium">
          This product has variants
        </label>
      </div>

      <h2 className="text-xl font-semibold">Add New Product</h2>

      {/* Name */}
      <div>
        <input
          name="name"
          placeholder="Product Name"
          className={`border p-2 w-full rounded ${
            errors.name ? 'border-red-600' : 'border-gray-300'
          }`}
          value={product.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Brand */}
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
        {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Pick an existing brand or create a new one.
        </p>
      </div>

      {/* Category Tree */}
      <div>
        <p className="text-sm font-medium mb-1">Category & Subcategory</p>
        {loading ? (
          <div className="text-sm text-gray-500">Loading categories…</div>
        ) : (
          <CategoryTreeSelect
            categories={categories}
            valuePath={categoryPath}
            onChange={setCategoryPath}
            placeholder="Select…"
          />
        )}
        {categoryPath.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">Selected: {readablePath}</div>
        )}
        {errors.categoryPath && (
          <p className="text-xs text-red-600 mt-1">{errors.categoryPath}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <textarea
          name="description"
          placeholder="Description"
          className={`border p-2 w-full rounded min-h-[120px] ${
            errors.description ? 'border-red-600' : 'border-gray-300'
          }`}
          value={product.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>
     {/* Detailed Description */}
<div className="mt-3">
  <label className="block text-sm font-medium mb-1">Detailed Description</label>
  <textarea
    name="detailedDescription"
    placeholder={`Add a detailed description of the product here.`}
    className={`border p-2 w-full rounded min-h-[220px] ${
      errors.detailedDescription ? 'border-red-600' : 'border-gray-300'
    }`}
    value={detailedDescription}
    onChange={(e) => setDetailedDescription(e.target.value)}
  />
  {errors.detailedDescription && (
    <p className="text-xs text-red-600 mt-1">{errors.detailedDescription}</p>
  )}
</div>




      {/* Tags */}
      <div>
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          className="border p-2 w-full rounded border-gray-300"
          value={product.tags}
          onChange={handleChange}
        />
      </div>

      {/* Simple product fields */}
      {!hasVariants && (
        <>
          <div>
            <input
              type="number"
              placeholder="Price"
              className={`border p-2 w-full rounded ${
                errors.defaultPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
            />
            {errors.defaultPrice && (
              <p className="text-xs text-red-600 mt-1">{errors.defaultPrice}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              placeholder="Comparison Price"
              className={`border p-2 w-full rounded ${
                errors.compareAtPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
            {errors.compareAtPrice && (
              <p className="text-xs text-red-600 mt-1">{errors.compareAtPrice}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              placeholder="Stock"
              className={`border p-2 w-full rounded ${
                errors.defaultStock ? 'border-red-500' : 'border-gray-300'
              }`}
              value={defaultStock}
              onChange={(e) => setDefaultStock(e.target.value)}
            />
            {errors.defaultStock && (
              <p className="text-xs text-red-600 mt-1">{errors.defaultStock}</p>
            )}
          </div>

          {/* Images */}
          <div className="border border-dashed border-gray-300 p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Images</p>
            <div className="flex items-center gap-4">
              <label
                className={`cursor-pointer px-4 py-2 border rounded-md bg-white shadow text-sm font-medium inline-flex items-center gap-2 ${
                  isUploadingImages ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isUploadingImages ? (
                  <>
                    <Spinner />
                    Uploading…
                  </>
                ) : (
                  'Add files'
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleDefaultImageUpload}
                  disabled={isUploadingImages}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Accepts up to 14 images. First image is used as the default.
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {defaultImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    className="w-16 h-16 object-cover rounded"
                    alt="Default preview"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                    onClick={() =>
                      setDefaultImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {errors.defaultImages && (
              <p className="text-xs text-red-600 mt-1">{errors.defaultImages}</p>
            )}
          </div>
        </>
      )}

      {/* Variants */}
      {hasVariants && (
        <>
          <VariantBuilderGrouped
            onVariantsChange={setVariants}
            defaultPrice={defaultPrice}
            defaultStock={defaultStock}
            variantErrors={errors}
          />
          {errors.variants && (
            <p className="text-xs text-red-600 mt-2">{errors.variants}</p>
          )}
        </>
      )}

      <button
        type="submit"
        className={`px-6 py-2 text-white rounded ${
          isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
};

export default ProductForm;
