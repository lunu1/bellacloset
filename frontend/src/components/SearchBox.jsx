import { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { useLocation } from "react-router-dom";

const SearchBox = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);

  const location = useLocation();


  // this is for showing search bar on collection only but im trying to give search bar in navbar for all pages
  
  // useEffect(() => {
  //   if (location.pathname.includes("collection") && showSearch) {
  //     setShowSearch(true);
  //   } else {
  //     setShowSearch(true);
  //   }
  // }, [location]);

  return showSearch ? (
    <div className="w-full px-4 sm:px-6">
  <div className="flex justify-center mt-5">
    <div className="flex w-full max-w-lg items-center border border-gray-400 rounded-full px-4 py-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
        className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-500"
      />
      <img
        src={assets.cross_icon}
        alt="Close"
        className="w-4 h-4 ml-2 cursor-pointer"
        onClick={() => setShowSearch(false)}
      />
    </div>
  </div>
</div>
  ) : null;
};

export default SearchBox;
