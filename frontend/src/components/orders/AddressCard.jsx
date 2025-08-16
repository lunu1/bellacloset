import { MapPin, Phone } from "lucide-react";

export default function AddressCard({ address = {} }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-gray-500" />
          <h3 className="font-semibold">Shipping Address</h3>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          {address.name && <p className="font-medium">{address.name}</p>}
          {address.street && <p>{address.street}</p>}
          {(address.city || address.state || address.zip) && (
            <p>{address.city}{address.city && address.state ? ", " : ""}{address.state} {address.zip}</p>
          )}
          {address.country && <p>{address.country}</p>}
          {address.phone && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t">
              <Phone size={14} />
              <span>{address.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
