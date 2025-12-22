import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import { Link } from "react-router-dom";

function AboutBella() {
  const heroImg = assets.about_img || assets.contact_img;

  return (
    <div>
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="flex flex-col justify-center gap-10 my-10 lg:flex-row mb-28">
        <img src={heroImg} className="w-full lg:max-w-[550px] rounded" alt="About Bella Closet" />

        <div className="flex flex-col items-start justify-center gap-6 max-w-2xl">
          <p className="text-2xl font-semibold text-gray-700">Bella Closet</p>
          <p className="text-gray-600 leading-relaxed">
            Your trusted destination for authenticated luxury and contemporary fashion.
            We curate new and pre-loved bags, shoes, accessories, and ready-to-wear —
            making premium style accessible, sustainable, and fun.
          </p>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">What we believe</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Authenticity first:</strong> Multi-point checks by trained specialists.</li>
              <li><strong>Fair pricing:</strong> Transparent pricing with seasonal offers.</li>
              <li><strong>Delightful experience:</strong> Fast shipping & easy returns.</li>
              <li><strong>Sustainability:</strong> Extending product lifecycles via resale.</li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">How it works</p>
            <ol className="list-decimal pl-5 text-gray-600 space-y-1">
              <li>Source from collectors, verified resellers, and brands.</li>
              <li>Authenticate materials, hardware, codes, and condition.</li>
              <li>List with clear photos, grading, and accurate descriptions.</li>
              <li>Deliver securely with tracking and careful packaging.</li>
            </ol>
          </div>

          <div className="text-gray-600">
            <p className="font-medium text-gray-700">Visit & Contact</p>
            <p>
              Novotel Dubai Al Barsha, API Trio Tower, Office 901, PO Box: 502626<br />
              Phone: 800 BELLA (800 589) · Email: <a className="underline" href="mailto:info@bellacloset.com">info@bellacloset.com</a>
            </p>
          </div>

          <Link
            to="/contact"
            className="px-6 py-3 border border-black hover:bg-black hover:text-white transition"
          >
            Get Support
          </Link>
        </div>
      </div>

      {/* <NewsletterBox /> */}
    </div>
  );
}

export default AboutBella;
