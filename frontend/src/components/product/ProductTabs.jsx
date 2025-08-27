import { useMemo, useState } from "react";

export default function ProductTabs({
  activeTab,
  setActiveTab,
  product,
  reviews = [],
  reviewsLoading = false,
  availableSizes = [],
  summary = null,          // { avgRating, reviewCount, countsByStar }
  hasMore = false,
  onLoadMore,
  onSubmitReview,
}) {
  const avgRating = summary?.avgRating ?? useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const reviewCount = summary?.reviewCount ?? reviews.length;

  return (
    <div className="mt-20">
      <div className="flex border-b">
        {["description", "reviews", "specifications"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab ? "border-b-2 border-black" : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "description" && "Description"}
            {tab === "reviews" && `Reviews (${reviewCount}${avgRating ? ` • ${avgRating}★` : ""})`}
            {tab === "specifications" && "Specifications"}
          </button>
        ))}
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
            {/* Rating summary */}
            <RatingSummary summary={summary} />

            {reviewsLoading && <div className="text-gray-500">Loading reviews…</div>}

            {!reviewsLoading && reviews.length === 0 && (
              <div className="text-gray-600">No reviews yet. Be the first to review this product!</div>
            )}

            {reviews.map((review) => {
              const key = review._id || review.id;
              const name = review.user?.name || review.user?.fullName || review.user || "Anonymous";
              const initial = String(name).charAt(0).toUpperCase() || "A";
              const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
              const created = review.createdAt || review.date || review.updatedAt || null;
              const dateStr = created ? new Date(created).toLocaleDateString() : "";
              return (
                <div key={key} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                        {initial}
                      </div>
                      <div>
                        <p className="font-semibold">{name}</p>
                        <Stars rating={rating} />
                        {review.verified && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    {dateStr && <span className="text-sm text-gray-500">{dateStr}</span>}
                  </div>
                  <p className="text-gray-600">{review.comment || ""}</p>
                </div>
              );
            })}

            {hasMore && (
              <button
                className="text-blue-600 hover:underline disabled:opacity-50"
                onClick={onLoadMore}
                disabled={reviewsLoading}
              >
                {reviewsLoading ? "Loading…" : "Load more reviews"}
              </button>
            )}

            {typeof onSubmitReview === "function" && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Add a review</h4>
                <AddReviewForm onSubmit={onSubmitReview} />
              </div>
            )}
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <SpecRow label="Brand" value={product.brand || "N/A"} />
              <SpecRow label="Category" value={product.category} />
              <SpecRow label="Material" value={product.material || "Premium Quality"} />
            </div>
            <div className="space-y-3">
              <SpecRow
                label="Available Sizes"
                value={availableSizes.length ? availableSizes.join(", ") : "One Size"}
              />
              <SpecRow label="Care Instructions" value="Machine wash cold" />
              <SpecRow label="Country of Origin" value="India" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RatingSummary({ summary }) {
  if (!summary) return null;
  const total = summary.reviewCount || 0;
  const counts = summary.countsByStar || {};
  return (
    <div className="p-4 rounded border bg-gray-50">
      <div className="flex items-end gap-3 mb-3">
        <div className="text-3xl font-bold">{summary.avgRating || 0}★</div>
        <div className="text-gray-600">{total} review{total !== 1 ? "s" : ""}</div>
      </div>
      <div className="space-y-1">
        {[5,4,3,2,1].map((star) => {
          const count = counts[star] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-8 text-sm">{star}★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded">
                <div className="h-2 rounded" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-12 text-right text-sm text-gray-600">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stars({ rating = 0 }) {
  const filled = Math.round(rating);
  const empty = Math.max(0, 5 - filled);
  return (
    <div className="flex items-center gap-1 text-yellow-500 text-sm">
      {Array.from({ length: filled }).map((_, i) => <span key={`f-${i}`}>★</span>)}
      <span className="text-gray-300">
        {Array.from({ length: empty }).map((_, i) => <span key={`e-${i}`}>★</span>)}
      </span>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="font-medium">{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}

function AddReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    try {
      setSubmitting(true);
      await onSubmit({ rating: Number(rating), comment: comment.trim() });
      setComment("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ★</option>)}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full border p-2 rounded"
        rows={3}
      />
      <button className="bg-black text-white px-4 py-2 rounded disabled:opacity-50" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
