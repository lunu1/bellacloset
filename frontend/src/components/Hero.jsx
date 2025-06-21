import axios from "axios";
import { useEffect, useState } from "react";

const Hero = () => {
  const [heroBanner, setHeroBanner] = useState("");
  const [promoBanner, setPromoBanner] = useState("");

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const [heroRes, promoRes] = await Promise.all([
          axios.get("http://localhost:4000/api/banner/hero"),
          axios.get("http://localhost:4000/api/banner/promo")
        ]);
      
        

        if (heroRes.data?.imageUrl) setHeroBanner(heroRes.data.imageUrl);
        if (promoRes.data?.imageUrl) setPromoBanner(promoRes.data.imageUrl);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="container mx-auto my-5 gap-4">
      {heroBanner && (
        <img src={heroBanner} alt="Hero Banner" className="w-full object-cover my-4" />
      )}
      {promoBanner && (
        <img src={promoBanner} alt="Promo Banner" className="w-full object-cover my-4" />
      )}
    </div>
  );
};

export default Hero;
