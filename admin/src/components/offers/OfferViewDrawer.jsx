import Chip from "./Chip";
import SectionTitle from "./SectionTitle";

export default function OfferViewDrawer({ open, offer, onClose, onEdit, onDelete }) {
  if (!open || !offer) return null;

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
            <div>
              {offer.type === "percent" ? `${offer.value}%` : `₹${offer.value}`}
              {typeof offer.maxDiscount === "number" ? ` (cap ₹${offer.maxDiscount})` : ""}
            </div>
          </div>
          <div>
            <SectionTitle>Status & flags</SectionTitle>
            <div className="flex gap-2">
              {offer.active ? <Chip tint="green">Active</Chip> : <Chip tint="gray">Inactive</Chip>}
              {offer.exclusive ? <Chip tint="orange">Exclusive</Chip> : null}
              {offer.applyToSaleItems ? <Chip tint="blue">Applies to sale</Chip> : null}
            </div>
          </div>
          <div>
            <SectionTitle>Scope</SectionTitle>
            <div className="capitalize">{offer.scope?.kind || "all"}</div>
            {offer.scope?.kind === "categories" && (
              <div className="text-xs text-gray-500">
                {offer.scope?.categories?.length || 0} category id(s)
                {offer.scope?.includeDescendants === false ? " • no descendants" : ""}
              </div>
            )}
          </div>
          <div>
            <SectionTitle>Schedule</SectionTitle>
            <div>Starts: {offer.startsAt ? new Date(offer.startsAt).toLocaleString() : "—"}</div>
            <div>Ends: {offer.endsAt ? new Date(offer.endsAt).toLocaleString() : "—"}</div>
          </div>
          <div>
            <SectionTitle>Priority</SectionTitle>
            <div>{typeof offer.priority === "number" ? offer.priority : "—"}</div>
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
          <button onClick={() => onDelete(offer)} className="px-3 py-2 rounded border border-red-300 text-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}
