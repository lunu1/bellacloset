// src/components/checkout/AddressPicker.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";

export default function AddressPicker({ backendUrl, onChange }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [useNew, setUseNew] = useState(false);
  const [draft, setDraft] = useState({
    street: "", city: "", state: "", zip: "", country: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/addresses`, { withCredentials: true });
        const list = res.data.addresses || [];
        setAddresses(list);
      } catch (e) {
        console.error("Failed to fetch addresses", e);
      }
    };
    load();
  }, [backendUrl]);

  useEffect(() => {
    if (!useNew && selectedId) {
      const sel = addresses.find(a => (a._id || a.id) === selectedId) || null;
      onChange?.(sel);
    }
    if (useNew) onChange?.(draft);
  }, [useNew, selectedId, addresses, draft, onChange]);

  // const saveNewAddress = async () => {
  //   const { street, city, state, zip, country } = draft;
  //   if (!street || !city || !state || !zip || !country) {
  //     toast.error("Please fill in all address fields.");
  //     return;
  //   }
  //   try {
  //     const res = await axios.post(`${backendUrl}/api/user/address`, draft, { withCredentials: true });

  //     const created = res.data.address;
  //     setAddresses(prev => [...prev, created]);
  //     setSelectedId(created._id || created.id);
  //     setUseNew(false);
  //     setDraft({ street: "", city: "", state: "", zip: "", country: "" });
  //     toast.success("Address saved!");
  //   } catch (e) {
  //     toast.error("Failed to save address");
  //     console.error(e);
  //   }
  // };

  const saveNewAddress = async () => {
  const { street, city, state, zip, country } = draft;
  if (!street || !city || !state || !zip || !country) {
    toast.error("Please fill in all address fields.");
    return;
  }

  try {
    const res = await axios.post(
      `${backendUrl}/api/user/address`,
      draft,
      { withCredentials: true }
    );

    // Be defensive about the response shape
    const payload = res?.data;
    // Try common shapes: {address}, {data}, plain object
    const created =
      payload?.address ??
      payload?.data ??
     (Array.isArray(payload?.addresses) && payload.addresses.length
        ? payload.addresses[payload.addresses.length - 1]   // assume server appends
        : null);

    if (!created || (!created._id && !created.id)) {
      console.error("Unexpected response shape:", payload);
      toast.error("Address saved, but response was unexpected.");
      // Still refetch to stay consistent
      try {
        const ref = await axios.get(`${backendUrl}/api/user/addresses`, { withCredentials: true });
        const list = ref.data?.addresses ?? [];
        setAddresses(list);
        // Try to pick the last one if we can’t get id
        if (list.length > 0) setSelectedId(list[list.length - 1]._id || list[list.length - 1].id);
      } catch (refErr) {
        console.error("Refetch failed:", refErr);
      }
      setUseNew(false);
      return;
    }

    // Happy path
    setAddresses(prev => [...prev, created]);
    setSelectedId(created._id || created.id);
    setUseNew(false);
    setDraft({ street: "", city: "", state: "", zip: "", country: "" });
    toast.success("Address saved!");
  } catch (e) {
    console.error(e);
    const msg = e?.response?.data?.message || "Failed to save address";
    toast.error(msg);
  }
};


  return (
    <div className="w-full">
      <div className="my-3 text-xl sm:text-2xl">SHIPPING <span className="font-semibold">ADDRESS</span></div>

      <button
        className="mb-4 flex items-center gap-1 text-blue-600 text-sm hover:text-blue-800"
        onClick={() => setUseNew(true)}
      >
        <LuPlus className="w-4 h-4" />
        Add a new address
      </button>

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
                <p className="text-sm text-gray-700">{a.city}</p>
                <p className="text-sm text-gray-700">{a.state}</p>
                <p className="text-sm text-gray-700">{a.zip}</p>
                <p className="text-sm text-gray-700">{a.country}</p>
              </div>
            </label>
          );
        })}
      </div>

      {useNew && (
        <div className="mt-6 border border-gray-300 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">New Address</h3>
          <div className="space-y-3">
            {["street", "city", "state", "zip", "country"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 capitalize mb-1">{field}</label>
                <input
                  placeholder={`Enter ${field}`}
                  value={draft[field]}
                  onChange={(e) => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full border p-2 rounded text-sm"
                />
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
              onClick={() => { setUseNew(false); }}
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
