import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function DeliveryReturnsBella() {
  const heroImg = assets.delivery_img || assets.contact_img;

  return (
    <div>
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"DELIVERY &"} text2={"RETURNS"} />
      </div>

      <div className="flex flex-col justify-center gap-10 my-10 lg:flex-row mb-28">
        <img src={heroImg} className="w-full lg:max-w-[550px] rounded" alt="Delivery & Returns" />

        <div className="flex flex-col items-start justify-center gap-6 max-w-2xl">
          <div>
            <p className="text-xl font-semibold text-gray-700">Shipping</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Processing:</strong> 1–2 business days for verification & packing.</li>
              <li><strong>Options:</strong> Standard, Express, Same-Day (where available).</li>
              <li><strong>Tracking:</strong> Link sent when your order ships.</li>
              <li><strong>Duties/Taxes:</strong> May apply for international deliveries.</li>
            </ul>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-700">Returns</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li><strong>Window:</strong> Request within 7 days of delivery.</li>
              <li><strong>Condition:</strong> Unused, with tags, authenticity cards, dust bags, and all inclusions.</li>
              <li><strong>Non-returnable:</strong> Final-sale items, earrings, beauty, made-to-order, or items marked non-returnable.</li>
              <li><strong>Refunds:</strong> To original payment method after inspection (typically 5–10 business days from receipt).</li>
              <li><strong>Exchanges:</strong> Subject to availability; contact support.</li>
            </ul>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-700">Damaged or incorrect</p>
            <p className="text-gray-600">
              Report within 48 hours with photos and your order number for a prioritized replacement or refund.
            </p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-700">How to start a return</p>
            <ol className="list-decimal pl-5 text-gray-600 space-y-1">
              <li>Email <a className="underline" href="mailto:info@bellacloset.com">info@bellacloset.com</a> with order number & reason.</li>
              <li>Receive instructions and, where eligible, a return label.</li>
              <li>Pack securely with all inclusions and drop off as instructed.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* <NewsletterBox /> */}
    </div>
  );
}

export default DeliveryReturnsBella;
