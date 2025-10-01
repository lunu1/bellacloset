import { addressFields } from "../../utils/address";
import { sanitizePhoneInput, validateAddress } from "../../utils/validators";

export default function AddressForm({
  title,
  values,
  setValues,
  errors,
  setErrors,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {title ? <h3 className="text-xl font-medium mb-4">{title}</h3> : null}
      {addressFields.map((field) => (
        <div key={field} className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type={field === "phone" ? "tel" : "text"}
            inputMode={field === "phone" ? "tel" : "text"}
            value={String(values[field] ?? "")}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                [field]: field === "phone" ? sanitizePhoneInput(e.target.value) : e.target.value,
              }))
            }
            onBlur={() => setErrors(validateAddress(values))}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors[field] ? "border-red-400" : "border-gray-300"
            }`}
            placeholder={field === "phone" ? "e.g. 9876543210" : `Enter ${field}`}
          />
          {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <button onClick={onSubmit} className="flex-1 bg-black hover:bg-gray-700 text-white py-2 rounded-md">
          {submitLabel}
        </button>
        <button onClick={onCancel} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md">
          Cancel
        </button>
      </div>
    </div>
  );
}
