// components/ProductForm.jsx
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/categorySlice';
import { toast } from 'react-toastify';
import VariantBuilderGrouped from './VariantBuilderGrouped';
import CategoryTreeSelect from '../components/category/CategoryTreeSelect';
import Spinner from './Spinner';

const ProductForm = ({ onSubmit }) => {
  const [product, setProduct] = useState({
    name: '', brand: '', tags: '', description: '', options: [],
    // We'll set category/subcategory from the tree at submit
  });

  const [defaultImages, setDefaultImages] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState('');
  const [compareAtPrice, setDefaultcomparePrice] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [variants, setVariants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);


  // NEW: holds selected ids from root -> leaf
  const [categoryPath, setCategoryPath] = useState([]); // e.g. ["WomenId", "BagsId", "ShoulderBagId"]

  const dispatch = useDispatch();
  const { items: categories, loading } = useSelector(state => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleDefaultImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - defaultImages.length);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    setIsUploadingImages(true);
    
    try {
      const res = await axios.post("http://localhost:4000/api/upload/images", formData);
      setDefaultImages(prev => [...prev, ...res.data.urls]);
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Failed to upload images.");
    } finally {
    setIsUploadingImages(false); 
  }
  };

  const idToNode = useMemo(() => {
    const map = new Map();
    const visit = (node) => {
      map.set(node._id, node);
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    categories.forEach(visit);
    return map;
  }, [categories]);

  const readablePath = useMemo(() => {
    return categoryPath
      .map(id => idToNode.get(id)?.label)
      .filter(Boolean)
      .join(" › ");
  }, [categoryPath, idToNode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tagsArray = product.tags.split(',').map(t => t.trim()).filter(Boolean);
    const finalVariants = variants.map(v => ({
      ...v,
      price: v.price || defaultPrice,
      stock: v.stock || defaultStock,
      compareAtPrice: v.compareAtPrice || compareAtPrice,
    }));

    // Determine root category and deepest subcategory from the path
    const rootCategoryId = categoryPath[0] || null;
    const leafCategoryId = categoryPath.length ? categoryPath[categoryPath.length - 1] : null;

    const payload = {
      ...product,
      // 1) root/top-level
      category: rootCategoryId,
      // 2) deepest selected node (treat as subcategory on backend)
      subcategory: leafCategoryId && leafCategoryId !== rootCategoryId ? leafCategoryId : null,
      // (Optional) full path if your backend wants to store lineage
      categoryPath, // e.g. ["WomenId","BagsId","ShoulderBagId"]

      tags: tagsArray,
      variants: finalVariants,
      defaultImages,
      defaultPrice,
      defaultStock,
      compareAtPrice,
    };

    try {
      await onSubmit(payload);
      toast.success("✅ Product created successfully!");

      // Reset form
      setProduct({ name: '', brand: '', tags: '', description: '', options: [] });
      setDefaultImages([]);
      setDefaultPrice('');
      setDefaultcomparePrice('');
      setDefaultStock('');
      setVariants([]);
      setHasVariants(false);
      setCategoryPath([]);
    } catch (err) {
      toast.error("❌ Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Debug: watch variants
    // console.log("Updated variants in ProductForm:", variants);
  }, [variants]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasVariants"
          checked={hasVariants}
          onChange={() => setHasVariants(prev => !prev)}
        />
        <label htmlFor="hasVariants" className="text-sm font-medium">
          This product has variants
        </label>
      </div>

      <h2 className="text-xl font-semibold">Add New Product</h2>

      <input name="name" placeholder="Product Name" className="border p-2 w-full" value={product.name} onChange={handleChange} />
      <input name="brand" placeholder="Brand" className="border p-2 w-full" value={product.brand} onChange={handleChange} />

      {/* DYNAMIC CATEGORY TREE */}
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
      </div>

      <textarea name="description" placeholder="Description" className="border p-2 w-full" value={product.description} onChange={handleChange} />
      <input name="tags" placeholder="Tags (comma separated)" className="border p-2 w-full" value={product.tags} onChange={handleChange} />

      {!hasVariants && (
        <>
          <input
            type="number"
            placeholder="Price"
            className="border p-2 w-full"
            value={defaultPrice}
            onChange={e => setDefaultPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Comparison Price"
            className="border p-2 w-full"
            value={compareAtPrice}
            onChange={e => setDefaultcomparePrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Stock"
            className="border p-2 w-full"
            value={defaultStock}
            onChange={e => setDefaultStock(e.target.value)}
          />
        </>
      )}

      {!hasVariants && (
        <div className="border border-dashed border-gray-300 p-4 rounded-md">
          <p className="text-sm font-medium mb-2">Image</p>
          <div className="flex items-center gap-4">
            <label className={`cursor-pointer px-4 py-2 border rounded-md bg-white shadow text-sm font-medium inline-flex items-center gap-2 
            ${isUploadingImages ? "opacity-60 cursor-not-allowed" : ""}`}>
             {isUploadingImages ? (
      <>
        <Spinner />
        Uploading…
      </>
    ) : (
      "Add files"
    )}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleDefaultImageUpload} />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Accepts images, videos, or 3D models</p>
          <div className="flex gap-2 mt-4">
            {defaultImages.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} className="w-16 h-16 object-cover rounded" alt="Default preview" />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                  onClick={() => setDefaultImages(prev => prev.filter((_, idx) => idx !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasVariants && (
        <VariantBuilderGrouped
          onVariantsChange={setVariants}
          defaultPrice={defaultPrice}
          defaultStock={defaultStock}
        />
      )}

      <button
        type="submit"
        className={`px-6 py-2 text-white rounded ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
};

export default ProductForm;
