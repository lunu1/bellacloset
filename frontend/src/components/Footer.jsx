// Footer.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, CircleUser } from "lucide-react";

// ⬇️ adjust these two paths to your project structure
import { fetchCategories } from "../features/category/categorySlice";
import { api } from "../api/http";

export default function Footer() {
  const dispatch = useDispatch();

  // ===== Categories (Redux) =====
  const {
    items: categoryTree = [],
    loading: catLoading,
    error: catError,
  } = useSelector((s) => s.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);



  // Collect up to 12 leaf categories (deepest nodes) excluding a 'brand' node
  const topCategories = useMemo(() => {
    const out = [];
    const seen = new Set();

    const dfs = (node) => {
      if (out.length >= 12) return;
      const label = (node?.label || "").trim();
      if (!label) return;
      if (label.toLowerCase() === "brand") return;

      const children = Array.isArray(node?.children) ? node.children : [];
      if (children.length === 0) {
        const key = node._id || label;
        if (!seen.has(key)) {
          out.push(node);
          seen.add(key);
        }
        return;
      }
      for (const child of children) {
        if (out.length >= 5) break;
        dfs(child);
      }
    };

    for (const n of categoryTree) {
      if (out.length >= 5) break;
      dfs(n);
    }
    return out;
  }, [categoryTree]);

  // ===== Brands (local fetch via axios api) =====
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setBrandsLoading(true);
        setBrandsError("");
        // hits: `${VITE_API_URL}/api/brands`
        const res = await api.get("/brands");
        if (!cancel) {
          const data = Array.isArray(res.data) ? res.data : res.data?.brands || [];
          setBrands(data);
        }
      } catch (err) {
        if (!cancel) setBrandsError(err?.response?.data?.error || err.message || "Failed to load brands");
      } finally {
        if (!cancel) setBrandsLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);
    const brandsList = useMemo(() => {
  return (brands || [])
    .filter((b) => b?.name && b?.slug)
    .sort((a, b) => a.name.localeCompare(b.name)) // A → Z
    .slice(0, 5); // show first 12 like categories
}, [brands]);


  // ===== Static blocks kept as-is (edit anytime) =====
  const aboutLinks = [
    { id: 1, name: "About Us", url: "/about"},
    // { id: 2, name: "How Does It Work?", url: "#" },
    { id: 3, name: "Privacy Policy", url: "/privacy-policy" },
    { id: 4, name: "Terms & Conditions", url: "/terms" },
    { id: 5, name: "FAQs", url: "/faq"  },
    // { id: 6, name: "Sell Now", url: "#" },
    { id: 7, name: "Delivery & Returns", url: "/delivery-returns" },
    // { id: 8, name: "Warranty", url: "#" },
    // { id: 9, name: "Change My Preferences", url: "#" },
  ];

  const customerServiceLinks = [
    { id: 1, name: "Contact Us", url: "/contact" },
    { id: 2, name: "FAQs", url: "/faq" },
    // { id: 3, name: "Student & Youth Discount", url: "#" },
    // { id: 4, name: "Essential Worker Discount", url: "#" },
  ];

  // const brandCategoryBlocks = {
  //   louisVuitton: [
  //     { id: 1, name: "Louis Vuitton Bag", url: "#" },
  //     { id: 2, name: "Louis Vuitton Shoes", url: "#" },
  //     { id: 3, name: "Louis Vuitton Wallet", url: "#" },
  //     { id: 4, name: "Louis Vuitton Sneakers", url: "#" },
  //   ],
  //   gucci: [
  //     { id: 1, name: "Gucci Bag", url: "#" },
  //     { id: 2, name: "Gucci Shoes", url: "#" },
  //     { id: 3, name: "Gucci Sneakers", url: "#" },
  //     { id: 4, name: "Gucci Wallet", url: "#" },
  //     { id: 5, name: "Gucci Sandals", url: "#" },
  //   ],
  //   hermes: [
  //     { id: 1, name: "Hermes Bag", url: "#" },
  //     { id: 2, name: "Hermes Shoes", url: "#" },
  //     { id: 3, name: "Hermes Birkin", url: "#" },
  //     { id: 4, name: "Hermes Kelly", url: "#" },
  //     { id: 5, name: "Hermes Sandals", url: "#" },
  //   ],
  //   chanel: [
  //     { id: 1, name: "Chanel Bag", url: "#" },
  //     { id: 2, name: "Chanel Shoes", url: "#" },
  //     { id: 3, name: "Chanel Wallet", url: "#" },
  //     { id: 4, name: "Chanel Boots", url: "#" },
  //     { id: 5, name: "Chanel Sandals", url: "#" },
  //   ],
  // };

  const contactInfo = {
    helpMessage: "We Are Here To Help You!",
    phone: "800 BEllA (800 589)",
    email: "info@bellacloset.com",
    hours: "Monday to Sunday",
    timeZone: "9 am to 9 pm (GST)",
  };

  const companyInfo = {
    address: "Novotel Dubai Al Barsha API Trio Tower Office 901 PO Box:502626",
    storeTimings:
      "Store Timings: Monday To Friday - 9 AM To 8 PM GST, Saturday - 10 AM To 8 PM GST, Sunday - Closed",
  };

  const renderSocialIcon = (iconName) => {
    switch (iconName) {
      case "Facebook":
        return <Facebook className="w-6 h-6" />;
      case "Instagram":
        return <Instagram className="w-6 h-6" />;
      case "Youtube":
        return <Youtube className="w-6 h-6" />;
      case "Twitter":
        return <Twitter className="w-6 h-6" />;
      default:
        return <CircleUser className="w-6 h-6" />;
    }
  };

  return (
    <footer className="bg-black text-white py-12 mt-10">
      <div className="w-screen px-4 sm:px-6 lg:px-8 flex justify-center items-center flex-col">
        {/* Main footer columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Top Categories (dynamic) */}
          <div>
            <h3 className="font-medium text-lg mb-4">Top Categories</h3>
            <ul className="space-y-2">
              {catLoading && <li className="text-gray-400">Loading...</li>}
              {catError && <li className="text-red-400">Failed to load categories</li>}
              {!catLoading && !catError && topCategories.length === 0 && (
                <li className="text-gray-400">No categories available</li>
              )}
              {!catLoading &&
                !catError &&
                topCategories.map((cat) => (
                  <li key={cat._id}>
                    <Link to={`/c/${cat._id}?deep=1`} className="text-gray-300 hover:text-white">
                      {cat.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Top Brands (dynamic via axios) */}
          <div>
                <h3 className="font-medium text-lg mb-4">Top Brands</h3>
                <ul className="space-y-2">
                  {brandsLoading && <li className="text-gray-400">Loading...</li>}
                  {brandsError && <li className="text-red-400">{brandsError}</li>}

                  {!brandsLoading && !brandsError && brandsList.length === 0 && (
                    <li className="text-gray-400">No brands available</li>
                  )}

                  {!brandsLoading &&
                    !brandsError &&
                    brandsList.map((b) => (
                      <li key={b.slug}>
                        <Link to={`/brand/${b.slug}`} className="text-gray-300 hover:text-white">
                          {b.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>

          {/* About */}
          <div>
            <h3 className="font-medium text-lg mb-4">About The Luxury Closet</h3>
            <ul className="space-y-2">
              {aboutLinks.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-medium text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {customerServiceLinks.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <p className="font-medium">{contactInfo.helpMessage}</p>
              <p className="my-1">{contactInfo.phone}</p>
              <p className="mb-3">{contactInfo.email}</p>
              <p>{contactInfo.hours}</p>
              <p>{contactInfo.timeZone}</p>
            </div>
          </div>

          {/* Social (static for now) */}
          <div>
            <h3 className="font-medium text-lg mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4 mb-8">
              {/* <a href="#" className="text-gray-300 hover:text-white">
                {renderSocialIcon("Facebook")}
              </a> */}
              <a href="https://www.threads.com/@bellaclosetcom?igshid=NTc4MTIwNjQ2YQ==" className="text-gray-300 hover:text-white">
                {renderSocialIcon("Instagram")}
              </a>
              {/* <a href="#" className="text-gray-300 hover:text-white">
                {renderSocialIcon("Youtube")}
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                {renderSocialIcon("Twitter")}
              </a> */}
            </div>
          </div>
        </div>

        {/* Brand-specific links (static placeholders) */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-medium mb-4">Shop Louis Vuitton</h3>
            <ul className="space-y-2">
              {brandCategoryBlocks.louisVuitton.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Shop Gucci</h3>
            <ul className="space-y-2">
              {brandCategoryBlocks.gucci.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Shop Hermes</h3>
            <ul className="space-y-2">
              {brandCategoryBlocks.hermes.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Shop Chanel</h3>
            <ul className="space-y-2">
              {brandCategoryBlocks.chanel.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="text-gray-300 hover:text-white">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div> */}

        {/* Address and store timing */}
        <div className="text-center text-gray-300 text-sm border-t border-gray-800 pt-8">
          <p className="mb-2">{companyInfo.address}</p>
          <p>{companyInfo.storeTimings}</p>
        </div>
      </div>
    </footer>
  );
}
