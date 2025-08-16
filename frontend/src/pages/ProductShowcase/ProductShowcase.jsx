
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../features/product/productSlice';
import ProductCard from './ProductCard';
import Loader from '../../components/Loader';

const ProductShowcase = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {items.map(({ product, variants }) => (
        <ProductCard key={product._id} product={product} variants={variants} />
      ))}
    </div>
  );
};

export default ProductShowcase;
