import Chip from "./Chip";

export default function OfferList({
  offers,
  loading,
  query,
  onQueryChange,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
}) {
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
          <div className="col-span-2">Scope</div>
          <div className="col-span-2">Window</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-600">Loading…</div>
        ) : !offers || offers.length === 0 ? (
          <div className="p-6 text-gray-600">No offers found.</div>
        ) : (
          offers.map((o) => (
            <div key={o._id} className="grid grid-cols-12 px-4 py-3 border-b items-center text-sm">
              <div className="col-span-3">
                <div className="font-medium">{o.name}</div>
                <div className="flex gap-2 mt-1">
                 {o.active ? <Chip tone="green">Active</Chip> : <Chip tone="gray">Inactive</Chip>}
                  {o.exclusive ? <Chip tone="orange">Exclusive</Chip> : null}
                  {o.applyToSaleItems ? <Chip tone="blue">Applies to sale items</Chip> : null}
                </div>
              </div>

              <div className="col-span-2">
                <div>{o.type === "percent" ? `${o.value}% off` : `₹${o.value} off`}</div>
                {o.type === "percent" && typeof o.maxDiscount === "number" && (
                  <div className="text-xs text-gray-500">Cap: ₹{o.maxDiscount}</div>
                )}
              </div>

              <div className="col-span-2">
                <div className="capitalize">{o.scope?.kind || "all"}</div>
                {o.scope?.kind === "categories" && (
                  <div className="text-xs text-gray-500">
                    {o.scope?.categories?.length || 0} category id(s)
                    {o.scope?.includeDescendants === false ? " • no descendants" : ""}
                  </div>
                )}
              </div>

              <div className="col-span-2 text-xs text-gray-700">
                <div>{o.startsAt ? new Date(o.startsAt).toLocaleString() : "—"}</div>
                <div>{o.endsAt ? new Date(o.endsAt).toLocaleString() : "—"}</div>
              </div>

              <div className="col-span-1">{typeof o.priority === "number" ? o.priority : "—"}</div>

              <div className="col-span-2 text-right space-x-2">
                <button onClick={() => onView(o)} className="text-gray-700 hover:underline">View</button>
                <button onClick={() => onEdit(o)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => onToggleActive(o)} className="text-amber-600 hover:underline">
                  {o.active ? "Disable" : "Enable"}
                </button>
                <button onClick={() => onDelete(o)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
