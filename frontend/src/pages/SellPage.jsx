import { useEffect, useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets";

/** ---- GENERAL FORM OPTIONS ---- */
const CATEGORIES = ["Handbag", "Shoes", "Watch", "Jewelry", "Accessory", "Clothing", "Other"];
const CONDITIONS = [
  "I don't know",
  "Unworn",
  "Almost New",
  "Pre-loved (slight signs)",
  "Pre-loved (a few imperfections)",
  "Pre-loved (strong signs of usage)",
];
const AGES = ["Less than 6 months", "6-12 months", "1-2 years", "2-5 years", "5+ years"];
const HEARD_ABOUT = ["Instagram", "Google", "Friend/Referral", "TikTok", "Other"];

export default function SellPage() {
  const [page, setPage] = useState(null);

  // show form only after CTA click
  const [showForm, setShowForm] = useState(false);

  // Steps: 1 details, 2 upload, 3 thank you
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",

    category: "",
    brand: "",
    productName: "",
    model: "",

    size: "",
    condition: "",
    age: "",
    heardAbout: "",
  });

  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/sell-page`;
  const SUBMIT_URL = `${import.meta.env.VITE_BACKEND_URL}/api/sell-requests`;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(BASE);
        setPage(data?.page || null);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [BASE]);

  const canGoNext = () => {
    if (!form.sellerName?.trim()) return false;
    if (!form.sellerEmail?.trim()) return false;
    if (!form.sellerPhone?.trim()) return false;

    if (!form.category) return false;
    if (!form.productName?.trim()) return false;

    return true;
  };

  const openForm = () => {
    setShowForm(true);
    setStep(1);

    setTimeout(() => {
      document.getElementById("sell-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const closeForm = () => {
    setShowForm(false);
    setStep(1);
  };

  const resetAll = () => {
    setForm({
      sellerName: "",
      sellerEmail: "",
      sellerPhone: "",
      category: "",
      brand: "",
      productName: "",
      model: "",
      size: "",
      condition: "",
      age: "",
      heardAbout: "",
    });
    setPhotos([]);
    setStep(1);
    setShowForm(false);
  };

  const onNext = () => {
    if (!canGoNext()) return;
    setStep(2);
  };

  const onPrev = () => setStep(1);

  const onSubmit = async () => {
    if (!photos.length) return alert("Please upload at least 1 photo.");

    try {
      setSubmitting(true);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      photos.forEach((f) => fd.append("images", f));

      await axios.post(SUBMIT_URL, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep(3);
    } catch (e) {
      alert("Submit failed: " + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-20">
      {/* hero image */}
      <div className="w-full overflow-hidden border-b">
        <img
          src={page?.heroImage || assets.about_img}
          alt="Sell With Us"
          className="w-full max-h-[420px] object-cover object-[center_75%]"
        />
      </div>

      {/* description */}
      <div className="max-w-5xl px-5 mx-auto my-10 text-lg leading-relaxed text-gray-700 whitespace-pre-line">
        {page?.description || "No content added yet."}
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="border rounded-2xl p-8 bg-white">
          <h3 className="font-serif text-3xl md:text-4xl text-black">
            Want to sell your product with us?
          </h3>
          <p className="mt-3 text-gray-700 leading-relaxed">
            Submit your item for review. Share details and upload photos — our team will get back to you.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={openForm}
              className="px-10 py-4 bg-black text-white rounded hover:bg-gray-900 transition"
            >
              Sell With Us
            </button>
          </div>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div id="sell-form" className="max-w-5xl mx-auto px-5 mt-12">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="font-serif text-4xl md:text-5xl text-black">
              {step === 1 ? "Product Details" : step === 2 ? "Upload Photos" : ""}
            </h2>

            {step !== 3 && (
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Close
              </button>
            )}
          </div>

          {/* Progress bar */}
          {step !== 3 && (
            <div className="mb-8 relative">
              <div className="h-[3px] w-full bg-gray-300" />
              <div
                className="h-[3px] bg-black absolute top-0 left-0"
                style={{ width: step === 1 ? "25%" : "55%" }}
              />
              <div className="absolute top-[-10px] left-[25%] w-5 h-5 rounded-full border-2 bg-white border-gray-300" />
              <div
                className={`absolute top-[-10px] left-[55%] w-5 h-5 rounded-full border-2 ${
                  step >= 2 ? "bg-black border-black" : "bg-white border-gray-300"
                }`}
              />
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-white">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* seller */}
                <div>
                  <label className="block text-sm mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.sellerName}
                    onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.sellerEmail}
                    onChange={(e) => setForm({ ...form, sellerEmail: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.sellerPhone}
                    onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                    placeholder="+971..."
                  />
                </div>

                {/* product */}
                <div>
                  <label className="block text-sm mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">Brand</label>
                  <input
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Hermès, Chanel, Rolex..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    placeholder="e.g. Sneakers, Bracelet, Bag, Watch..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Model (optional)</label>
                  <input
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="e.g. Speedy 30, Submariner, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Size</label>
                  <input
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="e.g. 38 EU, 30cm, Medium..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Condition</label>
                  <select
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  >
                    <option value="">Select</option>
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">Age</label>
                  <select
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  >
                    <option value="">Select</option>
                    {AGES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">How did you hear about us?</label>
                  <select
                    className="w-full bg-gray-100 px-4 py-4 rounded outline-none"
                    value={form.heardAbout}
                    onChange={(e) => setForm({ ...form, heardAbout: e.target.value })}
                  >
                    <option value="">Select</option>
                    {HEARD_ABOUT.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-10">
                <button
                  onClick={onNext}
                  disabled={!canGoNext()}
                  className={`px-14 py-4 rounded text-white bg-black hover:bg-gray-900 transition ${
                    !canGoNext() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-white">
              <div className="mt-6">
                <label className="block text-sm mb-2">
                  Upload Photos <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                  className="w-full bg-gray-100 px-4 py-4 rounded"
                />

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {photos.map((file, idx) => (
                      <div key={idx} className="border rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-28 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 mt-10">
                <button
                  onClick={onPrev}
                  className="px-10 py-4 border rounded hover:bg-gray-50"
                >
                  Previous
                </button>

                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="px-12 py-4 rounded text-white bg-black hover:bg-gray-900 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="py-16 text-center">
              <h2 className="font-serif text-4xl md:text-6xl">
                Thank you for submitting your item!
              </h2>

              <div className="mt-10">
                <button
                  onClick={resetAll}
                  className="px-12 py-4 bg-black text-white rounded hover:bg-gray-900"
                >
                  SELL ANOTHER
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
