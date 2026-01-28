import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { RefreshCcw } from "lucide-react";

const STATUS = ["new", "reviewed", "approved", "rejected"];

export default function SellAdmin() {
  /** ---------------------------
   *  SELL PAGE CMS STATE
   *  --------------------------- */
  const [form, setForm] = useState({ heroImage: "", description: "" });
  const [heroFile, setHeroFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  /** ---------------------------
   *  SELL REQUESTS STATE
   *  --------------------------- */
  const [items, setItems] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [active, setActive] = useState(null); // modal item
  const [modalOpen, setModalOpen] = useState(false);

  // status UI state
  const [pendingStatus, setPendingStatus] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  /** ---------------------------
   *  API BASES
   *  --------------------------- */
  const PAGE_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/sell-page`;
  const HERO_UPLOAD = `${import.meta.env.VITE_BACKEND_URL}/api/sell-page/hero-image`;
  const REQ_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/sell-requests`;

  /** ---------------------------
   *  INIT: fetch sell page + requests
   *  --------------------------- */
  useEffect(() => {
    fetchSellPage();
    fetchSellRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSellPage = async () => {
    try {
      const { data } = await axios.get(PAGE_BASE);
      if (data?.page) setForm(data.page);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSellRequests = async () => {
    setLoadingReq(true);
    try {
      const { data } = await axios.get(REQ_BASE, { withCredentials: true });
      setItems(data?.items || []);
    } catch (e) {
      alert("Failed to load sell requests: " + (e.response?.data?.message || e.message));
    } finally {
      setLoadingReq(false);
    }
  };

  /** ---------------------------
   *  HERO UPLOAD
   *  --------------------------- */
  const uploadHero = async () => {
    if (!heroFile) return alert("Please select an image");

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", heroFile);

      const { data } = await axios.post(HERO_UPLOAD, fd, { withCredentials: true });

      if (data?.success) {
        setForm((prev) => ({ ...prev, heroImage: data.imageUrl }));
        setHeroFile(null);
        alert(data.message || "Uploaded");
      } else {
        alert(data?.message || "Upload failed");
      }
    } catch (e) {
      alert("Upload failed: " + (e.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  /** ---------------------------
   *  SAVE SELL PAGE
   *  --------------------------- */
  const savePage = async () => {
    try {
      setSaving(true);
      const payload = {
        description: form.description,
        heroImage: form.heroImage,
      };

      const { data } = await axios.put(PAGE_BASE, payload, { withCredentials: true });
      alert(data?.message || "Saved");
    } catch (e) {
      alert("Save failed: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  /** ---------------------------
   *  REQUESTS: modal + status + delete
   *  --------------------------- */
  const openModal = (it) => {
    setActive(it);
    setPendingStatus(it.status); // start with current status
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActive(null);
    setPendingStatus("");
  };

  const updateStatus = async () => {
    if (!active?._id) return;

    // no change → no save
    if (pendingStatus === active.status) return alert("No changes to save.");

    try {
      setStatusSaving(true);

      const adminMessage =
        prompt("Optional message for seller (reason/notes). Leave blank if none:") || "";

      const { data } = await axios.patch(
        `${REQ_BASE}/${active._id}/status`,
        { status: pendingStatus, adminMessage },
        { withCredentials: true }
      );

      alert(data?.message || "Updated");

      // update list + modal item
      setItems((prev) => prev.map((x) => (x._id === active._id ? data.item : x)));
      setActive(data.item);
      setPendingStatus(data.item.status);
    } catch (e) {
      alert("Status update failed: " + (e.response?.data?.message || e.message));
    } finally {
      setStatusSaving(false);
    }
  };

  const deleteRequest = async (id) => {
    if (!confirm("Delete this sell request?")) return;

    try {
      const { data } = await axios.delete(`${REQ_BASE}/${id}`, { withCredentials: true });
      alert(data?.message || "Deleted");

      setItems((prev) => prev.filter((x) => x._id !== id));
      if (active?._id === id) closeModal();
    } catch (e) {
      alert("Delete failed: " + (e.response?.data?.message || e.message));
    }
  };

  const counts = useMemo(() => {
    return items.reduce((acc, it) => {
      acc[it.status] = (acc[it.status] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Sell Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage Sell Page content + view Sell submissions
          </p>
        </div>

        <button
          onClick={() => {
            fetchSellPage();
            fetchSellRequests();
          }}
          className="p-2 border rounded hover:bg-gray-50"
          title="Refresh All"
          aria-label="Refresh All"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* ---------------- SELL PAGE CMS ---------------- */}
      <div className="border rounded-2xl bg-white p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sell Page Content</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold mb-3">Hero Image</h3>

            {form.heroImage ? (
              <img
                src={form.heroImage}
                alt="Hero"
                className="w-full h-44 object-cover rounded border"
              />
            ) : (
              <div className="w-full h-44 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="block w-full mt-3"
              onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
            />

            <button
              type="button"
              onClick={uploadHero}
              disabled={uploading}
              className="mt-3 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-60"
            >
              {uploading ? "Uploading..." : form.heroImage ? "Replace" : "Upload"}
            </button>
          </div>

          <div className="border rounded-xl p-4">
            <h3 className="font-semibold mb-3">Description</h3>

            <textarea
              className="border p-3 rounded w-full min-h-[220px]"
              placeholder="Write your Sell page description..."
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <button
              onClick={savePage}
              disabled={saving}
              className="mt-3 bg-black text-white px-5 py-2 rounded disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Page"}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- SELL REQUESTS ---------------- */}
      <div className="border rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Sell Requests</h2>
            <p className="text-sm text-gray-500 mt-1">
              New: {counts.new || 0} • Reviewed: {counts.reviewed || 0} • Approved:{" "}
              {counts.approved || 0} • Rejected: {counts.rejected || 0}
            </p>
          </div>

          <button
            onClick={fetchSellRequests}
            disabled={loadingReq}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-60"
            title={loadingReq ? "Refreshing..." : "Refresh Requests"}
            aria-label="Refresh Requests"
          >
            <RefreshCcw className={`w-5 h-5 ${loadingReq ? "animate-spin" : ""}`} />
          </button>
        </div>

        {!items.length && !loadingReq && <p className="text-gray-500">No sell submissions found.</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <div key={it._id} className="border rounded-xl overflow-hidden">
              <div className="h-44 bg-gray-100">
                {it.images?.[0] ? (
                  <img src={it.images[0]} alt="" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {it.brand} • {it.model}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {it.condition || "-"} • {it.age || "-"}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded border capitalize bg-gray-50">
                    {it.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openModal(it)}
                    className="flex-1 px-3 py-2 bg-black text-white rounded hover:bg-gray-900"
                  >
                    View
                  </button>

                  <button
                    onClick={() => deleteRequest(it._id)}
                    className="px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- MODAL ---------------- */}
      {modalOpen && active && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {active.brand} • {active.model}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(active.createdAt).toLocaleString()}
                </p>
              </div>

              <button onClick={closeModal} className="px-3 py-1 border rounded">
                Close
              </button>
            </div>

            <div className="p-5 grid md:grid-cols-2 gap-5">
              {/* details */}
              <div className="border rounded-xl p-4">
                <p className="font-medium mb-3">Details</p>

                <div className="text-sm text-gray-700 grid gap-2">
                  <p><b>Seller:</b> {active.sellerName || "-"}</p>
                  <p><b>Email:</b> {active.sellerEmail || "-"}</p>
                  <p><b>Phone:</b> {active.sellerPhone || "-"}</p>
                  <hr className="my-2" />
                  <p><b>Size:</b> {active.size || "-"}</p>
                  <p><b>Condition:</b> {active.condition || "-"}</p>
                  <p><b>Age:</b> {active.age || "-"}</p>
                  <p><b>Heard About:</b> {active.heardAbout || "-"}</p>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={pendingStatus}
                    onChange={(e) => setPendingStatus(e.target.value)}
                    className="w-full mt-2 border rounded px-3 py-2 capitalize"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex w-full flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={updateStatus}
                    disabled={statusSaving || pendingStatus === active.status}
                    className="w-full sm:flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50"
                  >
                    {statusSaving ? "Saving..." : "Save Status"}
                  </button>

                  <button
                    onClick={() => deleteRequest(active._id)}
                    className="w-full sm:flex-1 px-4 py-2 text-white bg-black rounded hover:bg-gray-900"
                  >
                    Delete Submission
                  </button>
                </div>
              </div>

              {/* images */}
              <div className="border rounded-xl p-4">
                <p className="font-medium mb-3">Images</p>

                {active.images?.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {active.images.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-32 object-cover rounded border"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No images.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
