import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function TermsConditionsBella() {
  //const heroImg = assets.terms_img || assets.contact_img;

  return (
    <div className="pb-20">
      {/* Page title */}
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"TERMS &"} text2={"CONDITIONS"} />
      </div>

      {/* Hero image */}
      {/* <div className="max-w-6xl px-5 mx-auto mt-8">
        <img
          src={heroImg}
          alt="Bella Luxury Closet — Terms & Conditions"
          className="w-full rounded-lg object-cover max-h-[420px]"
        />
      </div> */}

      {/* Last updated */}
      <div className="max-w-4xl px-5 mx-auto mt-6 text-sm text-gray-600">
        <p><span className="font-medium">Last Updated:</span> October 2025</p>
      </div>

      {/* Body */}
      <div className="max-w-4xl px-5 mx-auto mt-8 text-gray-700 leading-relaxed">
        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to Bella Luxury Closet. These Terms &amp; Conditions (“Terms”) govern your
            use of our website and services, as well as any orders or sourcing requests placed
            with us. By accessing our site or confirming an order, you agree to comply with and
            be bound by these Terms.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Orders &amp; Sourcing Requests</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              All orders and sourcing requests must be confirmed in writing (via email or website
              communication) and will include the item details, final price, and any applicable deposit.
            </li>
            <li>
              For custom sourcing requests (items not currently in stock), Bella Luxury Closet leverages
              its global network and trusted relationships to locate each piece.
            </li>
            <li>
              In the rare event that an item cannot be sourced, your deposit will be fully refunded.
            </li>
            <li>
              Once sourcing is confirmed and we proceed with the acquisition, the deposit becomes
              non-refundable and will be fully applied toward the final purchase price of the item.
            </li>
            <li>
              <span className="font-medium">Order Confirmation:</span> All orders are subject to availability and confirmation.
              Your payment method may be authorized at checkout, but payment will only be processed (captured)
              once your item has been verified and confirmed by our team—typically within 24 hours. If an item
              cannot be confirmed, the authorization is released and you will not be charged.
            </li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Pricing, Payment &amp; Fees</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Accepted payment methods: Credit Card, Debit Card, Apple Pay, and Cryptocurrency (Crypto).</li>
            <li>Prices displayed on the website apply to orders shipped within the UAE.</li>
            <li>
              International clients cannot place orders directly through the website. To make an international
              purchase, please contact us so we can assist you personally and provide a tailored quote.
            </li>
            <li>
              Shipping, customs, and insurance for international orders are arranged individually, depending on
              the nature and value of the item.
            </li>
            <li>All international shipments are fully insured.</li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Final Sale — No Returns or Exchanges</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All sales are final. Due to the exclusive nature of our products, we do not accept returns or exchanges.</li>
            <li>
              Clients are encouraged to review all product details carefully, request additional photos, and ask questions
              prior to completing their purchase.
            </li>
            <li>
              Every item is verified, authenticated, and carefully inspected before shipment to ensure accuracy and condition.
            </li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Authentication &amp; Verification</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Every item undergoes a triple-check authentication process by our expert team prior to delivery release.</li>
            <li>Each purchase includes an authenticity report to provide complete confidence in your investment.</li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Shipping &amp; Delivery</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>UAE Orders: Shipped via trusted, insured couriers with care and attention to detail.</li>
            <li>
              International Orders: Shipping, insurance, and customs duties are handled case-by-case and confirmed
              directly with our team before finalizing the order.
            </li>
            <li>We take great care in preparing and dispatching each item to ensure it arrives safely and securely.</li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Bella Luxury Closet’s responsibility is limited to the value of the purchased item.</li>
            <li>We remain committed to handling every transaction with professionalism, care, and discretion.</li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Governing Law &amp; Dispute Resolution</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>These Terms are governed by the laws of the United Arab Emirates (UAE).</li>
            <li>
              Any disputes will be subject to the exclusive jurisdiction of the courts of Dubai, UAE, unless arbitration is
              mutually agreed upon.
            </li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Amendments &amp; Severability</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Bella Luxury Closet may update or modify these Terms at any time. Continued use of the website or services
              after any change constitutes acceptance of the updated Terms.
            </li>
            <li>
              If any clause is found to be invalid or unenforceable, the remaining clauses will continue in full effect.
            </li>
          </ul>
        </section>

        <hr className="my-6" />

        {/* Contact */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            For questions or international purchase assistance, email{" "}
            <a className="underline" href="mailto:info@bellaluxurycloset.com">
              info@bellaluxurycloset.com
            </a>.
          </p>
        </section>
      </div>

      <div className="max-w-6xl px-5 mx-auto mt-16">
        {/* <NewsletterBox /> */}
      </div>
    </div>
  );
}

export default TermsConditionsBella;
