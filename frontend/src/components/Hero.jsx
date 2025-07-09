import axios from "axios";
import { useEffect, useState} from "react";
import { Link } from "react-router-dom";

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
    <div className="container  mx-auto  my-5 gap-4">
      {heroBanner && (
        <img src={heroBanner} alt="Hero Banner" className="w-full object-cover my-4" />
      )}

      <div className="text-center mt-8">
  <Link to="/shop">
    <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition duration-300 text-sm sm:text-base">
      View All Products
    </button>
  </Link>
</div>

      {promoBanner && (
        <img src={promoBanner} alt="Promo Banner" className="w-full object-cover my-4" />
      )}
    </div>
  );
};

export default Hero;
