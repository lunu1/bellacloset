// // src/components/product/WishlistShare.jsx
// import { Share, Heart } from "lucide-react";

// export default function WishlistShare({ isInWishlist, onToggleWishlist }) {
//   return (
//     <div className="flex flex-col gap-2">
//       <button
//         onClick={onToggleWishlist}
//         className={`p-2 rounded-full shadow-md ${
//           isInWishlist ? "bg-red-500 text-white" : "bg-white text-gray-600"
//         } hover:scale-110 transition-transform`}
//         title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
//       >
//         <Heart className="w-5 h-5" />
//       </button>
//       <button
//         className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:scale-110 transition-transform"
//         title="Share"
//         onClick={() => {
//           if (navigator?.share) navigator.share({ title: document.title, url: window.location.href });
//           else navigator.clipboard?.writeText(window.location.href);
//         }}
//       >
//         <Share className="w-5 h-5" />
//       </button>
//     </div>
//   );
// }


// src/components/product/WishlistShare.jsx
import { Share, Heart } from "lucide-react";

export default function WishlistShare({ isInWishlist, onToggleWishlist }) {
  async function handleShare() {
    try {
      if (navigator?.share) {
        await navigator.share({ title: document.title, url: window.location.href });
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        // optionally toast: "Link copied!"
      }
    } catch {
      // ignore cancel/error or toast an error if you want
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onToggleWishlist}
        aria-pressed={!!isInWishlist}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform ${
          isInWishlist ? "bg-red-500 text-white" : "bg-white text-gray-600"
        }`}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className="w-5 h-5"
          // make the heart fill when in wishlist
          fill={isInWishlist ? "currentColor" : "none"}
          // keep stroke visible in both states (optional)
          stroke="currentColor"
        />
      </button>

      <button
        type="button"
        onClick={handleShare}
        aria-label="Share"
        className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:scale-110 transition-transform"
        title="Share"
      >
        <Share className="w-5 h-5" />
      </button>
    </div>
  );
}

