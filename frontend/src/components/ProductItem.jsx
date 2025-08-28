import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price, originalPrice, rating }) => {
  const { currency } = useContext(ShopContext);

  // Support string OR array for image prop
  const mainImage = useMemo(() => {
    if (Array.isArray(image)) return image[0] || "";
    return image || "";
  }, [image]);

  const formatPrice = (value) => {
    if (value == null) return "";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD",
        // If your currency in context is a symbol (e.g., "₹"), switch to style:"decimal"
      }).format(Number(value));
    } catch {
      return `${currency ?? ""}${value}`;
    }
  };

  return (
    <Link
      className="text-gray-700 cursor-pointer block"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      to={`/product/${id}`}
    >
      <div className="overflow-hidden rounded-lg bg-white">
        {mainImage ? (
          <img
            className="transition-all ease-in-out hover:scale-110 w-full h-auto"
            src={mainImage}
            alt={name || "Product image"}
            loading="lazy"
          />
        ) : (
          <div className="aspect-[4/5] bg-gray-100" />
        )}
      </div>

      <p className="pt-3 pb-1 overflow-hidden text-lg whitespace-nowrap text-ellipsis">
        {name}
      </p>

      <div className="flex items-center gap-2">
        <p className="text-xl font-medium">{formatPrice(price)}</p>
        {originalPrice && Number(originalPrice) > Number(price) && (
          <p className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</p>
        )}
      </div>

      {typeof rating === "number" && (
        <div className="mt-1 text-sm text-yellow-500">
          {"★".repeat(Math.max(0, Math.min(5, Math.round(rating))))}
          <span className="text-gray-300">
            {"★".repeat(Math.max(0, 5 - Math.round(rating)))}
          </span>
        </div>
      )}
    </Link>
  );
};

export default ProductItem;
