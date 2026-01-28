import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

export default function Footer() {
  const scrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const brand = {
    name: "Bella Luxury Closet",
    instagram: "https://www.threads.com/@bellaclosetcom?igshid=NTc4MTIwNjQ2YQ==",
    logoSrc: "/logo-white.svg",
  };

  const leftLinks = [
    { label: "FAQs", to: "/faq" },
    { label: "Delivery & Returns", to: "/delivery-returns" },
  ];

  const rightLinks = [
    { label: "About Us", to: "/about" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Contact", to: "/contact" },
    { label: "Terms & Conditions", to: "/terms" },
  ];

  return (
    <footer className="bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img
                src={brand.logoSrc}
                alt={brand.name}
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="leading-tight">
                <p className="font-serif text-lg tracking-wide">{brand.name}</p>
                <p className="text-xs text-white/60">Bags • Homewear • Watches</p>
              </div>
            </div>

            <p className="text-sm text-white/70">
              © {new Date().getFullYear()}, {brand.name}. All Rights Reserved.
            </p>

            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>

          {/* Middle */}
          <div className="md:justify-self-center">
            <ul className="space-y-4 text-white/80">
              {leftLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={scrollTop}
                    className="hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <div className="md:justify-self-end">
            <ul className="space-y-4 text-white/80">
              {rightLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={scrollTop}
                    className="hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-xs text-white/50">
          Luxury essentials curated in Dubai — bags, homewear, watches & more.
        </div>
      </div>
    </footer>
  );
}
