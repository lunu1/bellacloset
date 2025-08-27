// src/pages/admin/SettingsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings, updateSettings } from "../../src/features/settings/settingSlice";
import { toast } from "react-toastify";

const EMPTY_METHOD = { code: "", label: "", amount: 0, etaDaysMin: 2, etaDaysMax: 4, active: true };

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.settings);

  const [taxRate, setTaxRate] = useState(5);
  const [freeOver, setFreeOver] = useState(199);
  const [defaultMethodCode, setDefaultMethodCode] = useState("standard");
  const [methods, setMethods] = useState([
    { code: "standard", label: "Standard", amount: 15, etaDaysMin: 2, etaDaysMax: 4, active: true },
    { code: "express", label: "Express", amount: 35, etaDaysMin: 1, etaDaysMax: 2, active: true },
  ]);

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);

  useEffect(() => {
    if (!data) return;
    setTaxRate(Number(data.tax?.rate ?? 5));
    setFreeOver(Number(data.shipping?.freeOver ?? 199));
    setDefaultMethodCode(data.shipping?.defaultMethodCode || "standard");
    setMethods(Array.isArray(data.shipping?.methods) ? data.shipping.methods : []);
  }, [data]);

  const updateMethod = (idx, patch) => {
    setMethods((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };
  const addMethod = () => setMethods((prev) => [...prev, { ...EMPTY_METHOD }]);
  const removeMethod = (idx) => setMethods((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();

    if (!methods.length) {
      toast.error("Add at least one shipping method");
      return;
    }
    if (!methods.some(m => m.active && m.code === defaultMethodCode)) {
      toast.error("Default must be an active method");
      return;
    }

    try {
      const payload = {
        tax: { rate: Number(taxRate) || 0, displayMode: "tax_exclusive" },
        shipping: {
          freeOver: Number(freeOver) || 0,
          defaultMethodCode,
          methods: methods.map(m => ({
            code: m.code.trim(),
            label: m.label.trim(),
            amount: Number(m.amount) || 0,
            etaDaysMin: Number(m.etaDaysMin) || 0,
            etaDaysMax: Number(m.etaDaysMax) || 0,
            active: !!m.active,
          })),
        },
      };
      await dispatch(updateSettings(payload)).unwrap();
      toast.success("Settings saved");
      dispatch(fetchSettings());
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Store Settings</h1>

      <form onSubmit={submit} className="space-y-8">

        {/* Tax */}
        <section>
          <h2 className="font-medium mb-3">Tax</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">VAT Rate (%)</label>
              <input
                type="number"
                className="border p-2 w-full"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section>
          <h2 className="font-medium mb-3">Shipping</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Free Over (AED)</label>
              <input
                type="number"
                className="border p-2 w-full"
                value={freeOver}
                onChange={(e) => setFreeOver(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Default Method</label>
              <select
                className="border p-2 w-full"
                value={defaultMethodCode}
                onChange={(e) => setDefaultMethodCode(e.target.value)}
              >
                {methods.map((m, i) => (
                  <option key={`${m.code}-${i}`} value={m.code || ""}>
                    {m.label || m.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {methods.map((m, idx) => (
            <div key={idx} className="border rounded p-3 mb-2">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <input
                  className="border p-2"
                  placeholder="Code"
                  value={m.code}
                  onChange={(e) => updateMethod(idx, { code: e.target.value })}
                />
                <input
                  className="border p-2"
                  placeholder="Label"
                  value={m.label}
                  onChange={(e) => updateMethod(idx, { label: e.target.value })}
                />
                <input
                  type="number"
                  className="border p-2"
                  placeholder="Fee"
                  value={m.amount}
                  onChange={(e) => updateMethod(idx, { amount: e.target.value })}
                />
                <input
                  type="number"
                  className="border p-2"
                  placeholder="ETA Min"
                  value={m.etaDaysMin}
                  onChange={(e) => updateMethod(idx, { etaDaysMin: e.target.value })}
                />
                <input
                  type="number"
                  className="border p-2"
                  placeholder="ETA Max"
                  value={m.etaDaysMax}
                  onChange={(e) => updateMethod(idx, { etaDaysMax: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!m.active}
                    onChange={(e) => updateMethod(idx, { active: e.target.checked })}
                  />
                  Active
                </label>
                <button
                  type="button"
                  className="ml-auto text-sm text-red-600 hover:underline"
                  onClick={() => removeMethod(idx)}
                  disabled={methods.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="mt-3 px-3 py-2 border rounded"
            onClick={addMethod}
          >
            + Add method
          </button>
        </section>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-black"}`}
        >
          {loading ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
