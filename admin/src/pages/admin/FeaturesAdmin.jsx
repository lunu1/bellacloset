import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Icons from "lucide-react";
import {
  fetchFeaturesAdminAsync,
  createFeatureAdminAsync,
  updateFeatureAdminAsync,
  deleteFeatureAdminAsync,
} from "../../redux/features/featureSlice";

const ICON_OPTIONS = [
  "ShoppingBag",
  "BadgePercent",
  "Shield",
  "CreditCard",
  "Truck",
  "Package",
  "Globe",
  "Sparkles",
  "Gem",
  "Lock",
  "CheckCircle",
  "Star",
];

const getLucideIcon = (name) => {
  const Icon = Icons?.[name];
  return Icon ? Icon : Icons.HelpCircle;
};

const emptyForm = {
  title: "",
  description: "",
  icon: "ShoppingBag",
  isActive: true,
  order: 0,
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function FeaturesAdmin() {
  const dispatch = useDispatch();
  const { adminItems, loading, error } = useSelector((s) => s.features);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // feature object
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchFeaturesAdminAsync());
  }, [dispatch]);

  const sorted = useMemo(() => {
    return [...adminItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [adminItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      icon: item.icon || "ShoppingBag",
      isActive: typeof item.isActive === "boolean" ? item.isActive : true,
      order: typeof item.order === "number" ? item.order : 0,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon,
      isActive: !!form.isActive,
      order: Number(form.order) || 0,
    };

    if (!payload.title || !payload.description) return;

    if (editing?._id) {
      await dispatch(updateFeatureAdminAsync({ id: editing._id, payload }));
    } else {
      await dispatch(createFeatureAdminAsync(payload));
    }
    closeModal();
  };

  const toggleActive = async (item) => {
    await dispatch(
      updateFeatureAdminAsync({
        id: item._id,
        payload: { isActive: !item.isActive },
      })
    );
  };

  const removeItem = async (item) => {
    const ok = window.confirm(`Delete feature: "${item.title}" ?`);
    if (!ok) return;
    await dispatch(deleteFeatureAdminAsync(item._id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Features</h1>
          <p className="text-gray-500 text-sm">
            Manage homepage “You Can Always Count On Us” cards.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          + Add Feature
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-gray-500 border-b">
          <div className="col-span-1">Icon</div>
          <div className="col-span-3">Title</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-1">Order</div>
          <div className="col-span-1">Active</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-500">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-gray-500">No features found.</div>
        ) : (
          sorted.map((item) => {
            const Icon = getLucideIcon(item.icon);
            return (
              <div
                key={item._id}
                className="grid grid-cols-12 gap-3 px-4 py-4 border-b last:border-b-0 items-center"
              >
                <div className="col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="font-medium text-gray-900">{item.title}</div>
                </div>

                <div className="col-span-5">
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="text-sm text-gray-700">{item.order ?? 0}</div>
                </div>

                <div className="col-span-1">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      item.isActive
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    {item.isActive ? "Yes" : "No"}
                  </button>
                </div>

                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        title={editing ? "Edit Feature" : "Add Feature"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. Trusted Platform"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Icon
              </label>
              <div className="flex gap-2">
                <select
                  value={form.icon}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                >
                  {ICON_OPTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <div className="w-12 h-11 rounded-xl border bg-gray-50 flex items-center justify-center">
                  {(() => {
                    const Icon = getLucideIcon(form.icon);
                    return <Icon className="w-5 h-5 text-gray-700" />;
                  })()}
                </div>
              </div>

              <p className="text-[11px] text-gray-500 mt-1">
                Store icon name in DB (ex: ShoppingBag).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Write feature description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
            >
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
