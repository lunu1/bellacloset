import CopyButton from "./CopyButton";
import { Truck } from "lucide-react";

export default function TrackingCard({ tracking }) {
  if (!tracking?.trackingNumber) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck size={18} className="text-gray-500" />
          <h3 className="font-semibold">Tracking Info</h3>
        </div>
        <div className="text-sm space-y-2">
          <div>
            <p className="text-gray-600">Carrier</p>
            <p className="font-medium">{tracking.carrier || "—"}</p>
          </div>
          <div>
            <p className="text-gray-600">Tracking Number</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">{tracking.trackingNumber}</p>
              <CopyButton text={tracking.trackingNumber} />
            </div>
          </div>
          {tracking.eta && (
            <div>
              <p className="text-gray-600">Estimated Delivery</p>
              <p className="font-medium">{new Date(tracking.eta).toLocaleString()}</p>
            </div>
          )}
          {tracking.url && (
            <a
              href={tracking.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Truck size={16} />
              Track Package
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
