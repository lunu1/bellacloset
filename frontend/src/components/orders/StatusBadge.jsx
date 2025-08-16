import { Clock, Truck, CheckCircle, Package } from "lucide-react";

const STYLES = {
  Pending:   { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", Icon: Clock },
  Shipped:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   Icon: Truck },
  Delivered: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  Icon: CheckCircle },
  Cancelled: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    Icon: Package },
};

export default function StatusBadge({ status = "Pending" }) {
  const { bg, text, border, Icon } = STYLES[status] || STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${bg} ${text} ${border}`}>
      <Icon size={14} />
      {status}
    </span>
  );
}
