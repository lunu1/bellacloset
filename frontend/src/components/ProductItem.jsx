import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";

const ProductItem = ({ id, image, name, price, originalPrice, rating }) => {
  const { format } = useCurrency();

  // Support string OR array for image prop
  const mainImage = useMemo(() => {
    if (Array.isArray(image)) return image[0] || "";
    return image || "";
  }, [image]);

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
        <p className="text-xl font-medium">{format(Number(price || 0))}</p>

        {originalPrice != null && Number(originalPrice) > Number(price) && (
          <p className="text-sm text-gray-500 line-through">
            {format(Number(originalPrice || 0))}
          </p>
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
