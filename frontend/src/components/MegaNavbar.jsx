import { useEffect, useState } from 'react';
// import { ChevronDown } from 'lucide-react';
import axios from "axios";
import { backendURL } from '../config';

export default function DesignerNavbar() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [navbarData, setNavbarData] = useState([]);

  // const navbarData = [
  //   {
  //     "name": "WOMEN",
  //     "children": [
  //       {
  //         "name": "BAGS",
  //         "children": ["Tote Bags", "Shoulder Bags", "Clutches", "Satchel Bags", "Backpacks", "All Bags"]
  //       },
  //       {
  //         "name": "SHOES",
  //         "children": ["Sandals", "Sneakers", "Heels", "Boots", "All Shoes"]
  //       },
  //       {
  //         "name": "SHOES",
  //         "children": ["Sandals", "Sneakers", "Heels", "Boots", "All Shoes", "Sneakers", "Heels", "Boots", "All Shoes"]
  //       },
  //       {
  //         "name": "CLOTHING",
  //         "children": ["Dresses", "Tops", "Pants", "Coats", "All Clothing"]
  //       },
  //       {
  //         "name": "ACCESSORIES",
  //         "children": ["Sunglasses", "Scarves", "Jewelry", "Belts", "All Accessories"]
  //       },
  //       {
  //         "name": "ACCESSORIES",
  //         "children": ["Sunglasses", "Scarves", "Jewelry", "Belts", "All Accessories"]
  //       }
  //     ]
  //   },
  //   {
  //     "name": "MEN",
  //     "children": [
  //       {
  //         "name": "BAGS",
  //         "children": ["Wallets", "Briefcases", "Suitcases", "Backpacks", "All Bags"]
  //       },
  //       {
  //         "name": "SHOES",
  //         "children": ["Sneakers", "Sandals", "Loafers", "Boots", "All Shoes"]
  //       },
  //       {
  //         "name": "ACCESSORIES",
  //         "children": ["Belts", "Sunglasses", "Ties", "All Accessories"]
  //       }
  //     ]
  //   },
  //   { "name": "HANDBAGS" },
  //   { "name": "WATCHES" },
  //   { "name": "NEW ARRIVALS" },
  //   { "name": "CLEARANCE" },
  //   { "name": "DESIGNERS" },
  //   { "name": "VIDEO SHOPPING" },
  //   { "name": "MAGAZINE" },
  //   { "name": "AUTHENTICITY" },
  // ];



   useEffect(() => {
     const fetchCategories = async () => {
       try {
         const res = await axios.get(`${backendURL}/api/category`);
         setNavbarData(res.data);
       } catch (error) {
         console.error("Failed to fetch categories", error);
       }
     };
     fetchCategories();
   })
  
  const handleMouseEnter = (index) => {
    setActiveCategory(index);
  };
  
  const handleMouseLeave = () => {
    setActiveCategory(null);
  };
  
  return (
    <div className="w-full font-sans">
      {/* Main Navigation Bar */}
      <div className="bg-white border-gray-200 relative">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-wrap justify-between uppercase">
              {navbarData.map((category, index) => (
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