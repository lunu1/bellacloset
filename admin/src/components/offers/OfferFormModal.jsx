import { useEffect, useMemo, useState } from "react";
import SectionTitle from "./SectionTitle";

const toISOorNull = (localValue) => {
  if (!localValue) return null;
  try {
    const d = new Date(localValue); // "YYYY-MM-DDTHH:mm" (local)
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
};

const isoToLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function OfferFormModal({
  open,
  initial,           // null for create, offer object for edit
  catOptions,        // [{value,label,pathLabel}]
  onClose,
  onSave,            // (payload, idOrNull) => Promise
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState(10);
  const [maxDiscount, setMaxDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [exclusive, setExclusive] = useState(false);
  const [priority, setPriority] = useState(100);
  const [applyToSaleItems, setApplyToSaleItems] = useState(true); // default TRUE as requested
  const [scopeKind, setScopeKind] = useState("categories");
  const [includeDescendants, setIncludeDescendants] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState("");

  // hydrate for edit
  useEffect(() => {
    if (!initial) {
      setName(""); setType("percent"); setValue(10); setMaxDiscount("");
      setDescription(""); setActive(true); setExclusive(false); setPriority(100);
      setApplyToSaleItems(true);
      setScopeKind("categories"); setIncludeDescendants(true); setSelectedCategoryIds([]);
      setStartsAt(""); setEndsAt("");
      return;
    }
    setName(initial.name || "");
    setType(initial.type || "percent");
    setValue(initial.value ?? 0);
    setMaxDiscount(typeof initial.maxDiscount === "number" ? String(initial.maxDiscount) : "");
    setDescription(initial.description || "");
    setActive(initial.active !== false);
    setExclusive(!!initial.exclusive);
    setPriority(typeof initial.priority === "number" ? initial.priority : 100);
    setApplyToSaleItems(!!initial.applyToSaleItems);
    const kind = initial.scope?.kind || "all";
    setScopeKind(kind);
    setIncludeDescendants(initial.scope?.includeDescendants !== false);
    setSelectedCategoryIds(kind === "categories" ? (initial.scope?.categories || []).map(String) : []);
    setStartsAt(initial.startsAt ? isoToLocalInput(initial.startsAt) : "");
    setEndsAt(initial.endsAt ? isoToLocalInput(initial.endsAt) : "");
  }, [initial]);

  const filteredCats = useMemo(() => {
    const k = catFilter.trim().toLowerCase();
    if (!k) return catOptions || [];
    return (catOptions || []).filter((c) => (c.pathLabel || c.label).toLowerCase().includes(k));
  }, [catFilter, catOptions]);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Please enter an offer name");
    const num = Number(value);
    if (type === "percent") {
      if (num <= 0 || num > 100) return alert("Percent must be between 1 and 100");
    } else if (num <= 0) {
      return alert("Amount must be greater than 0");
    }
    if (scopeKind === "categories" && selectedCategoryIds.length === 0) {
      return alert("Select at least one category");
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      type,
      value: Number(value),
      maxDiscount: type === "percent" && maxDiscount !== "" ? Number(maxDiscount) : undefined,
      active: !!active,
      exclusive: !!exclusive,
      priority: Number(priority) || 0,
      startsAt: toISOorNull(startsAt) || null,  // allow empty → null
      endsAt: toISOorNull(endsAt) || null,      // allow empty → null
      applyToSaleItems: !!applyToSaleItems,
      scope: {
        kind: scopeKind,
        categories: scopeKind === "categories" ? selectedCategoryIds : [],
        products: [],
        includeDescendants,
      },
    };

    try {
      setSaving(true);
      await onSave(payload, initial?._id || null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl flex max-h-[90vh] flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b p-4 bg-white">
          <h2 className="text-lg font-semibold">{initial ? "Edit Offer" : "New Offer"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SectionTitle>Basics</SectionTitle>
              <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Offer name (e.g., Winter Sale)" value={name} onChange={(e) => setName(e.target.value)} />
              <textarea rows={3} className="w-full border rounded px-3 py-2" placeholder="Optional note" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <SectionTitle>Status</SectionTitle>
              <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={applyToSaleItems} onChange={(e) => setActive(e.target.checked)} /> Active
              </label>
              {/* <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={exclusive} onChange={(e) => setExclusive(e.target.checked)} /> Exclusive
              </label> */}
              {/* <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={applyToSaleItems} onChange={(e) => setApplyToSaleItems(e.target.checked)} /> Apply to sale items
              </label> */}
              {/* <div className="text-sm mt-2">
                <label className="block text-sm text-gray-700 mb-1">Priority</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value)} />
              </div> */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <SectionTitle>Discount</SectionTitle>
              <div className="flex gap-2">
                <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="percent">Percent (%)</option>
                  <option value="amount">Fixed amount</option>
                </select>
                <input type="number" min={1} max={type === "percent" ? 100 : undefined} className="border rounded px-3 py-2 w-28" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              {type === "percent" && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700 mb-1">Max discount (optional)</label>
                  <input type="number" min={0} className="w-full border rounded px-3 py-2" placeholder="e.g. 500" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <SectionTitle>Scope</SectionTitle>
              <div className="flex items-center gap-4 mb-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="scope" value="all" checked={scopeKind === "all"} onChange={(e) => setScopeKind(e.target.value)} />
                  All products
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="scope" value="categories" checked={scopeKind === "categories"} onChange={(e) => setScopeKind(e.target.value)} />
                  Categories
                </label>
                {/* <label className="inline-flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <input type="radio" disabled name="scope" value="products" /> Specific products (separate picker)
                </label> */}
              </div>

              {scopeKind === "categories" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <input className="border rounded px-3 py-2 w-72" placeholder="Filter categories…" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} />
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={includeDescendants} onChange={(e) => setIncludeDescendants(e.target.checked)} />
                      Include sub-categories
                    </label>
                  </div>
                  <select
                    multiple
                    className="w-full border rounded px-3 py-2 h-48"
                    value={selectedCategoryIds}
                    onChange={(e) => {
                      const ids = Array.from(e.target.selectedOptions).map((o) => o.value);
                      setSelectedCategoryIds(ids);
                    }}
                  >
                    {filteredCats.map((c) => (
                      <option key={c.value} value={c.value}>{c.pathLabel || c.label}</option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  <div>
    <SectionTitle>Starts at</SectionTitle>
    <input
      type="datetime-local"
      className="w-full border rounded px-3 py-2"
      value={startsAt}
      onChange={(e) => setStartsAt(e.target.value)}
    />
  </div>
  <div>
    <SectionTitle>Ends at</SectionTitle>
    <input
      type="datetime-local"
      className="w-full border rounded px-3 py-2"
      value={endsAt}
      onChange={(e) => setEndsAt(e.target.value)}
    />
  </div>
</div>


          {/* Optional: preview payload */}
          {/* <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600">Preview payload</summary>
            <pre className="mt-2 bg-gray-50 border rounded p-3 text-xs overflow-auto">
{JSON.stringify({
  name,
  description,
  type,
  value: Number(value),
  maxDiscount: type === "percent" && maxDiscount !== "" ? Number(maxDiscount) : undefined,
  active,
  exclusive,
  priority: Number(priority) || 0,
  startsAt: toISOorNull(startsAt),
  endsAt: toISOorNull(endsAt),
  applyToSaleItems,
  scope: { kind: scopeKind, categories: scopeKind === "categories" ? selectedCategoryIds : [], products: [], includeDescendants },
}, null, 2)}
            </pre>
          </details> */}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 border-t bg-white p-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button disabled={saving} onClick={handleSubmit} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
            {saving ? "Saving…" : (initial ? "Save changes" : "Create offer")}
          </button>
        </div>
      </div>
    </div>
  );
}
