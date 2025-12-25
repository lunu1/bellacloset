import { Edit3, Trash2 } from "lucide-react";

export default function AddressCard({
  address,
  isDefault,
  onMakeDefault,
  onEdit,
  onDelete,
}) {
  const line1 = `${address.unitNumber || ""}${address.unitNumber ? ", " : ""}${address.buildingName || ""}`.trim();

  const line2 = [
    address.street ? address.street : null,
    address.area ? address.area : null,
    address.city ? address.city : null,
  ]
    .filter(Boolean)
    .join(", ");

  const line3 = [
    address.emirate ? address.emirate : null,
    address.postalCode ? address.postalCode : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <input
          type="radio"
          name="defaultAddress"
          checked={isDefault}
          onChange={() => onMakeDefault(address._id)}
          className="mt-1"
        />

        <div className="flex-1 mx-4">
          {/* Name + phone */}
          <p className="font-medium text-gray-900">
            {address.fullName || "—"}
          </p>
          {address.phone ? (
            <p className="text-gray-700 mt-1">Phone: {address.phone}</p>
          ) : null}

          {/* Address type */}
          {address.addressType ? (
            <p className="text-gray-600 text-sm mt-1 capitalize">
              {address.addressType}
            </p>
          ) : null}

          {/* Main address lines */}
          {line1 ? <p className="text-gray-900 mt-2">{line1}</p> : null}
          {line2 ? <p className="text-gray-900">{line2}</p> : null}
          {line3 ? <p className="text-gray-900">{line3}</p> : null}

          {/* Optional landmark / PO box */}
          {address.landmark ? (
            <p className="text-gray-700 mt-1">Landmark: {address.landmark}</p>
          ) : null}
          {address.poBox ? (
            <p className="text-gray-700 mt-1">PO Box: {address.poBox}</p>
          ) : null}

          {/* Default badge */}
          {(isDefault || address.isDefault) && (
            <span className="text-green-600 text-sm font-medium">(Default)</span>
          )}
        </div>

        <div className="flex gap-3 items-start">
          <button
            onClick={() => onEdit(address)}
            className="text-blue-600 hover:text-blue-700"
            aria-label="Edit address"
          >
            <Edit3 size={20} />
          </button>
          <button
            onClick={() => onDelete(address._id)}
            className="text-red-600 hover:text-red-700"
            aria-label="Delete address"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
