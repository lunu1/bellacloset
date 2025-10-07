import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function PrivacyPolicyBella() {
  //const heroImg = assets.privacy_img || assets.contact_img;

  return (
    <div className="pb-20">
      {/* Page title */}
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"PRIVACY"} text2={"POLICY"} />
      </div>

      {/* Hero image */}
      {/* <div className="max-w-6xl px-5 mx-auto mt-8">
        <img
          src={heroImg}
          alt="Privacy Policy — Bella Luxury Closet"
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
            At Bella Luxury Closet, privacy and discretion are central to our philosophy. This Privacy Policy
            explains how we collect, use, and protect personal information when you visit our website or use our
            services. By engaging with us or providing your information, you consent to the practices outlined below.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. What We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium">Information you provide:</span> name, contact details (email, phone),
              shipping address, and payment-related information. For crypto payments, we may temporarily record the
              wallet identifier required to complete your transaction.
            </li>
            <li>
              <span className="font-medium">Automatically collected:</span> basic technical data such as IP address,
              device type, browser version, and anonymised analytics to help us improve the experience.
            </li>
            <li>
              <span className="font-medium">Third-party data:</span> where needed, information from verified partners
              such as payment processors or authentication experts.
            </li>
          </ul>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Data Use &amp; Retention</h2>
          <p>We use your data only to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Process and fulfil your order,</li>
            <li>Communicate with you about your purchase, and</li>
            <li>Meet essential administrative or accounting requirements.</li>
          </ul>
          <p>
            We retain only what is necessary for these purposes and securely delete or anonymise information once it is
            no longer required.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Payment Processing &amp; Security</h2>
          <p>
            We do not store full credit- or debit-card details on our servers. All transactions are processed through
            PCI-compliant third-party providers or secure crypto wallets. We employ technical and administrative
            safeguards to protect your data from unauthorised access or misuse.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Authentication &amp; Partner Access</h2>
          <p>
            In specific cases, limited information may be shared with trusted partners such as couriers or authentication
            specialists. These parties are bound by confidentiality agreements and can access only the data necessary to
            perform their services.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. No Data Resale or Marketing Distribution</h2>
          <p>
            We will never sell, rent, or share your personal information with third parties for marketing purposes.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal information where
            permitted by law. To make such a request, please contact us using the details below.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Client Privacy Commitment</h2>
          <p>
            At Bella Luxury Closet, we believe luxury should extend to how your privacy is treated — quietly, respectfully,
            and without compromise. We do not store unnecessary data, and all communications are handled with care and
            discretion.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. International Data Handling</h2>
          <p>
            If your order or service involves international fulfilment, your data may be securely transferred outside your
            country of residence. We ensure all partners follow strict privacy standards and appropriate safeguards.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any significant changes will be reflected by an updated
            “Last Updated” date on this page. Continued use of our website after changes means you accept the revised version.
          </p>
        </section>

        <hr className="my-6" />

        {/* Contact */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            For privacy questions or data requests, email{" "}
            <a className="underline" href="mailto:info@bellaluxurycloset.com">
              info@bellaluxurycloset.com
            </a>.
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

export default PrivacyPolicyBella;
