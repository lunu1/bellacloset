import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import { Link } from "react-router-dom";

function TermsConditionsBella() {
  const heroImg = assets.terms_img || assets.contact_img;

  return (
    <div>
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"TERMS &"} text2={"CONDITIONS"} />
      </div>

      <div className="flex flex-col justify-center gap-10 my-10 lg:flex-row mb-28">
        <img src={heroImg} className="w-full lg:max-w-[550px] rounded" alt="Bella Closet Terms" />

        <div className="flex flex-col items-start justify-center gap-6 max-w-2xl">
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">1. Overview</p>
            <p className="text-gray-600">By using our site or purchasing, you agree to these Terms.</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">2. Accounts</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Provide accurate info and keep credentials secure.</li>
              <li>You’re responsible for activity under your account.</li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">3. Products & Pricing</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>We aim for listing accuracy; minor errors may occur and be corrected.</li>
              <li>Prices/availability may change without notice.</li>
              <li>Pre-loved items include condition grades and photos.</li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">4. Orders</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Confirmation isn’t acceptance; we may cancel/refund for stock, pricing, or fraud concerns.</li>
              <li>Risk passes on delivery; title on full payment.</li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">5. Shipping & Returns</p>
            <p className="text-gray-600">
              See <Link className="underline" to="/delivery-returns">Delivery & Returns</Link> for details.
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">6. Authenticity</p>
            <p className="text-gray-600">Inspected by specialists. If authenticity is reasonably disputed, contact us promptly.</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">7. Prohibited Use</p>
            <p className="text-gray-600">No fraud, scraping, security interference, or IP infringement.</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">8. Liability</p>
            <p className="text-gray-600">
              To the maximum extent permitted by law, we’re not liable for indirect or consequential losses.
              Our total liability is limited to the amount paid for the relevant order.
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">9. IP</p>
            <p className="text-gray-600">Site content belongs to Bella Closet or licensors. No reproduction without permission.</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">10. Changes & Contact</p>
            <p className="text-gray-600">
              We may update these Terms. Questions? <a className="underline" href="mailto:info@bellacloset.com">info@bellacloset.com</a>
            </p>
          </div>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
}

export default TermsConditionsBella;
