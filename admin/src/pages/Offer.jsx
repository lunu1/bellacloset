import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api, { adminApi } from "../lib/api";
import OfferList from "../components/offers/OfferList";
import OfferFormModal from "../components/offers/OfferFormModal";
import OfferViewDrawer from "../components/offers/OfferViewDrawer";

export default function OfferPage() {
  const [offers, setOffers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [openView, setOpenView] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [catOptions, setCatOptions] = useState([]);

  // data loaders
  const loadOffers = async () => {
    try {
      const { data } = await adminApi.get("/api/offers");
      setOffers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load offers");
      setOffers([]);
    }
  };

  const loadCategories = async () => {
    try {
      const resp = await api.get("/api/category/flat");
      const raw = Array.isArray(resp?.data?.items) ? resp.data.items : [];
      const items = raw
        .map((it) => ({
          value: String(it.value ?? it._id ?? ""),
          label: String(it.label ?? it.name ?? ""),
          pathLabel: String(it.pathLabel ?? it.name ?? it.label ?? ""),
        }))
        .filter((it) => it.value);
      items.sort((a, b) => (a.pathLabel || "").localeCompare(b.pathLabel || ""));
      setCatOptions(items);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load categories");
      setCatOptions([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadOffers(), loadCategories()]);
      setLoading(false);
    })();
  }, []);

  // filtering
  const filteredOffers = useMemo(() => {
    if (!offers) return null;
    const query = q.trim().toLowerCase();
    if (!query) return offers;
    return offers.filter((o) =>
      [o.name, o.description, o.scope?.kind, String(o.value)]
        .filter(Boolean)
        .some((t) => String(t).toLowerCase().includes(query))
    );
  }, [offers, q]);

  // actions
  const openCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const openEdit = (o) => {
    setEditing(o);
    setOpenForm(true);
  };

  const onDelete = async (o) => {
    if (!window.confirm(`Delete offer “${o.name}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/offers/${o._id}`);
      toast.success("Offer deleted");
      await loadOffers();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to delete offer");
    }
  };

  const onToggleActive = async (o) => {
    try {
      await api.put(`/api/offers/${o._id}`, { active: !o.active });
      await loadOffers();
    } catch (e) {
      console.error(e);
      toast.error("Failed to toggle active");
    }
  };

  const onSave = async (payload, idOrNull) => {
    if (idOrNull) {
      await api.put(`/api/offers/${idOrNull}`, payload);
      toast.success("Offer updated");
    } else {
      await api.post(`/api/offers`, payload);
      toast.success("Offer created");
    }
    await loadOffers();
  };

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Offers</h1>
        <button onClick={openCreate} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          New Offer
        </button>
      </div>

      <OfferList
        offers={filteredOffers}
        loading={loading}
        query={q}
        onQueryChange={setQ}
        onView={(o) => { setViewItem(o); setOpenView(true); }}
        onEdit={openEdit}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
      />

      <OfferFormModal
        open={openForm}
        initial={editing}
        catOptions={catOptions}
        onClose={() => setOpenForm(false)}
        onSave={onSave}
      />

      <OfferViewDrawer
        open={openView}
        offer={viewItem}
        onClose={() => setOpenView(false)}
        onEdit={(o) => { setOpenView(false); openEdit(o); }}
        onDelete={onDelete}
      />
    </div>
  );
}
