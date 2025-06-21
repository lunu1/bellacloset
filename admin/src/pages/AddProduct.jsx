import React from 'react';
import { useDispatch } from 'react-redux';
import { createProduct } from '../redux/productSlice';
import ProductForm from '../components/ProductForm';

const AddProduct = () => {
  const dispatch = useDispatch();

  const handleSubmit = (formData) => {
    dispatch(createProduct(formData));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddProduct;
