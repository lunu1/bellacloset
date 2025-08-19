// src/components/product/WishlistShare.jsx
import { Share, Heart } from "lucide-react";

export default function WishlistShare({ isInWishlist, onToggleWishlist }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onToggleWishlist}
        className={`p-2 rounded-full shadow-md ${
          isInWishlist ? "bg-red-500 text-white" : "bg-white text-gray-600"
        } hover:scale-110 transition-transform`}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className="w-5 h-5" />
      </button>
      <button
        className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:scale-110 transition-transform"
        title="Share"
        onClick={() => {
          if (navigator?.share) navigator.share({ title: document.title, url: window.location.href });
          else navigator.clipboard?.writeText(window.location.href);
        }}
      >
        <Share className="w-5 h-5" />
      </button>
    </div>
  );
}
