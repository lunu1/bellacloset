// src/components/checkout/AddressPicker.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import { sanitizePhoneInput, isValidUaePhone } from "../../utils/validators";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Fujairah",
  "Ras Al Khaimah",
  "Umm Al Quwain",
];

// Normalize to UAE shape used everywhere
const normalizeAddress = (a) => {
  if (!a) return null;
  return {
    _id: a._id || a.id,

    label: a.label?.trim() || "",
    fullName: a.fullName?.trim() || "",
    email: a.email?.trim() || "",   

    phone: a.phone?.trim() || "",

    addressType: a.addressType || "apartment",

    unitNumber: a.unitNumber?.trim() || "",
    buildingName: a.buildingName?.trim() || "",
    street: a.street?.trim() || "",
    area: a.area?.trim() || "",
    city: a.city?.trim() || "",
    emirate: a.emirate?.trim() || "",

    landmark: a.landmark?.trim() || "",
    poBox: a.poBox?.trim() || "",
    postalCode: a.postalCode?.trim() || "",

    isDefault: Boolean(a.isDefault),
  };
};

/** ---------------------------
 *  Guest address storage
 *  --------------------------- */
const GUEST_KEY = "guest_shipping_addresses";

const readGuestAddresses = () => {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const writeGuestAddresses = (arr) => {
  localStorage.setItem(GUEST_KEY, JSON.stringify(arr));
};

export default function AddressPicker({ backendUrl, onChange, isLoggedin }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [useNew, setUseNew] = useState(false);

  const [draft, setDraft] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    addressType: "apartment",
    unitNumber: "",
    buildingName: "",
    street: "",
    area: "",
    city: "",
    emirate: "",
    landmark: "",
    poBox: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState({});

  /** ---------------------------
   *  Fetch existing addresses
   *  - Logged-in: from backend
   *  - Guest: from localStorage
   *  --------------------------- */
  useEffect(() => {
    const load = async () => {
      // ✅ Guest mode
      if (!isLoggedin) {
        const list = readGuestAddresses();
        setAddresses(list);

        const def = list.find((a) => a.isDefault) || list[0];
        if (def?._id || def?.id) {
          setSelectedId(def._id || def.id);
          setUseNew(false);
        } else {
          setUseNew(true);
          setSelectedId(null);
        }
        return;
      }

      // ✅ Logged-in mode
      try {
        const res = await axios.get(`${backendUrl}/api/user/addresses`, {
          withCredentials: true,
        });

        const list = Array.isArray(res.data?.addresses) ? res.data.addresses : [];
        setAddresses(list);

        const def = list.find((a) => a.isDefault) || list[0];
        if (def?._id || def?.id) {
          setSelectedId(def._id || def.id);
          setUseNew(false);
        } else {
          setUseNew(true);
          setSelectedId(null);
        }
      } catch (e) {
        // If backend denies, don't spam guest with toast
        console.error("Failed to fetch addresses", e);
      }
    };

    load();
  }, [backendUrl, isLoggedin]);

  /** ---------------------------
   *  Selected address
   *  --------------------------- */
  const selectedAddress = useMemo(
    () => addresses.find((a) => (a._id || a.id) === selectedId) || null,
    [addresses, selectedId]
  );

  /** ---------------------------
   *  Push normalized selection upwards
   *  --------------------------- */
  useEffect(() => {
    if (useNew) onChange?.(normalizeAddress(draft));
    else if (selectedAddress) onChange?.(normalizeAddress(selectedAddress));
    else onChange?.(null);
  }, [useNew, selectedAddress, draft, onChange]);

  /** ---------------------------
   *  Validate draft
   *  --------------------------- */
  const validateDraft = (d) => {
    const e = {};
    if (!d.fullName.trim()) e.fullName = "Full name is required.";
    if (!d.email.trim()) e.email = "Email is required.";
else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
  e.email = "Enter a valid email address.";

    if (!d.phone.trim()) e.phone = "Phone is required.";
    else if (!isValidUaePhone(d.phone))
      e.phone = "Enter a valid UAE mobile (05XXXXXXXX or +9715XXXXXXXX).";

    if (!d.unitNumber.trim()) e.unitNumber = "Unit number is required.";
    if (!d.buildingName.trim()) e.buildingName = "Building name is required.";
    if (!d.area.trim()) e.area = "Area / community is required.";
    if (!d.city.trim()) e.city = "City is required.";
    if (!d.emirate.trim()) e.emirate = "Emirate is required.";

    if (d.emirate && !EMIRATES.includes(d.emirate))
      e.emirate = "Select a valid emirate.";

    if (d.addressType && !["apartment", "villa", "office"].includes(d.addressType))
      e.addressType = "Invalid address type.";

    return e;
  };

  /** ---------------------------
   *  Save new address
   *  - Logged-in: POST to backend
   *  - Guest: save to localStorage
   *  --------------------------- */
  const saveNewAddress = async () => {
    const v = {
      ...draft,
      phone: sanitizePhoneInput(draft.phone),
    };

    const e = validateDraft(v);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fill in the highlighted fields to continue.");
      return;
    }

    // ✅ Guest save (no token required)
    if (!isLoggedin) {
      const normalized = normalizeAddress({
        ...v,
        _id: `guest_${Date.now()}`,
        isDefault: true,
      });

      const prev = readGuestAddresses().map((a) => ({
        ...a,
        isDefault: false,
      }));

      const nextList = [normalized, ...prev];

      writeGuestAddresses(nextList);
      setAddresses(nextList);

      setSelectedId(normalized._id);
      setUseNew(false);

      // Reset form
      setDraft({
        label: "Home",
        fullName: "",
        phone: "",
        addressType: "apartment",
        unitNumber: "",
        buildingName: "",
        street: "",
        area: "",
        city: "",
        emirate: "",
        landmark: "",
        poBox: "",
        postalCode: "",
      });

      setErrors({});
      toast.success("Address saved!");
      return;
    }

    // ✅ Logged-in save (server)
    try {
      const res = await axios.post(`${backendUrl}/api/user/address`, v, {
        withCredentials: true,
      });

      let nextList = Array.isArray(res.data?.addresses) ? res.data.addresses : [];

      // Fallback refresh if API doesn't return list
      if (!nextList.length) {
        const ref = await axios.get(`${backendUrl}/api/user/addresses`, {
          withCredentials: true,
        });
        nextList = Array.isArray(ref.data?.addresses) ? ref.data.addresses : [];
      }

      setAddresses(nextList);

      const last = nextList[nextList.length - 1];
      const newId = last?._id || last?.id || null;
      if (newId) {
        setSelectedId(newId);
        setUseNew(false);
      }

      // reset draft
      setDraft({
        label: "Home",
        fullName: "",
        email: "",  
        phone: "",
        addressType: "apartment",
        unitNumber: "",
        buildingName: "",
        street: "",
        area: "",
        city: "",
        emirate: "",
        landmark: "",
        poBox: "",
        postalCode: "",
      });

      setErrors({});
      toast.success("Address saved!");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Please login to save address." : "Failed to save address");
      toast.error(msg);
    }
  };

  const renderLine = (a) => {
    const line1 = `${a.unitNumber ? a.unitNumber + ", " : ""}${a.buildingName || ""}`.trim();
    const line2 = [a.street, a.area, a.city].filter(Boolean).join(", ");
    const line3 = [a.emirate, a.postalCode].filter(Boolean).join(" · ");
    return { line1, line2, line3 };
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
        type="button"
      >
        <LuPlus className="w-4 h-4" />
        Add a new address
      </button>

      {/* Existing addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((raw) => {
          const a = normalizeAddress(raw);
          const id = a?._id;
          const checked = selectedId === id && !useNew;
          const { line1, line2, line3 } = renderLine(a || {});
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
                <p className="font-semibold">{a.fullName || "—"}</p>
                {a.phone ? <p className="text-sm text-gray-700 mt-1">Phone: {a.phone}</p> : null}

                {line1 ? <p className="text-sm text-gray-800 mt-2">{line1}</p> : null}
                {line2 ? <p className="text-sm text-gray-700">{line2}</p> : null}
                {line3 ? <p className="text-sm text-gray-700">{line3}</p> : null}

                {a.landmark ? (
                  <p className="text-sm text-gray-700 mt-1">Landmark: {a.landmark}</p>
                ) : null}

                {a.isDefault ? (
                  <span className="mt-1 inline-block text-xs text-green-700 font-semibold">
                    (Default)
                  </span>
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
              { key: "label", label: "Label", placeholder: "Home / Office" },
              { key: "fullName", label: "Full Name", placeholder: "Receiver name" },
              { key: "email", label: "Email", placeholder: "you@example.com" },
              {
                key: "phone",
                label: "Phone",
                placeholder: "+9715XXXXXXXX or 05XXXXXXXX",
                phone: true,
              },
            ].map(({ key, label, placeholder, phone }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
  type={key === "email" ? "email" : "text"}   // ✅ ADD
  placeholder={placeholder}
  value={draft[key] || ""}
  onChange={(e) =>
    setDraft((prev) => ({
      ...prev,
      [key]: phone ? sanitizePhoneInput(e.target.value) : e.target.value,
    }))
  }
  onBlur={() => setErrors(validateDraft(draft))}
  className={`w-full border p-2 rounded text-sm ${
    errors[key] ? "border-red-400" : "border-gray-300"
  }`}
  inputMode={phone ? "tel" : undefined}
/>

                {errors[key] ? <p className="text-xs text-red-600 mt-1">{errors[key]}</p> : null}
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Address Type</label>
              <select
                value={draft.addressType}
                onChange={(e) => setDraft((p) => ({ ...p, addressType: e.target.value }))}
                className={`w-full border p-2 rounded text-sm ${
                  errors.addressType ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="office">Office</option>
              </select>
              {errors.addressType ? (
                <p className="text-xs text-red-600 mt-1">{errors.addressType}</p>
              ) : null}
            </div>

            {[
              { key: "unitNumber", label: "Unit Number", placeholder: "Flat / Villa / Office No." },
              { key: "buildingName", label: "Building Name", placeholder: "Tower / Building / Community" },
              { key: "street", label: "Street (optional)", placeholder: "Street / Road (optional)" },
              { key: "area", label: "Area / Community", placeholder: "Marina, Deira, JLT..." },
              { key: "city", label: "City", placeholder: "Dubai / Abu Dhabi" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  placeholder={placeholder}
                  value={draft[key] || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                  onBlur={() => setErrors(validateDraft(draft))}
                  className={`w-full border p-2 rounded text-sm ${
                    errors[key] ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors[key] ? <p className="text-xs text-red-600 mt-1">{errors[key]}</p> : null}
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-600 mb-1">Emirate</label>
              <select
                value={draft.emirate}
                onChange={(e) => setDraft((p) => ({ ...p, emirate: e.target.value }))}
                onBlur={() => setErrors(validateDraft(draft))}
                className={`w-full border p-2 rounded text-sm ${
                  errors.emirate ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">Select Emirate</option>
                {EMIRATES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              {errors.emirate ? <p className="text-xs text-red-600 mt-1">{errors.emirate}</p> : null}
            </div>

            {[
              { key: "landmark", label: "Landmark (optional)", placeholder: "Near..." },
              { key: "poBox", label: "PO Box (optional)", placeholder: "12345" },
              { key: "postalCode", label: "Postal Code (optional)", placeholder: "Optional" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  placeholder={placeholder}
                  value={draft[key] || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                  onBlur={() => setErrors(validateDraft(draft))}
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={saveNewAddress}
              className="px-4 py-2 mt-4 text-white bg-black hover:bg-gray-800 rounded text-sm"
              type="button"
            >
              Save Address
            </button>
            <button
              onClick={() => {
                setUseNew(false);
                setErrors({});
              }}
              className="px-4 py-2 mt-4 text-gray-700 hover:bg-gray-200 rounded text-sm border"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
