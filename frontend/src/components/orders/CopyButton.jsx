import { useState } from "react";
import { Copy } from "lucide-react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      onClick={onCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
      title="Copy"
    >
      <Copy size={12} />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
