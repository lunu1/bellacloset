import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Reviews-only ProductTabs with "See all reviews" modal
 *
 * Props:
 * - reviews, reviewsLoading
 * - summary: { avgRating, reviewCount, countsByStar } (optional)
 * - hasMore, onLoadMore
 * - onSubmitReview: ({ rating, comment }) => Promise<void>
 * - sort: "newest" | "highest" | "lowest" (optional, controlled)
 * - onChangeSort: (value) => void (optional, controlled)
 * - initialVisible: number (how many reviews to show before "See all")
 */
export default function ProductTabs({
 product,
  reviews = [],
  reviewsLoading = false,
  summary = null,
  hasMore = false,
  onLoadMore,
  onSubmitReview,
  sort,
  onChangeSort,
  initialVisible = 3,
}) {
  const [localSort, setLocalSort] = useState(sort || "newest");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const computed = useMemo(() => {
    const count = reviews.length;
    const avg =
      summary?.avgRating ??
      (count
        ? Math.round(
            (reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / count) * 10
          ) / 10
        : 0);

    const counts = summary?.countsByStar ?? (() => {
      const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of reviews) {
        const s = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
        c[s] += 1;
      }
      return c;
    })();

    const reviewCount = summary?.reviewCount ?? count;
    return { avg, counts, reviewCount };
  }, [summary, reviews]);

  const preview = useMemo(() => {
    const list = [...reviews].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    return list.slice(0, initialVisible);
  }, [reviews, initialVisible]);

  return (
    <section className="mt-14">
          {/* ----- Product text sections (dropdowns) ----- */}
    {/* {product?.description?.trim() && (
      <details className="mb-4 border rounded-lg bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
          Description
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {product.description}
        </div>
      </details>
    )} */}

    {/* {product?.detailedDescription?.trim() && (
      <details className="mb-8 border rounded-lg bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
          Product details
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {product.detailedDescription}
        </div>
      </details>
    )} */}
      {/* ----- Reviews ----- */}
      <div className="flex items-end justify-between">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          Reviews {computed.reviewCount ? `(${computed.reviewCount})` : ""}
        </h2>
        <button
          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-black bg-white text-sm disabled:opacity-50"
          onClick={() => setOpen(true)}
          disabled={computed.reviewCount === 0 && !reviewsLoading}
        >
          See all reviews
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummaryCard avg={computed.avg} counts={computed.counts} total={computed.reviewCount} />
        <div className="md:col-span-2 space-y-4">
          {reviewsLoading && !reviews.length && <ReviewsSkeleton />}
          {!reviewsLoading && preview.length === 0 && (
            <div className="p-6 rounded-xl border bg-white text-gray-600">
              No reviews yet. Be the first to review this product!
            </div>
          )}
          {preview.map((r) => (
            <ReviewItem key={r._id || r.id} review={r} />
          ))}
        </div>
      </div>

      {typeof onSubmitReview === "function" && (
        <div className="mt-8 p-5 rounded-xl border bg-white">
          <h3 className="text-base font-semibold mb-3">Add a review</h3>
          <AddReviewForm
            submitting={submitting}
            onSubmit={async (payload) => {
              try {
                setSubmitting(true);
                await onSubmitReview(payload);
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </div>
      )}

      <ReviewsModal
        open={open}
        onClose={() => setOpen(false)}
        reviews={reviews}
        reviewsLoading={reviewsLoading}
        summary={computed}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        sort={sort ?? localSort}
        onChangeSort={(v) => {
          setLocalSort(v);
          onChangeSort?.(v);
        }}
        ratingFilter={ratingFilter}
        onChangeFilter={setRatingFilter}
      />
    </section>
  );
}

/* ====== modal ====== */

function ReviewsModal({
  open,
  onClose,
  reviews,
  reviewsLoading,
  summary,
  hasMore,
  onLoadMore,
  sort,
  onChangeSort,
  ratingFilter,
  onChangeFilter,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    let list = reviews;
    if (ratingFilter) list = list.filter((r) => Math.round(Number(r.rating) || 0) === ratingFilter);
    if (sort === "highest") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === "lowest") list = [...list].sort((a, b) => (a.rating || 0) - (b.rating || 0));
    else list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [reviews, ratingFilter, sort]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="All reviews"
    >
      <div className="bg-white w-full md:max-w-3xl max-h-[90vh] rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">All Reviews</h3>
          <button
            className="h-9 w-9 rounded-full border border-gray-300 hover:border-black flex items-center justify-center"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard avg={summary.avg} counts={summary.counts} total={summary.reviewCount} compact />
            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => onChangeSort(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {[{ v: 0, label: "All" }, { v: 5, label: "5★" }, { v: 4, label: "4★" }, { v: 3, label: "3★" }, { v: 2, label: "2★" }, { v: 1, label: "1★" }].map((f) => (
                  <button
                    key={f.v}
                    onClick={() => onChangeFilter((prev) => (prev === f.v ? 0 : f.v))}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      ratingFilter === f.v
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-800 border-gray-300 hover:border-black"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
          {reviewsLoading && !filtered.length && <ReviewsSkeleton />}
          {!reviewsLoading && filtered.length === 0 && (
            <div className="p-6 rounded-xl border bg-white text-gray-600">
              No reviews{ratingFilter ? ` for ${ratingFilter}★` : ""}.
            </div>
          )}
          {filtered.map((r) => (
            <ReviewItem key={r._id || r.id} review={r} />
          ))}
          {hasMore && (
            <div className="pt-2">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 hover:border-black bg-white text-sm disabled:opacity-50"
                onClick={onLoadMore}
                disabled={reviewsLoading}
              >
                {reviewsLoading ? "Loading…" : "Load more reviews"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====== bits ====== */

function SummaryCard({ avg = 0, counts = {}, total = 0, compact = false }) {
  return (
    <div className={`p-4 rounded-xl border bg-white ${compact ? "" : "flex items-center gap-4"}`}>
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold">{avg}★</div>
        <div className="text-sm text-gray-600">
          {total} review{total === 1 ? "" : "s"}
          <div className="mt-1 text-yellow-500">
            <Stars rating={avg} />
          </div>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 w-full">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = counts[star] || 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-10 text-sm">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                    <div className="h-2 bg-gray-900 rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse p-4 rounded-xl border bg-white">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3 mb-1" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ReviewItem({ review }) {
  const name = review?.user?.name || review?.user?.fullName || review?.user || "Anonymous";
  const initials = getInitials(name);
  const rating = Math.max(0, Math.min(5, Number(review?.rating) || 0));
  const created = review?.createdAt || review?.date || review?.updatedAt || null;
  const dateStr = created
    ? new Date(created).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "";
  return (
    <article className="p-4 rounded-xl border bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-black">{name}</p>
            <div className="flex items-center gap-2">
              <Stars rating={rating} />
              {review?.verified && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>
        {dateStr && <time className="text-sm text-gray-500">{dateStr}</time>}
      </div>
      {review?.comment && <p className="mt-3 text-gray-700 leading-relaxed">{review.comment}</p>}
    </article>
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

function AddReviewForm({ onSubmit, submitting }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    await onSubmit({ rating: Number(rating), comment: comment.trim() });
    setComment("");
    setRating(5);
    setHover(0);
  };

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">Your rating</span>
        <div className="flex items-center gap-1 text-2xl">
          {Array.from({ length: 5 }).map((_, i) => {
            const idx = i + 1;
            const active = (hover || rating) >= idx;
            return (
              <button
                key={idx}
                type="button"
                className={`leading-none ${active ? "text-yellow-500" : "text-gray-300"}`}
                onMouseEnter={() => setHover(idx)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(idx)}
                aria-label={`${idx} star${idx > 1 ? "s" : ""}`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
        rows={4}
        maxLength={1000}
      />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{comment.length}/1000</span>
      </div>

      <button className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}

function getInitials(name) {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}
