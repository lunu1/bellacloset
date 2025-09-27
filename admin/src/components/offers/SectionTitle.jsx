// Small uppercase section label used in drawers/forms
export default function SectionTitle({ children, className = "" }) {
  return (
    <div className={`text-xs uppercase tracking-wider text-gray-500 font-medium mb-1 ${className}`}>
      {children}
    </div>
  );
}
