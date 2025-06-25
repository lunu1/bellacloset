import { useEffect, useState } from 'react';
// import { ChevronDown } from 'lucide-react';
import { useDispatch , useSelector } from 'react-redux';
import { fetchCategories } from '../features/category/categorySlice';



export default function DesignerNavbar() {
  const [activeCategory, setActiveCategory] = useState(null);
  const dispatch = useDispatch();

  //Redux state
  const { items: navbarData,loading ,error} = useSelector((state) => state.category)

  //Fetch categories via redux 
  useEffect(() => {
    dispatch(fetchCategories());
  },[dispatch])
  
  const handleMouseEnter = (index) => {
    setActiveCategory(index);
  };
  
  const handleMouseLeave = () => {
    setActiveCategory(null);
  };
  
  return (
    <div className=" w-full font-sans">
      {/* Main Navigation Bar */}
      <div className="bg-white border-gray-200 relative">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-wrap justify-between uppercase">

              {loading && <div>Loading...</div>}
              {error && <div className="text-red-500">Error loading categories</div>}
              {!loading && navbarData.map((category, index) => (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={`px-4 py-4 cursor-pointer text-md hover:font-bold  flex items-center whitespace-nowrap `}>
                    {category.label}
                    {/* {category.children && <ChevronDown className="ml-1 w-4 h-4" />} */}
                  </div>
                </div>
              ))}
            </div>
            <div className=" ">
            <button className="bg-lime-400 px-4 py-2 text-black font-bold cursor-pointer hover:bg-lime-500 flex items-center w-24 rounded-lg mx-4">
              Sell Now
            </button>
           
            </div>
          </div>
          
          {/* Fixed position dropdown */}
          {activeCategory !== null && navbarData[activeCategory]?.children.length > 0 && (
            <div 
              className="absolute container mx-auto left-0 right-0 z-50 bg-white shadow-lg"
              onMouseEnter={() => setActiveCategory(activeCategory)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto">
                <div className="flex p-6">
                  {navbarData[activeCategory].children.map((subcategory, subIndex) => (
                    <div key={subIndex} className="w-1/4 px-4">
                      <div className="font-bold mb-3 text-black uppercase">{subcategory.label}</div>
                      <ul className="uppercase text-sm">
                        {subcategory.children.map((item, itemIndex) => (
                          <li key={itemIndex} className="hover:font-bold cursor-pointer">
                            {item.label}
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

      {/* Featured Product Information - Optional */}
      {/* <div className="bg-gray-50 py-2">
        <div className="container mx-auto text-center text-sm">
          Free shipping on orders over $200 • Designer authenticity guaranteed
        </div>
      </div> */}
    </div>
  );
}