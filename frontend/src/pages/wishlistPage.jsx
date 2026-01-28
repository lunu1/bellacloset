// src/pages/wishlistPage.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import Title from "../components/Title";
import BackButton from "../components/BackButton";
import { assets } from "../assets/assets";

import { AppContext } from "../context/AppContext";

// ✅ wishlist actions (server + guest)
import {
  getWishlist,
  removeFromWishlist,
  removeFromWishlistGuest,
} from "../features/wishlist/wishlistSlice";

// ✅ product lookup (your store shape is [{ product }])
import {
  getAllProducts,
  selectProductsWrapped,
} from "../features/product/productSlice";

// ✅ variants lookup for variant images (optional but good)
import { getVariantsByProduct } from "../features/variants/variantSlice";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading, isLoggedin } = useContext(AppContext);

  const wishlistItems = useSelector((s) => s.wishlist.items || []);
  const loading = useSelector((s) => s.wishlist.loading);

  // products store: [{ product }]
  const productsWrapped = useSelector(selectProductsWrapped);
  const variantsAll = useSelector((s) => s.variants.items || []);

  // ✅ build quick map: productId -> product
  const productsById = useMemo(() => {
    const m = {};
    for (const w of productsWrapped || []) {
      const p = w?.product;
      if (p?._id) m[String(p._id)] = p;
    }
    return m;
  }, [productsWrapped]);

  // ✅ build map: productId -> variants[]
  const variantsByProductId = useMemo(() => {
    const map = {};
    for (const v of variantsAll) {
      const pid = typeof v.product === "string" ? v.product : v.product?._id;
      if (!pid) continue;
      (map[pid] ||= []).push(v);
    }
    return map;
  }, [variantsAll]);

  // ✅ make sure we have products after refresh (for image/name)
  useEffect(() => {
    if ((productsWrapped || []).length === 0) dispatch(getAllProducts());
  }, [dispatch, productsWrapped?.length]);

  // ✅ load wishlist depending on auth
  useEffect(() => {
    if (authLoading) return;

    if (isLoggedin) {
      dispatch(getWishlist()).catch(() => {});
    }
    // guest wishlist is already loaded in App.jsx via setGuestWishlistState()
  }, [authLoading, isLoggedin, dispatch]);

  // ✅ fetch variants for any wishlist item missing variant data (only if needed)
  useEffect(() => {
    const toFetch = new Set();

    for (const it of wishlistItems) {
      const pid = it?.productId || it?.product?._id;
      if (!pid) continue;

      const vid = it?.variantId ?? null;
      if (!vid) continue;

      const haveVariantAlready =
        (variantsByProductId[pid] || []).some(
          (v) => String(v._id) === String(vid)
        ) || !!it?.variant?.images?.length;

      if (!haveVariantAlready) toFetch.add(pid);
    }

    toFetch.forEach((pid) => dispatch(getVariantsByProduct(pid)));
  }, [wishlistItems, variantsByProductId, dispatch]);

  const resolvedItems = useMemo(() => {
    return wishlistItems.map((it) => {
      const pid = String(it?.productId || it?.product?._id || "");
      const vid = it?.variantId ? String(it.variantId) : null;

      const product = it.product || productsById[pid] || null;

      // variant from item OR from variants slice
      const productVars = variantsByProductId[pid] || [];
      const variant =
        it.variant ||
        (vid ? productVars.find((v) => String(v._id) === String(vid)) : null) ||
        null;

        const stock =
        typeof variant?.stock === "number"
          ? variant.stock
          : typeof product?.defaultStock === "number"
          ? product.defaultStock
          : null;

      const image =
        variant?.images?.[0] ||
        product?.images?.[0] ||
        product?.defaultImages?.[0] ||
        "/placeholder.jpg";

      return { ...it, _resolvedProduct: product, _resolvedVariant: variant, _img: image , _stock: stock};
    });
  }, [wishlistItems, productsById, variantsByProductId]);

  const handleRemove = async (item) => {
    const pid = item?.productId || item?._resolvedProduct?._id;
    const vid = item?.variantId ?? null;

    // ✅ GUEST remove
    if (!isLoggedin) {
      dispatch(removeFromWishlistGuest({ productId: pid, variantId: vid }));
      toast.success("Removed from wishlist");
      return;
    }

    // ✅ LOGGED IN remove (server)
    try {
      await dispatch(
        removeFromWishlist({
          wishlistId: item?.wishlistId, // if exists
          productId: pid,
          variantId: vid,
        })
      ).unwrap();

      toast.success("Removed from wishlist");
    } catch (e) {
      toast.error(e?.message || "Failed to remove");
      dispatch(getWishlist());
    }
  };

  const empty = resolvedItems.length === 0;

  return (
    <div className="border-t pt-10">
      <div className="flex items-center justify-between mb-4">
        <BackButton />
        <button
          className="px-4 py-2 text-sm border rounded hover:bg-black hover:text-white transition-colors"
          onClick={() => {
            if (!isLoggedin) return toast.info("Guest wishlist is already up to date");
            dispatch(getWishlist());
          }}
        >
          ⟳ Refresh
        </button>
      </div>

      <div className="mb-3 text-3xl flex justify-center">
        <Title text1={"MY"} text2={"WISHLIST"} />
      </div>

      {loading && (
        <div className="py-6 text-center text-sm text-gray-500">Loading…</div>
      )}

      {!loading && empty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-3">🤍</div>
          <p className="text-lg text-gray-800 font-medium">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 mt-1">
            Browse products and save your favorites.
          </p>
          <button
            className="mt-6 px-6 py-2 text-sm text-white bg-black hover:bg-gray-800"
            onClick={() => navigate("/")}
          >
            Start shopping
          </button>
        </div>
      )}

      {!loading && !empty && (
       <div className="max-w-7xl mx-auto px-2 sm:px-4">
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 justify-items-center mb-5">

          {resolvedItems.map((it, idx) => {
            const p = it._resolvedProduct;
            const name = p?.name || "Item";

            return (
              <Link
                to={p?._id ? `/product/${p._id}` : "#"}
                key={`${it.wishlistId || it.productId || "x"}-${it.variantId || "no"}-${idx}`}
                className="group relative w-full max-w-[320px] border border-gray-200 bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition "

              >
                <div className="relative">
                  <img
                    src={it._img}
                    alt={name}
                    className="w-full aspect-square object-contain bg-[#fafafa] p-6"
                    loading="lazy"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(it);
                    }}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition"
                    title="Remove"
                  >
                    {/* if you have assets.bin_icon use that, else use emoji */}
                    {assets?.bin_icon ? (
                      <img src={assets.bin_icon} className="w-4 h-4" alt="Remove" />
                    ) : (
                      <span className="text-lg">🗑️</span>
                    )}
                  </button>
                </div>

                <div className="p-3">
                  <p className="text-sm font-thin text-black line-clamp-1">{name}</p>
                  <div className="mt-2">
  {it._stock > 0 ? (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] border border-gray-300 rounded-md text-white bg-[#D0BC98] uppercase">
      In stock
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] bg-gray-900 text-white rounded-full">
      Sold out
    </span>
  )}
</div>


                  {/* Optional: show variant info if exists */}
                  {it._resolvedVariant?.optionValues && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {Object.entries(it._resolvedVariant.optionValues)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" • ")}
                    </p>
                  )}

                  {/* Optional: low stock badge (if you track stock) */}
                 {typeof it?._stock === "number" && it._stock > 0 && it._stock <= 3 && (
  <p className="text-xs text-orange-600 mt-2">• Low stock</p>
)}

                </div>
              </Link>
            );
          })}
        </div>

</div>

      )}
    </div>
  );
}


