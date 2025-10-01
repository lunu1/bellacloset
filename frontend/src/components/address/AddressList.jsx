import { NotebookTabs } from "lucide-react";
import AddressCard from "./AddressCard";

export default function AddressList({
  addresses,
  defaultAddressId,
  onMakeDefault,
  onEdit,
  onDelete,
}) {
  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <NotebookTabs size={20} className="text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
      </div>

      {addresses.map((address) => (
        <AddressCard
          key={address._id}
          address={address}
          isDefault={defaultAddressId === address._id}
          onMakeDefault={onMakeDefault}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
