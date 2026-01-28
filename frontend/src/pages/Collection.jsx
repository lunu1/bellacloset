// src/pages/Collection.jsx
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext"; // ✅ make sure this exists
import { useCurrency } from "../context/CurrencyContext"; // ✅ currency switch support

import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

function Collection() {
  const { products = [], showSearch, search } = useContext(ShopContext);

  // ✅ currency helpers (ProductItem will format display price)
  const { format, toAED } = useCurrency();

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  const toggleCategory = (e) => {
    const val = e.target.value;
    setCategory((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const toggleSubCategory = (e) => {
    const val = e.target.value;
    setSubCategory((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const applyFilter = () => {
    let productsCopy = [...products];

    if (showSearch && search) {
      const q = search.toLowerCase();
      productsCopy = productsCopy.filter((item) =>
        String(item?.name || "").toLowerCase().includes(q)
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item?.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item?.subCategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  // ✅ IMPORTANT: Sort using AED base price from DB (not converted display)
  const getAEDPrice = (p) => Number(p?.price ?? 0); // your DB base currency is AED

  const sortProducts = () => {
    let fpCopy = [...filterProducts];

    switch (sortType) {
      case "low-high":
        fpCopy.sort((a, b) => getAEDPrice(a) - getAEDPrice(b));
        break;
      case "high-low":
        fpCopy.sort((a, b) => getAEDPrice(b) - getAEDPrice(a));
        break;
      default:
        // relevant: keep existing order
        break;
    }

    setFilterProducts(fpCopy);
  };

  // init list
  useEffect(() => {
    setFilterProducts(products);
  }, [products]);

  // apply filter when inputs change
  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subCategory, search, showSearch, products]);

  // sort when sortType changes (or when filterProducts changes)
  useEffect(() => {
    sortProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType]);

  return (
    <div className="flex flex-col gap-1 pt-10 border-t md:flex-row sm:gap-10">
      {/* Left: Filters */}
      <div className="min-w-60">
        <p
          className="flex items-center gap-2 my-2 text-2xl font-semibold cursor-pointer"
          onClick={() => setShowFilter((v) => !v)}
        >
          FILTERS
          <img
            src={assets.dropdown_icon}
            className={`h-3 md:hidden ${showFilter ? "rotate-90" : ""}`}
            alt=""
          />
        </p>

        {/* Category Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } md:block`}
        >
          <p className="mb-3 text-lg font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 font-light text-gray-700">
            <p className="flex gap-2">
              <input
                type="checkbox"
                className="w-4 accent-[#272727]"
                value={"Mat"}
                onChange={toggleCategory}
                checked={category.includes("Mat")}
              />{" "}
              Prayer Mat
            </p>
            <p className="flex gap-2">
              <input
                type="checkbox"
                className="w-4 accent-[#272727]"
                value={"Towel"}
                onChange={toggleCategory}
                checked={category.includes("Towel")}
              />{" "}
              Towel
            </p>
            <p className="flex gap-2">
              <input
                type="checkbox"
                className="w-4 accent-[#272727]"
                value={"Robe"}
                onChange={toggleCategory}
                checked={category.includes("Robe")}
              />{" "}
              Bath Robe
            </p>
          </div>
        </div>

        {/* Optional Subcategory Filter (keep if you want)
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } md:block`}
        >
          <p className="mb-3 text-lg font-medium">TYPE</p>
          <div className="flex flex-col gap-2 font-light text-gray-700">
            <p className="flex gap-2">
              <input
                type="checkbox"
                className="w-4 accent-[#272727]"
                value={"Topwear"}
                onChange={toggleSubCategory}
                checked={subCategory.includes("Topwear")}
              />{" "}
              Top Wear
            </p>
          </div>
        </div>
        */}
      </div>

      {/* Right: Products */}
      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-lg">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          <select
            className="px-2 text-base border-2 border-gray-300"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="relevant">Sort By: Relevant</option>
            <option value="low-high">Sort By: Low to High</option>
            <option value="high-low">Sort By: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 gap-y-6">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={item?._id || index}
              id={item?._id}
              image={item?.image || item?.images} // supports string or array
              name={item?.name}
              price={item?.price} // AED base; ProductItem formats via CurrencyContext
              originalPrice={item?.compareAtPrice || item?.originalPrice}
              rating={item?.rating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Collection;
