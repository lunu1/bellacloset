// pages/ProductsBrowsePage.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchCategories } from "../features/category/categorySlice";
import CategoryTreeSidebar from "../components/product/CategoryTreeSidebar";
import ProductCard from "../pages/ProductShowcase/ProductCard"
import { useLocation } from "react-router-dom";


const API_BASE = "http://localhost:4000/api";

const formatAED = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n)
    : null;

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

export default function ProductsBrowsePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: categories, loading: catLoading } = useSelector((s) => s.category);
  const location = useLocation();

    const [search, setSearch] = useState(searchParams.get("search") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "1");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [limit, setLimit] = useState(Number(searchParams.get("limit") || 24));
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  useEffect(() => {
  // read everything from URL on change
  const urlSearch = searchParams.get("search") || "";
  const urlBrand  = searchParams.get("brand") || "";
  const urlMin    = searchParams.get("min") || "";
  const urlMax    = searchParams.get("max") || "";
  const urlIn     = searchParams.get("inStock") === "1";
  const urlSortBy = searchParams.get("sortBy") || "createdAt";
  const urlOrder  = searchParams.get("sortOrder") || "desc";
  const urlLimit  = Number(searchParams.get("limit") || 24);
  const urlPage   = Number(searchParams.get("page") || 1);

  // update only when different to avoid loops
  if (search !== urlSearch) setSearch(urlSearch);
  if (brand !== urlBrand) setBrand(urlBrand);
  if (minPrice !== urlMin) setMinPrice(urlMin);
  if (maxPrice !== urlMax) setMaxPrice(urlMax);
  if (inStock !== urlIn) setInStock(urlIn);
  if (sortBy !== urlSortBy) setSortBy(urlSortBy);
  if (sortOrder !== urlOrder) setSortOrder(urlOrder);
  if (limit !== urlLimit) setLimit(urlLimit);
  if (page !== urlPage) setPage(urlPage);
}, [location.search]); // <— run whenever the query string changes

  // Filters


  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 24 });
  const [loading, setLoading] = useState(false);

  const deep = searchParams.get("deep") === "1";

  // fetch categories once
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // keep URL in sync with filters
useEffect(() => {
  const params = new URLSearchParams(searchParams);
  const setOrDel = (k, v) => (v && v !== "" && v !== "0" ? params.set(k, v) : params.delete(k));

  setOrDel("search", search.trim());
  setOrDel("brand", brand.trim());
  setOrDel("min", minPrice);
  setOrDel("max", maxPrice);
  setOrDel("inStock", inStock ? "1" : "");
  setOrDel("sortBy", sortBy);
  setOrDel("sortOrder", sortOrder);
  setOrDel("limit", String(limit));
  setOrDel("page", String(page));
  if (categoryId) params.set("category", categoryId); else params.delete("category");
  if (deep) params.set("deep", "1"); else params.delete("deep");

  const next = params.toString();
  const current = searchParams.toString();
  if (next !== current) {
    setSearchParams(params, { replace: true });
  }
}, [search, brand, minPrice, maxPrice, inStock, sortBy, sortOrder, limit, page, categoryId, deep]);


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

  // fetch products on any change
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
  }, [serverQuery]);

  // client-side price & stock filters
  const filteredItems = useMemo(() => {
    let out = data.items;
    if (minPrice) {
      out = out.filter(({ product, variants }) => {
        const price = variants?.[0]?.price ?? product.defaultPrice ?? 0;
        return Number(price) >= Number(minPrice);
      });
    }
    if (maxPrice) {
      out = out.filter(({ product, variants }) => {
        const price = variants?.[0]?.price ?? product.defaultPrice ?? 0;
        return Number(price) <= Number(maxPrice);
      });
    }
    if (inStock) {
      out = out.filter(({ product, variants }) => {
        if (variants?.length) return variants.some((v) => (v.stock ?? 0) > 0);
        return (product.defaultStock ?? 0) > 0;
      });
    }
    return out;
  }, [data.items, minPrice, maxPrice, inStock]);

  const total = data.total; // server total (pre client filters)
  const showCount = filteredItems.length;

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

  // Breadcrumb from categoryId
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

  // Active filter chips (B/W)
  const chips = [
    search && { key: "search", label: `“${search}”`, clear: () => setSearch("") },
    brand && { key: "brand", label: `Brand: ${brand}`, clear: () => setBrand("") },
    minPrice && { key: "min", label: `Min: ${formatAED(Number(minPrice))}`, clear: () => setMinPrice("") },
    maxPrice && { key: "max", label: `Max: ${formatAED(Number(maxPrice))}`, clear: () => setMaxPrice("") },
    inStock && { key: "inStock", label: "In stock", clear: () => setInStock(false) },
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header + breadcrumb */}
      <div className="mb-4">
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
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold text-black">Browse Products</h1>

          {/* Top toolbar (B/W) */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-600">View</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>

            <div className="w-px h-5 bg-gray-200" />

            <label className="text-xs text-gray-600">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
              <option value="brand">Brand</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                c.clear();
                setPage(1);
              }}
              className="group flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-800 bg-white hover:border-black"
              title="Remove filter"
            >
              <span>{c.label}</span>
              <span className="inline-flex h-5 w-5 items-center justify-center border border-gray-300 rounded-full group-hover:border-black">
                ×
              </span>
            </button>
          ))}
          <button
            onClick={resetFilters}
            className="text-xs underline text-gray-700 hover:text-black"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-6 md:sticky md:top-24 self-start">
          {catLoading ? (
            <div className="border border-gray-200 rounded-xl p-4">Loading categories…</div>
          ) : (
            <CategoryTreeSidebar categories={categories} />
          )}

          {/* Filters (B/W) */}
          <div className="p-4 border border-gray-200 rounded-xl bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filter by</h3>
              <button className="text-xs underline" onClick={resetFilters}>
                Reset
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Search</label>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Product or brand…"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Brand</label>
              <input
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Gucci"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Price range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Min"
                  className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
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
                  className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {minPrice && formatAED(Number(minPrice))} {minPrice && maxPrice ? "–" : ""}{" "}
                {maxPrice && formatAED(Number(maxPrice))}
              </div>
            </div>

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
          </div>
        </aside>

        {/* Results */}
        <section className="md:col-span-3">
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
                <ProductCard key={product._id} product={product} variants={variants} />
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
            <span className="px-3 py-1 border border-gray-300 rounded bg-white">{page}</span>
            <button
              className="px-3 py-1 border border-gray-300 rounded hover:border-black"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
