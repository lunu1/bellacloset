// pages/ProductsBrowsePage.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import { fetchCategories } from "../features/category/categorySlice";
import CategoryTreeSidebar from "../components/product/CategoryTreeSidebar";
import ProductCard from "../pages/ProductShowcase/ProductCard";
import BackButton from "../components/BackButton";
import { SlidersHorizontal, X } from "lucide-react";

import { useCurrency } from "../context/CurrencyContext";

const API_BASE = "https://bellaluxurycloset.com/api";

const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-xl overflow-hidden animate-pulse bg-white">
    <div className="w-full aspect-square bg-gray-100" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

// Drawer row like SANDS list
const DrawerRow = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-6 flex items-center justify-between border-b border-gray-200 text-left"
  >
    <span className="text-[22px] font-light">{label}</span>
    <span className="text-gray-500 text-2xl">›</span>
  </button>
);

const DrawerSubHeader = ({ title, onBack }) => (
  <div className="px-6 pt-5 pb-4 border-b border-gray-200 flex items-center justify-between">
    <button
      type="button"
      onClick={onBack}
      className="text-sm underline text-gray-700"
    >
      Back
    </button>
    <p className="text-sm tracking-wide">{title}</p>
    <div className="w-10" />
  </div>
);

export default function ProductsBrowsePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const { items: categories = [], loading: catLoading } = useSelector(
    (s) => s.category
  );

  // currency helpers
  const { format, toAED } = useCurrency();

  // ✅ Drawer state (DESKTOP + MOBILE)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPage, setDrawerPage] = useState("menu"); // menu | sort | price | brands | category

  // --- Filters from URL ---
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "1");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc"
  );
  const [limit, setLimit] = useState(Number(searchParams.get("limit") || 24));
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const deep = searchParams.get("deep") === "1";

  // read everything from URL on change
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlBrand = searchParams.get("brand") || "";
    const urlMin = searchParams.get("min") || "";
    const urlMax = searchParams.get("max") || "";
    const urlIn = searchParams.get("inStock") === "1";
    const urlSortBy = searchParams.get("sortBy") || "createdAt";
    const urlOrder = searchParams.get("sortOrder") || "desc";
    const urlLimit = Number(searchParams.get("limit") || 24);
    const urlPage = Number(searchParams.get("page") || 1);

    if (search !== urlSearch) setSearch(urlSearch);
    if (brand !== urlBrand) setBrand(urlBrand);
    if (minPrice !== urlMin) setMinPrice(urlMin);
    if (maxPrice !== urlMax) setMaxPrice(urlMax);
    if (inStock !== urlIn) setInStock(urlIn);
    if (sortBy !== urlSortBy) setSortBy(urlSortBy);
    if (sortOrder !== urlOrder) setSortOrder(urlOrder);
    if (limit !== urlLimit) setLimit(urlLimit);
    if (page !== urlPage) setPage(urlPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // fetch categories once
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // keep URL in sync with filters
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const setOrDel = (k, v) =>
      v && v !== "" && v !== "0" ? params.set(k, v) : params.delete(k);

    setOrDel("search", search.trim());
    setOrDel("brand", brand.trim());
    setOrDel("min", minPrice);
    setOrDel("max", maxPrice);
    setOrDel("inStock", inStock ? "1" : "");
    setOrDel("sortBy", sortBy);
    setOrDel("sortOrder", sortOrder);
    setOrDel("limit", String(limit));
    setOrDel("page", String(page));

    if (categoryId) params.set("category", categoryId);
    else params.delete("category");

    if (deep) params.set("deep", "1");
    else params.delete("deep");

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) setSearchParams(params, { replace: true });
  }, [
    search,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
    sortOrder,
    limit,
    page,
    categoryId,
    deep,
    searchParams,
    setSearchParams,
  ]);

  // build server query
  const serverQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (brand.trim()) params.set("brand", brand.trim());
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    if (limit) params.set("limit", String(limit));
    if (page) params.set("page", String(page));

    if (categoryId) {
      params.set("category", categoryId);
      if (deep) params.set("deep", "1");
    }

    return params;
  }, [search, brand, sortBy, sortOrder, limit, page, categoryId, deep]);

  // fetch products
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 24 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const url = `${API_BASE}/products/all?${serverQuery.toString()}`;
        const res = await axios.get(url);
        if (cancelled) return;
        setData(res.data || { items: [], total: 0, page: 1, limit });
      } catch {
        if (!cancelled) setData({ items: [], total: 0, page: 1, limit });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [serverQuery, limit]);

  // convert min/max to AED
  const minAED = minPrice !== "" ? toAED(minPrice) : null;
  const maxAED = maxPrice !== "" ? toAED(maxPrice) : null;

  const pickPriceAED = ({ product, variants }) => {
    const v = variants?.[0];
    return Number(
      v?.salePrice ??
        v?.price ??
        product?.pricing?.salePrice ??
        product?.salePrice ??
        product?.defaultPrice ??
        0
    );
  };

  const filteredItems = useMemo(() => {
    let out = data.items;

    if (minAED != null && !Number.isNaN(minAED)) {
      out = out.filter(({ product, variants }) => {
        const priceAED = pickPriceAED({ product, variants });
        return Number(priceAED) >= Number(minAED);
      });
    }

    if (maxAED != null && !Number.isNaN(maxAED)) {
      out = out.filter(({ product, variants }) => {
        const priceAED = pickPriceAED({ product, variants });
        return Number(priceAED) <= Number(maxAED);
      });
    }

    if (inStock) {
      out = out.filter(({ product, variants }) => {
        if (variants?.length) return variants.some((v) => (v.stock ?? 0) > 0);
        return (product.defaultStock ?? 0) > 0;
      });
    }

    return out;
  }, [data.items, minAED, maxAED, inStock]);

  const showCount = filteredItems.length;
  const total = data.total;

  const resetFilters = () => {
    setSearch("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(24);
    setPage(1);
  };

  // breadcrumb map
  const idToNode = useMemo(() => {
    const map = new Map();
    const walk = (n) => {
      map.set(n._id, n);
      (n.children || []).forEach(walk);
    };
    categories.forEach(walk);
    return map;
  }, [categories]);

  const breadcrumb = useMemo(() => {
    const trail = [];
    let current = categoryId ? idToNode.get(categoryId) : null;
    while (current) {
      trail.unshift(current);
      current = current.parent ? idToNode.get(current.parent) : null;
    }
    return trail;
  }, [categoryId, idToNode]);

  // ✅ Category hero helpers (brought from your previous page)
  const pickCategoryImage = (cat) =>
    cat?.bannerImage ||
    cat?.image ||
    cat?.thumbnail ||
    cat?.media?.url ||
    cat?.cover?.url ||
    null;

  const activeCategory = categoryId ? idToNode.get(categoryId) : null;
  const activeCategoryImage = pickCategoryImage(activeCategory);

  // drawer handlers
  const openDrawer = () => {
    setDrawerOpen(true);
    setDrawerPage("menu");
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerPage("menu");
  };

  const applyDrawer = () => {
    // URL sync already applied via useEffect; we just close like SANDS
    closeDrawer();
  };

  return (
    <div className="container mx-auto px-4 py-2">
      {/* <BackButton className="mb-5" /> */}

      {/* ✅ Category hero (image + description) */}
      {activeCategoryImage && (
  <section className="relative w-screen left-1/2 -translate-x-1/2 h-[70vh] md:h-[85vh] overflow-hidden">
    {/* Background Image */}
    <img
      src={activeCategoryImage}
      alt={activeCategory?.label || "Category"}
      className="absolute inset-0 w-full h-full object-cover object-[center_65%]"
      loading="lazy"
    />

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/35" />

    {/* Text content */}
    <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
      <div className="max-w-3xl">
        <h1 className="text-white text-3xl md:text-6xl font-light tracking-wide uppercase">
          {activeCategory?.label || "Browse Products"}
        </h1>

        {activeCategory?.description?.trim() && (
          <p className="mt-6 text-white/90 text-base md:text-lg leading-7 md:leading-8 font-thin">
            {activeCategory.description}
          </p>
        )}
      </div>
    </div>
  </section>
)}


      {/* Breadcrumb */}
      <div className="my-4">
        {breadcrumb.length > 0 ? (
          <div className="text-sm text-gray-600 mb-1">
            {breadcrumb.map((n, i) => (
              <span key={n._id}>
                {i > 0 && " / "}
                <button
                  className="hover:underline"
                  onClick={() => navigate(`/c/${n._id}?deep=1`)}
                >
                  {n.label}
                </button>
              </span>
            ))}
            {deep && (
              <span className="ml-2 rounded-full border border-gray-300 px-2 py-[2px] text-xs text-gray-700">
                Deep
              </span>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600 mb-1">All Products</div>
        )}

        {/* Header + Desktop Filter Button */}
        <div className="flex items-end justify-between gap-4">
          {/* If category hero exists, show category label; else show Browse Products */}
          <h1 className="text-3xl font-semibold text-black text-left">
            {activeCategory?.label || "Browse Products"}
          </h1>

          <button
            onClick={openDrawer}
            className="border border-gray-300 bg-white px-5 py-3 text-sm flex items-center gap-3 hover:bg-black hover:text-white transition-colors duration-300 ease-in-out"
          >
            <span className="tracking-wide">Filter & Sort</span>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {typeof total === "number" && total > 0 ? `${total} products` : ""}
        </div>
      </div>

      {/* Results */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{showCount}</span>
            {typeof total === "number" && total > 0 ? <> of {total}</> : null}
          </div>
          <div className="text-sm text-gray-500">Page {page}</div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="border border-gray-200 rounded-xl p-10 text-center text-gray-600 bg-white">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredItems.map(({ product, variants }) => (
              <ProductCard
                key={product._id}
                product={product}
                variants={variants}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            className="px-3 py-1 border border-gray-300 rounded hover:border-black disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="px-3 py-1 border border-gray-300 rounded bg-white">
            {page}
          </span>
          <button
            className="px-3 py-1 border border-gray-300 rounded hover:border-black"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </section>

      {/* ===================== DRAWER (SANDS STYLE) ===================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[9999]">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />

          {/* panel */}
          <div className="absolute right-0 top-0 h-full w-[520px] max-w-[92vw] bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-gray-200 flex items-start justify-between">
              <div>
                <p className="text-sm tracking-wide">Filter & Sort</p>
                <p className="text-sm text-gray-500 mt-1">
                  {showCount} products
                </p>
              </div>

              <button
                onClick={closeDrawer}
                className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto">
              {/* MENU */}
              {drawerPage === "menu" && (
                <div className="px-6 py-2">
                  <DrawerRow
                    label="Price"
                    onClick={() => setDrawerPage("price")}
                  />
                  <DrawerRow
                    label="Brands"
                    onClick={() => setDrawerPage("brands")}
                  />
                  <DrawerRow
                    label="Category"
                    onClick={() => setDrawerPage("category")}
                  />
                  <DrawerRow
                    label="Sort"
                    onClick={() => setDrawerPage("sort")}
                  />
                </div>
              )}

              {/* PRICE */}
              {drawerPage === "price" && (
                <>
                  <DrawerSubHeader
                    title="Price"
                    onBack={() => setDrawerPage("menu")}
                  />
                  <div className="px-6 py-6 space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Min"
                        className="w-1/2 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                      />
                      <input
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Max"
                        className="w-1/2 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="text-[11px] text-gray-500">
                      {minAED != null && !Number.isNaN(minAED)
                        ? format(minAED)
                        : ""}
                      {minAED != null && maxAED != null ? " – " : ""}
                      {maxAED != null && !Number.isNaN(maxAED)
                        ? format(maxAED)
                        : ""}
                    </div>

                    <div className="flex items-center justify-between gap-6">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={inStock}
                          onChange={(e) => {
                            setInStock(e.target.checked);
                            setPage(1);
                          }}
                        />
                        In stock only
                      </label>

                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-sm underline text-gray-700"
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* BRANDS */}
              {drawerPage === "brands" && (
                <>
                  <DrawerSubHeader
                    title="Brands"
                    onBack={() => setDrawerPage("menu")}
                  />
                  <div className="px-6 py-6 space-y-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Brand
                    </label>
                    <input
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        setPage(1);
                      }}
                      placeholder="e.g. Chanel"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => setBrand("")}
                      className="text-sm underline text-gray-700"
                    >
                      Clear brand
                    </button>
                  </div>
                </>
              )}

              {/* CATEGORY */}
              {drawerPage === "category" && (
                <>
                  <DrawerSubHeader
                    title="Category"
                    onBack={() => setDrawerPage("menu")}
                  />
                  <div className="px-6 py-6">
                    {catLoading ? (
                      <div className="border border-gray-200 rounded-xl p-4">
                        Loading categories…
                      </div>
                    ) : (
                      <CategoryTreeSidebar categories={categories} />
                    )}
                  </div>
                </>
              )}

              {/* SORT + VIEW */}
              {drawerPage === "sort" && (
                <>
                  <DrawerSubHeader
                    title="Sort"
                    onBack={() => setDrawerPage("menu")}
                  />
                  <div className="px-6 py-6 space-y-5">
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        View
                      </label>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="w-full border border-gray-300 px-4 py-3 text-sm bg-white"
                      >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        Sort by
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setPage(1);
                        }}
                        className="w-full border border-gray-300 px-4 py-3 text-sm bg-white"
                      >
                        <option value="createdAt">Newest</option>
                        <option value="name">Name</option>
                        <option value="brand">Brand</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => {
                          setSortOrder(e.target.value);
                          setPage(1);
                        }}
                        className="w-full border border-gray-300 px-4 py-3 text-sm bg-white"
                      >
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky APPLY */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={applyDrawer}
                className="w-full bg-black text-white py-4 rounded-full text-sm tracking-wide"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =============================================================== */}
    </div>
  );
}
