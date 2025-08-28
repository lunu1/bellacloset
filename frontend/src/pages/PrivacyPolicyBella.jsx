import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function PrivacyPolicyBella() {
  const heroImg = assets.privacy_img || assets.contact_img;

  return (
    <div>
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"PRIVACY"} text2={"POLICY"} />
      </div>

      <div className="flex flex-col justify-center gap-10 my-10 lg:flex-row mb-28">
        <img src={heroImg} className="w-full lg:max-w-[550px] rounded" alt="Privacy at Bella Closet" />

        <div className="flex flex-col items-start justify-center gap-6 max-w-2xl">
          <p className="text-gray-600">
            We respect your privacy. This policy explains what we collect, how we use it,
            and the choices you have.
          </p>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Information we collect</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Account & Orders:</strong> name, email, phone, addresses, order history.</li>
              <li><strong>Payments:</strong> processed by secure gateways; we don’t store full card details.</li>
              <li><strong>Usage:</strong> device info, IP, pages viewed, cookies for analytics/personalization.</li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">How we use data</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Process orders, shipping, and returns.</li>
              <li>Provide support and improve our services.</li>
              <li>Prevent fraud and ensure platform security.</li>
              <li>Send service updates; marketing only with consent (unsubscribe anytime).</li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Sharing</p>
            <p className="text-gray-600">
              With trusted providers (payments, logistics, analytics, support) under strict confidentiality, or when required by law.
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Cookies & analytics</p>
            <p className="text-gray-600">
              Used for core functionality (cart/login), preferences, and analytics. You can control cookies in your browser.
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Your rights</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Access, correct, or delete your data (subject to lawful exceptions).</li>
              <li>Opt out of marketing communications.</li>
              <li>Contact us with any privacy questions at <a className="underline" href="mailto:info@bellacloset.com">info@bellacloset.com</a>.</li>
            </ul>
          </div>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
}

export default PrivacyPolicyBella;
