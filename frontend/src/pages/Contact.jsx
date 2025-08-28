import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function Contact() {
  return (
    <div>
      {/* Page Title */}
      <div className="pt-10 text-3xl text-center border-t">
        <Title text1={"GET IN"} text2={"TOUCH"} />
      </div>

      {/* Hero / Intro */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <p className="text-center text-gray-600">
          Have a question about an order, returns, or authentication?
          We’re here to help — reach out to Bella Closet and we’ll respond promptly.
        </p>
      </div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-12 mb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <img
            src={assets.about_img}
            alt="Contact Bella Closet"
            className="w-full rounded-xl shadow-sm lg:max-w-[580px] justify-self-center"
          />

          {/* Info + Form */}
          <div className="flex flex-col gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800">Bella Closet — Support</h3>
              <p className="text-gray-600">
                Novotel Dubai Al Barsha, API Trio Tower, Office 901<br />
                PO Box: 502626
              </p>
              <p className="text-gray-600">
                Phone: 800 BELLA (800 589)<br />
                Email: <a href="mailto:info@bellacloset.com" className="underline">info@bellacloset.com</a>
              </p>
              <p className="text-gray-600">
                Hours: Mon–Fri 9 AM–8 PM GST · Sat 10 AM–8 PM GST · Sun Closed
              </p>
            </div>

            {/* Quick Support Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Order Help</p>
                <p className="font-medium">Track & Returns</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Authenticity</p>
                <p className="font-medium">Expert Verified</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Response</p>
                <p className="font-medium">Fast & Friendly</p>
              </div>
            </div>

           
           
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <NewsletterBox />
    </div>
  );
}

export default Contact;
