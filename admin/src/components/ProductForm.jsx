// === FRONTEND === //

// components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VariantBuilder from './VariantBuilder';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/categorySlice';
import { toast } from 'react-toastify'; 

const AVAILABLE_OPTIONS = ["Color", "Size", "Material"];

const ProductForm = ({ onSubmit }) => {
  const [product, setProduct] = useState({
    name: '', brand: '', category: '', tags: '', description: '', options: [],
  });

  const [optionInput, setOptionInput] = useState('');
  const [defaultImages, setDefaultImages] = useState([]);
  const [uploadingDefault, setUploadingDefault] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [variants, setVariants] = useState([]);

 const dispatch = useDispatch();
 const { items: categories, loading } = useSelector(state => state.category)

 useEffect(() => {
  dispatch(fetchCategories());
}, [dispatch]);
 

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleAddOption = () => {
    if (optionInput && !product.options.includes(optionInput)) {
      setProduct({ ...product, options: [...product.options, optionInput] });
      setOptionInput('');
    }
  };

  const handleDefaultImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - defaultImages.length);
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    setUploadingDefault(true);
    try {
      const res = await axios.post("http://localhost:4000/api/upload/images", formData);
      setDefaultImages(prev => [...prev, ...res.data.urls]);
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Failed to upload images.")
    } finally {
      setUploadingDefault(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = product.tags.split(',').map(t => t.trim());
    const finalVariants = variants.map(v => ({
      ...v,
      price: v.price || defaultPrice,
      stock: v.stock || defaultStock,
    }));

    const payload = {
      ...product,
      tags: tagsArray,
      variants: finalVariants,
      defaultImages,
      defaultPrice,
      defaultStock
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Add New Product</h2>

      <input name="name" placeholder="Product Name" className="border p-2 w-full" value={product.name} onChange={handleChange} />
      <input name="brand" placeholder="Brand" className="border p-2 w-full" value={product.brand} onChange={handleChange} />
      {/* <input name="category" placeholder="Category ID" className="border p-2 w-full" value={product.category} onChange={handleChange} /> */}
      <select 
      name='category'
      className='border p-2 w-full'
      value={product.category}
      onChange={handleChange}
      >
        <option value=" ">Select Category</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>
            {cat.label}
          </option>
        ))}
      </select>
      <textarea name="description" placeholder="Description" className="border p-2 w-full" value={product.description} onChange={handleChange} />
      <input name="tags" placeholder="Tags (comma separated)" className="border p-2 w-full" value={product.tags} onChange={handleChange} />

      <input type="number" placeholder="Default Price" className="border p-2 w-full" value={defaultPrice} onChange={e => setDefaultPrice(e.target.value)} />
      <input type="number" placeholder="Default Stock" className="border p-2 w-full" value={defaultStock} onChange={e => setDefaultStock(e.target.value)} />

      <div className="flex gap-2">
        <select value={optionInput} onChange={e => setOptionInput(e.target.value)} className="border p-2">
          <option value="">Select Option</option>
          {AVAILABLE_OPTIONS.filter(opt => !product.options.includes(opt)).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button type="button" className="bg-blue-500 text-white px-4 py-2" onClick={handleAddOption}>Add Option</button>
      </div>

      <div className="border border-dashed border-gray-300 p-4 rounded-md">
        <p className="text-sm font-medium mb-2">Media</p>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer px-4 py-2 border rounded-md bg-white shadow text-sm font-medium">
            Add files
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleDefaultImageUpload} />
          </label>
          <button type="button" className="text-blue-600 text-sm">Add from URL</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Accepts images, videos, or 3D models</p>
        <div className="flex gap-2 mt-4">
          {defaultImages.map((img, i) => (
            <img key={i} src={img} className="w-16 h-16 object-cover rounded" alt="Default preview" />
          ))}
        </div>
      </div>

      <VariantBuilder options={product.options} onVariantsChange={setVariants} defaultPrice={defaultPrice} defaultStock={defaultStock} />

      <button type="submit" className="bg-green-600 text-white px-6 py-2">Save Product</button>
    </form>
  );
};

export default ProductForm;
