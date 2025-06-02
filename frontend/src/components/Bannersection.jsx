import axios from "axios";
import { useEffect, useState } from "react";

const Bannersection = () => {
  const [banner1, setBanner1] = useState("");
  const [banner2, setBanner2] = useState("");
  const [banner3, setBanner3] = useState("");

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const [banner1Res, banner2Res, banner3Res] = await Promise.all([
          axios.get("http://localhost:4000/api/banner/banner-1"),
          axios.get("http://localhost:4000/api/banner/banner-2"),
          axios.get("http://localhost:4000/api/banner/banner-3"),
        ]);

        if (banner1Res.data?.imageUrl) setBanner1(banner1Res.data.imageUrl);
        if (banner2Res.data?.imageUrl) setBanner2(banner2Res.data.imageUrl);
        if (banner3Res.data?.imageUrl) setBanner3(banner3Res.data.imageUrl);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);
  return (
    <div className="container mx-auto my-5 gap-4">
      {banner1 && (
        <img
          src={banner1}
          alt="Banner 1"
          className="w-full object-cover my-4"
        />
      )}
      {banner2 && (
        <img
          src={banner2}
          alt="Banner 1"
          className="w-full object-cover my-4"
        />
      )}
      {banner3 && (
        <img
          src={banner3}
          alt="Banner 1"
          className="w-full object-cover my-4"
        />
      )}
    </div>
  );
};

export default Bannersection;
