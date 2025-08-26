// src/pages/ProductPage.jsx
import { useContext, useEffect, useMemo, useState ,useRef} from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { getAllProducts } from "../features/product/productSlice";
import { getVariantsByProduct } from "../features/variants/variantSlice";
import { addToWishlist, removeFromWishlist } from "../features/wishlist/wishlistSlice";
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
  getAvailableColors,
  getAvailableSizes,
  findMatchedVariant,
  getDisplayImages,
  calcDiscount,
} from "../utils/productView";
import { AppContext } from "../context/AppContext";
import { brandLabel } from "../utils/brandLabel";

const CURRENCY = "AED";

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // From AppContext
  const { authLoading, isLoggedin } = useContext(AppContext);

  // Store data
  const { items: products = [], loading } = useSelector((s) => s.products);
  const { items: variants = [], loading: variantLoading } = useSelector((s) => s.variants);
  const wishlistItems = useSelector((s) => s.wishlist.items);

  // Local UI state
  const [productData, setProductData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [stockLimitReached, setStockLimitReached] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Optimistic local wishlist indicator for instant heart fill
  const [wishState, setWishState] = useState(false);
  const wishInFlightRef = useRef(false);

  // Mock reviews
  const [reviews] = useState([
    {
      id: 1,
      user: "John Doe",
      rating: 5,
      comment: "Excellent product! Great quality and fast delivery.",
      date: "2024-01-15",
      verified: true,
    },
    {
      id: 2,
      user: "Jane Smith",
      rating: 4,
      comment: "Good product, but sizing runs a bit small.",
      date: "2024-01-10",
      verified: true,
    },
  ]);

  // Load products on first mount
  useEffect(() => {
    if (products.length === 0) dispatch(getAllProducts());
  }, [dispatch, products.length]);

  // Resolve product by route id
  useEffect(() => {
    if (!id || products.length === 0) return;
    const sel = products.find((p) => p.product._id === id);
    setProductData(sel || null);
  }, [id, products]);

  // Keep local wishState in sync with store (after nav/refresh)
  useEffect(() => {
    if (productData?.product?._id) {
      if (wishInFlightRef.current) return;
      setWishState(wishlistItems.some((w) => w?.product?._id === productData.product._id));
    }
  }, [wishlistItems, productData]);

  // Load variants when product is ready
  useEffect(() => {
    if (productData?.product?._id) {
      dispatch(getVariantsByProduct(productData.product._id));
    }
  }, [dispatch, productData]);

  // Ensure valid selected variant & image when data changes
  useEffect(() => {
    if (!productData) return;

    if (!variants || variants.length === 0) {
      setSelectedVariant(null);
      const imgs = getDisplayImages(null, productData.product);
      setImage(imgs?.[0] || productData.product?.images?.[0] || "");
      return;
    }

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
    if (c) setColor(c);
    if (s) setSize(s);
    const imgs = getDisplayImages(first, productData.product);
    setImage(imgs?.[0] || "");
  }, [productData, variants, color, size]);

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

  // (kept for any other logic you might rely on)
  const isInWishlist = useMemo(() => {
    if (!productData?.product?._id) return false;
    return wishlistItems.some((w) => w?.product?._id === productData.product._id);
  }, [wishlistItems, productData]);

  // Loading & Not found guards
  if (loading || variantLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!loading && products.length > 0 && !productData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you are looking for does not exist.</p>
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

  const availableColors = getAvailableColors(variants);
  const availableSizes = getAvailableSizes(variants);
  const variantStock = selectedVariant?.stock ?? product.defaultStock ?? 0;

  const { currentPrice, originalPrice, discountPercent } = calcDiscount(selectedVariant);

  // zoom helpers
  const handleMouseMove = (e) => {
    if (!showZoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleToggleWishlist = async () => {
    try {
      wishInFlightRef.current = true;
      if (wishState) {
        setWishState(false); // optimistic
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        setWishState(true); // optimistic
        // IMPORTANT: use the payload shape your slice expects
        await dispatch(addToWishlist({ productId: product._id })).unwrap();
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

  return (
    <div className="pt-10 transition-opacity duration-500 ease-in border-t-2 opacity-100">
      {/* Top section */}
      <div className="flex flex-col gap-12 sm:flex-row">
        {/* Left: Images */}
        <div className="flex-1 relative">
          <ImageGallery
            images={galleryImages}
            activeImage={image}
            onChange={setImage}
            showZoom={showZoom}
            setShowZoom={setShowZoom}
            zoomPosition={zoomPosition}
            onMouseMove={handleMouseMove}
          />
          <div className="absolute top-4 right-4">
            <WishlistShare
              // render from local optimistic state so the heart fills instantly
              isInWishlist={wishState}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex-1">
          {/* badges */}
          <div className="flex items-center gap-2 mb-2">
            {product.brand && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {product.brand?.slug ? (
                  <Link to={`/brand/${product.brand.slug}`}>{brandLabel(product)}</Link>
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

          <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>

          {/* stars */}
          <div className="mt-2 text-sm text-gray-600">4.5 ({reviews.length} reviews)</div>

          <PriceBlock
            currency={CURRENCY}
            currentPrice={currentPrice ?? product.defaultPrice}
            originalPrice={originalPrice}
            discountPercent={discountPercent}
          />

          <p className="mt-5 text-gray-600 md:w-4/5 leading-relaxed">{product.description}</p>

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
          />

          {stockLimitReached && (
            <p className="text-sm text-red-600 my-2">
              Only {variantStock} item(s) available in stock.
            </p>
          )}

          {/* Actions */}
          <ProductActions
            addDisabled={authLoading}
            onAddToCart={async () => {
              // For variant products, enforce a choice
              if (!size && availableSizes.length > 0) return toast.error("Please select a size");
              if (!color && availableColors.length > 0) return toast.error("Please select a color");

              if (authLoading) {
                toast.info("Checking your session…");
                return;
              }
              if (!isLoggedin) {
                toast.info("Please login to add items to cart");
                return navigate("/login", { state: { from: location.pathname } });
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

                dispatch(loadCart()); // refresh navbar count
                toast.success("Added to cart");
              } catch (e) {
                const msg = e?.error || e?.message || "Failed to add to cart";
                toast.error(typeof msg === "string" ? msg : "Failed to add to cart");
              }
            }}
            onBuyNow={() => {
              if (!size && availableSizes.length > 0) return toast.error("Please select a size");
              if (!color && availableColors.length > 0) return toast.error("Please select a color");

              navigate("/place-order", {
                state: {
                  productId: product._id,
                  variantId: selectedVariant?._id,
                  size,
                  color,
                  quantity,
                  productName: product.name,
                  price: selectedVariant?.price ?? product.defaultPrice,
                  thumbnail: product.images?.[0],
                },
              });
            }}
          />

          {/* small guarantees */}
          <hr className="mt-8 sm:w-4/5" />
          <div className="flex flex-col gap-2 mt-5 text-sm text-gray-600">
            <p>✓ 100% original product</p>
            <p>✓ Cash on delivery available</p>
            <p>✓ Easy return & exchange within 7 days</p>
            <p>🚚 Free shipping on orders above {CURRENCY}999</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProductTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        product={product}
        reviews={reviews}
        availableSizes={availableSizes}
      />

      {/* Related (prop fixed to match backend field casing) */}
      <RelatedProducts category={product.category} subcategory={product.subcategory} />
    </div>
  );
}
