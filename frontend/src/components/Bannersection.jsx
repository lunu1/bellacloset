import axios from "axios";
import { useEffect, useState } from "react";

const Bannersection = () => {
  const [banner1, setBanner1] = useState("");
  const [banner2, setBanner2] = useState("");
  const [banner3, setBanner3] = useState("");

  useEffect(() => {
    const fetchBanners = async () => {
      const [banner1Res, banner2Res, banner3Res] = await Promise.allSettled([
        axios.get("http://localhost:4000/api/banner/banner-1"),
        axios.get("http://localhost:4000/api/banner/banner-2"),
        axios.get("http://localhost:4000/api/banner/banner-3"),
      ]);

      if (banner1Res.status === "fulfilled" && banner1Res.value?.data?.imageUrl) {
        setBanner1(banner1Res.value.data.imageUrl);
      }
      if (banner2Res.status === "fulfilled" && banner2Res.value?.data?.imageUrl) {
        setBanner2(banner2Res.value.data.imageUrl);
      }
      if (banner3Res.status === "fulfilled" && banner3Res.value?.data?.imageUrl) {
        setBanner3(banner3Res.value.data.imageUrl);
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
          alt="Banner 2"
          className="w-full object-cover my-4"
        />
      )}
      {banner3 && (
        <img
          src={banner3}
          alt="Banner 3"
          className="w-full object-cover my-4"
        />
      )}
    </div>
  );
};

export default Bannersection;
