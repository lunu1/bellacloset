import { useEffect, useState } from "react";
import axios from "axios";

export default function PersonalStylistAdmin() {
  const [form, setForm] = useState({
    heroImage: "",
    title1: "PERSONAL",
    title2: "STYLIST",
    pageTitle: "Personal Stylist",
    introHeading: "Welcome ✨",
    introParagraphs: [""],
    whyTitle1: "WHY",
    whyTitle2: "CHOOSE US",
    cards: [
      { heading: "Quality Assurance", text: "..." },
      { heading: "Convenience", text: "..." },
      { heading: "Exceptional Service", text: "..." },
    ],
  });

  // ✅ file state for browsing
  const [heroFile, setHeroFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/personal-stylist`;
  const HERO_UPLOAD = `${import.meta.env.VITE_BACKEND_URL}/api/personal-stylist/hero-image`;

  // fetch existing saved page
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(BASE);
        if (data?.page) {
          const page = data.page;
          setForm((prev) => ({
            ...prev,
            ...page,
            introHeading: page.introHeading || page.introTitle || prev.introHeading,
            introParagraphs:
              Array.isArray(page.introParagraphs) && page.introParagraphs.length
                ? page.introParagraphs
                : prev.introParagraphs,
          }));
        }
      } catch (e) {
        console.log("Fetch failed:", e);
      }
    })();
  }, [BASE]);

  // ✅ Upload hero image (same UX as banner)
  const uploadHeroImage = async () => {
    if (!heroFile) return alert("Please select an image first");

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", heroFile);

      const { data } = await axios.post(HERO_UPLOAD, fd, {
        withCredentials: true,
      });

      if (data?.success) {
        setForm((prev) => ({ ...prev, heroImage: data.imageUrl }));
        setHeroFile(null);
        alert(data.message || "Hero image uploaded");
      } else {
        alert(data?.message || "Upload failed");
      }
    } catch (e) {
      alert("Upload failed: " + (e.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        introTitle: form.introHeading, // backward compatible
      };

      const { data } = await axios.put(BASE, payload, {
        withCredentials: true,
      });

      alert(data?.message || "Saved!");
    } catch (e) {
      alert("Save failed: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Personal Stylist Page</h1>

      <div className="grid gap-4">
        {/* ✅ HERO UPLOAD (FILE BROWSING LIKE BANNER) */}
        <div className="border rounded p-4">
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

          <div className="mt-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
              className="block w-full"
            />

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={uploadHeroImage}
                disabled={uploading}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : form.heroImage ? "Replace" : "Upload"}
              </button>

              {form.heroImage ? (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, heroImage: "" }))}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* PAGE TITLE */}
        <input
          className="border p-2 rounded"
          placeholder="Page Title"
          value={form.pageTitle || ""}
          onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
        />

        {/* TITLE1 TITLE2 */}
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Title 1"
            value={form.title1 || ""}
            onChange={(e) => setForm({ ...form, title1: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Title 2"
            value={form.title2 || ""}
            onChange={(e) => setForm({ ...form, title2: e.target.value })}
          />
        </div>

        {/* INTRO HEADING */}
        <input
          className="border p-2 rounded"
          placeholder="Intro Heading"
          value={form.introHeading || ""}
          onChange={(e) => setForm({ ...form, introHeading: e.target.value })}
        />

        {/* INTRO PARAGRAPHS */}
        <div className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Intro Paragraphs</p>
            <button
              type="button"
              className="px-3 py-1 border rounded"
              onClick={() =>
                setForm({ ...form, introParagraphs: [...form.introParagraphs, ""] })
              }
            >
              + Add
            </button>
          </div>

          <div className="grid gap-2">
            {form.introParagraphs.map((p, idx) => (
              <div key={idx} className="flex gap-2">
                <textarea
                  className="border p-2 rounded w-full min-h-[80px]"
                  value={p}
                  onChange={(e) => {
                    const next = [...form.introParagraphs];
                    next[idx] = e.target.value;
                    setForm({ ...form, introParagraphs: next });
                  }}
                />
                <button
                  type="button"
                  className="px-3 border rounded"
                  onClick={() => {
                    const next = form.introParagraphs.filter((_, i) => i !== idx);
                    setForm({ ...form, introParagraphs: next.length ? next : [""] });
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          className="bg-black text-white px-5 py-2 rounded w-fit"
        >
          Save Page
        </button>
      </div>
    </div>
  );
}
