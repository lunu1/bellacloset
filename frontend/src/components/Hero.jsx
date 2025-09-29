import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [heroBanner, setHeroBanner] = useState("");
  const [promoBanner, setPromoBanner] = useState("");

  useEffect(() => {
    const fetchBanners = async () => {
      
        const [heroRes, promoRes] = await Promise.allSettled([
          axios.get("https://bellaluxurycloset.com/api/banner/hero"),
          axios.get("https://bellaluxurycloset.com/api/banner/promo"),
        ]);
        if (heroRes.status === "fulfilled" && heroRes.value?.data?.imageUrl) {
          setHeroBanner(heroRes.value.data.imageUrl);
        }
        if (promoRes.status === "fulfilled" && promoRes.value?.data?.imageUrl) {
          setPromoBanner(promoRes.value.data.imageUrl);
        }

        // Optional: log any failures without breaking the other
        if (heroRes.status === "rejected") {
          console.error("Hero banner fetch failed:", heroRes.reason);
        }
        if (promoRes.status === "rejected") {
          console.error("Promo banner fetch failed:", promoRes.reason);
        }
    
    };

    fetchBanners();
  }, []);

  return (
    <div className="container  mx-auto  my-5 gap-4">
      {heroBanner && (
        <div>
          <img
            src={heroBanner}
            alt="Hero Banner"
            className="w-full object-cover my-4"
          />
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/shop"></Link>
      </div>

      {promoBanner && (
        <div>
          <img
            src={promoBanner}
            alt="Promo Banner"
            className="w-full object-cover my-4"
          />
        </div>
      )}
    </div>
  );
};

export default Hero;
