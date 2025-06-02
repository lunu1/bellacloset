import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

function About() {
  return (
    <div>
      <div className="pt-8 text-4xl text-center border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>
      <div className="flex flex-col gap-16 my-10 lg:flex-row">
        <img
          src={assets.about_img}
          alt=""
          className="w-full lg:max-w-[500px]"
        />
        <div className="flex flex-col justify-center w-full gap-6 text-lg text-gray-700">
          <p>
          CEKIR was founded with a deep passion for craftsmanship and a commitment to enriching the spiritual experience of every home. Our journey began with a simple vision: to offer a collection of high-quality prayer mats that blend tradition, comfort, and elegance.
          </p>
          <p>
          Since our inception, we&apos;ve been dedicated to curating a selection of prayer mats that cater to different styles and preferences. From classic designs to modern aesthetics, each mat is crafted with care using premium materials, ensuring both durability and comfort.

          </p>
          <b className="text-xl text-gray-800">Our Mission</b>
          <p>
          At CEKIR, our mission is to provide prayer mats that inspire serenity and devotion. We are committed to offering a seamless shopping experience, from browsing and ordering to swift delivery. Whether for personal use or as a thoughtful gift, our prayer mats are designed to bring warmth and spirituality into every prayer moment.
          </p>
        </div>
      </div>
      <div className="py-4 text-3xl">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>
      <div className="flex flex-col mb-20 text-lg md:flex-row">
        <div className="flex flex-col gap-5 px-10 py-8 border md:px-16 sm:py-20">
          <b>Quality Assurance:</b>
          <p className="text-base text-gray-600">
            We meticulously select and vet each product to ensure it meets our
            stringent quality standards.
          </p>
        </div>
        <div className="flex flex-col gap-5 px-10 py-8 border md:px-16 sm:py-20">
          <b>Convenience:</b>
          <p className="text-base text-gray-600">
            With our user-friendly interface and hassle-free ordering process,
            shopping has never been easier.
          </p>
        </div>
        <div className="flex flex-col gap-5 px-10 py-8 border md:px-16 sm:py-20">
          <b>Exceptional Customer Service:</b>
          <p className="text-base text-gray-600">
            Our team of dedicated professionals is here to assist you the way,
            ensuring your satisfaction is our top priority.
          </p>
        </div>
      </div>
      <NewsletterBox />
    </div>
  );
}

export default About;
