// components/WhatsAppInquire.jsx
import React from "react";

const WhatsAppInquire = ({
  phone = "971556055777",
  message = "Hello! I’d like to inquire about a product.",
  label = "Inquire now",
  className = "",
}) => {
  const waLink = `https://wa.me/${String(phone).replace(/\D/g, "")}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Inquire now on WhatsApp"
      className={[
        "group fixed bottom-5 right-5 z-50",
        "h-12 w-12 hover:w-[140px]",
        "rounded-full bg-black text-white",
        "shadow-lg hover:shadow-2xl",
        "transition-all duration-300 ease-out",
        "overflow-hidden",
        "flex items-center", // ✅ keep stable
        className,
      ].join(" ")}
    >
      {/* ✅ Icon stays perfectly centered in the initial 48x48 area */}
      <span className="relative flex h-12 w-12 items-center justify-center shrink-0">
        {/* pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-white/20"></span>

        <svg
          viewBox="0 0 24 24"
          className="relative z-10 h-6 w-6"
          fill="#fff" // ✅ force visible
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.91 11.91 0 0 0 12.06 0C5.5 0 .12 5.38.12 12c0 2.1.55 4.14 1.6 5.95L0 24l6.2-1.6A11.9 11.9 0 0 0 12.06 24c6.56 0 11.94-5.38 11.94-12 0-3.19-1.25-6.19-3.48-8.52zM12.06 21.6c-1.96 0-3.86-.52-5.52-1.52l-.4-.25-3.68.95.98-3.58-.25-.37a9.51 9.51 0 0 1-1.47-5.07c0-5.29 4.31-9.6 9.6-9.6s9.6 4.31 9.6 9.6-4.31 9.6-9.6 9.6zm5.48-7.2c-.3-.15-1.78-.87-2.06-.97-.28-.1-.48-.15-.68.15s-.78.97-.95 1.17c-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.5-1.77-1.67-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53-.18-.01-.37-.01-.57-.01-.2 0-.52.08-.8.38s-1.05 1.02-1.05 2.5 1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.13 4.43 3.01 1.2 3.01.8 3.55.75.55-.05 1.75-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35z" />
        </svg>
      </span>

      {/* ✅ text hidden by default, appears on hover */}
      <span className="pr-5 text-xs font-medium text-white whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        {label}
      </span>
    </a>
  );
};

export default WhatsAppInquire;
