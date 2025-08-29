// src/components/ShopbyCategory.jsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCategories } from "../features/category/categorySlice";

export default function ShopbyCategory() {
  const dispatch = useDispatch();
  const { items: categories = [], loading, error } = useSelector(
    (state) => state.category
  );

  // fetch once (only if empty)
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // pick first 6 categories (prefer top-level if `parent` exists)
  const topLevelCategories = useMemo(() => {
    const cats = Array.isArray(categories) ? categories : [];
    const topOnly = cats.filter((c) => !c.parent);
    const base = (topOnly.length ? topOnly : cats).slice(0, 6);
    return base.map((cat) => ({
      id: cat._id,
      name: String(cat.label || cat.name || "Category").toUpperCase(),
      image: cat.image || "https://via.placeholder.com/300x200?text=No+Image",
      alt: `${cat.label || cat.name || "Category"} banner`,
    }));
  }, [categories]);

  return (
    <div className="container mx-auto py-8">
      <div className="bg-gray-100 py-2 mb-8">
        <h2 className="text-center text-sm font-normal text-gray-800">
          SHOP BY CATEGORIES
        </h2>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topLevelCategories.map((category) => (
          <Link
            key={category.id}
            to={`/c/${category.id}`}
            className="block group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="relative overflow-hidden bg-gray-200">
              <img
                src={category.image}
                alt={category.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <h3 className="text-center mt-2 text-base font-semibold text-gray-700">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
