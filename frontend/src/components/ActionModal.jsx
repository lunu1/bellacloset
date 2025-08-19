import { useEffect } from "react";

export default function ActionModal({
  open,
  onClose,
  title = "Are you sure?",
  message = "",
  actions = [], // [{ label, onClick, variant: 'primary'|'danger'|'secondary' }]
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const btn = (v) =>
    v === "primary"
      ? "bg-black text-white hover:bg-gray-800"
      : v === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "border text-gray-700 hover:bg-gray-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-[92%] max-w-md rounded-lg bg-white shadow-lg border p-5"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}

        <div className="mt-5 flex flex-wrap gap-2 justify-end">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className={`px-4 py-2 text-sm rounded ${btn(a.variant)}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
