import Hero from "../components/Hero";
// import LatestCollection from "../components/LatestCollection";
// import BestSeller from "../components/BestSeller";
// import OurPolicy from "../components/OurPolicy";
 import NewsletterBox from "../components/NewsletterBox";
import ShopbyCategory from "../components/ShopbyCategory";
import Bannersection from "../components/Bannersection";
import FeaturesSection from "../components/Countonus";
import NewsletterSignup from "../components/NewsletterSignup";

function Home() {
  return (
    <div>
      <Hero />
      <ShopbyCategory/>
      <Bannersection/>
      {/* <LatestCollection /> */}
      {/* <BestSeller /> */}
      {/* <FeaturesSection/> */}
      {/* <OurPolicy /> */}
      {/* <NewsletterBox /> */}
      <NewsletterSignup />
    </div>
  );
}

export default Home;
