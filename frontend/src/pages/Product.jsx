import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { getAllProducts } from "../features/product/productSlice";
import { toast } from "react-toastify";
import { Share, Heart } from "lucide-react";
import {
  addToWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";
import { addToCart } from "../features/cart/cartSlice";
import { getVariantsByProduct } from "../features/variants/variantSlice";

const Product = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: products = [], loading } = useSelector(
    (state) => state.products
  );
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { items: variants = [], loading: variantLoading } = useSelector(
    (state) => state.variants
  );
  const currency = "AED";
  const [stockLimitReached, setStockLimitReached] = useState(false);
  const [productData, setProductData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Load products on component mount
  useEffect(() => {
    if (products.length === 0) {
      dispatch(getAllProducts());
    }
  }, [dispatch, products.length]);

  // Find and set product data when products or id changes
  useEffect(() => {
    if (products.length > 0 && id) {
      console.log("Looking for product with ID:", id);
      console.log("Available products:", products);

      const selectedProduct = products.find((p) => p.product._id === id);
      console.log("Found product:", selectedProduct);

      if (selectedProduct) {
        setProductData(selectedProduct);

        // Set initial color if available
        if (selectedProduct.product.options?.includes("Color")) {
          const firstColorVariant = variants.find((v) => v.optionValues?.Color);

          setColor(firstColorVariant?.optionValues?.Color || "");
        }

        // Set initial image
        const firstVariantWithImages = variants.find(
          (v) => v.images?.length > 0
        );

        setImage(
          firstVariantWithImages?.images?.[0] ||
            selectedProduct.product.images?.[0] ||
            ""
        );

        const inWishlist = wishlistItems.some(
          (item) => item?.product?._id === selectedProduct.product._id
        );
        setIsInWishlist(inWishlist);

        // Mock reviews
        setReviews([
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
      } else {
        console.log("Product not found in products array");
        setProductData(null);
      }
    }
  }, [id, products, wishlistItems, variants]);

  // Load variants when product is found
  useEffect(() => {
    if (productData?.product?._id) {
      dispatch(getVariantsByProduct(productData.product._id));
    }
  }, [dispatch, productData]);

  // Update selected variant when color/size changes
  useEffect(() => {
    if (productData && variants.length > 0 && (color || size)) {
      const matchedVariant = variants.find(
        (v) =>
          (!color || v.optionValues?.Color === color) &&
          (!size || v.optionValues?.Size === size)
      );

      if (matchedVariant) {
        setSelectedVariant(matchedVariant);
      }
    }
  }, [color, size, productData, variants]);

  // Show loading state
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

  // Show not found state
  if (!loading && products.length > 0 && !productData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you are looking for doesnot exist.
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

  // Don't render anything if still loading or no product data
  if (!productData) {
    return null;
  }

  const { product } = productData;

  const variantStock = selectedVariant?.stock ?? 0;

  const originalPrice =
    selectedVariant?.originalPrice || selectedVariant?.price;
  const currentPrice = selectedVariant?.price;
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;


  const getDisplayImages = () => {
    if (selectedVariant?.images?.length > 0) return selectedVariant.images;
    return product.images || [];
  };

  const handleMouseMove = (e) => {
    if (!showZoom) return;
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleToggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productData.product._id)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist(productData.product._id)).unwrap();
        toast.success("Added to wishlist");
      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      if (err.response?.data?.message === "Product already in wishlist.") {
        toast.info("Already in wishlist");
      } else {
        toast.error("Something went wrong while updating wishlist");
      }
    }
  };

  const availableColors = variants
    .filter((v) => v.optionValues?.Color)
    .reduce((unique, v) => {
      const exists = unique.some(
        (u) => u.optionValues.Color === v.optionValues.Color
      );
      return exists ? unique : [...unique, v];
    }, []);

  const availableSizes = [
    ...new Set(variants.map((v) => v.optionValues?.Size).filter(Boolean)),
  ];

  return (
    <div className="pt-10 transition-opacity duration-500 ease-in border-t-2 opacity-100">
      {/* Product Data */}
      <div className="flex flex-col gap-12 sm:gap-12 sm:flex-row">
        {/* Product Images */}
        <div className="flex flex-col-reverse flex-1 gap-3 sm:flex-row">
          {/* Thumbnail Images */}
          <div className="flex sm:flex-col justify-between overflow-x-auto sm:overflow-y-scroll sm:justify-normal sm:w-[18.7%] w-full">
            {getDisplayImages().map((imageUrl, index) => (
              <img
                onClick={() => setImage(imageUrl)}
                src={imageUrl}
                alt={`${product.name}${color ? ` in ${color}` : ""} - View ${
                  index + 1
                }`}
                key={`${color || "default"}-${index}`}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 ${
                  image === imageUrl ? "border-black" : "border-transparent"
                } hover:border-gray-300 transition-all duration-200`}
              />
            ))}

            {color && getDisplayImages().length === 0 && (
              <div className="text-center text-gray-500 text-sm p-4">
                No images available for {color} color
              </div>
            )}
          </div>

          {/* Main Image Display */}
          <div className="w-full sm:w-[80%] relative">
            <img
              src={image}
              alt={`${product.name}${color ? ` in ${color}` : ""}`}
              className="w-full h-auto cursor-zoom-in"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            />

            {/* Zoom overlay */}
            {showZoom && (
              <div
                className="absolute top-0 left-full ml-4 w-96 h-96 border border-gray-300 bg-white shadow-lg pointer-events-none hidden lg:block"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: "200%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}

            {/* Wishlist & Share buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleToggleWishlist}
                className={`p-2 rounded-full shadow-md ${
                  isInWishlist
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600"
                } hover:scale-110 transition-transform`}
                title={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist ? "text-white" : "text-gray-600"
                  }`}
                />
              </button>
              <button className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:scale-110 transition-transform">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {product.brand || "Brand"}
            </span>
            {product.bestseller && (
              <span className="text-xs bg-black text-white px-2 py-1 rounded">
                Bestseller
              </span>
            )}
          </div>

          <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="w-3.5"
              />
            ))}
            <p className="pl-2 text-sm">4.5 ({reviews.length} reviews)</p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <p className="text-3xl font-bold ">
              {currency}
           {selectedVariant?.price ?? product.defaultPrice ?? "N/A"}
            </p>
            {discountPercent > 0 && (
              <>
                <p className="text-xl text-gray-500 line-through">
                  {currency}
                  {originalPrice}
                </p>
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-gray-600 md:w-4/5 leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-3 my-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  Color:{" "}
                  <span className="font-normal text-gray-600">
                    {color || "Select a color"}
                  </span>
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {availableColors.map((variant) => {
                  const vColor = variant.optionValues.Color;
                  const isSelected = selectedVariant?._id === variant._id;
                  const previewImage =
                    variant.images?.[0] || product.images?.[0];

                  return (
                    <button
                      key={variant._id}
                      className={`w-14 h-14 rounded overflow-hidden border-2 relative ${
                        isSelected
                          ? "border-orange-500 scale-110 shadow-lg"
                          : "border-gray-300"
                      } transition-all hover:border-gray-500 hover:scale-105`}
                      onClick={() => {
                        // console.log("Selected color:", vColor);
                        // console.log("Variant ID:", variant._id);
                        // console.log("Variant images:", variant.images);

                        setColor(vColor);
                        setSelectedVariant(variant);

                        const variantImages = variant.images;
                        const fallbackImages = product.images || [];

                        if (variantImages?.length > 0) {
                          setImage(variantImages[0]);
                        } else if (fallbackImages.length > 0) {
                          setImage(fallbackImages[0]);
                        } else {
                          setImage("");
                        }
                      }}
                      title={`Select ${vColor}`}
                    >
                      <img
                        src={previewImage}
                        alt={`${product.name} in ${vColor}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>

              {selectedVariant?.images?.length > 0 && (
                <p className="text-sm text-gray-500">
                  {selectedVariant.images.length} image
                  {selectedVariant.images.length !== 1 ? "s" : ""} available for{" "}
                  {color}
                </p>
              )}
            </div>
          )}

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="flex flex-col gap-3 my-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  Size:{" "}
                  <span className="font-normal text-gray-600">{size}</span>
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    className={`border py-2 px-4 min-w-[3rem] transition-all ${
                      s === size
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <p className="font-medium">Quantity:</p>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => {
                  setQuantity((q) => {
                    const newQty = Math.max(1, q - 1);
                    setStockLimitReached(false);
                    return newQty;
                  });
                }}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => {
                  setQuantity((q) => {
                    const newQty = Math.min(variantStock, q + 1);
                    setStockLimitReached(newQty === variantStock);
                    return newQty;
                  });
                }}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                disabled={quantity >= variantStock}
              >
                +
              </button>
            </div>
          </div>

          {stockLimitReached && (
            <p className="text-sm text-red-600  my-2">
              Only {variantStock} item(s) available in stock.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex sm:flex-row gap-3 mb-6">
            <button
              className="flex-1 bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
              onClick={() => {
                if (!size && availableSizes.length > 0) {
                  toast.error("Please select a size");
                } else if (!color && availableColors.length > 0) {
                  toast.error("Please select a color");
                } else {
                  dispatch(
                    addToCart({
                      productId: product._id,
                      variantId: selectedVariant?._id,
                      size,
                      color,
                      quantity,
                      price: selectedVariant?.price,
                      name: product.name,
                      thumbnail: image || product.images?.[0],
                    })
                  );
                  toast.success("Added to cart");
                }
              }}
            >
              Add to Cart
            </button>

            <button
              className="flex-1 border border-black py-3 rounded transition-colors"
              onClick={() => {
                if (!size && availableSizes.length > 0) {
                  toast.error("Please select a size");
                } else if (!color && availableColors.length > 0) {
                  toast.error("Please select a color");
                } else {
                  navigate("/place-order", {
                    state: {
                      productId: product._id,
                      variantId: selectedVariant?._id,
                      size,
                      color,
                      quantity,
                      productName: product.name,
                      price: selectedVariant?.price,
                      thumbnail: product.images?.[0],
                    },
                  });
                }
              }}
            >
              Buy Now
            </button>
          </div>

          <hr className="mt-8 sm:w-4/5" />
          <div className="flex flex-col gap-2 mt-5 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              100% original product
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Cash on delivery available
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Easy return & exchange within 7 days
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-600">🚚</span>
              Free shipping on orders above {currency}999
            </p>
          </div>
        </div>
      </div>

      {/* Description & Reviews */}
      <div className="mt-20">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "description"
                ? "border-b-2 border-black "
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "reviews"
                ? "border-b-2 border-black "
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({reviews.length})
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "specifications"
                ? "border-b-2 border-black "
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("specifications")}
          >
            Specifications
          </button>
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                {product.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                This premium product is crafted with attention to detail and
                quality materials. Perfect for daily use, it combines style and
                functionality to meet your needs.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.user.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{review.user}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          {review.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
              <button className="text-blue-600 hover:underline">
                Load more reviews
              </button>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Brand</span>
                  <span className="text-gray-600">
                    {product.brand || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Category</span>
                  <span className="text-gray-600">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Material</span>
                  <span className="text-gray-600">
                    {product.material || "Premium Quality"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Available Sizes</span>
                  <span className="text-gray-600">
                    {availableSizes.join(", ") || "One Size"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Care Instructions</span>
                  <span className="text-gray-600">Machine wash cold</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Country of Origin</span>
                  <span className="text-gray-600">India</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={product.category}
        subCategory={product.subCategory}
      />
    </div>
  );
};

export default Product;
