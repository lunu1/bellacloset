import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../features/category/categorySlice";

export default function Bannersection() {
  const [banner1, setBanner1] = useState("");
  const [banner2, setBanner2] = useState("");
  const [banner3, setBanner3] = useState("");

  // categories from store
  const dispatch = useDispatch();
  const { items: categories = [] } = useSelector((s) => s.category);

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // find "Accessories" category (label/slug/tags contains "accessor")
  const accessoriesCategory = useMemo(() => {
    const flat = [];
    const walk = (n) => {
      if (!n) return;
      flat.push(n);
      (n.children || []).forEach(walk);
    };
    (categories || []).forEach(walk);

    return (
      flat.find((c) => {
        const label = String(c.label || c.name || "").toLowerCase();
        const slug = String(c.slug || "").toLowerCase();
        const tags = Array.isArray(c.tags)
          ? c.tags.map((t) => String(t).toLowerCase())
          : [];
        return (
          label.includes("accessor") ||
          slug.includes("accessor") ||
          tags.includes("accessory") ||
          tags.includes("accessories")
        );
      }) || null
    );
  }, [categories]);

  const clothingCategory = useMemo(()=>{
    const flat = [];
    const walk = (n)=>{
      if(!n) return;
      flat.push(n);
      (n.children || []).forEach(walk);
    };
    (categories || []).forEach(walk);
    return flat.find((c)=>{
      const label = String(c.label || c.name || "").toLowerCase();
      const slug = String(c.slug || "").toLowerCase();
      const tags = Array.isArray(c.tags)? c.tags.map((t)=>String(t).toLowerCase()):[];
      return (
        label.includes("clothing") ||
        slug.includes("clothing") ||
        tags.includes("clothing")
      )
    }) || null
  },[categories]);

  const jewelleryCategory = useMemo(()=>{
    const flat = [];
    const walk = (n)=>{
      if(!n) return;
      flat.push(n);
      (n.children || []).forEach(walk);

    };
    (categories || []).forEach(walk);
    return flat.find((c)=>{
      const label = String(c.label || c.name || "").toLowerCase();
      const slug = String(c.slug || "").toLowerCase();
      const tags = Array.isArray(c.tags)? c.tags.map((t)=>String(t).toLowerCase()):[];
      return (
        label.includes("jewellery") ||
        slug.includes("jewellery") ||
        tags.includes("jewellery")
      )
    }) || null
  })


  const accessoriesHref = accessoriesCategory
    ? `/c/${accessoriesCategory._id}?deep=1`
    : null;

  const clothingHref = clothingCategory
    ? `/c/${clothingCategory._id}?deep=1`
    : null;

    const jewelleryHref = jewelleryCategory
    ? `/c/${jewelleryCategory._id}?deep=1`
    : null;

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
      {/* Banner 1: link only if Accessories category found */}
      {banner1 &&
        (accessoriesHref ? (
          <Link
            to={accessoriesHref}
            className="block group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src={banner1}
              alt="Banner 1"
              className="w-full object-cover my-4"
            />
          </Link>
        ) : (
          <img
            src={banner1}
            alt="Banner 1"
            className="w-full object-cover my-4"
          />
        ))}

      {/* Banner 2 & 3 are just images; add links similarly if you need */}
      {banner2 && 
      (clothingHref ? (
        <Link
          to={clothingHref}
          className="block group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={banner2}
            alt="Banner 2"
            className="w-full object-cover my-4"
          />
        </Link>
      ):(<img
          src={banner2}
          alt="Banner 2"
          className="w-full object-cover my-4"
        />)
        
      )}

   {banner3 && 
      (jewelleryHref ? (
        <Link
          to={jewelleryHref}
          className="block group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={banner3}
            alt="Banner 3"
            className="w-full object-cover my-4"
          />
        </Link>
      ):(<img
          src={banner3}
          alt="Banner 3"
          className="w-full object-cover my-4"
        />)
        
      )}
    </div>
  );
}
