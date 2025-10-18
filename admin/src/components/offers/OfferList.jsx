// src/components/offers/OfferList.jsx
import PropTypes from "prop-types";
import Chip from "./Chip";

const formatAED = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
      }).format(n)
    : null;

export default function OfferList({
  offers,
  loading,
  query,
  onQueryChange,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  // Map<string id, string label> — pass from OfferPage (built from /api/category/flat)
  catNameById = new Map(),
}) {
  const renderDiscount = (o) => {
    if (o?.type === "percent") {
      return (
        <>
          {o.value}% off
          {typeof o.maxDiscount === "number" ? (
            <div className="text-xs text-gray-500">Cap: {formatAED(o.maxDiscount)}</div>
          ) : null}
        </>
      );
    }
    return <>{formatAED(Number(o?.value) || 0)} off</>;
  };


  // add this helper
const resolveCatLabel = (entry) => {
  if (entry && typeof entry === "object") {
    const possibleLabel = entry.pathLabel || entry.label || entry.name;
    if (possibleLabel) return possibleLabel;

    const possibleKeys = [entry.value, entry._id, entry.id, entry.slug];
    for (const k of possibleKeys) {
      if (!k) continue;
      const exact = catNameById?.get(String(k));
      if (exact) return exact;
      const lower = catNameById?.get(String(k).toLowerCase());
      if (lower) return lower;
    }
  }

  const key = String(entry);
  const exact = catNameById?.get(key);
  if (exact) return exact;
  const lower = catNameById?.get(key.toLowerCase());
  if (lower) return lower;

  return `#${key.slice(-4)}`;
};


  // replace your current renderCategoryNames with this
const renderCategoryNames = (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return "No categories selected";
  const names = ids.map(resolveCatLabel);
  return names.length > 3
    ? `${names.slice(0, 3).join(", ")} +${names.length - 3} more`
    : names.join(", ");
};


  return (
    <>
      {/* Toolbar */}
      <div className="bg-white border rounded-lg p-3 mb-4 flex items-center gap-3">
        <input
          className="border rounded px-3 py-2 w-full md:w-80"
          placeholder="Search offers (name, notes, value…)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <div className="ml-auto text-sm text-gray-500">
          {offers ? offers.length : 0} result(s)
        </div>
      </div>

      {/* List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-600 border-b">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Discount</div>
          <div className="col-span-3">Scope</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-600">Loading…</div>
        ) : !offers || offers.length === 0 ? (
          <div className="p-6 text-gray-600">No offers found.</div>
        ) : (
          offers.map((o) => (
            <div
              key={o._id}
              className="grid grid-cols-12 px-4 py-3 border-b items-center text-sm"
            >
              {/* Name + flags */}
              <div className="col-span-3">
                <div className="font-medium">{o.name}</div>
                <div className="flex gap-2 mt-1">
                  {o.active ? <Chip tone="green">Active</Chip> : <Chip tone="gray">Inactive</Chip>}
                  {o.exclusive ? <Chip tone="orange">Exclusive</Chip> : null}
                </div>
                {o.description ? (
                  <div className="mt-1 text-xs text-gray-500 line-clamp-1">{o.description}</div>
                ) : null}
              </div>

              {/* Discount */}
              <div className="col-span-2">
                <div>{renderDiscount(o)}</div>
              </div>

              {/* Scope */}
              <div className="col-span-3">
                <div className="capitalize">{o.scope?.kind || "all"}</div>

                {o.scope?.kind === "categories" && (
                  <div className="text-xs text-gray-600">
                    {renderCategoryNames(o.scope?.categories)}
                    {o.scope?.includeDescendants === false ? " • no descendants" : ""}
                  </div>
                )}

                {o.scope?.kind === "products" && (
                  <div className="text-xs text-gray-500">
                    {Array.isArray(o.scope?.products)
                      ? `${o.scope.products.length} product(s)`
                      : "No products selected"}
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="col-span-2 text-xs text-gray-700">
                <div>{o.startsAt ? new Date(o.startsAt).toLocaleString() : "—"}</div>
                <div>{o.endsAt ? new Date(o.endsAt).toLocaleString() : "—"}</div>
              </div>

              {/* Actions */}
              <div className="col-span-2 text-right space-x-2">
                <button onClick={() => onView(o)} className="text-gray-700 hover:underline">
                  View
                </button>
                <button onClick={() => onEdit(o)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => onToggleActive(o)}
                  className="text-amber-600 hover:underline"
                >
                  {o.active ? "Disable" : "Enable"}
                </button>
                <button onClick={() => onDelete(o)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

OfferList.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  query: PropTypes.string,
  onQueryChange: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  catNameById: PropTypes.instanceOf(Map),
};
