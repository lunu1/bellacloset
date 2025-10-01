// src/components/checkout/AddressPicker.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";

/** Phone helpers (exactly 10 digits) */
const sanitizePhone10 = (raw = "") => String(raw).replace(/\D/g, "").slice(0, 10);
const isValidPhone10 = (raw = "") => /^\d{10}$/.test(sanitizePhone10(raw));

/** Normalize to the new shape your app uses everywhere */
const normalizeAddress = (a) => {
  if (!a) return null;
  return {
    _id: a._id || a.id,
    street: a.street?.trim() || "",
    city: a.city?.trim() || "",
    state: a.state?.trim() || "",
    zip: a.zip?.trim() || "",
    country: a.country?.trim() || "",
    ...(a.phone ? { phone: sanitizePhone10(a.phone) } : {}),
    isDefault: Boolean(a.isDefault),
  };
};

export default function AddressPicker({ backendUrl, onChange }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [useNew, setUseNew] = useState(false);

  const [draft, setDraft] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  /** Fetch existing addresses */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/addresses`, { withCredentials: true });
        const list = Array.isArray(res.data?.addresses) ? res.data.addresses : [];
        setAddresses(list);

        // Preselect default or first
        const def = list.find((a) => a.isDefault) || list[0];
        if (def?._id || def?.id) {
          setSelectedId(def._id || def.id);
          setUseNew(false);
        }
      } catch (e) {
        console.error("Failed to fetch addresses", e);
      }
    };
    load();
  }, [backendUrl]);

  /** Push normalized selection upwards */
  const selectedAddress = useMemo(
    () => addresses.find((a) => (a._id || a.id) === selectedId) || null,
    [addresses, selectedId]
  );

  useEffect(() => {
    if (useNew) {
      onChange?.(normalizeAddress(draft));
    } else if (selectedAddress) {
      onChange?.(normalizeAddress(selectedAddress));
    } else {
      onChange?.(null);
    }
  }, [useNew, selectedAddress, draft, onChange]);

  /** Basic inline validation for the draft form */
  const validateDraft = (d) => {
    const e = {};
    if (!d.street.trim()) e.street = "Street is required.";
    if (!d.city.trim()) e.city = "City is required.";
    if (!d.state.trim()) e.state = "State is required.";
    if (!d.zip.trim()) e.zip = "ZIP/Postal code is required.";
    if (!d.country.trim()) e.country = "Country is required.";
    if (d.phone) {
      if (!isValidPhone10(d.phone)) e.phone = "Phone must be exactly 10 digits.";
    }
    return e;
  };

  /** Save a brand new address */
  const saveNewAddress = async () => {
    const v = { ...draft, phone: draft.phone ? sanitizePhone10(draft.phone) : "" };
    const e = validateDraft(v);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the errors in the address form.");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/user/address`, v, { withCredentials: true });

      // Backend usually returns {success, addresses:[...]}. Fall back defensively.
      let nextList = Array.isArray(res.data?.addresses) ? res.data.addresses : [];
      if (!nextList.length) {
        // try to refetch if the response shape is unexpected
        const ref = await axios.get(`${backendUrl}/api/user/addresses`, { withCredentials: true });
        nextList = Array.isArray(ref.data?.addresses) ? ref.data.addresses : [];
      }

      setAddresses(nextList);

      // pick the one that looks new (last is OK if server appends)
      const last = nextList[nextList.length - 1];
      const newId = last?._id || last?.id || null;
      if (newId) {
        setSelectedId(newId);
        setUseNew(false);
      }

      // reset draft
      setDraft({ street: "", city: "", state: "", zip: "", country: "", phone: "" });
      setErrors({});
      toast.success("Address saved!");
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Failed to save address";
      toast.error(msg);
    }
  };

  return (
    <div className="w-full">
      <div className="my-3 text-xl sm:text-2xl">
        SHIPPING <span className="font-semibold">ADDRESS</span>
      </div>

      <button
        className="mb-4 flex items-center gap-1 text-blue-600 text-sm hover:text-blue-800"
        onClick={() => {
          setUseNew(true);
          setSelectedId(null);
        }}
      >
        <LuPlus className="w-4 h-4" />
        Add a new address
      </button>

      {/* Existing addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((a) => {
          const id = a._id || a.id;
          const checked = selectedId === id && !useNew;
          return (
            <label
              key={id}
              className={`p-4 border rounded shadow-sm cursor-pointer flex gap-3 ${
                checked ? "border-gray-400 bg-gray-200" : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="shippingAddress"
                value={id}
                checked={checked}
                onChange={() => {
                  setSelectedId(id);
                  setUseNew(false);
                }}
                className="mt-1"
              />
              <div>
                <p className="font-semibold">{a.street}</p>
                <p className="text-sm text-gray-700">
                  {[a.city, a.state, a.zip].filter(Boolean).join(", ")}
                </p>
                <p className="text-sm text-gray-700">{a.country}</p>
                {a.phone ? <p className="text-sm text-gray-700 mt-1">Phone: {sanitizePhone10(a.phone)}</p> : null}
                {a.isDefault ? (
                  <span className="mt-1 inline-block text-xs text-green-700 font-semibold">(Default)</span>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>

      {/* New address form */}
      {useNew && (
        <div className="mt-6 border border-gray-300 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">New Address</h3>
          <div className="space-y-3">
            {[
              { key: "street", label: "Street" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "zip", label: "ZIP/Postal code" },
              { key: "country", label: "Country" },
              { key: "phone", label: "Phone (optional, 10 digits)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  placeholder={`Enter ${key}`}
                  value={draft[key] || ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [key]: key === "phone" ? sanitizePhone10(e.target.value) : e.target.value,
                    }))
                  }
                  onBlur={() => setErrors(validateDraft(draft))}
                  className={`w-full border p-2 rounded text-sm ${
                    errors[key] ? "border-red-400" : "border-gray-300"
                  }`}
                  inputMode={key === "phone" ? "tel" : undefined}
                />
                {errors[key] ? <p className="text-xs text-red-600 mt-1">{errors[key]}</p> : null}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={saveNewAddress}
              className="px-4 py-2 mt-4 text-white bg-black hover:bg-gray-800 rounded text-sm"
            >
              Save Address
            </button>
            <button
              onClick={() => {
                setUseNew(false);
                setErrors({});
              }}
              className="px-4 py-2 mt-4 text-gray-700 hover:bg-gray-200 rounded text-sm border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
