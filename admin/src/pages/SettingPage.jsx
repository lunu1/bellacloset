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
    setMethods(Array.isArray(data.shipping?.methods) && data.shipping.methods.length
      ? data.shipping.methods
      : [{ ...EMPTY_METHOD }]);
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
    if (!methods.some((m) => m.active && m.code === defaultMethodCode)) {
      toast.error("Default must be an active method");
      return;
    }

    try {
      const payload = {
        tax: { rate: Number(taxRate) || 0, displayMode: "tax_exclusive" },
        shipping: {
          freeOver: Number(freeOver) || 0,
          defaultMethodCode,
          methods: methods.map((m) => ({
            code: (m.code || "").trim(),
            label: (m.label || "").trim(),
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

  const input = "border rounded px-3 py-2 w-full text-sm";
  const label = "block text-sm font-medium text-gray-800";
  const hint = "text-xs text-gray-500 mt-1";
  const section = "border rounded-md p-4 bg-white";
  const row = "grid grid-cols-1 sm:grid-cols-2 gap-4";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">Store Settings</h1>
      {/* <p className="text-sm text-gray-600 mb-6">
        Fill these fields to control taxes and shipping. Each field below has a short explanation.
      </p> */}

      <form onSubmit={submit} className="space-y-6">
        {/* Tax */}
        <section className={section}>
          <h2 className="font-medium mb-3">Tax</h2>
          <div className={row}>
            <div>
              <label className={label}>VAT Rate (%)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5"
                className={input}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
              <p className={hint}>The tax percentage added to orders. Example: 5 means 5% VAT.</p>
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className={section}>
          <h2 className="font-medium mb-3">Shipping</h2>

          <div className={row + " mb-3"}>
            <div>
              <label className={label}>Free Over (AED)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 199"
                className={input}
                value={freeOver}
                onChange={(e) => setFreeOver(e.target.value)}
              />
              <p className={hint}>
                Orders with subtotal at or above this amount get free shipping. Example: 199.
              </p>
            </div>

            <div>
              <label className={label}>Default Method</label>
              <select
                className={input}
                value={defaultMethodCode}
                onChange={(e) => setDefaultMethodCode(e.target.value)}
              >
                {methods.map((m, i) => (
                  <option key={`${m.code}-${i}`} value={m.code || ""}>
                    {m.label || m.code}
                  </option>
                ))}
              </select>
              {/* <p className={hint}>
                Used automatically at checkout. Customers can still change it.
              </p> */}
            </div>
          </div>

          {methods.map((m, idx) => (
            <div key={idx} className="border rounded p-3 mb-2 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div>
                  <label className={label}>Code</label>
                  <input
                    className={input}
                    placeholder="e.g. standard"
                    value={m.code}
                    onChange={(e) => updateMethod(idx, { code: e.target.value })}
                  />
                  {/* <p className={hint}>Short, unique ID. Example: standard, express.</p> */}
                </div>

                <div>
                  <label className={label}>Label</label>
                  <input
                    className={input}
                    placeholder="e.g. Standard"
                    value={m.label}
                    onChange={(e) => updateMethod(idx, { label: e.target.value })}
                  />
                  <p className={hint}>Customer-facing name shown at checkout.</p>
                </div>

                <div>
                  <label className={label}>Fee (AED)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    className={input}
                    value={m.amount}
                    onChange={(e) => updateMethod(idx, { amount: e.target.value })}
                  />
                  <p className={hint}>How much you charge for the shipping .</p>
                </div>

                <div>
                  <label className={label}>ETA Min (days)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    className={input}
                    value={m.etaDaysMin}
                    onChange={(e) => updateMethod(idx, { etaDaysMin: e.target.value })}
                  />
                  <p className={hint}>Soonest expected delivery, in days.</p>
                </div>

                <div>
                  <label className={label}>ETA Max (days)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 4"
                    className={input}
                    value={m.etaDaysMax}
                    onChange={(e) => updateMethod(idx, { etaDaysMax: e.target.value })}
                  />
                  <p className={hint}>Latest expected delivery, in days.</p>
                </div>
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
                <span className="text-xs text-gray-500">
                  If off, customers won’t see this method.
                </span>

                <button
                  type="button"
                  className="ml-auto text-sm text-red-600 hover:underline disabled:text-gray-400"
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
            className="mt-2 px-3 py-2 border rounded text-sm"
            onClick={addMethod}
          >
            + Add method
          </button>
        </section>

        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-black"}`}
        >
          {loading ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
