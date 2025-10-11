
import { useEffect, useMemo } from 'react';
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

  // items may be an array OR an object with { items: [...] }
  const rows = useMemo(() => {
    const list = Array.isArray(items?.items) ? items.items
               : Array.isArray(items)      ? items
               : [];
    // each row should look like { product, variants }
    return list.map(row => ({
      product: row.product || row,               // support both shapes
      variants: row.variants || row.product?.variants || []
    }));
  }, [items]);
  

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!rows.length) return <div className="p-6 text-gray-500">No products found.</div>;

  return (
    <>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {rows.map(({ product, variants }, i) => (
        <ProductCard 
        key={product?._id || product?.id || i } 
        product={product} 
        variants={variants} />
      ))}
    </div>


    </>

  );
};

export default ProductShowcase;
