// src/pages/ProductPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { getAllProducts } from "../features/product/productSlice";
import { getVariantsByProduct } from "../features/variants/variantSlice";
import { addToWishlist, removeFromWishlist } from "../features/wishlist/wishlistSlice";
import { addToCart } from "../features/cart/cartSlice";

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

const CURRENCY = "AED";

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: products = [], loading } = useSelector((s) => s.products);
  const { items: variants = [], loading: variantLoading } = useSelector((s) => s.variants);
  const wishlistItems = useSelector((s) => s.wishlist.items);

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

  // Mock reviews (keep as-is; later you can fetch real ones)
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

  // Load products
  useEffect(() => {
    if (products.length === 0) dispatch(getAllProducts());
  }, [dispatch, products.length]);

  // Resolve product by id + initialize
  useEffect(() => {
    if (!id || products.length === 0) return;
    const sel = products.find((p) => p.product._id === id);
    setProductData(sel || null);
  }, [id, products]);

  // Load variants for the product
  useEffect(() => {
    if (productData?.product?._id) {
      dispatch(getVariantsByProduct(productData.product._id));
    }
  }, [dispatch, productData]);

  // Init image/color when product & variants change
  useEffect(() => {
    if (!productData) return;

    const imgs = getDisplayImages(selectedVariant, productData.product);
    setImage(imgs?.[0] || "");

    if (variants.length > 0) {
      const firstWithColor = variants.find((v) => v.optionValues?.Color);
      if (firstWithColor?.optionValues?.Color) {
        setColor(firstWithColor.optionValues.Color);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData, variants]);

  // Update selected variant when color/size changes
  useEffect(() => {
    if (!productData) return;
    const mv = findMatchedVariant(variants, { color, size });
    if (mv) setSelectedVariant(mv);
  }, [productData, variants, color, size]);

  // Wishlist derived state
  const isInWishlist = useMemo(() => {
    if (!productData?.product?._id) return false;
    return wishlistItems.some((w) => w?.product?._id === productData.product._id);
  }, [wishlistItems, productData]);

  if (loading) {
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
  const variantStock = selectedVariant?.stock ?? 0;

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
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        toast.success("Added to wishlist");
      }
    } catch (err) {
      if (err?.response?.data?.message === "Product already in wishlist.") {
        toast.info("Already in wishlist");
      } else {
        toast.error("Something went wrong while updating wishlist");
      }
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
              isInWishlist={isInWishlist}
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
                {product.brand}
              </span>
            )}
            {product.bestseller && (
              <span className="text-xs bg-black text-white px-2 py-1 rounded">
                Bestseller
              </span>
            )}
          </div>

          <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>

          {/* stars (keep simple) */}
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
            <SizeSelector
              sizes={availableSizes}
              value={size}
              onChange={setSize}
            />
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
            onAddToCart={() => {
              if (!size && availableSizes.length > 0) return toast.error("Please select a size");
              if (!color && availableColors.length > 0) return toast.error("Please select a color");

              dispatch(
                addToCart({
                  productId: product._id,
                  variantId: selectedVariant?._id,
                  size,
                  color,
                  quantity,
                  price: selectedVariant?.price ?? product.defaultPrice,
                  name: product.name,
                  thumbnail: image || product.images?.[0],
                })
              );
              toast.success("Added to cart");
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

      {/* Related */}
      <RelatedProducts category={product.category} subCategory={product.subCategory} />
    </div>
  );
}

