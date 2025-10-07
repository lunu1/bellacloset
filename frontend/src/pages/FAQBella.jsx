import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function FAQBella() {
  //const heroImg = assets.faq_img || assets.contact_img;

  return (
    <div className="pb-20">
      {/* Page title */}
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"FAQ"} text2={"S"} />
      </div>

      {/* Hero image */}
      {/* <div className="max-w-6xl px-5 mx-auto mt-8">
        <img
          src={heroImg}
          alt="Bella Luxury Closet — FAQs"
          className="w-full rounded-lg object-cover max-h-[420px]"
        />
      </div> */}

      {/* Last updated */}
      <div className="max-w-4xl px-5 mx-auto mt-6 text-sm text-gray-600">
        <p><span className="font-medium">Last Updated:</span> October 2025</p>
      </div>

      {/* FAQ body */}
      <div className="max-w-4xl px-5 mx-auto mt-8 text-gray-700 leading-relaxed">
        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. How does ordering work?</h2>
          <p>
            At Bella Luxury Closet, many of our pieces are sourced upon request. When you place an order,
            your payment method is only authorized—<em>not</em> charged immediately. Our team verifies
            availability within 24 hours through our trusted global network. Once your item is confirmed and
            reserved for you, payment is processed and your order moves into fulfilment.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. What if an item isn’t available?</h2>
          <p>
            In the rare case that an item is unavailable, your authorization will be voided immediately and you
            will not be charged. Our team will offer alternative options or notify you when the desired item
            becomes available again.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Do you hold stock?</h2>
          <p>
            Some items are available for immediate purchase, while others are sourced on demand through our
            verified global partners. This model lets us provide exclusive access to rare and sold-out pieces
            worldwide.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Which payment methods do you accept?</h2>
          <p>
            We accept Credit Cards, Debit Cards, Apple Pay, and Cryptocurrency (Crypto). For international
            clients, payment is coordinated directly once your order has been confirmed.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. When will my payment be processed?</h2>
          <p>
            Your payment is processed after your order has been confirmed and the item is secured for you.
            This typically happens within 24 hours of placing your order request.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Do you ship internationally?</h2>
          <p>
            Yes, we ship worldwide. However, international orders cannot be placed directly through the website.
            Clients outside the UAE should contact us for a personalized quote, which includes insured shipping,
            customs, and any applicable fees.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. What are your delivery times?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">UAE Orders:</span> Typically delivered within 1–3 business days after confirmation.</li>
            <li><span className="font-medium">International Orders:</span> Timelines depend on location and item type; details are provided during your personalized shipping arrangement.</li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Are all items authentic?</h2>
          <p>
            Yes. Every item undergoes a triple-check authentication process by our expert team before shipment.
            Each purchase is accompanied by a formal authenticity report for complete confidence.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Can I return or exchange an item?</h2>
          <p>
            All sales are final. Due to the exclusive and high-value nature of our items, we do not accept
            returns or exchanges. We encourage clients to ask questions or request additional photos before
            completing a purchase.
          </p>
        </section>

        <hr className="my-6" />

        {/* Contact CTA */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Still need help?</h2>
          <p>
            Email us at{" "}
            <a className="underline" href="mailto:info@bellaluxurycloset.com">
              info@bellaluxurycloset.com
            </a>{" "}
            and our team will be happy to assist.
          </p>
        </section>
      </div>

      {/* Newsletter */}
      <div className="max-w-6xl px-5 mx-auto mt-16">
        <NewsletterBox />
      </div>
    </div>
  );
}

export default FAQBella;
