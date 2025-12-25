import { MapPin, Phone } from "lucide-react";

export default function AddressCard({ address = {} }) {
  const line1 = `${address.unitNumber ? address.unitNumber + ", " : ""}${address.buildingName || ""}`.trim();
  const line2 = [address.street, address.area, address.city].filter(Boolean).join(", ");
  const line3 = [address.emirate, address.postalCode].filter(Boolean).join(" · ");

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-gray-500" />
          <h3 className="font-semibold">Shipping Address</h3>
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          {address.fullName && <p className="font-medium">{address.fullName}</p>}

          {line1 ? <p>{line1}</p> : null}
          {line2 ? <p>{line2}</p> : null}
          {line3 ? <p>{line3}</p> : null}

          {address.landmark ? <p>Landmark: {address.landmark}</p> : null}
          {address.poBox ? <p>PO Box: {address.poBox}</p> : null}

          {address.phone ? (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t">
              <Phone size={14} />
              <span>{address.phone}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
