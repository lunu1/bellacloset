import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { getAllProducts } from "../features/product/productSlice";
import { toast } from "react-toastify";
import { Share, Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from "../features/wishlist/wishlistSlice";
import { addToCart } from "../features/cart/cartSlice";

const Product = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { items: products = [], loading } = useSelector((state) => state.products);
  // Get wishlist from Redux store
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const  currency = "₹"

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [stockStatus, setStockStatus] = useState("in-stock");
  // const [deliveryInfo, setDeliveryInfo] = useState(null);
  // const [pincode, setPincode] = useState("");
  

  useEffect(() => {
    if (products.length === 0) {
      dispatch(getAllProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    const selectedProduct = products.find((p) => p.product._id === id);
    if (selectedProduct) {
      setProductData(selectedProduct);
      setImage(selectedProduct.product.images?.[0] || "");
      

      const inWishlist = wishlistItems.some(
      (item) => item.product._id === selectedProduct.product._id
    );
    setIsInWishlist(inWishlist);
      
      // Set initial color if available
      if (selectedProduct.product.options?.includes("Color")) {
        const firstVariant = selectedProduct.variants[0];
        setColor(firstVariant?.optionValues?.Color || "");
      }
      
      // Mock reviews data (replace with actual API call)
      setReviews([
        {
          id: 1,
          user: "John Doe",
          rating: 5,
          comment: "Excellent product! Great quality and fast delivery.",
          date: "2024-01-15",
          verified: true
        },
        {
          id: 2,
          user: "Jane Smith",
          rating: 4,
          comment: "Good product, but sizing runs a bit small.",
          date: "2024-01-10",
          verified: true
        }
      ]);
    }
  }, [id, products, wishlistItems]);

 

  // Mock delivery check function
  // const checkDelivery = async () => {
  //   if (pincode.length !== 6) {
  //     toast.error("Please enter a valid 6-digit pincode");
  //     return;
  //   }
    
  //   // Mock delivery info
  //   setDeliveryInfo({
  //     available: true,
  //     estimatedDays: "3-5",
  //     charges: pincode.startsWith("1") ? 0 : 50
  //   });
  // };

  // Image zoom handlers
  const handleMouseMove = (e) => {
    if (!showZoom) return;
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Handle toggle
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


  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!productData) return <div className="p-10 text-center">Product not found</div>;

  const { product, variants } = productData;
  const selectedVariant = variants.find((v) => 
    (!size || v.optionValues?.Size === size) && 
    (!color || v.optionValues?.Color === color)
  ) || variants[0];

  // Calculate discount percentage
  const originalPrice = selectedVariant?.originalPrice || selectedVariant?.price;
  const currentPrice = selectedVariant?.price;
  const discountPercent = originalPrice > currentPrice ? 
    Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Get unique colors and sizes
  const availableColors = [...new Set(variants.map(v => v.optionValues?.Color).filter(Boolean))];
  const availableSizes = [...new Set(variants.map(v => v.optionValues?.Size).filter(Boolean))];

  return (
    <div className="pt-10 transition-opacity duration-500 ease-in border-t-2 opacity-100">
      
      {/* Product Data */}
      <div className="flex flex-col gap-12 sm:gap-12 sm:flex-row">
        {/* Product Images */}
        <div className="flex flex-col-reverse flex-1 gap-3 sm:flex-row">
          <div className="flex sm:flex-col justify-between overflow-x-auto sm:overflow-y-scroll sm:justify-normal sm:w-[18.7%] w-full">
            {product.images?.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                alt={`View of ${product.name} - ${index + 1}`}
                key={index}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 ${
                  image === item ? 'border-black' : 'border-transparent'
                } hover:border-gray-300`}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%] relative">
            <img 
              src={image} 
              alt={product.name} 
              className="w-full h-auto cursor-zoom-in"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            />
            {showZoom && (
              <div 
                className="absolute top-0 left-full ml-4 w-96 h-96 border border-gray-300 bg-white shadow-lg pointer-events-none hidden lg:block"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '200%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}
            {/* Wishlist & Share buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full shadow-md ${
                    isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                  } hover:scale-110 transition-transform`}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'text-white' : 'text-gray-600'}`} />  
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
              {currency}{selectedVariant?.price || "N/A"}
            </p>
            {discountPercent > 0 && (
              <>
                <p className="text-xl text-gray-500 line-through">
                  {currency}{originalPrice}
                </p>
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-3">
            <span className={`text-sm px-2 py-1 rounded ${
              stockStatus === 'in-stock' ? 'bg-green-100 text-green-800' :
              stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {stockStatus === 'in-stock' ? '✓ In Stock' :
               stockStatus === 'low-stock' ? '⚠ Low Stock' :
               '✗ Out of Stock'}
            </span>
          </div>

          <p className="mt-5 text-gray-600 md:w-4/5 leading-relaxed">{product.description}</p>

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-3 my-6">
              <p className="font-medium">Color: <span className="font-normal text-gray-600">{color}</span></p>
              <div className="flex gap-2">
                

                {availableColors.map((c) => {
                    const safeColor = c?.toLowerCase(); // ensure it's a valid string
                    return (
                      <button
                        key={c}
                        className={`w-8 h-8 rounded-full border-2 ${
                          c === color ? "border-gray-800 scale-110" : "border-gray-300"
                        } transition-all`}
                        style={{ backgroundColor: safeColor || "#ccc" }} // fallback if color is invalid
                        onClick={() => setColor(c)}
                        title={c}
                      />
                    );
                  })}

              </div>
            </div>




          )}

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="flex flex-col gap-3 my-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">Size: <span className="font-normal text-gray-600">{size}</span></p>
                {/* <button className="text-sm text-blue-600 hover:underline">Size Guide</button> */}
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
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)} 
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex  sm:flex-row gap-3 mb-6">
             <button
              className="flex-1 bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
              onClick={() => {
                if (!size && availableSizes.length > 0) {
                  toast.error("Please select a size");
                } else if (!color && availableColors.length > 0) {
                  toast.error("Please select a color");
                } else {
                  dispatch(addToCart({ productId: product._id, size, quantity, color }));
                  toast.success("Added to cart");
                }
              }}
            >
              Add to Cart
            </button>

            <button
              className="flex-1  border border-black py-3 rounded  transition-colors"
              onClick={() => {
                if (!size && availableSizes.length > 0) {
                  toast.error("Please select a size");
                } else if (!color && availableColors.length > 0) {
                  toast.error("Please select a color");
                } else {
                  dispatch(addToCart({ productId: product._id, size, quantity, color }));
                  toast.success("Redirecting to checkout...");
                  window.location.href = "/checkout";
                }
              }}
            >
              Buy Now
            </button>
          </div>

          {/* Delivery Check */}
          {/* <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Delivery Options</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                maxLength={6}
              />
              <button
                onClick={checkDelivery}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Check
              </button>
            </div>
            {deliveryInfo && (
              <div className="text-sm text-gray-600">
                {deliveryInfo.available ? (
                  <div>
                    <p className="text-green-600">✓ Delivery available</p>
                    <p>Estimated delivery: {deliveryInfo.estimatedDays} business days</p>
                    <p>Delivery charges: {deliveryInfo.charges === 0 ? 'Free' : `${currency}${deliveryInfo.charges}`}</p>
                  </div>
                ) : (
                  <p className="text-red-600">✗ Delivery not available to this pincode</p>
                )}
              </div>
            )}
          </div> */}

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

      {/* Enhanced Description & Reviews */}
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
              <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
              <p className="text-gray-600 leading-relaxed">
                This premium product is crafted with attention to detail and quality materials. 
                Perfect for daily use, it combines style and functionality to meet your needs.
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
                            <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
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
              <button className="text-blue-600 hover:underline">Load more reviews</button>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Brand</span>
                  <span className="text-gray-600">{product.brand || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Category</span>
                  <span className="text-gray-600">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Material</span>
                  <span className="text-gray-600">{product.material || "Premium Quality"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Available Sizes</span>
                  <span className="text-gray-600">{availableSizes.join(", ") || "One Size"}</span>
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