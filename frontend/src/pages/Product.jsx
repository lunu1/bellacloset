// src/pages/ProductPage.jsx
import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react";

import {
  getAllProducts,
  selectProductsWrapped,
  selectProductById,
  selectProductsLoading,
} from "../features/product/productSlice";

import {
  getVariantsByProduct,
  clearVariants,
} from "../features/variants/variantSlice";

import {
  addToWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";

import { addToCartServer, loadCart } from "../features/cart/cartSlice";

import ImageGallery from "../components/product/ImageGallery";
import WishlistShare from "../components/product/WishlistShare";
import PriceBlock from "../components/product/PriceBlock";
import ColorSelector from "../components/product/ColorSelector";
import SizeSelector from "../components/product/SizeSelector";
import QuantitySelector from "../components/product/QuantitySelector";
import ProductActions from "../components/product/ProductActions";
import ProductTabs from "../components/product/ProductTabs";
import RelatedProducts from "../components/RelatedProducts";


import {
  getReviewsByProduct,
  clearReviews,
  addReview,
} from "../features/reviews/reviewsSlice";

import {
  getAvailableColors,
  getAvailableSizes,
  findMatchedVariant,
  getDisplayImages,
} from "../utils/productView";

import { AppContext } from "../context/AppContext";
import { brandLabel } from "../utils/brandLabel";

const CURRENCY = "AED";

const api = axios.create({
  baseURL: "https://bellaluxurycloset.com",
  withCredentials: true,
});

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // From AppContext
  const { authLoading, isLoggedin } = useContext(AppContext);

  // Products (via selectors)
  const products = useSelector(selectProductsWrapped); // [{ product }]
  const productData = useSelector((s) => selectProductById(s, id)); // { product } or null
  const productsLoading = useSelector(selectProductsLoading);

  // Variants (raw from slice)
  const variantsAll = useSelector((s) => s.variants.items);
  const variantLoading = useSelector((s) => s.variants.loading);

  // Reviews
  const reviews = useSelector((s) => s.reviews.items);
  const reviewsLoading = useSelector((s) => s.reviews.loading);
  const reviewPosting = useSelector((s) => s.reviews.posting);
  const revPage       = useSelector((s) => s.reviews.page);
  const revPages      = useSelector((s) => s.reviews.pages);
  const revSummary    = useSelector((s) => s.reviews.summary);

  // Only variants for this product id
  const variants = useMemo(
    () =>
      (variantsAll || []).filter(
        (v) => v?.product === id || v?.product?._id === id
      ),
    [variantsAll, id]
  );

  // Wishlist items in store
  const wishlistItems = useSelector((s) => s.wishlist.items);

  // Local UI state
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [stockLimitReached, setStockLimitReached] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Wishlist optimistic UI state + in-flight ref
  const [wishState, setWishState] = useState(false);
  const wishInFlightRef = useRef(false);

  // Offer-aware snapshot (from /api/products/:id that returns effectivePrice fields)
  const [offerProduct, setOfferProduct] = useState(null); // { effectivePrice, appliedOffer, ... }
  const [offerVariants, setOfferVariants] = useState(new Map()); // Map(variantId -> { effectivePrice, appliedOffer })

  // Load products on first mount
  useEffect(() => {
    if (products.length === 0) dispatch(getAllProducts());
  }, [dispatch, products.length]);

  // When product changes, fetch variants + reviews, reset local state
  useEffect(() => {
    if (!productData?.product?._id) return;

    // clear & fetch fresh data
    dispatch(clearVariants());
    dispatch(getVariantsByProduct(productData.product._id));
    // reviews are independent; if you have reviews slice:
    dispatch(clearReviews());
    dispatch(getReviewsByProduct({ productId: productData.product._id, page: 1, limit: 10, sort: "newest" }));

    // reset local selection
    setSelectedVariant(null);
    setColor("");
    setSize("");
    setQuantity(1);
    setStockLimitReached(false);

    // default image (product-level) to start with
    setImage(productData.product?.images?.[0] || "");
  }, [dispatch, productData?.product?._id]);

  // Fetch offer-aware product snapshot (effectivePrice for product and variants)
  useEffect(() => {
    const pid = productData?.product?._id;
    if (!pid) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/products/${pid}`);
        if (cancelled) return;
        setOfferProduct(data?.product || null);
        const map = new Map();
        (data?.variants || []).forEach((v) => map.set(String(v._id), v));
        setOfferVariants(map);
      } catch {
        setOfferProduct(null);
        setOfferVariants(new Map());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productData?.product?._id]);

  // Keep local wishState in sync with store (after nav/refresh)
  useEffect(() => {
    if (!productData?.product?._id) return;
    if (wishInFlightRef.current) return; // avoid clobbering optimistic state during request
    setWishState(
      wishlistItems.some((w) => String(w?.productId) === String(productData.product._id) && 
      String(w?.variantId ?? "") === String(selectedVariant?._id ?? "") )
    );
  }, [wishlistItems, productData?.product?._id]);

  // Ensure valid selection when product/variants change
  useEffect(() => {
    if (!productData) return;

    if (!variants || variants.length === 0) {
      // no variants: show product images
      setSelectedVariant(null);
      const imgs = getDisplayImages(null, productData.product);
      setImage(imgs?.[0] || productData.product?.images?.[0] || "");
      return;
    }

    // Try current color/size, else pick first variant
    const matched = findMatchedVariant(variants, { color, size });
    if (matched) {
      setSelectedVariant(matched);
      const imgs = getDisplayImages(matched, productData.product);
      setImage(imgs?.[0] || "");
      return;
    }

    const first = variants[0];
    setSelectedVariant(first);
    const c = first?.optionValues?.Color;
    const s = first?.optionValues?.Size;
    if (!color && c) setColor(c);
    if (!size && s) setSize(s);

    const imgs = getDisplayImages(first, productData.product);
    setImage(imgs?.[0] || "");
  }, [productData, variants]); // color/size handled by next effect

  // Re-pick variant & image when user changes color/size
  useEffect(() => {
    if (!productData || !variants || variants.length === 0) return;
    const matched = findMatchedVariant(variants, { color, size });
    if (matched) {
      setSelectedVariant(matched);
      const imgs = getDisplayImages(matched, productData.product);
      setImage(imgs?.[0] || "");
    }
  }, [color, size, productData, variants]);

  // derived state
  const isInWishlist = useMemo(() => {
    const pid = productData?.product?._id;
    if (!pid) return false;
    return wishlistItems.some((w) => w?.product?._id === pid);
  }, [wishlistItems, productData]);

  // Loading & Not found guards
  if (productsLoading || variantLoading || reviewsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!productsLoading && products.length > 0 && !productData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl  text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you are looking for does not exist.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!productData) return null;

  const { product } = productData;

  const freshProduct = offerProduct || product;

  const availableColors = getAvailableColors(variants);
  const availableSizes = getAvailableSizes(variants);
  const variantStock = selectedVariant?.stock ?? product.defaultStock ?? 0;

  // --- Offer-aware pricing for PDP ---
// Back-end now returns:
// - product.pricing = { basePrice, salePrice, discount }
// - variants[].salePrice (and variants[].discount)

const baseOriginalPrice = selectedVariant
  ? Number(selectedVariant?.price ?? 0)
  : Number(product?.defaultPrice ?? 0);

// Use salePrice from backend when available
const effectivePrice = (() => {
  if (selectedVariant) {
    const ov = offerVariants.get(String(selectedVariant?._id || ""));
    // variants carry salePrice (not "effectivePrice" anymore)
    return Number(
      ov?.salePrice ??
        selectedVariant?.price ??
        0
    );
  }
  // product.pricing.salePrice for non-variant products
  return Number(
    offerProduct?.pricing?.salePrice ??
      offerProduct?.salePrice ??           // legacy fallback
      product?.defaultPrice ??
      0
  );
})();

// If the product has no variants, prefer the backend's basePrice as the "original"
const originalPriceForUi = selectedVariant
  ? baseOriginalPrice
  : Number(offerProduct?.pricing?.basePrice ?? baseOriginalPrice);

const discountPercent =
  originalPriceForUi > 0 && effectivePrice < originalPriceForUi
    ? Math.round((1 - effectivePrice / originalPriceForUi) * 100)
    : 0;






  // zoom helpers
  const handleMouseMove = (e) => {
    if (!showZoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleToggleWishlist = async () => {
    if (!product?._id) return;
    try {
      wishInFlightRef.current = true;
      if (wishState) {
        setWishState(false); // optimistic
        await dispatch(removeFromWishlist({ productId: product._id, variantId: selectedVariant?._id || null  })).unwrap();
        toast.success("Removed from wishlist");
      } else {
        setWishState(true); // optimistic
        await dispatch(addToWishlist({ productId: product._id ,
          variantId: selectedVariant?._id || null,
          
        })).unwrap();
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error("Something went wrong");
      setWishState((v) => !v); // rollback
    } finally {
      wishInFlightRef.current = false;
    }
  };

  const galleryImages = getDisplayImages(selectedVariant, product);

  const avg = product?.avgRating ?? 0;
  const count = product?.reviewCount ?? (reviews?.length || 0);

  return (
    <div className="pt-10 transition-opacity duration-500 ease-in border-t-2 opacity-100">
      {/* Top section */}
     
<div className="flex flex-col sm:flex-row sm:gap-4 lg:gap-6">
  {/* Left: Images (3/4) */}
  <div className="relative w-full sm:basis-2/3 sm:pr-2 lg:pr-4">
    <ImageGallery
      images={galleryImages}
      activeImage={image}
      onChange={setImage}
      showZoom={showZoom}
      setShowZoom={setShowZoom}
      zoomPosition={zoomPosition}
      onMouseMove={handleMouseMove}
    />
    <div className="absolute top-3 right-3 lg:right-4">
      <WishlistShare
        isInWishlist={wishState}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  </div>

  {/* Right: Details (1/4) */}
  <div className="w-full sm:basis-1/3 lg:sticky lg:top-24">
    <div className="flex items-center gap-2 mb-2">
      {product.brand && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          {product.brand?.slug ? (
            <Link to={`/brand/${product.brand.slug}`}>
              {brandLabel(product)}
            </Link>
          ) : (
            brandLabel(product)
          )}
        </span>
      )}
      {product.bestseller && (
        <span className="text-xs bg-black text-white px-2 py-1 rounded">
          Bestseller
        </span>
      )}
    </div>

    <h1 className="mt-2 text-2xl ">{product.name}</h1>

    <div className="mt-2 text-sm text-gray-600">
      {avg
        ? `${avg}★ (${count} review${count !== 1 ? "s" : ""})`
        : `${count} review${count !== 1 ? "s" : ""}`}
    </div>

    <PriceBlock
      currency={CURRENCY}
      currentPrice={effectivePrice}
      originalPrice={discountPercent > 0 ? originalPriceForUi : undefined}
      discountPercent={discountPercent > 0 ? discountPercent : undefined}
    />

    {/* NOTE: removed md:w-4/5 so the text uses full 1/4 column width */}
    <p className="mt-5 text-gray-600 leading-relaxed">
      {freshProduct?.description}
    </p>

    {/* Color / Size */}
    {availableColors.length > 0 && (
      <ColorSelector
        product={product}
        colors={availableColors}
        selectedVariant={selectedVariant}
        onSelect={(v) => {
          setColor(v.optionValues.Color);
          setSelectedVariant(v);
          const imgs = getDisplayImages(v, product);
          setImage(imgs?.[0] || "");
        }}
      />
    )}

    {availableSizes.length > 0 && (
      <SizeSelector sizes={availableSizes} value={size} onChange={setSize} />
    )}

    {/* Quantity */}
    <QuantitySelector
      stock={variantStock}
      quantity={quantity}
      setQuantity={setQuantity}
      onStockLimit={(flag) => setStockLimitReached(flag)}
    >
      {stockLimitReached && (
        <p className="text-sm text-red-600 my-2">
          Only {variantStock} item(s) available in stock.
        </p>
      )}

      {freshProduct?.detailedDescription?.trim() && (
        <details className="group rounded-md border border-black backdrop-blur-sm shadow-sm open:shadow-md transition-shadow">
          <summary className="flex items-center justify-between gap-3 cursor-pointer px-4 py-3 text-md select-none rounded-xl">
            <span className="inline-flex items-center gap-2">Product details</span>
            <svg className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111 1.1l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.33a.75.75 0 01.02-1.12z" clipRule="evenodd" />
            </svg>
          </summary>
          <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-300 ease-in-out">
            <div className="overflow-hidden">
              <div className="px-4 pb-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {freshProduct.detailedDescription}
              </div>
            </div>
          </div>
        </details>
      )}
    </QuantitySelector>

    {/* Actions */}
    <ProductActions
      addDisabled={authLoading}
      onAddToCart={async () => {
        if (!size && availableSizes.length > 0)
          return toast.error("Please select a size");
        if (!color && availableColors.length > 0)
          return toast.error("Please select a color");

        if (authLoading) {
          toast.info("Checking your session…");
          return;
        }
        if (!isLoggedin) {
          toast.info("Please login to add items to cart");
          return navigate("/login", {
            state: { from: location.pathname },
          });
        }

        if (variants.length > 0 && !selectedVariant?._id) {
          return toast.error("Please select a variant");
        }

        try {
          await dispatch(
            addToCartServer({
              productId: product._id,
              variantId: selectedVariant?._id || null,
              quantity,
            })
          ).unwrap();

          dispatch(loadCart());
          toast.success("Added to cart");
        } catch (e) {
          const msg = e?.error || e?.message || "Failed to add to cart";
          toast.error(typeof msg === "string" ? msg : "Failed to add to cart");
        }
      }}
      onBuyNow={() => {
        if (!size && availableSizes.length > 0)
          return toast.error("Please select a size");
        if (!color && availableColors.length > 0)
          return toast.error("Please select a color");

        navigate("/place-order", {
          state: {
            productId: product._id,
            variantId: selectedVariant?._id,
            size,
            color,
            quantity,
            productName: product.name,
            price: selectedVariant
              ? effectivePrice
              : (offerProduct?.pricing?.salePrice ?? product.defaultPrice),
            thumbnail: product.images?.[0],
          },
        });
      }}

      productName={product.name}
    />

    {/* <hr className="mt-8" />
    <div className="flex flex-col gap-2 mt-5 text-sm text-gray-600">
      <p>✓ 100% original product</p>
      <p>✓ Cash on delivery available</p>
      <p>✓ Easy return &amp; exchange within 7 days</p>
      <p>🚚 Free shipping on orders above {CURRENCY}999</p>
    </div> */}
  </div>
</div>


    <div className="w-full rounded-2xl bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 my-10 md:mt-18">
      <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center gap-5 sm:gap-6 lg:gap-8 text-xs sm:text-sm lg:text-base text-gray-800">
        
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3">
          <Truck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 shrink-0" strokeWidth={1.75} />
          <span className="leading-snug">Worldwide Delivery</span>
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3">
          <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 shrink-0" strokeWidth={1.75} />
          <span className="leading-snug">100% Authenticity Guaranteed</span>
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3">
          <Headphones className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 shrink-0" strokeWidth={1.75} />
          <span className="leading-snug">Responsive Customer Service 24/7</span>
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3">
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 shrink-0" strokeWidth={1.75} />
          <span className="leading-snug">Several Payment Methods Available</span>
        </div>
      </div>
    </div>

      <ProductTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        product={product}
        reviews={reviews}
        reviewsLoading={reviewsLoading}
        availableSizes={availableSizes}
        onLoadMore={() => dispatch(getReviewsByProduct(product._id))}
        onSubmitReview={({ rating, comment }) =>
          dispatch(addReview({ productId: product._id, rating, comment })).unwrap()
        }
      />

      <RelatedProducts
        category={product.category}
        subcategory={product.subcategory || product.subCategory || null}
      />
     
    </div>
  );
}


