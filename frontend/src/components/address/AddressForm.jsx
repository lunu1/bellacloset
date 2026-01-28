import { sanitizePhoneInput, validateAddress } from "../../utils/validators";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Fujairah",
  "Ras Al Khaimah",
  "Umm Al Quwain",
];

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
  const setField = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  // IMPORTANT: Update your validateAddress() to validate these UAE keys
  const handleBlur = () => setErrors(validateAddress(values));

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {title ? <h3 className="text-xl font-medium mb-4">{title}</h3> : null}

      {/* Label */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          value={String(values.label ?? "")}
          onChange={(e) => setField("label", e.target.value)}
          onBlur={handleBlur}
          className={`w-full px-4 py-2 border rounded-lg ${
            errors.label ? "border-red-400" : "border-gray-300"
          }`}
          placeholder="Home / Office"
        />
        {errors.label && <p className="text-red-600 text-sm mt-1">{errors.label}</p>}
      </div>

      {/* Full Name */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={String(values.fullName ?? "")}
          onChange={(e) => setField("fullName", e.target.value)}
          onBlur={handleBlur}
          className={`w-full px-4 py-2 border rounded-lg ${
            errors.fullName ? "border-red-400" : "border-gray-300"
          }`}
          placeholder="Receiver name"
        />
        {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
      </div>

      {/* Email */}
<div className="mb-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
  <input
    type="email"
    value={String(values.email ?? "")}
    onChange={(e) => setField("email", e.target.value)}
    onBlur={handleBlur}
    className={`w-full px-4 py-2 border rounded-lg ${
      errors.email ? "border-red-400" : "border-gray-300"
    }`}
    placeholder="example@email.com"
  />
  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
</div>


      {/* Phone */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          inputMode="tel"
          value={String(values.phone ?? "")}
          onChange={(e) => setField("phone", sanitizePhoneInput(e.target.value))}
          onBlur={handleBlur}
          className={`w-full px-4 py-2 border rounded-lg ${
            errors.phone ? "border-red-400" : "border-gray-300"
          }`}
          placeholder="e.g. +9715XXXXXXXX or 05XXXXXXXX"
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Address Type */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
        <select
          value={String(values.addressType ?? "apartment")}
          onChange={(e) => setField("addressType", e.target.value)}
          onBlur={handleBlur}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="office">Office</option>
        </select>
      </div>

      {/* Unit + Building */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
          <input
            type="text"
            value={String(values.unitNumber ?? "")}
            onChange={(e) => setField("unitNumber", e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.unitNumber ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Flat / Villa / Office no."
          />
          {errors.unitNumber && <p className="text-red-600 text-sm mt-1">{errors.unitNumber}</p>}
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
          <input
            type="text"
            value={String(values.buildingName ?? "")}
            onChange={(e) => setField("buildingName", e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.buildingName ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Tower / Building / Community"
          />
          {errors.buildingName && <p className="text-red-600 text-sm mt-1">{errors.buildingName}</p>}
        </div>
      </div>

      {/* Street (optional) */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Street (optional)</label>
        <input
          type="text"
          value={String(values.street ?? "")}
          onChange={(e) => setField("street", e.target.value)}
          onBlur={handleBlur}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Street / Road name (optional)"
        />
      </div>

      {/* Area + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Area / Community</label>
          <input
            type="text"
            value={String(values.area ?? "")}
            onChange={(e) => setField("area", e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.area ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Marina, Deira, JLT..."
          />
          {errors.area && <p className="text-red-600 text-sm mt-1">{errors.area}</p>}
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={String(values.city ?? "")}
            onChange={(e) => setField("city", e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.city ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="Dubai / Abu Dhabi"
          />
          {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
        </div>
      </div>

      {/* Emirate */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
        <select
          value={String(values.emirate ?? "")}
          onChange={(e) => setField("emirate", e.target.value)}
          onBlur={handleBlur}
          className={`w-full px-4 py-2 border rounded-lg bg-white ${
            errors.emirate ? "border-red-400" : "border-gray-300"
          }`}
        >
          <option value="">Select Emirate</option>
          {EMIRATES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        {errors.emirate && <p className="text-red-600 text-sm mt-1">{errors.emirate}</p>}
      </div>

      {/* Landmark + PO Box + Postal Code (optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (optional)</label>
          <input
            type="text"
            value={String(values.landmark ?? "")}
            onChange={(e) => setField("landmark", e.target.value)}
            onBlur={handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Near..."
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">PO Box (optional)</label>
          <input
            type="text"
            value={String(values.poBox ?? "")}
            onChange={(e) => setField("poBox", e.target.value)}
            onBlur={handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g. 12345"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code (optional)</label>
          <input
            type="text"
            value={String(values.postalCode ?? "")}
            onChange={(e) => setField("postalCode", e.target.value)}
            onBlur={handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 bg-black hover:bg-gray-700 text-white py-2 rounded-md"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
