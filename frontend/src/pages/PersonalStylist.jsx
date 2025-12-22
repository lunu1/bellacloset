import { useEffect, useState } from "react";
import axios from "axios";
import Title from "../components/Title";
import NewsletterBox from "../components/NewsletterBox";
import { assets } from "../assets/assets";

export default function PersonalStylist() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/personal-stylist`;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(BASE);
        const p = data?.page || null;

        if (p) {
          p.introHeading = p.introHeading || p.introTitle || "";
          p.introParagraphs = Array.isArray(p.introParagraphs) ? p.introParagraphs : [];
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

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="pb-16">
      {/* hero image */}
      <div className="w-full overflow-hidden border-b">
        <img
          src={page?.heroImage || assets.about_img}
          alt="Personal Stylist"
          className="w-full max-h-[520px] object-cover"
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

      {/* why choose us */}
      {/* <div className="py-4 text-3xl">
        <Title text1={page?.whyTitle1 || "WHY"} text2={page?.whyTitle2 || "CHOOSE US"} />
      </div>

      <div className="grid max-w-6xl gap-6 px-5 mx-auto mb-20 md:grid-cols-3">
        {(page?.cards || []).map((c, i) => (
          <div key={i} className="flex flex-col gap-3 p-8 transition border rounded-xl hover:shadow-md">
            <b>{c.heading}</b>
            <p className="text-base text-gray-600">{c.text}</p>
          </div>
        ))}
      </div> */}

      {/* <NewsletterBox /> */}
    </div>
  );
}
