const tone = {
  gray:   "text-gray-700 border-gray-300",
  green:  "text-green-700 border-green-300",
  orange: "text-orange-700 border-orange-300",
  blue:   "text-blue-700 border-blue-300",
};

export default function Chip({ children, tint = "gray" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border bg-white ${tone[tint] || tone.gray}`}>
      {children}
    </span>
  );
}
