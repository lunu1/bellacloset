import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function FAQBella() {
  const heroImg = assets.faq_img || assets.contact_img;

  return (
    <div>
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"FAQ"} text2={"S"} />
      </div>

      <div className="flex flex-col justify-center gap-10 my-10 lg:flex-row mb-28">
        <img src={heroImg} className="w-full lg:max-w-[550px] rounded" alt="FAQ Bella Closet" />

        <div className="flex flex-col items-start justify-center gap-6 max-w-2xl">
          <div>
            <p className="text-xl font-semibold text-gray-700">Orders & Payments</p>
            <p className="text-gray-600">
              <strong>Which payment methods do you accept?</strong><br />
              Major cards, selected wallets, and COD where available.
            </p>
            <p className="text-gray-600">
              <strong>Can I cancel or change my order?</strong><br />
              Contact us ASAP. If it hasn’t shipped, we’ll try to update/cancel.
            </p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-700">Shipping</p>
            <p className="text-gray-600">
              <strong>How long does delivery take?</strong><br />
              Estimates shown at checkout based on address/method; tracking provided.
            </p>
            <p className="text-gray-600">
              <strong>Express/Same-Day?</strong><br />
              Available in select locations; shown at checkout.
            </p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-700">Returns</p>
            <p className="text-gray-600">
              <strong>Return window?</strong><br />
              Most items within 7 days if unused and in original condition with inclusions.
            </p>
            <p className="text-gray-600">
              <strong>How do I start a return?</strong><br />
              Email <a className="underline" href="mailto:info@bellacloset.com">info@bellacloset.com</a> with your order number.
            </p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-700">Authenticity</p>
            <p className="text-gray-600">
              Every item is checked by specialists. If you believe there’s an issue, contact us immediately.
            </p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-700">Accounts</p>
            <p className="text-gray-600">
              You can check out as guest, but accounts help with order history, wishlists, and faster checkout.
            </p>
          </div>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
}

export default FAQBella;
