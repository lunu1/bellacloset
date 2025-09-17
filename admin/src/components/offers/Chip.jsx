// Lightweight pill label used across the offers UI
export default function Chip({ children, tone = "gray", className = "" }) {
  const toneClass = {
    gray:   "text-gray-700 border-gray-300",
    green:  "text-green-700 border-green-300",
    orange: "text-orange-700 border-orange-300",
    blue:   "text-blue-700 border-blue-300",
    red:    "text-red-700 border-red-300",
  }[tone] || "text-gray-700 border-gray-300";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border bg-white ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
