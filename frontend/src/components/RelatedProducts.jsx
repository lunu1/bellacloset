// src/components/RelatedProducts.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  selectProductsWrapped,
  selectProductsLoading,
} from "../features/product/productSlice";
import { fetchVariantByProduct } from "../features/variants/variantAPI";
import Title from "./Title";
import ProductCard from "../pages/ProductShowcase/ProductCard";

/* ------------ helpers ------------ */
function normalizeId(id) {
  if (!id) return "";
  if (typeof id === "string") return id.trim();
  if (typeof id === "object") {
    // handle {_id}, {$oid}, or whole product passed by mistake
    if (id._id) return normalizeId(id._id);
    if (id.$oid) return String(id.$oid).trim();
  }
  return String(id).trim();
}
function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).toLowerCase().trim()).filter(Boolean);
  return String(tags).split(",").map(t => t.toLowerCase().trim()).filter(Boolean);
}
function scoreCandidate(p, ctx) {
  let score = 0;
  if (!p) return 0;
  if (ctx.category && p.category === ctx.category) score += 4;
  if (ctx.subCategory && p.subCategory === ctx.subCategory) score += 3;
  if (ctx.brand && p.brand && p.brand === ctx.brand) score += 2;
  const candTags = normalizeTags(p.tags);
  if (candTags.length && ctx.tagsSet.size) {
    const overlap = candTags.filter(t => ctx.tagsSet.has(t)).length;
    score += Math.min(3, overlap);
  }
  if (typeof p.avgRating === "number") score += p.avgRating * 0.25;
  if (p.bestseller) score += 0.5;
  return score;
}

/* ------------ component ------------ */
export default function RelatedProducts({
  product,               // prefer passing full product
  category,
  subCategory,
  tags,
  brand,
  excludeId,             // optional explicit exclusion
  limit = 8,
  title = "RELATED PRODUCTS",
}) {
  const dispatch = useDispatch();
  const wrapped = useSelector(selectProductsWrapped); // [{ product }]
  const loading = useSelector(selectProductsLoading);

  const [variantsByProduct, setVariantsByProduct] = useState({});

  useEffect(() => {
    if (!wrapped.length) dispatch(getAllProducts());
  }, [dispatch, wrapped.length]);

  const ctx = useMemo(() => {
    const src = product || {};
    const tg = normalizeTags(src.tags ?? tags);
    return {
      id: normalizeId(src._id ?? excludeId ?? null),
      slug: src.slug || null,
      category: src.category ?? category ?? null,
      subCategory: src.subCategory ?? subCategory ?? null,
      brand: src.brand ?? brand ?? null,
      tagsSet: new Set(tg),
    };
  }, [product, category, subCategory, tags, brand, excludeId]);

  // 1) Flatten to products and de-duplicate by id
  const allProducts = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const w of wrapped) {
      const p = w?.product;
      if (!p) continue;
      const id = normalizeId(p._id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      list.push(p);
    }
    return list;
  }, [wrapped]);

  // 2) Build related list, with strong exclusion by id (and fallback by slug)
  const related = useMemo(() => {
    const scored = allProducts
      .filter(p => {
        const pid = normalizeId(p._id);
        const isSameId = pid && ctx.id && pid === ctx.id;
        const isSameSlug = ctx.slug && p.slug && p.slug === ctx.slug;
        return !isSameId && !isSameSlug;
      })
      .map(p => ({ p, score: scoreCandidate(p, ctx) }))
      .filter(x => x.score > 0);

    let pool = scored;
    if (!pool.length && ctx.category) {
      pool = allProducts
        .filter(p => {
          const pid = normalizeId(p._id);
          const isSameId = pid && ctx.id && pid === ctx.id;
          const isSameSlug = ctx.slug && p.slug && p.slug === ctx.slug;
          return !isSameId && !isSameSlug && p.category === ctx.category;
        })
        .map(p => ({ p, score: 1 }));
    }

    pool.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.p?.bestseller ? 1 : 0) !== (a.p?.bestseller ? 1 : 0)) {
        return (b.p?.bestseller ? 1 : 0) - (a.p?.bestseller ? 1 : 0);
      }
      const at = new Date(a.p?.createdAt || 0).getTime();
      const bt = new Date(b.p?.createdAt || 0).getTime();
      return bt - at;
    });

    return pool.slice(0, limit).map(x => x.p);
  }, [allProducts, ctx, limit]);

  // 3) Fetch variants for those related products (once each)
  const relatedIdsKey = useMemo(() => related.map(p => normalizeId(p._id)).join(","), [related]);
  useEffect(() => {
    if (!related.length) return;
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      const missing = related
        .map(p => normalizeId(p._id))
        .filter(id => variantsByProduct[id] == null);
      if (!missing.length) return;

      const results = await Promise.allSettled(
        missing.map(id => fetchVariantByProduct(id, controller.signal))
      );

      const next = {};
      results.forEach((res, i) => {
        const pid = missing[i];
        if (res.status === "fulfilled") {
          const val = res.value;
          next[pid] = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : [];
        } else {
          next[pid] = [];
        }
      });
      if (!cancelled) setVariantsByProduct(prev => ({ ...prev, ...next }));
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [relatedIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !wrapped.length) {
    return <div className="my-24 text-center text-gray-500">Loading related products…</div>;
  }
  if (!related.length) return null;

  return (
    <div className="my-24">
      <div className="py-2 text-3xl text-center">
        <Title text1={title.split(" ")[0]} text2={title.split(" ").slice(1).join(" ")} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {related.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            variants={variantsByProduct[normalizeId(p._id)] || []}
          />
        ))}
      </div>
    </div>
  );
}
