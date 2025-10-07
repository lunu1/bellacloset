import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function About() {
  return (
    <div className="pb-16">
      {/* Top hero image */}
      <div className="w-full overflow-hidden border-b">
        <img
          src={assets.about_img}
          alt="About Bella Luxury Closet"
          className="w-full max-h-[520px] object-cover"
        />
      </div>

      {/* Title BELOW the image */}
      <div className="pt-8 text-4xl text-center">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      {/* Main copy */}
      <div className="max-w-5xl px-5 mx-auto my-10 text-lg leading-relaxed text-gray-700">
        <p className="mb-4">
          <span className="font-semibold">Welcome to Bella Luxury Closet ✨</span>
        </p>

        <p className="mb-4">
          Born from a shared passion for timeless style, Bella Luxury Closet was
          created by Isabella and her mother, Bella, to redefine how luxury is
          experienced. We specialize in sourcing the rare, the refined, and the
          pieces that define individuality — from handbags and fine jewelry to
          watches, ready-to-wear, and beyond.
        </p>

        <p className="mb-4">
          With a global network and trusted relationships across the world’s
          leading fashion houses and boutiques, we provide our clients with
          exclusive access to items that are often unavailable or sold out
          elsewhere. Whether it’s a pair of newly released Chanel shoes, an
          Hermès bag from a limited drop, or a special piece you’ve been
          searching for — we make it happen.
        </p>

        <p className="mb-4">
          Based in Dubai, we proudly serve clients worldwide and offer
          international shipping upon request. Each sourcing experience is
          handled with care, discretion, and attention to detail — ensuring that
          every client feels understood, valued, and inspired.
        </p>

        <p className="mb-2 font-semibold">
          At Bella Luxury Closet, we make the impossible possible — bringing the
          world’s most desired pieces within reach.
        </p>

        <p className="italic text-gray-800">
          Bella Luxury Closet — Curated. Desired. Delivered.
        </p>
      </div>

      {/* WHY CHOOSE US */}
      <div className="py-4 text-3xl">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="grid max-w-6xl gap-6 px-5 mx-auto mb-20 md:grid-cols-3">
        <div className="flex flex-col gap-3 p-8 transition border rounded-xl hover:shadow-md">
          <b>Quality Assurance</b>
          <p className="text-base text-gray-600">
            We meticulously select and vet each piece to ensure it meets our
            stringent quality standards.
          </p>
        </div>
        <div className="flex flex-col gap-3 p-8 transition border rounded-xl hover:shadow-md">
          <b>Convenience</b>
          <p className="text-base text-gray-600">
            A smooth, concierge-style sourcing and ordering experience — from
            request to delivery.
          </p>
        </div>
        <div className="flex flex-col gap-3 p-8 transition border rounded-xl hover:shadow-md">
          <b>Exceptional Service</b>
          <p className="text-base text-gray-600">
            Dedicated, discreet, and detail-oriented support to make every
            client feel understood and valued.
          </p>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
}

export default About;
