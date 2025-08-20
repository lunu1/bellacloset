import { useEffect, useState } from 'react';
import { useDispatch , useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../features/category/categorySlice';

export default function DesignerNavbar() {
  const [activeCategory, setActiveCategory] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: navbarData, loading, error } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleMouseEnter = (index) => setActiveCategory(index);
  const handleMouseLeave = () => setActiveCategory(null);

  // 🔗 navigate helper: deep browse
  const goToCategory = (id) => {
    if (!id) return;
    navigate(`/c/${id}?deep=1`);
    setActiveCategory(null); // close dropdown after click
  };

  return (
    <div className="w-full font-sans">
      {/* Main Navigation Bar */}
      <div className="bg-white border-gray-200 relative">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-wrap justify-between uppercase">
              {loading && <div>Loading...</div>}
              {error && <div className="text-red-500">Error loading categories</div>}

              {!loading && navbarData.map((category, index) => (
                <div
                  key={category._id || index}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className="px-4 py-4 cursor-pointer text-md hover:font-bold flex items-center whitespace-nowrap uppercase"
                    onClick={() => goToCategory(category._id)}
                  >
                    {category.label}
                  </button>
                </div>
              ))}
            </div>

            <div>
              <button className="bg-lime-400 px-4 py-2 text-black font-bold cursor-pointer hover:bg-lime-500 flex items-center w-24 rounded-lg mx-4">
                Sell Now
              </button>
            </div>
          </div>

          {/* Fixed position dropdown */}
          {activeCategory !== null &&
            navbarData[activeCategory]?.children?.length > 0 && (
            <div
              className="absolute container mx-auto left-0 right-0 z-50 bg-white shadow-lg"
              onMouseEnter={() => setActiveCategory(activeCategory)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto">
                <div className="flex p-6">
                  {navbarData[activeCategory].children.map((subcategory) => (
                    <div key={subcategory._id} className="w-full md:w-1/4 px-4">
                      <button
                        type="button"
                        className="font-bold mb-3 text-black uppercase hover:underline"
                        onClick={() => goToCategory(subcategory._id)}
                      >
                        {subcategory.label}
                      </button>

                      <ul className="uppercase text-sm space-y-2">
                        {(subcategory.children || []).map((item) => (
                          <li key={item._id}>
                            <button
                              type="button"
                              className="hover:font-bold cursor-pointer"
                              onClick={() => goToCategory(item._id)}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
