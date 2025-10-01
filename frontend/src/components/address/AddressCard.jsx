import { Edit3, Trash2 } from "lucide-react";

export default function AddressCard({ address, isDefault, onMakeDefault, onEdit, onDelete }) {
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
          <p className="font-medium text-gray-900">{address.street}</p>
          <p className="text-gray-900">
            {address.city}, {address.state} {address.zip}
          </p>
          <p className="text-gray-900">{address.country}</p>
          {address.phone && <p className="text-gray-700 mt-1">Phone: {address.phone}</p>}
          {address.isDefault && <span className="text-green-600 text-sm font-medium">(Default)</span>}
        </div>

        <div className="flex gap-3 items-start">
          <button onClick={() => onEdit(address)} className="text-blue-600 hover:text-blue-700">
            <Edit3 size={20} />
          </button>
          <button onClick={() => onDelete(address._id)} className="text-red-600 hover:text-red-700">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
