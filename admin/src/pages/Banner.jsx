import { useEffect, useRef, useState } from "react";
import axios from "axios";

const SECTIONS = ["hero", "promo", "banner-1", "banner-2", "banner-3"];

const AdminBannerUpload = () => {
  const [section, setSection] = useState("hero");
  const [image, setImage] = useState(null);

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  const replaceInputRef = useRef(null);
  const [replaceSection, setReplaceSection] = useState("");

  const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/banner`;

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(BASE);
      setBanners(data.items || []);
    } catch (error) {
      console.error("Fetch banners failed", error);
      alert("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(`${BASE}/${section}`, formData);
      alert(response.data.message || "Upload successful");
      setImage(null);
      await fetchBanners();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (sec) => {
    if (!confirm(`Delete banner for "${sec}"?`)) return;

    try {
      await axios.delete(`${BASE}/${sec}`);
      alert("Deleted!");
      await fetchBanners();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Delete failed: " + (error.response?.data?.message || error.message));
    }
  };

  const openReplacePicker = (sec) => {
    setReplaceSection(sec);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (file) => {
    if (!file || !replaceSection) return;

    const fd = new FormData();
    fd.append("image", file);

    try {
      await axios.post(`${BASE}/${replaceSection}`, fd); // same upload endpoint = replace/edit
      alert("Updated!");
      await fetchBanners();
    } catch (error) {
      console.error("Replace failed", error);
      alert("Replace failed: " + (error.response?.data?.message || error.message));
    } finally {
      setReplaceSection("");
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const getBannerBySection = (sec) => banners.find((b) => b.section === sec);

  return (
    <div className="max-w-6xl mx-auto p-4 mt-10">
      {/* ===== Upload Form ===== */}
      <div className="max-w-md p-4 border rounded mb-10">
        <h2 className="mb-4 text-xl font-bold">Upload / Replace Banner</h2>

        <form onSubmit={handleUpload}>
          <label className="block mb-2 text-sm font-medium">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-2 py-2 mb-4 border rounded"
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="block w-full mb-4"
          />

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Upload
          </button>
        </form>
      </div>

      {/* hidden file input for Replace button on cards */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleReplaceFile(e.target.files?.[0])}
      />

      {/* ===== Banner Manager ===== */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Banner Management</h2>
        <button
          onClick={fetchBanners}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTIONS.map((sec) => {
          const b = getBannerBySection(sec);

          return (
            <div key={sec} className="border rounded-lg overflow-hidden bg-white">
              <div className="p-3 border-b flex items-center justify-between">
                <p className="font-semibold capitalize">{sec}</p>
                <span className="text-xs text-gray-500">
                  {b ? "Uploaded" : "Empty"}
                </span>
              </div>

              <div className="p-4">
                {b?.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={sec}
                    className="w-full h-44 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-44 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openReplacePicker(sec)}
                    className="flex-1 px-3 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    {b ? "Replace" : "Upload"}
                  </button>

                  <button
                    onClick={() => handleDelete(sec)}
                    disabled={!b}
                    className={`flex-1 px-3 py-2 border rounded ${
                      b ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional debug: show raw list */}
      {/* <pre className="mt-8 text-xs">{JSON.stringify(banners, null, 2)}</pre> */}
    </div>
  );
};

export default AdminBannerUpload;
