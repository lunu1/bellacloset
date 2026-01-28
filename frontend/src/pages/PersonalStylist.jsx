import { useEffect, useState } from "react";
import axios from "axios";
import Title from "../components/Title";
// import NewsletterBox from "../components/NewsletterBox";
import { assets } from "../assets/assets";

export default function PersonalStylist() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const WHATSAPP_NUMBER = "971556055777";

  // form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });

  const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/personal-stylist`;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(BASE);
        const p = data?.page || null;

        if (p) {
          p.introHeading = p.introHeading || p.introTitle || "";
          p.introParagraphs = Array.isArray(p.introParagraphs)
            ? p.introParagraphs
            : [];
          p.cards = Array.isArray(p.cards) ? p.cards : [];
        }

        setPage(p);
      } catch (e) {
        console.log("Fetch personal stylist failed:", e);
        setPage(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [BASE]);

  const onChange = (e) => {
    setFormStatus({ type: "", message: "" });
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return "Please enter a valid email.";
    if (!form.phone.trim()) return "Please enter your phone number.";
    if (form.phone.trim().length < 7) return "Please enter a valid phone number.";
    return "";
  };

  const submitInquiry = async (e) => {
  e.preventDefault();
  const err = validate();
  if (err) {
    setFormStatus({ type: "error", message: err });
    return;
  }

  // ✅ Create WhatsApp message
  const text = `
Personal Stylist Inquiry
------------------------
Name: ${form.name.trim()}
Email: ${form.email.trim()}
Phone: ${form.phone.trim()}
Message: ${form.message.trim() || "-"}
`.trim();

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  // ✅ Open WhatsApp (new tab)
  window.open(url, "_blank", "noopener,noreferrer");

  // Optional: show UI success + clear
  setFormStatus({
  type: "success",
  message: "Thank you! We’ll get back to you shortly.",
});

  setForm({ name: "", email: "", phone: "", message: "" });
};


  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="pb-16">
      {/* hero image */}
      <div className="w-full overflow-hidden border-b">
        <img
          src={page?.heroImage || assets.about_img}
          alt="Personal Stylist"
          className="w-full max-h-[520px] object-cover object-center"
        />
      </div>

      {/* title */}
      <div className="pt-8 text-4xl text-center">
        <Title text1={page?.title1 || "PERSONAL"} text2={page?.title2 || "STYLIST"} />
      </div>

      {/* intro */}
      <div className="max-w-5xl px-5 mx-auto my-10 text-lg leading-relaxed text-gray-700">
        {page?.introHeading ? (
          <p className="mb-4">
            <span className="font-semibold">{page.introHeading}</span>
          </p>
        ) : null}

        {(page?.introParagraphs || []).map((p, i) => (
          <p key={i} className="mb-4">
            {p}
          </p>
        ))}
      </div>

      {/* INQUIRE FORM */}
      <div className="max-w-5xl px-5 mx-auto">
        <div className="border rounded-2xl p-6 md:p-8 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <h3 className="text-2xl font-semibold text-black">Inquire Now</h3>
              <p className="text-gray-600 mt-2">
                Share your details and we’ll get back to you to proceed with Personal Styling.
              </p>
            </div>

            {/* <div className="text-sm text-gray-500 md:text-right">
              <p className="font-medium text-black">Response time</p>
              <p>Usually within 24 hours</p>
            </div> */}
          </div>

          <form onSubmit={submitInquiry} className="mt-6 grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Your name"
                  className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Phone number"
                  className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700">Message (optional)</label>
                <input
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  placeholder="Any preference / occasion / budget..."
                  className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            {formStatus.message ? (
              <div
                className={`text-sm rounded-xl px-4 py-3 ${
                  formStatus.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {formStatus.message}
              </div>
            ) : null}

            <div className="flex items-center gap-3 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-black/90 transition disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Inquire Now"}
              </button>

              {/* <p className="text-xs text-gray-500">
                By submitting, you agree to be contacted about your inquiry.
              </p> */}
            </div>
          </form>
        </div>
      </div>

      {/* <NewsletterBox /> */}
    </div>
  );
}
