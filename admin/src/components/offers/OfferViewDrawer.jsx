import Chip from "./Chip";
import SectionTitle from "./SectionTitle";
import PropTypes from "prop-types";

const formatAED = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
      }).format(n)
    : null;

export default function OfferViewDrawer({
  open,
  offer,
  onClose,
  onEdit,
  onDelete,
  // Map<string id, string label> built in the page and passed down
  catNameById = new Map(),
}) {
  if (!open || !offer) return null;

  // ✅ ADD THIS: resolveCatLabel used by renderCategoryNames
  const resolveCatLabel = (entry) => {
    if (entry && typeof entry === "object") {
      const possibleLabel = entry.pathLabel || entry.label || entry.name;
      if (possibleLabel) return possibleLabel;

      const possibleKeys = [entry.value, entry._id, entry.id, entry.slug];
      for (const k of possibleKeys) {
        if (!k) continue;
        const exact = catNameById.get(String(k));
        if (exact) return exact;
        const lower = catNameById.get(String(k).toLowerCase());
        if (lower) return lower;
      }
    }
    const key = String(entry);
    const exact = catNameById.get(key);
    if (exact) return exact;
    const lower = catNameById.get(key.toLowerCase());
    if (lower) return lower;
    return `#${key.slice(-4)}`;
  };

  const renderCategoryNames = (ids = []) => {
    if (!Array.isArray(ids) || ids.length === 0) return "No categories selected";
    const names = ids.map(resolveCatLabel);
    return names.length > 6 ? (
      <>
        {names.slice(0, 6).join(", ")}{" "}
        <span className="text-gray-500">+{names.length - 6} more</span>
      </>
    ) : (
      names.join(", ")
    );
  };

  const renderDiscount = () => {
    if (offer.type === "percent") {
      return (
        <>
          {offer.value}% off{" "}
          {typeof offer.maxDiscount === "number" ? (
            <span className="text-xs text-gray-500"> (cap {formatAED(offer.maxDiscount)})</span>
          ) : null}
        </>
      );
    }
    return <>{formatAED(Number(offer.value) || 0)} off</>;
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full sm:w-[460px] bg-white border-l p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Offer details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <SectionTitle>Name</SectionTitle>
            <div>{offer.name}</div>
          </div>

          <div>
            <SectionTitle>Discount</SectionTitle>
            <div>{renderDiscount()}</div>
          </div>

          <div>
            <SectionTitle>Status</SectionTitle>
            <div className="flex gap-2">
              {offer.active ? <Chip tone="green">Active</Chip> : <Chip tone="gray">Inactive</Chip>}
              {offer.exclusive ? <Chip tone="orange">Exclusive</Chip> : null}
            </div>
          </div>

          <div>
            <SectionTitle>Scope</SectionTitle>
            <div className="capitalize">{offer.scope?.kind || "all"}</div>

            {offer.scope?.kind === "categories" && (
              <div className="mt-1 text-xs text-gray-700">
                <div className="mt-0.5">
                  {renderCategoryNames(offer.scope?.categories)}
                  {offer.scope?.includeDescendants === false ? (
                    <span className="text-gray-500"> • no descendants</span>
                  ) : null}
                </div>
              </div>
            )}

            {offer.scope?.kind === "products" && (
              <div className="mt-1 text-xs text-gray-700">
                {Array.isArray(offer.scope?.products) && offer.scope.products.length > 0
                  ? `${offer.scope.products.length} product(s)`
                  : "No products selected"}
              </div>
            )}
          </div>

          <div>
            <SectionTitle>Schedule</SectionTitle>
            <div>Starts: {offer.startsAt ? new Date(offer.startsAt).toLocaleString() : "—"}</div>
            <div>Ends: {offer.endsAt ? new Date(offer.endsAt).toLocaleString() : "—"}</div>
          </div>

          {offer.description ? (
            <div>
              <SectionTitle>Description</SectionTitle>
              <div className="whitespace-pre-wrap">{offer.description}</div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={() => onEdit(offer)} className="px-3 py-2 rounded border">Edit</button>
          <button
            onClick={() => onDelete(offer)}
            className="px-3 py-2 rounded border border-red-300 text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

OfferViewDrawer.propTypes = {
  open: PropTypes.bool,
  offer: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  catNameById: PropTypes.instanceOf(Map),
};
